import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('P3-1: Service Worker (sw.js)', () => {
  const sw = fs.readFileSync(path.join(__dirname, '../../sw.js'), 'utf-8');

  it('プリキャッシュに index.html と styles.css と leaflet が含まれる', () => {
    expect(sw).toMatch(/index\.html/);
    expect(sw).toMatch(/styles\.css/);
    expect(sw).toMatch(/lib\/leaflet\.js/);
  });

  it('data/*.js が Network First（10分更新・失敗時キャッシュ）', () => {
    expect(sw).toMatch(/networkFirst/);
    expect(sw).toMatch(/\/data\//);
  });

  it('地理院タイルが Cache First + 容量制限', () => {
    expect(sw).toMatch(/cyberjapandata\.gsi\.go\.jp/);
    expect(sw).toMatch(/MAX_TILE_ENTRIES/);
  });

  it('API は Network Only（オフラインはクライアント側キュー）', () => {
    expect(sw).toMatch(/\/api\//);
  });

  it('古いキャッシュを削除する activate 処理がある', () => {
    expect(sw).toMatch(/activate/);
    expect(sw).toMatch(/caches\.delete/);
  });
});

describe('P3-1: PWA 組み込み (pwa.js + manifest.json)', () => {
  const pwa = fs.readFileSync(path.join(__dirname, '../../pwa.js'), 'utf-8');
  const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../../manifest.json'), 'utf-8'));

  it('manifest.json が有効でアイコンを持つ', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.type).toBeTruthy();
    }
  });

  it('index.html に manifest リンクと theme-color があり pwa.js を読み込む', () => {
    expect(html).toMatch(/rel="manifest"/);
    expect(html).toMatch(/theme-color/);
    expect(html).toMatch(/<script src="\.\/pwa\.js"><\/script>/);
  });

  it('pwa.js に Service Worker 登録がある', () => {
    expect(pwa).toMatch(/serviceWorker\.register\('\.\/sw\.js'\)/);
  });

  it('pwa.js にオフライン投稿キュー（IndexedDB）が実装されている', () => {
    expect(pwa).toMatch(/enqueueReport/);
    expect(pwa).toMatch(/flushOfflineQueue/);
    expect(pwa).toMatch(/OFFLINE_MAX_SIZE/);
  });

  it('pwa.js がオンライン復帰時の自動再送と window 公開 API を持つ', () => {
    expect(pwa).toMatch(/addEventListener\('online'/);
    expect(pwa).toMatch(/window\.enqueueReport\s*=/);
    expect(pwa).toMatch(/window\.flushOfflineQueue\s*=/);
  });

  it('index.html の投稿失敗時にオフラインキューへ保存する導線がある', () => {
    expect(html).toMatch(/enqueueReport\(payload\)/);
  });

  it('アイコンファイルが存在する', () => {
    expect(fs.existsSync(path.join(__dirname, '../../icons/icon-192.png'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../../icons/icon-512.png'))).toBe(true);
  });
});
