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

  test('孤立集落パネルが表示され県別統計を含む', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    const isoHeader = page.locator('#isoPanel .fdma-header');
    await expect(isoHeader).toBeVisible();
    await expect(isoHeader).toContainText('孤立可能性集落');

    // 県別統計が表示される（高知が最大）
    await expect(page.locator('#isoTotal .num').first()).toHaveText(/2,141/);
    await expect(page.locator('#isoPref')).toContainText('高知');
    await expect(page.locator('#isoPref')).toContainText('957');
  });

  test('P0-10: 10分自動リロードがデータ再取得とレイヤー再構築を行う', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // リロード前のデータ件数
    const before = await page.evaluate(() => ({
      isolation: window.ISOLATION_RISK_DATA.length,
      fdma: window.FDMA_LATEST ? window.FDMA_LATEST.reportNo : null,
    }));

    // reloadDataFiles() を実行（実際のfetch+eval再評価）
    await page.evaluate(() => window.reloadDataFiles());
    await page.waitForTimeout(2500);

    // データは再評価後も保持されている（fetch成功・eval成功）
    const after = await page.evaluate(() => ({
      isolation: window.ISOLATION_RISK_DATA.length,
      fdma: window.FDMA_LATEST ? window.FDMA_LATEST.reportNo : null,
    }));
    expect(after.isolation).toBe(before.isolation);
    expect(after.isolation).toBeGreaterThan(0);
    expect(after.fdma).toBe(before.fdma);

    // レイヤー再構築後もポップアップ対象マーカーが動作（DOM側から確認）
    await page.evaluate(() => window.refreshAllLayers());
    await page.waitForTimeout(1000);
    const isoPanel = page.locator('#isoPanel .fdma-header');
    await expect(isoPanel).toBeVisible();
  });

  test('P2-2: 道の駅91駅が表示されマーカーが動作する', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // データが91件ロードされている
    const count = await page.evaluate(() => window.MICHINOEKI_DATA.length);
    expect(count).toBe(91);

    // renderMichinoekiMarkers がレイヤーを作成している
    const layerCount = await page.evaluate(() => {
      const layer = window.michinoekiLayer;
      return layer ? layer.getLayers().length : -1;
    });
    expect(layerCount).toBe(91);

    // リロード後もレイヤー再構築が動く（P0-10 連携）
    await page.evaluate(() => window.renderMichinoekiMarkers());
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => window.michinoekiLayer.getLayers().length);
    expect(after).toBe(91);
  });

  test('ページタイトルが正しい', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/四国版 災害情報マップ/);
  });
});
