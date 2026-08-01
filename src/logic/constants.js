/**
 * 被害種別のメタデータ一元管理（R5）
 * index.html の renderIncidentMarkers / renderModTable / exportCSV から参照
 */
export const INCIDENT_META = {
  rescue:    { label: '🚨 救助', csvLabel: '救助', color: '#dc2626', symbol: '🚨' },
  road:      { label: '⛔ 道路', csvLabel: '道路', color: '#f97316', symbol: '⛔' },
  building:  { label: '🏚️ 建物', csvLabel: '建物', color: '#78350f', symbol: '🏚️' },
  landslide: { label: '⛰️ 土砂', csvLabel: '土砂', color: '#854d0e', symbol: '⛰️' },
  fire:      { label: '🔥 火災', csvLabel: '火災', color: '#ef4444', symbol: '🔥' },
  water:     { label: '💧 断水', csvLabel: '断水', color: '#2563eb', symbol: '💧' },
};

/** 種別ごとのアイコン・色取得 */
export function incidentMeta(type) {
  return INCIDENT_META[type] || { label: type, csvLabel: type, color: '#ef4444', symbol: '⚠️' };
}
