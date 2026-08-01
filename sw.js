/* ═══════════════════════════════════════════════
 * P3-1: Service Worker（キャッシュ戦略のみ担当）
 * 戦略:
 *   - data/*.js:      Network First（10分更新・失敗時キャッシュ）
 *   - 地理院タイル:    Cache First（容量制限つき）
 *   - lib/*・静的:     Cache First（不変）
 *   - API(/api/):     Network Only（オフラインはクライアント側キューへ）
 * ※ SW登録・IndexedDBキュー・オンライン検知は pwa.js が担当（分離済み）
 * ═══════════════════════════════════════════════
 */
const CACHE_STATIC = 'saigai-static-v1';
const CACHE_TILES = 'saigai-tiles-v1';
const CACHE_DATA = 'saigai-data-v1';

// プリキャッシュ対象（初回オフライン起動に必要な最小セット）
const STATIC_ASSETS = [
  './',
  './index.html',
  './pwa.js',
  './styles.css',
  './lib/leaflet.js',
  './data/config.js',
  './data/incidents.js',
  './data/facilities.js',
  './data/shelters.js',
  './data/ports.js',
  './data/isolation.js',
  './data/tsunami_towers.js',
  './data/tsunami_inundation.js',
  './data/river_cameras.js',
  './data/michinoeki.js',
  './data/outage.js',
  './data/fdma_latest.js',
  './data/life_support.js',
];

// タイル容量制限（約50MB: 地理院タイル PNG 平均 20-30KB × 2000 枚）
const MAX_TILE_ENTRIES = 2000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_TILES && k !== CACHE_DATA)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/** タイルをキャッシュ（容量制限: 上限超過で最古エントリ削除） */
async function cacheTile(request, response) {
  const cache = await caches.open(CACHE_TILES);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  while (keys.length > MAX_TILE_ENTRIES) {
    await cache.delete(keys.shift());
  }
}

/** Network First: ネットワーク優先、失敗時キャッシュフォールバック */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DATA);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API は Network Only（オフライン時はクライアント側 IndexedDB キューへ）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 地理院タイル: Cache First + 容量制限
  if (url.hostname === 'cyberjapandata.gsi.go.jp' && /xyz\//.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) cacheTile(event.request, response);
          return response;
        });
      })
    );
    return;
  }

  // data/*.js: Network First（10分更新）
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirst(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // lib/*・静的アセット: Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const cacheable = response && response.ok && event.request.method === 'GET';
        if (cacheable && url.origin === self.location.origin) {
          caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      });
    })
  );
});
