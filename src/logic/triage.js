// 四国範囲
const SIKOKU_DEFAULT = {
  latMin: 32.5, latMax: 34.5,
  lonMin: 132.0, lonMax: 135.0
};

// NGワードリスト
const NG_WORDS = ['www.', 'http://', 'https://', '.com', '.net', '限定', '今だけ'];

/**
 * スコア計算（内部関数）
 */
function calcScore(report) {
  const { detail, hasPhoto, nearbyReports } = report;
  let score = 0;
  if (hasPhoto) score += 1;
  if (detail && detail.length >= 20) score += 1;
  if (nearbyReports > 0) score += 1;
  if (hasPhoto && detail && detail.length >= 20 && nearbyReports >= 2) score += 1;
  return score;
}

/**
 * ルールベース事前チェック（同期・共通）
 * @returns {{status:string, score:number, emergency:boolean, reason?:string}|null}
 *   null = チェック通過（次工程へ）
 */
function ruleCheck(report, bounds) {
  const { type, detail, lat, lon } = report;

  // TRI-08: 救助即時
  if (type === 'rescue') {
    return { status: 'approve', score: 3, emergency: true, reason: '救助要請' };
  }
  // TRI-01: 範囲外
  if (lat < bounds.latMin || lat > bounds.latMax || lon < bounds.lonMin || lon > bounds.lonMax) {
    return { status: 'reject', score: 0, emergency: false, reason: '対象地域外' };
  }
  // TRI-03: NGワード
  for (const word of NG_WORDS) {
    if (detail && detail.toLowerCase().includes(word)) {
      return { status: 'reject', score: 0, emergency: false, reason: '不適切な内容' };
    }
  }
  // TRI-04: テキスト長
  if (!detail || detail.length < 8) {
    return { status: 'hold', score: 0, emergency: false, reason: '情報不足' };
  }
  return null; // 通過
}

/**
 * ルールベース判定のみ（同期）
 * LLM呼び出しなし。fire-and-forget LLMは無視。
 */
export function triage(report, bounds = SIKOKU_DEFAULT, _options = {}) {
  const ruled = ruleCheck(report, bounds);
  if (ruled) return ruled;

  const score = calcScore(report);

  if (score >= 2) return { status: 'approve', score, emergency: false };
  return { status: 'hold', score, emergency: false, reason: '情報不足' };
}

/**
 * ルールベース + LLM判定（非同期）
 * LLMエラー/タイムアウトはholdにフォールバック（E-3）
 */
export async function triageWithLLM(report, bounds = SIKOKU_DEFAULT, options = {}) {
  const { llmFn, llmTimeout = 3000 } = options;

  // ルールベース事前チェック
  const ruled = ruleCheck(report, bounds);
  if (ruled) return ruled;

  const score = calcScore(report);

  // LLM呼び出し（エラー/タイムアウト→hold）
  if (llmFn) {
    try {
      const timer = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('LLM timeout')), llmTimeout)
      );
      await Promise.race([llmFn(report), timer]);
    } catch {
      return { status: 'hold', score, emergency: false, reason: 'LLM障害' };
    }
  }

  if (score >= 2) return { status: 'approve', score, emergency: false };
  return { status: 'hold', score, emergency: false, reason: '情報不足' };
}
