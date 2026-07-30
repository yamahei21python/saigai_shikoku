import { describe, it, expect, beforeEach } from 'vitest';

let calcIsolationScore, findNearestPort, calcSeaRoute;

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/ports.js');
    calcIsolationScore = mod.calcIsolationScore;
    findNearestPort = mod.findNearestPort;
    calcSeaRoute = mod.calcSeaRoute;
  } catch {
    throw new Error('ports.js 未実装 → 先に src/logic/ports.js を作成してください');
  }
});

const mockPorts = [
  { name: '高知港', lat: 33.5450, lon: 133.5750, depth: 8, active: true },
  { name: '徳島小松島港', lat: 34.0010, lon: 134.5920, depth: 10, active: true },
  { name: '松山港', lat: 33.8600, lon: 132.7100, depth: 12, active: true },
  { name: '高松港', lat: 34.3550, lon: 134.0550, depth: 7, active: false }, // 被災で使用不可
];

describe('P1-3: 孤立可能性スコア', () => {
  it('道路不通 + 津波浸水エリア + 標高低い = 高リスク', () => {
    const result = calcIsolationScore({
      roadAccessible: false,
      tsunamiRisk: true,
      elevationM: 2,
      nearbyVillages: 0,
      hasPort: false
    });
    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it('道路アクセス可 + 高台 = 低リスク', () => {
    const result = calcIsolationScore({
      roadAccessible: true,
      tsunamiRisk: false,
      elevationM: 50,
      nearbyVillages: 3,
      hasPort: true
    });
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('道路不通だが港あり + 高台 = 中リスク', () => {
    const result = calcIsolationScore({
      roadAccessible: false,
      tsunamiRisk: false,
      elevationM: 40,
      nearbyVillages: 1,
      hasPort: true
    });
    expect(result.level).toBe('medium');
  });
});

describe('P1-3: 最寄り港検索', () => {
  it('活動中の最寄り港を返す', () => {
    const result = findNearestPort(33.5, 133.5, mockPorts);
    expect(result.name).toBe('高知港');
    expect(result.distanceKm).toBeLessThan(10);
  });

  it('全港 inactive なら null', () => {
    const inactive = mockPorts.map(p => ({ ...p, active: false }));
    const result = findNearestPort(33.5, 133.5, inactive);
    expect(result).toBeNull();
  });
});

describe('P1-3: 海上輸送ルート距離', () => {
  it('港間の海上距離を計算', () => {
    // 高知港→徳島小松島港
    const result = calcSeaRoute(
      { lat: 33.545, lon: 133.575 },
      { lat: 34.001, lon: 134.592 }
    );
    expect(result.distanceKm).toBeGreaterThan(80);
    expect(result.distanceKm).toBeLessThan(120);
    expect(result.bearing).toBeGreaterThan(30);
    expect(result.bearing).toBeLessThan(70);
  });
});
