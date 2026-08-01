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

describe('P2-2: 道の駅・防災拠点データ (data/michinoeki.js)', () => {
  const data = loadData('michinoeki.js', 'MICHINOEKI_DATA');

  it('公式登録数 91駅（四国4県）がすべて含まれる', () => {
    expect(data.length).toBe(91);
  });

  it('県別内訳が公式一覧と一致（徳島18・香川18・愛媛29・高知26）', () => {
    const cnt = { '徳島': 0, '香川': 0, '愛媛': 0, '高知': 0 };
    for (const d of data) cnt[d.pref]++;
    expect(cnt['徳島']).toBe(18);
    expect(cnt['香川']).toBe(18);
    expect(cnt['愛媛']).toBe(29);
    expect(cnt['高知']).toBe(26);
  });

  it('id プレフィックスが都道府県コードと整合し県内連番', () => {
    // 36=徳島 37=香川 38=愛媛 39=高知
    const prefCode = { '徳島': '36', '香川': '37', '愛媛': '38', '高知': '39' };
    const seq = {};
    for (const d of data) {
      const code = d.id.split('-')[1];
      expect(code).toBe(prefCode[d.pref]);
      seq[d.pref] = (seq[d.pref] || 0) + 1;
      expect(d.id).toBe(`michi-${prefCode[d.pref]}-${String(seq[d.pref]).padStart(2, '0')}`);
    }
  });

  it('全駅に必須フィールドと四国範囲座標がある', () => {
    for (const d of data) {
      expect(d.id).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.address).toBeTruthy();
      expect(d.lat).toBeGreaterThan(32);
      expect(d.lat).toBeLessThan(34.7);
      expect(d.lon).toBeGreaterThan(131);
      expect(d.lon).toBeLessThan(135);
      expect(typeof d.generator).toBe('boolean');
      expect(typeof d.stockpile).toBe('boolean');
      expect(typeof d.toilet24h).toBe('boolean');
      expect(typeof d.water).toBe('boolean');
      expect(typeof d.funcInfo).toBe('boolean');
    }
  });

  it('座標取得元が許可値のみ（osm / manual / nominatim）', () => {
    for (const d of data) {
      expect(['osm', 'manual', 'nominatim']).toContain(d.source);
    }
  });

  it('防災機能フラグは未収集（funcInfo=false）が明示されている', () => {
    for (const d of data) {
      // 収集前は「情報なし」として明示（誤導防止）。実地確認後に funcInfo=true 化
      expect(d.funcInfo).toBe(false);
      expect(d.generator).toBe(false);
      expect(d.stockpile).toBe(false);
      expect(d.water).toBe(false);
    }
  });

  it('id が重複しない', () => {
    const ids = new Set(data.map(d => d.id));
    expect(ids.size).toBe(data.length);
  });
});
