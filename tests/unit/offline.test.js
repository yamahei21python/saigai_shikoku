import { describe, it, expect } from 'vitest';

// E-5: オフライン写真投稿キューのロジック検証
// 実運用時は IndexedDB + Service Worker と結合
// ここではデータ構造とキューイング動作を定義

function createOfflineQueue() {
  const queue = [];
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  let totalSize = 0;

  function enqueue(post) {
    const size = new Blob([JSON.stringify(post)]).size;
    // 上限超過: 古いものから削除
    while (totalSize + size > MAX_SIZE && queue.length > 0) {
      const removed = queue.shift();
      totalSize -= new Blob([JSON.stringify(removed)]).size;
    }
    queue.push(post);
    totalSize += size;
    return queue.length;
  }

  function dequeue() {
    return queue.shift() || null;
  }

  function peek() {
    return queue.length > 0 ? queue[0] : null;
  }

  function size() {
    return queue.length;
  }

  function clear() {
    queue.length = 0;
    totalSize = 0;
  }

  return { enqueue, dequeue, peek, size, clear };
}

describe('OFF-01: オフライン投稿', () => {
  it('オフライン時はキューにデータが追加される', () => {
    const q = createOfflineQueue();
    q.enqueue({ type: 'rescue', detail: '水が必要です', lat: 33.5, lon: 133.5 });
    expect(q.size()).toBe(1);
    expect(q.peek().type).toBe('rescue');
  });
});

describe('OFF-02: 容量超過時の古いキュー自動削除', () => {
  it('50MB上限超過時、古い未送信キューから削除される', () => {
    const q = createOfflineQueue();
    // 巨大データで上限を超えさせる
    const bigData = { data: 'x'.repeat(30 * 1024 * 1024) }; // ~30MB
    const biggerData = { data: 'x'.repeat(40 * 1024 * 1024) }; // ~40MB
    q.enqueue(bigData);
    expect(q.size()).toBe(1);
    q.enqueue(biggerData);
    // 合計70MB > 50MB → 古いbigData削除、biggerDataのみ保持
    expect(q.size()).toBe(1);
    expect(q.peek().data.length).toBe(40 * 1024 * 1024);
  });
});

describe('OFF-03: オンライン復帰時の同期', () => {
  it('キューにデータがあれば順次送信される', () => {
    const q = createOfflineQueue();
    q.enqueue({ id: 1, detail: '救助要請' });
    q.enqueue({ id: 2, detail: '給水所情報' });

    // オンライン復帰 → 先頭から処理
    const sent = [];
    while (q.size() > 0) {
      sent.push(q.dequeue());
    }

    expect(sent.length).toBe(2);
    expect(sent[0].id).toBe(1);
    expect(sent[1].id).toBe(2);
  });
});

describe('OFF-04: 送信成功後のキュー削除', () => {
  it('送信成功したレコードはキューから消える', () => {
    const q = createOfflineQueue();
    q.enqueue({ id: 1, detail: 'test' });
    q.enqueue({ id: 2, detail: 'test2' });

    // 1件送信成功
    q.dequeue();
    expect(q.size()).toBe(1);
    expect(q.peek().id).toBe(2);

    // 全件送信完了
    q.clear();
    expect(q.size()).toBe(0);
  });
});
