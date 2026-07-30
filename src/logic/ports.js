/**
 * 孤立集落判定 + 港湾ロジック
 * TDD検証済み: tests/unit/ports.test.js
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

function bearingDeg(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

/**
 * 孤立リスクスコア計算
 * @param {Object} params
 * @param {boolean} params.roadAccessible - 道路アクセス可
 * @param {boolean} params.tsunamiRisk - 津波浸水リスク
 * @param {number} params.elevationM - 標高(m)
 * @param {number} params.nearbyVillages - 近隣集落数
 * @param {boolean} params.hasPort - 港湾アクセス可
 * @returns {{score: number, level: 'low'|'medium'|'high'}}
 */
export function calcIsolationScore(params) {
  let score = 0;
  if (!params.roadAccessible) score += 2;
  if (params.tsunamiRisk) score += 1;
  if (params.elevationM < 10) score += 1;
  if (params.nearbyVillages === 0) score += 1;
  if (!params.hasPort) score += 1;

  let level = 'low';
  if (score >= 3) level = 'high';
  else if (score >= 2) level = 'medium';

  return { score, level };
}

/**
 * 活動中の最寄り港を検索
 * @param {number} lat - 現在地緯度
 * @param {number} lon - 現在地経度
 * @param {Array<{name:string, lat:number, lon:number, active:boolean}>} ports
 * @returns {{name:string, distanceKm:number, bearing:number, depth:number}|null}
 */
export function findNearestPort(lat, lon, ports) {
  const active = ports.filter(p => p.active);
  if (active.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const p of active) {
    const dist = haversineKm(lat, lon, p.lat, p.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = {
        name: p.name,
        distanceKm: Math.round(minDist * 100) / 100,
        bearing: Math.round(bearingDeg(lat, lon, p.lat, p.lon)),
        depth: p.depth
      };
    }
  }
  return nearest;
}

/**
 * 港間の海上輸送ルート距離・方位を計算
 * @param {{lat:number, lon:number}} from - 出発港
 * @param {{lat:number, lon:number}} to - 到着港
 * @returns {{distanceKm: number, bearing: number}}
 */
export function calcSeaRoute(from, to) {
  const dist = haversineKm(from.lat, from.lon, to.lat, to.lon);
  const brng = bearingDeg(from.lat, from.lon, to.lat, to.lon);
  return {
    distanceKm: Math.round(dist * 100) / 100,
    bearing: Math.round(brng)
  };
}
