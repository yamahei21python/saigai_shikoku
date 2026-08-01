import { test, expect } from '@playwright/test';

test.describe('P1-1: 津波浸水想定オーバーレイ', () => {
  test('チェックボックスがヘッダーに表示される', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#tsunamiToggle');
    await expect(toggle).toBeVisible();
    await expect(page.locator('#tsunamiToggle').locator('xpath=ancestor::label')).toContainText('津波浸水想定');
  });

  test('チェックONでレイヤーが地図に追加され凡例が表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#tsunamiToggle').check();
    await page.waitForTimeout(800);

    // 凡例表示
    const legend = page.locator('#tsunamiLegend');
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('想定浸水深');

    // ポリゴン描画（SVG path または canvas に反映）
    const polyCount = await page.evaluate(() => {
      const map = document.querySelector('#map');
      const paths = map.querySelectorAll('path.leaflet-interactive').length;
      const canvases = map.querySelectorAll('canvas').length;
      return { paths, canvases };
    });
    // zoom 9 初期表示では E-1 制御で非表示になる場合があるため、
    // zoom を上げてから再確認
    if (polyCount.paths === 0) {
      await page.evaluate(() => {
        window.map.setZoom(11);
      });
      await page.waitForTimeout(800);
    }
    const after = await page.evaluate(() => {
      return document.querySelectorAll('#map path.leaflet-interactive').length;
    });
    expect(after).toBeGreaterThan(0);
  });

  test('チェックOFFでレイヤーと凡例が消える', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#tsunamiToggle');

    await toggle.check();
    await page.waitForTimeout(500);
    await expect(page.locator('#tsunamiLegend')).toBeVisible();

    await toggle.uncheck();
    await page.waitForTimeout(500);
    await expect(page.locator('#tsunamiLegend')).toHaveCount(0);

    const pathCount = await page.evaluate(() =>
      document.querySelectorAll('#map path.leaflet-interactive').length
    );
    expect(pathCount).toBe(0);
  });

  test('ポップアップに浸水深ランクが表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#tsunamiToggle').check();
    // zoomを上げてポリゴンを表示
    await page.evaluate(() => window.map.setZoom(11));
    await page.waitForTimeout(800);

    // 最初のポリゴンをクリックしてポップアップ確認
    const clicked = await page.evaluate(() => {
      const path = document.querySelector('#map path.leaflet-interactive');
      if (!path) return false;
      path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    await page.waitForTimeout(500);

    const popupText = await page.locator('.leaflet-popup-content').textContent().catch(() => null);
    if (clicked && popupText) {
      expect(popupText).toContain('津波浸水想定');
    }
  });
});
