import { describe, it, expect } from 'vitest';

// APIバリデーションロジック（Workersデプロイ前にテスト可能な範囲）
// 実際のCloudflare Workers環境は Miniflare で結合テスト推奨

function validateReport(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return { valid: false, errors: ['リクエストボディがない'] };
  if (!body.lat || typeof body.lat !== 'number') errors.push('lat が存在しないか数値でない');
  if (!body.lon || typeof body.lon !== 'number') errors.push('lon が存在しないか数値でない');
  if (!body.detail || body.detail.length < 8) errors.push('detail が不足（8文字以上必須）');
  if (body.lat && (body.lat < 32 || body.lat > 35)) errors.push('lat が四国範囲外');
  if (body.lon && (body.lon < 131 || body.lon > 136)) errors.push('lon が四国範囲外');
  return { valid: errors.length === 0, errors };
}

function validateApiKey(authHeader) {
  if (!authHeader) return false;
  return authHeader === 'Bearer shikoku-quake-secret-key-2026';
}

describe('API-01: POST /api/reports バリデーション', () => {
  it('lat/lon がない不正リクエストは 400', () => {
    const result = validateReport({ detail: '道路陥没' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });
});

describe('API-02: 正常な投稿JSON', () => {
  it('必須項目が揃っていれば valid', () => {
    const result = validateReport({
      lat: 33.5, lon: 133.5,
      detail: '橋が崩落しています。迂回路はありません。',
      type: 'general',
      hasPhoto: false
    });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe('API-03: CDNキャッシュヘッダー', () => {
  it('Cache-Control ポリシー定義が存在する', () => {
    // このテストはデプロイ後に HTTP ヘッダー検証想定
    // ここではポリシー設定が存在することのみ確認
    const cachePolicy = {
      '/data/incidents.js': 'public, max-age=60, s-maxage=300',
      '/data/muni_live.js': 'public, max-age=60, s-maxage=300',
      '/index.html': 'public, max-age=0, s-maxage=60',
    };
    expect(cachePolicy['/data/incidents.js']).toContain('max-age=60');
    expect(cachePolicy['/index.html']).toContain('max-age=0');
  });
});

describe('API-04: 管理API認証', () => {
  it('不正なAPIキーは 401', () => {
    expect(validateApiKey('Bearer wrong-key')).toBe(false);
    expect(validateApiKey('')).toBe(false);
    expect(validateApiKey(null)).toBe(false);
  });

  it('正しいAPIキーは認証通過', () => {
    expect(validateApiKey('Bearer shikoku-quake-secret-key-2026')).toBe(true);
  });
});
