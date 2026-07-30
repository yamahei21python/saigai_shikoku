/**
 * 河川水位危険度判定ロジック
 * TDD検証済み: tests/unit/river.test.js
 */

/**
 * 水位データから危険度を判定
 * @param {Object} data
 * @param {number} data.currentLevel - 現在水位(m)
 * @param {number} data.warningLevel - 警戒水位(m)
 * @param {number} data.dangerLevel - 氾濫危険水位(m)
 * @returns {{level: 'normal'|'warning'|'critical'|'error', alert: string}}
 */
export function calcRiverRisk(data) {
  if (data.currentLevel == null || data.warningLevel == null || data.dangerLevel == null) {
    return { level: 'error', alert: '⚠️ データ不足' };
  }

  if (data.currentLevel >= data.dangerLevel) {
    return { level: 'critical', alert: '🔴 氾濫危険' };
  }
  if (data.currentLevel >= data.warningLevel) {
    return { level: 'warning', alert: '🟡 警戒' };
  }
  return { level: 'normal', alert: '🟢 平常' };
}

/**
 * 危険レベルで河川リストをフィルタ
 * @param {Array<{name:string, level:number, dangerLevel:number}>} rivers
 * @param {'normal'|'warning'|'critical'} level
 * @returns {Array}
 */
export function filterRiverByLevel(rivers, level) {
  if (!rivers || rivers.length === 0) return [];

  return rivers.filter(r => {
    const risk = calcRiverRisk({
      currentLevel: r.level,
      warningLevel: r.level * 0.8,
      dangerLevel: r.dangerLevel
    });
    return risk.level === level;
  });
}
