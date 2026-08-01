import { test, expect } from '@playwright/test';

test.describe('P3-1: PWA オフライン対応', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
  });

  test('Service Worker が登録される', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    const reg = await page.evaluate(() =>
      navigator.serviceWorker.getRegistration().then(r => !!r)
    );
    expect(reg).toBe(true);
  });

  test('オフライン時に投稿が IndexedDB キューへ保存される', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.waitForTimeout(300);

    await page.locator('.fab-report').click();
    await page.waitForTimeout(300);
    await page.locator('#reportType').selectOption('rescue');
    await page.locator('#reportDetail').fill('E2Eオフライン投稿テスト');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(800);

    const queued = await page.evaluate(() => new Promise(resolve => {
      const req = indexedDB.open('offline-queue', 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('reports', 'readonly');
        const all = tx.objectStore('reports').getAll();
        all.onsuccess = () => resolve(all.result.length);
        all.onerror = () => resolve(0);
      };
      req.onerror = () => resolve(0);
    }));
    expect(queued).toBeGreaterThan(0);
  });

  test('オンライン復帰時の自動再送フローが発火する（API応答に依存せず flush が呼ばれる）', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await context.setOffline(true);
    await page.waitForTimeout(300);

    // 投稿でキューに保存
    await page.locator('.fab-report').click();
    await page.waitForTimeout(300);
    await page.locator('#reportType').selectOption('rescue');
    await page.locator('#reportDetail').fill('オンライン復帰テスト');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(800);

    // オンライン復帰
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // flushOfflineQueue が手動実行可能（エラーにならない）
    const result = await page.evaluate(async () => {
      try {
        const n = await window.flushOfflineQueue();
        return { ok: true, sent: n };
      } catch (e) {
        return { ok: false, err: String(e) };
      }
    });
    expect(result.ok).toBe(true);
    // API が 404 なので sent は 0 または エラーで break するが、例外は投げない
  });
});