/**
 * 消防庁被害報告PDFテキストをパース
 * @param {string} text
 * @returns {Object}
 */
export function parseFDMA(text) {
  if (!text || text.trim() === '') {
    return { error: 'parse_failed' };
  }
  const patterns = {
    dead: /死者\s*(\d+)/,
    injuredHeavy: /(?:重傷|負傷者)\s*(\d+)/,
    injuredLight: /軽傷\s*(\d+)/,
    collapsed: /全壊\s*(\d+)/,
    halfCollapsed: /半壊\s*(\d+)/,
    partiallyDamaged: /一部破損\s*(\d+)/,
    floodedAbove: /床上浸水\s*(\d+)/,
    floodedBelow: /床下浸水\s*(\d+)/,
  };
  const result = {};
  for (const [key, re] of Object.entries(patterns)) {
    const match = text.match(re);
    if (match) {
      result[key] = parseInt(match[1], 10);
    }
  }
  if (Object.keys(result).length === 0) {
    return { error: 'parse_failed' };
  }
  return result;
}

/**
 * 気象庁地震JSONをパース＋四国フィルタ
 * @param {Object} quake
 * @returns {Object|null}
 */
export function parseJMAQuake(quake) {
  const SIKOKU = { latMin: 32.5, latMax: 34.5, lonMin: 132.0, lonMax: 135.0 };
  const { lat, lon } = quake;
  if (lat < SIKOKU.latMin || lat > SIKOKU.latMax || lon < SIKOKU.lonMin || lon > SIKOKU.lonMax) {
    return null; // 四国外
  }
  let intensity = quake.intensity;
  if (intensity === '6+') intensity = '6強';
  else if (intensity === '6-') intensity = '6弱';
  else if (intensity === '5+') intensity = '5強';
  else if (intensity === '5-') intensity = '5弱';
  return { ...quake, intensity };
}

/**
 * 自治体HTMLをパースして文字列配列に変換
 * @param {string} html
 * @param {string} source
 * @returns {Array<{source: string, text: string}>}
 */
export function parseMuniHTML(html, source = '') {
  if (!html || html.trim() === '') return [];
  // 簡易的な<p>タグ抽出
  const texts = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) {
      texts.push({ source, text });
    }
  }
  return texts;
}
