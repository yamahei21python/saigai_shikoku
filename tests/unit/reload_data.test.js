import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

// index.html の DYNAMIC_DATA_FILES と同じリスト（P0-10 リロード対象）
// ※ index.html に追加・削除するときは必ずここも同期すること
const RELOAD_TARGETS = [
  'data/life_support.js',
  'data/incidents.js',
  'data/fdma_latest.js',
  'data/facilities.js',
  'data/ports.js',
  'data/isolation.js',
  'data/river_cameras.js',
  'data/michinoeki.js',
  'data/outage.js',
];

// 巨大・静的データ（リロード対象外）
const STATIC_EXCLUDED = [
  'data/shelters.js',
  'data/tsunami_towers.js',
  'data/tsunami_inundation.js',
];

describe('P0-10: 10分自動リロード', () => {
  it('リロード対象ファイルがすべて存在する', () => {
    for (const f of RELOAD_TARGETS) {
      expect(fs.existsSync(path.join(root, f)), f).toBe(true);
    }
  });

  it('リロード対象ファイルは window.* 形式でグローバル定義されている（eval再評価可能）', () => {
    for (const f of RELOAD_TARGETS) {
      const src = fs.readFileSync(path.join(root, f), 'utf-8');
      expect(src, f).toMatch(/window\.\w+\s*=/);
    }
  });

  it('巨大静的データはリロード対象外（帯域節約）', () => {
    for (const f of STATIC_EXCLUDED) {
      const size = fs.statSync(path.join(root, f)).size;
      expect(size, f).toBeGreaterThan(100 * 1024); // 100KB超
    }
  });

  it('リロード対象には巨大ファイルが含まれない（各1MB未満）', () => {
    for (const f of RELOAD_TARGETS) {
      const size = fs.statSync(path.join(root, f)).size;
      expect(size, f).toBeLessThan(1024 * 1024);
    }
  });

  it('index.html に reloadDataFiles が定義され、setInterval から呼ばれる', () => {
    const src = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
    expect(src).toMatch(/function reloadDataFiles\(\)/);
    expect(src).toMatch(/function refreshAllLayers\(\)/);
    expect(src).toMatch(/setInterval\(reloadDataFiles/);
  });
});
