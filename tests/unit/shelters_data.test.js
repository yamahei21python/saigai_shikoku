import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadData(relPath, varName) {
  const filePath = path.join(__dirname, '../../data', relPath);
  if (!fs.existsSync(filePath)) throw new Error(`${relPath} が存在しません`);
  const src = fs.readFileSync(filePath, 'utf-8');
  const win = {};
  new Function('window', `${src}\nreturn window.${varName};`)(win);
  return win[varName];
}

describe('P0-8: 指定避難所データ (data/shelters.js)', () => {
  const data = loadData('shelters.js', 'SHELTERS_DATA');

  it('4県すべての避難所が含まれる', () => {
    const prefs = new Set(data.map(s => s.pref));
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('香川')).toBe(true);
    expect(prefs.has('愛媛')).toBe(true);
    expect(prefs.has('高知')).toBe(true);
  });

  it('十分な件数（4県で2000件以上）', () => {
    expect(data.length).toBeGreaterThan(2000);
  });

  it('全エントリに必須フィールドと四国範囲座標がある', () => {
    for (const s of data) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.address).toBeTruthy();
      expect(s.lat).toBeGreaterThan(32);
      expect(s.lat).toBeLessThan(34.7);
      expect(s.lon).toBeGreaterThan(131);
      expect(s.lon).toBeLessThan(135);
    }
  });

  it('各県に一定数の避難所がある', () => {
    const perPref = {};
    for (const s of data) perPref[s.pref] = (perPref[s.pref] || 0) + 1;
    for (const p of ['徳島', '香川', '愛媛', '高知']) {
      expect(perPref[p]).toBeGreaterThan(500);
    }
  });
});

describe('P1-2: 津波避難施設データ (data/tsunami_towers.js)', () => {
  const data = loadData('tsunami_towers.js', 'TSUNAMI_TOWERS');

  it('4県すべてに津波避難場所がある', () => {
    const prefs = new Set(data.map(t => t.pref));
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('香川')).toBe(true);
    expect(prefs.has('愛媛')).toBe(true);
    expect(prefs.has('高知')).toBe(true);
  });

  it('type は tower/building/highground のいずれか', () => {
    for (const t of data) {
      expect(['tower', 'building', 'highground']).toContain(t.type);
    }
  });

  it('津波避難タワーが存在する', () => {
    const towers = data.filter(t => t.type === 'tower');
    expect(towers.length).toBeGreaterThan(10);
  });

  it('全エントリに必須フィールドと四国範囲座標がある', () => {
    for (const t of data) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.lat).toBeGreaterThan(32);
      expect(t.lat).toBeLessThan(34.7);
      expect(t.lon).toBeGreaterThan(131);
      expect(t.lon).toBeLessThan(135);
    }
  });

  it('十分な件数（津波避難場所1000件以上）', () => {
    expect(data.length).toBeGreaterThan(1000);
  });
});
