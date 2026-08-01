/**
 * 四国範囲の単一定義（R6: 分散定数の一元化）
 * parser.js / triage.js / api/index.js / config.js から参照
 */
export const SIKOKU_BOUNDS = {
  latMin: 32.5, latMax: 34.5,
  lonMin: 132.0, lonMax: 135.0
};

/**
 * 座標が四国範囲内か判定
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isInShikoku(lat, lon) {
  return !(
    lat < SIKOKU_BOUNDS.latMin || lat > SIKOKU_BOUNDS.latMax ||
    lon < SIKOKU_BOUNDS.lonMin || lon > SIKOKU_BOUNDS.lonMax
  );
}
