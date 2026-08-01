import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// data/tsunami_inundation.js は window.TSUNAMI_INUNDATION = [...] 形式
// Node で読み込んでパースする
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../../data/tsunami_inundation.js');

function loadTsunamiData() {
  if (!fs.existsSync(filePath)) {
    throw new Error('data/tsunami_inundation.js が存在しません → tools/convert_inundation.py を実行してください');
  }
  const src = fs.readFileSync(filePath, 'utf-8');
  const match = src.match(/window\.TSUNAMI_INUNDATION\s*=\s*(\[[\s\S]*\])\s*;/);
  if (!match) throw new Error('TSUNAMI_INUNDATION のパースに失敗');
  return JSON.parse(match[1]);
}

function countCoords(c) {
  if (typeof c === 'number') return 1;
  return c.reduce((s, x) => s + countCoords(x), 0);
}

describe('P1-1: 津波浸水想定データ (data/tsunami_inundation.js)', () => {
  const data = loadTsunamiData();

  it('ポリゴンが存在する（25前後・県×ランク統合）', () => {
    expect(data.length).toBeGreaterThan(20);
    expect(data.length).toBeLessThan(40);
  });

  it('全エントリに p(県)/d(浸水深)/r(ランク)/c(座標) がある', () => {
    for (const entry of data) {
      expect(entry.p).toBeTruthy();
      expect(typeof entry.d).toBe('number');
      expect(entry.d).toBeGreaterThan(0);
      expect(entry.r).toMatch(/m以上/);
      expect(Array.isArray(entry.c)).toBe(true);
      expect(entry.c.length).toBeGreaterThan(0);
    }
  });

  it('4県のうち3県（徳島/愛媛/高知）が含まれる', () => {
    const prefs = new Set(data.map(e => e.p));
    expect(prefs.has('徳島県')).toBe(true);
    expect(prefs.has('愛媛県')).toBe(true);
    expect(prefs.has('高知県')).toBe(true);
  });

  it('浸水深ランクが4段階以上に分類される', () => {
    const depths = new Set(data.map(e => e.d));
    expect(depths.size).toBeGreaterThanOrEqual(4);
  });

  it('座標が四国範囲内（lat 32-34.7, lon 131-135）', () => {
    for (const entry of data) {
      // MultiPolygon: c[0] = 各Polygon, 各Polygon[0] = 外環
      for (const poly of entry.c) {
        const ring = poly[0];
        for (const [lng, lat] of ring) {
          expect(lat).toBeGreaterThan(32);
          expect(lat).toBeLessThan(34.7);
          expect(lng).toBeGreaterThan(131);
          expect(lng).toBeLessThan(135);
        }
      }
    }
  });

  it('ファイルサイズが軽量（1MB未満・モバイル描画可能）', () => {
    const size = fs.statSync(filePath).size;
    expect(size).toBeLessThan(1024 * 1024);
  });
});

describe('E-1: 軽量化 (zoomレベル制御の前提)', () => {
  it('総座標数が 100,000 未満', () => {
    const data = loadTsunamiData();
    const total = data.reduce((s, e) => s + countCoords(e.c), 0);
    expect(total).toBeLessThan(100000);
  });
});
