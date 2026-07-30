import { describe, it, expect, beforeEach } from 'vitest';

let getSupportStatus, sortByDistance;
const NOW = new Date('2026-03-01T12:00:00Z');

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/support.js');
    getSupportStatus = mod.getSupportStatus;
    sortByDistance = mod.sortByDistance;
  } catch {
    throw new Error('support.js 未実装 → 先に src/logic/support.js を作成してください');
  }
});

// ──────────────────────────────────────────────
// SUP-01〜05: 生活支援ステータス
// ──────────────────────────────────────────────

describe('SUP-01: 鮮度判定 - アクティブ', () => {
  it('2時間前の給水所データは active', () => {
    if (!getSupportStatus) return;
    const updated = '2026-03-01T10:00:00Z'; // 2h前
    expect(getSupportStatus(updated, 'open', NOW)).toBe('active');
  });
});

describe('SUP-02: 鮮度判定 - 警告', () => {
  it('10時間前の避難所データは warning', () => {
    if (!getSupportStatus) return;
    const updated = '2026-03-01T02:00:00Z'; // 10h前
    expect(getSupportStatus(updated, 'open', NOW)).toBe('warning');
  });
});

describe('SUP-03: 鮮度判定 - 過古', () => {
  it('25時間前の生活支援データは expired', () => {
    if (!getSupportStatus) return;
    const updated = '2026-02-28T11:00:00Z'; // 25h前
    expect(getSupportStatus(updated, 'open', NOW)).toBe('expired');
  });
});

describe('SUP-04: 距離ソート（Haversine）', () => {
  it('現在地から近い順にソートされる', () => {
    if (!sortByDistance) return;
    const loc = { lat: 33.5, lon: 133.5 };
    const items = [
      { name: '遠い', lat: 34.0, lon: 134.0 },  // ~70km
      { name: '近い', lat: 33.5, lon: 133.5 },   // 0km
      { name: '中間', lat: 33.7, lon: 133.7 },   // ~25km
    ];
    const sorted = sortByDistance(items, loc);
    expect(sorted[0].name).toBe('近い');
    expect(sorted[1].name).toBe('中間');
    expect(sorted[2].name).toBe('遠い');
  });
});

describe('SUP-05: GPS未取得時のデフォルトソート', () => {
  it('GPS拒否時は県庁所在地基準でエラーなくソート', () => {
    if (!sortByDistance) return;
    // null の現在地 → 高松市(34.3,134.0)をデフォルトに
    const items = [
      { name: '高知', lat: 33.5, lon: 133.5 },
      { name: '松山', lat: 33.8, lon: 132.8 },
    ];
    // フォールバック位置でソートできれば OK（例外を吐かない）
    expect(() => sortByDistance(items, null)).not.toThrow();
    const result = sortByDistance(items, null);
    expect(result.length).toBe(2);
  });
});
