/* ═══════════════════════════════════════════════
 * P3-1: PWA クライアントロジック
 * 責務（sw.js とは分離）:
 *   - Service Worker 登録
 *   - オフライン投稿キュー（IndexedDB）
 *   - オンライン復帰時の自動再送
 *   ※ sw.js はキャッシュ戦略のみ担当
 * ═══════════════════════════════════════════════ */

const OFFLINE_DB = 'offline-queue';
const OFFLINE_STORE = 'reports';
const OFFLINE_MAX_SIZE = 50 * 1024 * 1024; // 50MB 上限（REQUIREMENTS P3-1）

/** IndexedDB 接続（なければ reports ストアを作成） */
function openQueueDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(OFFLINE_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(OFFLINE_STORE)) {
        req.result.createObjectStore(OFFLINE_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function blobSize(obj) {
  try { return new Blob([JSON.stringify(obj)]).size; } catch { return 0; }
}

/** 容量上限超過時、古いエントリから削除 */
async function pruneQueue(store) {
  const all = await new Promise((res) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => res([]);
  });
  all.sort((a, b) => (b.queuedAt || '').localeCompare(a.queuedAt || ''));
  let total = all.reduce((acc, r) => acc + blobSize(r), 0);
  while (total > OFFLINE_MAX_SIZE && all.length > 0) {
    const old = all.pop();
    store.delete(old.id);
    total -= blobSize(old);
  }
}

/** 投稿をサーバーへ送信（handleReportSubmit / flushOfflineQueue 共通） */
async function postReport(payload) {
  const base = window.API_BASE || '/api';
  return fetch(`${base}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** オフライン投稿をキューへ保存 */
async function enqueueReport(payload) {
  const db = await openQueueDB();
  const tx = db.transaction(OFFLINE_STORE, 'readwrite');
  const store = tx.objectStore(OFFLINE_STORE);
  await pruneQueue(store);
  const id = 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  store.put(Object.assign({ id }, payload, { queuedAt: new Date().toISOString() }));
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}

/** キュー内の全投稿を再送。成功件数を返す */
async function flushOfflineQueue() {
  if (!navigator.onLine) return 0;
  let db;
  try { db = await openQueueDB(); } catch { return 0; }
  const tx = db.transaction(OFFLINE_STORE, 'readwrite');
  const store = tx.objectStore(OFFLINE_STORE);
  const all = await new Promise((res) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => res([]);
  });
  let sent = 0;
  for (const item of all) {
    const payload = Object.assign({}, item);
    delete payload.id; delete payload.queuedAt;
    try {
      const res = await postReport(payload);
      if (!res.ok) break;
      await new Promise((res2, rej2) => {
        const d = store.delete(item.id);
        d.onsuccess = res2;
        d.onerror = () => rej2(d.error);
      });
      sent++;
    } catch { break; }
  }
  return sent;
}

/** Service Worker 登録（オフラインキャッシュ有効化） */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js')
    .catch(err => console.warn('[PWA] SW登録失敗:', err));
}
registerServiceWorker();

// オンライン復帰時に未送信キューを自動再送
window.addEventListener('online', () => {
  flushOfflineQueue().then(n => {
    if (n > 0) console.log(`[PWA] オフライン投稿 ${n}件を再送しました`);
  });
});

// 他スクリプト（handleReportSubmit / E2Eテスト）から利用できるよう公開
window.enqueueReport = enqueueReport;
window.flushOfflineQueue = flushOfflineQueue;
window.postReport = postReport;
