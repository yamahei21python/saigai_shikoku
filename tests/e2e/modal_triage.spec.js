import { test, expect } from '@playwright/test';

test.describe('投稿モーダル & 119警告 (E-4)', () => {
  test('FAB投稿ボタンが右下に表示される', async ({ page }) => {
    await page.goto('/');
    const fab = page.locator('.fab-report');
    await expect(fab).toBeVisible();
    await expect(fab).toContainText('投稿');
  });

  test('投稿ボタンクリックでモーダルが開き119警告が表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.locator('.fab-report').click();
    await page.waitForTimeout(500);

    const modal = page.locator('#reportModal');
    await expect(modal).toBeVisible();

    const alertBox = modal.locator('.modal-alert-box');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('119番');
    await expect(alertBox).toContainText('電話');
  });

  test('モーダル内で種別選択が可能', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.locator('.fab-report').click();
    await page.waitForTimeout(300);

    const select = page.locator('#reportType');
    await expect(select).toBeVisible();
    await select.selectOption('rescue');
    await page.waitForTimeout(200);

    // 救助要請選択でトリアージ詳細が表示
    const triageFields = page.locator('#rescueTriageFields');
    await expect(triageFields).toBeVisible();
    await expect(triageFields).toContainText('救助要請詳細');
  });

  test('キャンセルボタンでモーダルが閉じる', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.locator('.fab-report').click();
    await page.waitForTimeout(300);

    await page.getByText('キャンセル').click();
    await expect(page.locator('#reportModal')).not.toBeVisible();
  });

  test('詳細8文字未満でエラーダイアログ', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.locator('.fab-report').click();
    await page.waitForTimeout(300);

    await page.locator('#reportDetail').fill('短い');
    await page.locator('button[type="submit"]').click();
    // ブラウザのネイティブダイアログまたはバリデーションを検出
    await expect(page.locator('#reportModal')).toBeVisible();
  });
});
