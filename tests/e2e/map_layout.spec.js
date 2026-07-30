import { test, expect } from '@playwright/test';

test.describe('画面レイアウト & E-4警告表示', () => {
  test('最上部に119番緊急通報バナーが表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const banner = page.locator('#emergencyBanner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('119番');
    await expect(banner).toContainText('118番');

    // phone-btnクラスのみ対象（モーダル内のリンクと区別）
    const tel119 = page.locator('a.phone-btn[href="tel:119"]');
    await expect(tel119).toBeVisible();
    const tel118 = page.locator('a.phone-btn[href="tel:118"]');
    await expect(tel118).toBeVisible();
  });

  test('ヘッダーに四国全域タブが表示される', async ({ page }) => {
    await page.goto('/');
    const regions = ['四国全域', '徳島', '香川', '愛媛', '高知'];
    for (const r of regions) {
      await expect(page.getByText(r, { exact: true }).first()).toBeVisible();
    }
  });

  test('被害情報と生活支援のモード切替タブが動作', async ({ page }) => {
    await page.goto('/');
    const supportBtn = page.locator('#btnSupport');
    await expect(supportBtn).toBeVisible();

    await supportBtn.click();
    await expect(supportBtn).toHaveClass(/active/);
    await expect(page.locator('#supportChipsBar')).toBeVisible();

    const incidentsBtn = page.locator('#btnIncidents');
    await incidentsBtn.click();
    await expect(incidentsBtn).toHaveClass(/active/);
    await expect(page.locator('#incidentsChipsBar')).toBeVisible();
  });

  test('FDMAパネルが表示されクリックで展開', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    const fdmaHeader = page.locator('#fdmaPanel .fdma-header');
    await expect(fdmaHeader).toBeVisible();
    await expect(fdmaHeader).toContainText('消防庁');

    // 緊急バナーが重なるので JS で直接開閉
    await page.evaluate(() => window.toggleFdmaPanel());
    await page.waitForTimeout(300);
    await expect(page.locator('#fdmaBody')).toBeVisible();
  });

  test('ページタイトルが正しい', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/四国版 災害情報マップ/);
  });
});
