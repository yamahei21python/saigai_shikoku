import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let calcRiverRisk, filterRiverByLevel;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadRiverCameras() {
  const filePath = path.join(__dirname, '../../data/river_cameras.js');
  if (!fs.existsSync(filePath)) {
    throw new Error('data/river_cameras.js が存在しません');
  }
  const src = fs.readFileSync(filePath, 'utf-8');
  const win = {};
  // 手書きJSはキー未引用のため new Function で評価して window 経由で取得
  new Function('window', `${src}\nreturn window.RIVER_CAMERAS;`)(win);
  return win.RIVER_CAMERAS;
}

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/river.js');
    calcRiverRisk = mod.calcRiverRisk;
    filterRiverByLevel = mod.filterRiverByLevel;
  } catch {
    throw new Error('river.js 未実装');
  }
});

describe('P2-1: 河川カメラ・水位データ (data/river_cameras.js)', () => {
  const data = loadRiverCameras();

  it('4県すべての河川観測所が含まれる', () => {
    const prefs = new Set(data.map(r => r.pref));
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('香川')).toBe(true);
    expect(prefs.has('愛媛')).toBe(true);
    expect(prefs.has('高知')).toBe(true);
  });

  it('カメラと水位計の両タイプが存在する', () => {
    const types = new Set(data.map(r => r.type));
    expect(types.has('camera')).toBe(true);
    expect(types.has('gauge')).toBe(true);
  });

  it('全エントリに必須フィールドがある', () => {
    for (const r of data) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.river).toBeTruthy();
      expect(r.lat).toBeGreaterThan(32);
      expect(r.lat).toBeLessThan(34.7);
      expect(r.lon).toBeGreaterThan(131);
      expect(r.lon).toBeLessThan(135);
      expect(r.dangerLevel).toBeGreaterThan(0);
      expect(r.warningLevel).toBeGreaterThan(0);
      expect(r.url).toMatch(/^https:\/\//);
    }
  });

  it('水位が氾濫危険水位を超えている観測所がcritical判定になる', () => {
    const risky = data.filter(r => r.level >= r.dangerLevel);
    if (risky.length > 0) {
      for (const r of risky) {
        const risk = calcRiverRisk({ currentLevel: r.level, warningLevel: r.warningLevel, dangerLevel: r.dangerLevel });
        expect(risk.level).toBe('critical');
      }
    }
  });

  it('全観測所が何らかの危険度判定を持つ', () => {
    for (const r of data) {
      const risk = calcRiverRisk({ currentLevel: r.level, warningLevel: r.warningLevel, dangerLevel: r.dangerLevel });
      expect(['normal', 'warning', 'critical']).toContain(risk.level);
    }
  });
});

describe('P2-1: 危険水位フィルタ（データ連携）', () => {
  it('データからcriticalレベルの河川を抽出できる', () => {
    const data = loadRiverCameras();
    const critical = filterRiverByLevel(data, 'critical');
    expect(Array.isArray(critical)).toBe(true);
  });
});
