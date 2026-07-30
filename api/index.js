/**
 * Cloudflare Worker — 四国版 災害情報マップ バックエンド
 *
 * エンドポイント:
 *   POST /api/reports   — 被害報告投稿（一般ユーザー）
 *   GET  /api/reports   — 報告一覧（管理者認証必須）
 *   PUT  /api/reports/:id — 報告ステータス更新（管理者認証必須）
 *   GET  *              — 静的ファイル配信（CDNキャッシュ制御 E-2）
 *
 * KV 名前空間: REPORTS_KV
 * 管理APIキー: MOD_AUTH_KEY 環境変数
 */

import { parseJMAQuake } from '../src/logic/parser.js';

// ─── 定数 ───────────────────────────────────────────────────
const VALID_TYPES = ['rescue', 'road', 'building', 'landslide', 'fire', 'water'];
const CACHE_POLICY = {
  '/data/incidents.js':     'public, max-age=60, s-maxage=300',
  '/data/config.js':        'public, max-age=60, s-maxage=300',
  '/data/life_support.js':  'public, max-age=60, s-maxage=300',
  '/data/fdma_latest.js':   'public, max-age=60, s-maxage=300',
  '/data/facilities.js':    'public, max-age=60, s-maxage=300',
  '/data/ports.js':         'public, max-age=60, s-maxage=300',
  '/data/isolation.js':     'public, max-age=60, s-maxage=300',
  '/data/tsunami_towers.js':'public, max-age=60, s-maxage=300',
  '/index.html':            'public, max-age=0, s-maxage=60',
};
const LIB_CACHE = 'public, max-age=86400, immutable';

// ─── メイン ─────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // CORS プリフライト
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    // ── API ルーティング ──
    if (method === 'POST' && path === '/api/reports') {
      return handlePostReport(request, env);
    }
    if (method === 'GET' && path === '/api/reports') {
      return handleGetReports(request, env);
    }
    if (method === 'PUT' && path.startsWith('/api/reports/')) {
      return handleUpdateReport(request, env, path);
    }
    // 地震データプロキシ（JMA API 代替）
    if (method === 'GET' && path === '/api/quake/live') {
      return handleJMAProxy(request);
    }

    // ── 静的ファイル配信 ──
    return serveStatic(request, url, env);
  },
};

// ─── 被害報告投稿 ─────────────────────────────────────────
async function handlePostReport(request, env) {
  try {
    const body = await request.json();
    const validation = validateReport(body);
    if (!validation.valid) {
      return jsonResponse({ error: 'バリデーションエラー', details: validation.errors }, 400);
    }

    const report = {
      id: crypto.randomUUID().slice(0, 8),
      ...body,
      status: 'pending',
      score: 0,
      createdAt: new Date().toISOString(),
    };

    // KV に保存（キー: report:{id}）
    await env.REPORTS_KV.put(`report:${report.id}`, JSON.stringify(report));

    // 投稿一覧インデックス追加
    const index = JSON.parse(await env.REPORTS_KV.get('report:index') || '[]');
    index.push(report.id);
    await env.REPORTS_KV.put('report:index', JSON.stringify(index));

    return jsonResponse({ ok: true, id: report.id }, 201);
  } catch (err) {
    return jsonResponse({ error: '不正なリクエスト', details: err.message }, 400);
  }
}

// ─── 報告一覧（管理者） ─────────────────────────────────
async function handleGetReports(request, env) {
  const authErr = checkAdminAuth(request, env);
  if (authErr) return authErr;

  const index = JSON.parse(await env.REPORTS_KV.get('report:index') || '[]');
  const reports = [];
  for (const id of index) {
    const raw = await env.REPORTS_KV.get(`report:${id}`);
    if (raw) reports.push(JSON.parse(raw));
  }
  return jsonResponse({ reports });
}

// ─── 報告ステータス更新（管理者） ────────────────────────
async function handleUpdateReport(request, env, path) {
  const authErr = checkAdminAuth(request, env);
  if (authErr) return authErr;

  const id = path.split('/').pop();
  if (!id) return jsonResponse({ error: 'ID不明' }, 400);

  try {
    const body = await request.json();
    const raw = await env.REPORTS_KV.get(`report:${id}`);
    if (!raw) return jsonResponse({ error: '報告が見つかりません' }, 404);

    const report = JSON.parse(raw);
    if (body.status) report.status = body.status;
    if (typeof body.score === 'number') report.score = body.score;
    if (body.lat) report.lat = body.lat;
    if (body.lon) report.lon = body.lon;

    await env.REPORTS_KV.put(`report:${id}`, JSON.stringify(report));
    return jsonResponse({ ok: true, id });
  } catch (err) {
    return jsonResponse({ error: '更新失敗', details: err.message }, 400);
  }
}

// ─── 気象庁地震プロキシ ─────────────────────────────────
async function handleJMAProxy(request) {
  try {
    const res = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json');
    if (!res.ok) return jsonResponse({ error: 'JMA API error' }, 502);
    const data = await res.json();

    const quakes = [];
    for (const eq of data) {
      const parsed = parseJMAQuake(eq);
      if (parsed) quakes.push(parsed);
    }
    return jsonResponse({ quakes, count: quakes.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return jsonResponse({ error: 'JMA fetch failed', details: err.message }, 502);
  }
}

// ─── 静的ファイル配信 ────────────────────────────────────
async function serveStatic(request, url, env) {
  let path = url.pathname;
  if (path === '/') path = '/index.html';

  try {
    // Cloudflare Pages / Workers Sites 経由で配信
    const res = await env.ASSETS.fetch(request);

    // E-2: CDNキャッシュヘッダー制御
    const cacheControl = CACHE_POLICY[path] ||
      (path.startsWith('/lib/') ? LIB_CACHE : 'public, max-age=0');

    const headers = new Headers(res.headers);
    headers.set('Cache-Control', cacheControl);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}

// ─── バリデーション ──────────────────────────────────────
function validateReport(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return { valid: false, errors: ['body欠如'] };
  if (typeof body.lat !== 'number' || body.lat < 32 || body.lat > 35) errors.push('lat不正（四国範囲: 32-35）');
  if (typeof body.lon !== 'number' || body.lon < 131 || body.lon > 136) errors.push('lon不正（四国範囲: 131-136）');
  if (!body.type || !VALID_TYPES.includes(body.type)) errors.push('type不正（許可: ' + VALID_TYPES.join(', ') + '）');
  if (!body.detail || body.detail.length < 8) errors.push('detail不足（8文字以上）');
  return { valid: errors.length === 0, errors };
}

function checkAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  const expected = env.MOD_AUTH_KEY || 'shikoku-quake-secret-key-2026';
  if (authHeader !== `Bearer ${expected}`) {
    return jsonResponse({ error: '認証エラー' }, 401);
  }
  return null;
}

// ─── ヘルパー ─────────────────────────────────────────────
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
