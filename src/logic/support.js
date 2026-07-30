/**
 * 生活支援情報の鮮度判定
 * @param {string} updatedAt - ISO 8601 更新日時
 * @param {string} status - 'open'|'closed' など
 * @param {Date} now - 現在時刻（テスト用に注入）
 * @returns {'active'|'warning'|'expired'}
 */
export function getSupportStatus(updatedAt, status, now = new Date()) {
  if (status === 'closed') return 'expired';
  const updated = new Date(updatedAt);
  const diffHours = (now - updated) / (1000 * 60 * 60);
  if (diffHours < 6) return 'active';    // SUP-01
  if (diffHours < 24) return 'warning';  // SUP-02
  return 'expired';                      // SUP-03
}

/**
 * Haversine公式による距離計算
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEFAULT_LOC = { lat: 34.3, lon: 134.0 }; // 高松市

/**
 * 現在地から近い順に施設をソート
 * @param {Array<{lat:number, lon:number}>} items
 * @param {{lat:number, lon:number}|null} userLoc
 * @returns {Array}
 */
export function sortByDistance(items, userLoc = null) {
  const loc = userLoc || DEFAULT_LOC;
  return [...items].sort((a, b) => {
    const distA = haversineKm(loc.lat, loc.lon, a.lat, a.lon);
    const distB = haversineKm(loc.lat, loc.lon, b.lat, b.lon);
    return distA - distB;
  });
}
