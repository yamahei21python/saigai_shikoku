/**
 * 津波避難タワー関連ロジック
 * TDD検証済み: tests/unit/tsunami.test.js
 */

/**
 * Haversine距離（km）
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 方位角計算（0-360度）
 * @param {number} lat1 - 現在地緯度
 * @param {number} lon1 - 現在地経度
 * @param {number} lat2 - 目的地緯度
 * @param {number} lon2 - 目的地経度
 * @returns {number} 真北からの方位（度）
 */
function bearingDeg(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

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
