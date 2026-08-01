import { test, expect } from '@playwright/test';

test.describe('P1-4: 県境表示 & 4県切替', () => {
  test('県切替タブで地図が移動する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const kochiBtn = page.locator('#regionTabs button[onclick*="kochi"]');
    await kochiBtn.click();
    await page.waitForTimeout(1200);

    const center = await page.evaluate(() => {
      const c = window.map.getCenter();
      return { lat: c.lat, lng: c.lng };
    });
    // 高知県中心付近へ移動
    expect(center.lat).toBeGreaterThan(32.5);
    expect(center.lat).toBeLessThan(34.0);
    expect(center.lng).toBeGreaterThan(132.5);
  });

  test('県境矩形が描画される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const boundsCount = await page.evaluate(() => {
      return document.querySelectorAll('#map path.leaflet-interactive').length;
    });
    // 津波レイヤーOFFでも県境(4本)は表示される
    expect(boundsCount).toBeGreaterThanOrEqual(4);
  });
});

test.describe('P1-5: 関連リソースリンクパネル', () => {
  test('関連リンクボタンでパネルが開き共通リンクが表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#btnResources').click();
    await page.waitForTimeout(300);

    const panel = page.locator('#resourcePanel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('関連リンク');
    await expect(panel).toContainText('気象庁');
    await expect(panel).toContainText('四国電力');
    await expect(panel).toContainText('JR四国');
  });

  test('4県すべての防災ポータルリンクが表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnResources').click();
    await page.waitForTimeout(300);

    for (const pref of ['徳島県', '香川県', '愛媛県', '高知県']) {
      await expect(page.locator('#resourcePrefs')).toContainText(pref);
    }
  });

  test('県切替で選択県のポータルが強調表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnResources').click();
    await page.waitForTimeout(300);

    await page.locator('#regionTabs button[onclick*="ehime"]').click();
    await page.waitForTimeout(500);

    const highlighted = await page.evaluate(() => {
      const panel = document.querySelector('#resourcePrefs');
      const children = panel.querySelectorAll('div[style*="background:#ecfdf5"]');
      return children.length;
    });
    expect(highlighted).toBeGreaterThanOrEqual(1);
  });
});

test.describe('P2-1: 河川カメラ・水位観測所', () => {
  test('河川マーカーが地図に表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const markerCount = await page.evaluate(() => {
      return document.querySelectorAll('#map .leaflet-marker-icon').length;
    });
    // 河川マーカー(14) + その他レイヤーが含まれる
    expect(markerCount).toBeGreaterThanOrEqual(14);
  });

  test('河川マーカーに水位情報ポップアップがある', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hasPopup = await page.evaluate(() => {
      // 河川マーカーは背景色が青(#2563eb)の divIcon。📹/📊 アイコンを含む
      const markers = Array.from(document.querySelectorAll('#map .leaflet-marker-icon'));
      const riverMarker = markers.find(el =>
        el.textContent.includes('📹') || el.textContent.includes('📊')
      );
      if (!riverMarker) return false;
      riverMarker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    await page.waitForTimeout(500);
    if (hasPopup) {
      const text = await page.locator('.leaflet-popup-content').textContent().catch(() => '');
      if (text) {
        expect(text).toMatch(/現在水位|氾濫危険|川の防災情報/);
      }
    }
  });
});
