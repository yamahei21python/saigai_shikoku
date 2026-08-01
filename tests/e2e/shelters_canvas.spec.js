// P0-8/P1-2: 実データ投入（国土地理院 指定避難所・津波避難施設）E2E
// - 避難所 canvas レンダラー + zoom 制御
// - 津波避難タワー/ビル divIcon + 高台 canvas
import { test, expect } from '@playwright/test';

test.describe('実データ投入: 避難所 canvas レンダラー', () => {
  test('supportビューで避難所マーカーが描画される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#btnSupport').click();
    await page.evaluate(() => filterCategory('shelter_facility'));
    await page.waitForTimeout(600);
    // zoom 11 以上で canvas + ポップアップ確認
    await page.evaluate(() => map.setView([33.6, 133.5], 11));
    await page.waitForTimeout(800);
    const canvasCount = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#map canvas'))
        .filter(c => c.width > 0 && c.height > 0).length
    );
    expect(canvasCount).toBeGreaterThan(0);
    // データ件数が十分あること
    const count = await page.evaluate(() => (window.SHELTERS_DATA || []).length);
    expect(count).toBeGreaterThan(2000);
  });

  test('zoom 9 では避難所 canvas レイヤーが非表示（メモリ制御）', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#btnSupport').click();
    await page.evaluate(() => filterCategory('shelter_facility'));
    await page.evaluate(() => map.setView([33.6, 133.5], 9));
    await page.waitForTimeout(800);
    // markersLayer 内の density レイヤーが map から外れている
    const visibleDensity = await page.evaluate(() => {
      let n = 0;
      markersLayer.eachLayer(l => { if (l._isDensity && map.hasLayer(l)) n++; });
      return n;
    });
    expect(visibleDensity).toBe(0);
    // zoom を上げると再表示される
    await page.evaluate(() => map.setView([33.6, 133.5], 12));
    await page.waitForTimeout(800);
    const visibleAfter = await page.evaluate(() => {
      let n = 0;
      markersLayer.eachLayer(l => { if (l._isDensity && map.hasLayer(l)) n++; });
      return n;
    });
    expect(visibleAfter).toBeGreaterThan(0);
  });
});

test.describe('実データ投入: 津波避難施設', () => {
  test('津波避難タワーとビルが divIcon で表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => map.setView([33.9, 134.0], 11));
    await page.waitForTimeout(1000);
    const icons = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('#map .leaflet-marker-icon'));
      return { tower: els.filter(e => e.textContent.includes('🗼')).length,
               building: els.filter(e => e.textContent.includes('🏢')).length };
    });
    expect(icons.tower).toBeGreaterThan(0);
    expect(icons.building).toBeGreaterThan(0);
  });

  test('津波避難施設データに実住所がありポップアップ表示できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => map.setView([33.9, 134.0], 12));
    await page.waitForTimeout(1000);
    const data = await page.evaluate(() => window.TSUNAMI_TOWERS || []);
    const tower = data.find(t => t.type === 'tower');
    expect(tower).toBeTruthy();
    expect(tower.address).toMatch(/県/);
    // タワーdivIconをクリックしてポップアップ
    const clicked = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('#map .leaflet-marker-icon'))
        .find(e => e.textContent.includes('🗼'));
      if (!el) return false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    expect(clicked).toBe(true);
    await page.waitForTimeout(400);
    const popup = await page.locator('.leaflet-popup-content').textContent().catch(() => '');
    expect(popup).toMatch(/津波避難タワー/);
  });
});
