import { describe, it, expect, beforeEach } from 'vitest';

let calcRiverRisk, filterRiverByLevel;

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/river.js');
    calcRiverRisk = mod.calcRiverRisk;
    filterRiverByLevel = mod.filterRiverByLevel;
  } catch {
    throw new Error('river.js 未実装 → 先に src/logic/river.js を作成してください');
  }
});

describe('P2-1: 河川水位危険度判定', () => {
  it('水位 > 氾濫危険水位(3.0m) は危険レベル critical', () => {
    const result = calcRiverRisk({ currentLevel: 3.5, warningLevel: 2.5, dangerLevel: 3.0 });
    expect(result.level).toBe('critical');
    expect(result.alert).toBe('🔴 氾濫危険');
  });

  it('水位 > 警戒水位(2.5m) かつ < 危険水位(3.0m) は warning', () => {
    const result = calcRiverRisk({ currentLevel: 2.8, warningLevel: 2.5, dangerLevel: 3.0 });
    expect(result.level).toBe('warning');
    expect(result.alert).toBe('🟡 警戒');
  });

  it('水位 < 警戒水位 は normal', () => {
    const result = calcRiverRisk({ currentLevel: 1.5, warningLevel: 2.5, dangerLevel: 3.0 });
    expect(result.level).toBe('normal');
    expect(result.alert).toBe('🟢 平常');
  });

  it('データ欠損時は error を返す', () => {
    const result = calcRiverRisk({});
    expect(result.level).toBe('error');
    expect(result.alert).toContain('データ不足');
  });
});

describe('P2-1: 危険水位フィルタ', () => {
  const rivers = [
    { name: '仁淀川', level: 1.0, dangerLevel: 4.0 },
    { name: '四万十川', level: 3.5, dangerLevel: 3.0 },
    { name: '吉野川', level: 2.5, dangerLevel: 2.8 },
  ];

  it('危険水位超過の河川のみ抽出', () => {
    const result = filterRiverByLevel(rivers, 'critical');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('四万十川');
  });

  it('空配列入力は空配列を返す', () => {
    expect(filterRiverByLevel([], 'critical')).toEqual([]);
  });
});
