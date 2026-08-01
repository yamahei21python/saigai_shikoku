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

describe('P2-3: 停電情報データ (data/outage.js)', () => {
  const data = loadData('outage.js', 'OUTAGE_DATA');
  const summary = loadData('outage.js', 'OUTAGE_SUMMARY');

  it('OUTAGE_DATA は配列（停電ゼロなら空）', () => {
    expect(Array.isArray(data)).toBe(true);
  });

  it('OUTAGE_SUMMARY は軒数合計と更新時刻を持つ', () => {
    expect(summary).toBeTruthy();
    expect(typeof summary.total).toBe('number');
    expect(summary.total).toBeGreaterThanOrEqual(0);
    expect(summary.updated).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('停電がある場合、各エントリは必須フィールドと四国範囲座標を持つ', () => {
    for (const o of data) {
      expect(o.id).toMatch(/^out-\d+$/);
      expect(o.pref).toBeTruthy();
      expect(typeof o.households).toBe('number');
      expect(o.households).toBeGreaterThan(0);
      expect(['outage', 'restoring']).toContain(o.status);
      expect(o.lat).toBeGreaterThan(32);
      expect(o.lat).toBeLessThan(34.7);
      expect(o.lon).toBeGreaterThan(131);
      expect(o.lon).toBeLessThan(135);
      expect(o.startTime).toBeTruthy();
    }
  });

  it('軒数合計は各エントリの合計と一致する', () => {
    const sum = data.reduce((a, o) => a + o.households, 0);
    expect(summary.total).toBe(sum);
  });
});
