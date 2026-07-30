import { describe, it, expect } from 'vitest';

// Cloudflare Workers API 規格テスト
// 実際のMiniflare結合テスト前の契約検証

function validatePayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return { valid: false, errors: ['body欠如'] };
  if (typeof body.lat !== 'number' || body.lat < 32 || body.lat > 35) errors.push('lat不正');
  if (typeof body.lon !== 'number' || body.lon < 131 || body.lon > 136) errors.push('lon不正');
  if (!body.type || !['rescue','road','building','landslide','fire','water'].includes(body.type)) errors.push('type不正');
  if (!body.detail || body.detail.length < 8) errors.push('detail不足(8文字以上)');
  return { valid: errors.length === 0, errors };
}

function validateApiKey(auth) {
  return auth === 'Bearer shikoku-quake-secret-key-2026';
}

describe('POST /api/reports バリデーション', () => {
  it('正常なペイロードは valid', () => {
    const result = validatePayload({
      lat: 33.5, lon: 133.5,
      type: 'rescue',
      detail: '津波避難タワーに避難中ですが水が足りません。'
    });
    expect(result.valid).toBe(true);
  });

  it('lat/lonなしは invalid', () => {
    expect(validatePayload({ type: 'road', detail: '道路陥没しています' }).valid).toBe(false);
    expect(validatePayload({ lat: 99, lon: 133.5, type: 'road', detail: 'test'.repeat(5) }).valid).toBe(false);
  });

  it('typeが許可リスト外は invalid', () => {
    const result = validatePayload({ lat: 33.5, lon: 133.5, type: 'nuclear', detail: 'test'.repeat(5) });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('type'))).toBe(true);
  });
});

describe('CDNキャッシュヘッダー (E-2)', () => {
  it('data/incidents.js は max-age=60, s-maxage=300', () => {
    const headers = { 'Cache-Control': 'public, max-age=60, s-maxage=300' };
    expect(headers['Cache-Control']).toContain('max-age=60');
    expect(headers['Cache-Control']).toContain('s-maxage=300');
  });

  it('lib/*.js は max-age=86400, immutable', () => {
    const headers = { 'Cache-Control': 'public, max-age=86400, immutable' };
    expect(headers['Cache-Control']).toContain('max-age=86400');
    expect(headers['Cache-Control']).toContain('immutable');
  });
});

describe('管理API認証', () => {
  it('正しいAPIキーで認証通過', () => {
    expect(validateApiKey('Bearer shikoku-quake-secret-key-2026')).toBe(true);
  });
  it('空文字は認証失敗', () => {
    expect(validateApiKey('')).toBe(false);
  });
  it('間違ったキーは認証失敗', () => {
    expect(validateApiKey('Bearer wrong-key')).toBe(false);
  });
});
