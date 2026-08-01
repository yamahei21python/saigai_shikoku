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

describe('P2-2: 孤立可能性集落データ (data/isolation.js)', () => {
  const data = loadData('isolation.js', 'ISOLATION_RISK_DATA');

  it('実データ（yodolabs研究）が含まれる', () => {
    const yodolabs = data.filter(a => a.source === 'yodolabs');
    expect(yodolabs.length).toBeGreaterThanOrEqual(15);
  });

  it('高知・徳島・愛媛に yodolabs 集落が存在する', () => {
    const yodolabs = data.filter(a => a.source === 'yodolabs');
    const prefs = new Set(yodolabs.map(a => a.pref));
    expect(prefs.has('高知')).toBe(true);
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('愛媛')).toBe(true);
  });

  it('yodolabs 集落はスコア・人口・高齢化率を持つ', () => {
    const yodolabs = data.filter(a => a.source === 'yodolabs');
    for (const a of yodolabs) {
      expect(typeof a.score).toBe('number');
      expect(a.score).toBeGreaterThan(0);
      expect(a.score).toBeLessThanOrEqual(1);
      expect(typeof a.population).toBe('number');
      expect(typeof a.elderlyRate).toBe('number');
      expect(a.elderlyRate).toBeGreaterThan(0);
      expect(a.elderlyRate).toBeLessThanOrEqual(100);
      expect(typeof a.hospitalKm).toBe('number');
      expect(typeof a.locNote).toBe('string');
      expect(a.desc).toContain('yodolabs');
    }
  });

  it('id プレフィックスが都道府県コードと整合する', () => {
    // 36=徳島 37=香川 38=愛媛 39=高知
    const prefCode = { '徳島': '36', '香川': '37', '愛媛': '38', '高知': '39' };
    for (const a of data) {
      const code = a.id.split('-')[1];
      expect(code).toBe(prefCode[a.pref]);
    }
  });

  it('上位30相当（煙硝蔵・御殿内）が含まれる', () => {
    const names = data.map(a => a.areaName).join('');
    expect(names).toContain('煙硝蔵');
    expect(names).toContain('御殿内');
  });

  it('全エントリに必須フィールドと四国範囲座標がある', () => {
    for (const a of data) {
      expect(a.id).toBeTruthy();
      expect(a.areaName).toBeTruthy();
      expect(a.pref).toBeTruthy();
      expect(a.muni).toBeTruthy();
      expect(a.status).toMatch(/high_risk|medium_risk|low_risk/);
      expect(a.lat).toBeGreaterThan(32);
      expect(a.lat).toBeLessThan(34.7);
      expect(a.lon).toBeGreaterThan(131);
      expect(a.lon).toBeLessThan(135);
    }
  });

  it('4県すべてをカバーする', () => {
    const prefs = new Set(data.map(a => a.pref));
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('香川')).toBe(true);
    expect(prefs.has('愛媛')).toBe(true);
    expect(prefs.has('高知')).toBe(true);
  });
});

describe('P2-2b: 県別統計 (window.ISOLATION_PREF_STATS)', () => {
  const stats = loadData('isolation.js', 'ISOLATION_PREF_STATS');

  it('4県すべてが含まれる', () => {
    expect(stats.length).toBe(4);
    const prefs = new Set(stats.map(s => s.pref));
    expect(prefs.has('愛媛')).toBe(true);
    expect(prefs.has('徳島')).toBe(true);
    expect(prefs.has('香川')).toBe(true);
    expect(prefs.has('高知')).toBe(true);
  });

  it('高知県が最多（全国最多の孤立可能性集落）', () => {
    const kochi = stats.find(s => s.pref === '高知');
    expect(kochi.total).toBeGreaterThan(900);
    expect(kochi.agricultural).toBeGreaterThan(800);
  });

  it('各県の合計は農業+漁業と一致', () => {
    for (const s of stats) {
      expect(s.total).toBe(s.agricultural + s.fishery);
    }
  });
});
