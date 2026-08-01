import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const filePath = path.join(__dirname, '../../data/config.js');
  const src = fs.readFileSync(filePath, 'utf-8');
  const win = {};
  new Function('window', `${src}\nreturn window.CONFIG;`)(win);
  return win.CONFIG;
}

describe('P2-4: 通信キャリア障害リンク集 (data/config.js RESOURCES.telecom)', () => {
  const cfg = loadConfig();
  const telecom = cfg.RESOURCES.telecom || [];

  it('通信・連絡手段リンクが定義されている', () => {
    expect(telecom.length).toBeGreaterThanOrEqual(6);
  });

  it('全リンクが https で始まる安全な URL', () => {
    for (const t of telecom) {
      expect(t.url).toMatch(/^https:\/\//);
      expect(t.label).toBeTruthy();
    }
  });

  it('主要キャリアと災害用伝言サービスが含まれる', () => {
    const labels = telecom.map(t => t.label).join(' ');
    const urls = telecom.map(t => t.url).join(' ');
    expect(labels).toContain('災害用伝言ダイヤル');
    expect(urls).toContain('web171');
    expect(labels).toContain('NTTドコモ');
    expect(labels).toContain('au');
    expect(labels).toContain('SoftBank');
    expect(labels).toContain('楽天モバイル');
  });
});
