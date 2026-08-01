import { haversineKm } from './geo.js';

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
