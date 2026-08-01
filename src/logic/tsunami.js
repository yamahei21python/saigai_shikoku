import { haversineKm, bearingDeg } from './geo.js';

/**
 * 津波避難タワー関連ロジック
 * TDD検証済み: tests/unit/tsunami.test.js
 */

/**
 * 現在地から最寄りの津波避難タワーを計算
 * @param {number} lat - 現在地緯度
 * @param {number} lon - 現在地経度
 * @param {Array<{name:string, lat:number, lon:number, capacity:number}>} towers
 * @returns {{name:string, distanceKm:number, bearing:number, capacity:number}|null}
 */
export function calculateNearestTower(lat, lon, towers) {
  if (!towers || towers.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const t of towers) {
    const dist = haversineKm(lat, lon, t.lat, t.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = {
        name: t.name,
        distanceKm: Math.round(minDist * 100) / 100,
        bearing: Math.round(bearingDeg(lat, lon, t.lat, t.lon)),
        capacity: t.capacity
      };
    }
  }
  return nearest;
}

/**
 * ズームレベルに応じた浸水ポリゴン描画可否（E-1対策）
 * @param {number} zoom - 地図ズームレベル
 * @returns {boolean} zoom >= 10 で真
 */
export function filterTsunamiInundation(zoom) {
  return zoom >= 10;
}
