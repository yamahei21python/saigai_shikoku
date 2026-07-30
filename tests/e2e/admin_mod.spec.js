import { test, expect } from '@playwright/test';

test.describe('#mod 管理画面', () => {
  test.beforeEach(async ({ page }) => {
    // ページ読み込み前にpromptダイアログハンドラ設定
    page.on('dialog', async dialog => {
      await dialog.accept('shikoku-quake-secret-key-2026');
    });
  });

  test('#mod ハッシュで管理画面にアクセスできる', async ({ page }) => {
    await page.goto('/#mod');
    await page.waitForTimeout(1000);

    await expect(page.locator('#modPanel')).toBeVisible();
    await expect(page.locator('#modPanel')).toContainText('運営管理画面');
  });

  test('マップに戻るボタンで地図表示に復帰', async ({ page }) => {
    await page.goto('/#mod');
    await page.waitForTimeout(1000);

    const backBtn = page.getByText('マップに戻る');
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('#modPanel')).not.toBeVisible();
  });

  test('CSV出力ボタンが存在する', async ({ page }) => {
    await page.goto('/#mod');
    await page.waitForTimeout(1000);

    const csvBtn = page.getByText('CSV出力');
    await expect(csvBtn).toBeVisible();
  });

  test('未審査投稿がテーブルに表示される', async ({ page }) => {
    await page.goto('/#mod');
    await page.waitForTimeout(1000);

    await expect(page.locator('.btn-approve').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.btn-reject').first()).toBeVisible({ timeout: 5000 });
  });
});
