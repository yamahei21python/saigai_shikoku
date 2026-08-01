import { describe, it, expect } from 'vitest';
import { validateReport, isAdminAuthorized, CACHE_POLICY } from '../../api/index.js';

// APIバリデーションロジック（実装 api/index.js を直接検証）
// R-3: 自前複製を廃止し、実装 import 化

describe('API-01: POST /api/reports バリデーション', () => {
  it('lat/lon がない不正リクエストは invalid', () => {
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
      type: 'rescue',
    });
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe('API-03: CDNキャッシュヘッダー', () => {
  it('動的データは max-age=60, s-maxage=300', () => {
    expect(CACHE_POLICY['/data/incidents.js']).toContain('max-age=60');
    expect(CACHE_POLICY['/data/incidents.js']).toContain('s-maxage=300');
  });
  it('/index.html は max-age=0', () => {
    expect(CACHE_POLICY['/index.html']).toContain('max-age=0');
  });
});

describe('API-04: 管理API認証', () => {
  it('不正なAPIキーは失敗', () => {
    expect(isAdminAuthorized('Bearer wrong-key', 'real-key')).toBe(false);
    expect(isAdminAuthorized('', 'real-key')).toBe(false);
    expect(isAdminAuthorized(null, 'real-key')).toBe(false);
  });

  it('正しいAPIキーは認証通過', () => {
    expect(isAdminAuthorized('Bearer real-key', 'real-key')).toBe(true);
  });

  it('env 未設定時のフォールバックキー（開発用）', () => {
    expect(isAdminAuthorized('Bearer shikoku-quake-secret-key-2026', undefined)).toBe(true);
  });
});
