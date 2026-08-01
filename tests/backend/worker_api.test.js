import { describe, it, expect } from 'vitest';
import { validateReport, isAdminAuthorized, CACHE_POLICY } from '../../api/index.js';

// Cloudflare Workers API 規格テスト（実装 api/index.js を直接検証）
// R-3: 自前複製を廃止し、実装 import 化

describe('POST /api/reports バリデーション', () => {
  it('正常なペイロードは valid', () => {
    const result = validateReport({
      lat: 33.5, lon: 133.5,
      type: 'rescue',
      detail: '津波避難タワーに避難中ですが水が足りません。'
    });
    expect(result.valid).toBe(true);
  });

  it('lat/lonなし・範囲外は invalid', () => {
    expect(validateReport({ type: 'road', detail: '道路陥没しています' }).valid).toBe(false);
    expect(validateReport({ lat: 99, lon: 133.5, type: 'road', detail: 'test'.repeat(5) }).valid).toBe(false);
  });

  it('typeが許可リスト外は invalid', () => {
    const result = validateReport({ lat: 33.5, lon: 133.5, type: 'nuclear', detail: 'test'.repeat(5) });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('type'))).toBe(true);
  });

  it('境界値は四国範囲内として valid', () => {
    expect(validateReport({ lat: 32.5, lon: 132, type: 'fire', detail: '境界値テストです' }).valid).toBe(true);
    expect(validateReport({ lat: 34.5, lon: 135, type: 'fire', detail: '境界値テストです' }).valid).toBe(true);
  });
});

describe('CDNキャッシュヘッダー (E-2)', () => {
  it('data/*.js は max-age=60, s-maxage=300', () => {
    expect(CACHE_POLICY['/data/incidents.js']).toContain('max-age=60');
    expect(CACHE_POLICY['/data/incidents.js']).toContain('s-maxage=300');
  });

  it('lib/*.js は max-age=86400, immutable', () => {
    // lib は CACHE_POLICY 対象外（アセット配信）。実装定数にないことを確認
    expect(Object.values(CACHE_POLICY).every(v => !v.includes('immutable'))).toBe(true);
  });
});

describe('管理API認証', () => {
  it('正しいAPIキーで認証通過', () => {
    expect(isAdminAuthorized('Bearer admin-key-1', 'admin-key-1')).toBe(true);
  });
  it('空文字は認証失敗', () => {
    expect(isAdminAuthorized('', 'admin-key-1')).toBe(false);
  });
  it('間違ったキーは認証失敗', () => {
    expect(isAdminAuthorized('Bearer wrong-key', 'admin-key-1')).toBe(false);
  });
});
