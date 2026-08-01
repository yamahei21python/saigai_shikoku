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

describe('P1-3: 海上輸送ルートデータ (data/ports.js MARINE_ROUTES)', () => {
  const routes = loadData('ports.js', 'MARINE_ROUTES');

  it('主要フェリールート 9 件が定義されている', () => {
    expect(routes.length).toBe(9);
  });

  it('各ルートに必須フィールドと2点の座標がある', () => {
    for (const r of routes) {
      expect(r.id).toMatch(/^route-\d+$/);
      expect(r.name).toBeTruthy();
      expect(r.operator).toBeTruthy();
      expect(r.role).toBeTruthy();
      expect(r.points.length).toBe(2);
      for (const p of r.points) {
        expect(p.length).toBe(2);
        expect(typeof p[0]).toBe('number');
        expect(typeof p[1]).toBe('number');
      }
    }
  });

  it('出発港（points[0]）はすべて四国側', () => {
    for (const r of routes) {
      const [lat, lon] = r.points[0];
      expect(lat).toBeGreaterThan(32);
      expect(lat).toBeLessThan(34.7);
      expect(lon).toBeGreaterThan(131);
      expect(lon).toBeLessThan(135);
    }
  });

  it('主要ルートが含まれる（神戸・大阪・和歌山・別府・佐賀関）', () => {
    const names = routes.map(r => r.name).join(' ');
    expect(names).toContain('神戸');
    expect(names).toContain('大阪');
    expect(names).toContain('和歌山');
    expect(names).toContain('別府');
    expect(names).toContain('佐賀関');
  });
});
