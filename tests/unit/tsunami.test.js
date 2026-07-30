import { describe, it, expect, beforeEach } from 'vitest';

let calculateNearestTower, filterTsunamiInundation;

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/tsunami.js');
    calculateNearestTower = mod.calculateNearestTower;
    filterTsunamiInundation = mod.filterTsunamiInundation;
  } catch {
    throw new Error('tsunami.js 未実装 → 先に src/logic/tsunami.js を作成してください');
  }
});

const mockTowers = [
  { name: "種崎津波避難タワー", lat: 33.5042, lon: 133.5851, capacity: 450 },
  { name: "阿南市避難ビル", lat: 33.8681, lon: 134.6912, capacity: 800 },
  { name: "黒潮町避難タワー", lat: 33.0300, lon: 133.0200, capacity: 300 }
];

describe('P1-2: 津波避難タワー距離・方位計算', () => {
  it('現在地から最寄りのタワーへの距離と方位が正確に計算される', () => {
    // 高知市桂浜付近
    const result = calculateNearestTower(33.4971, 133.5751, mockTowers);
    expect(result.name).toBe("種崎津波避難タワー");
    expect(result.distanceKm).toBeLessThan(2.0);
    expect(result.bearing).toBeGreaterThanOrEqual(0);
    expect(result.bearing).toBeLessThanOrEqual(360);
  });

  it('タワーリストが空の場合は null を返す', () => {
    const result = calculateNearestTower(33.5, 133.5, []);
    expect(result).toBeNull();
  });

  it('方位が0度(真北)または90度(真東)を正しく計算できる', () => {
    // 真北: 現在地から真北にタワー
    const northResult = calculateNearestTower(33.0, 133.0, [
      { name: "真北タワー", lat: 33.1, lon: 133.0, capacity: 100 }
    ]);
    expect(northResult.bearing).toBeCloseTo(0, 0);
  });
});

describe('E-1: 津波浸水ポリゴン描画制御', () => {
  it('zoom 9 は描画フラグ false（メモリ保護）', () => {
    expect(filterTsunamiInundation(9)).toBe(false);
  });
  it('zoom 10 以上は描画フラグ true', () => {
    expect(filterTsunamiInundation(10)).toBe(true);
    expect(filterTsunamiInundation(15)).toBe(true);
  });
  it('小数点zoomも正しく判定', () => {
    expect(filterTsunamiInundation(9.5)).toBe(false);
    expect(filterTsunamiInundation(10.0)).toBe(true);
  });
});
