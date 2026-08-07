// 停電情報（四国電力送配電）
// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)
// 生成: tools/fetch_teiden.py（10分間隔リロード対象）
// 取得時刻: 2026-08-07 19:35
window.OUTAGE_DATA = [
  {
    "id": "out-365036ba",
    "pref": "愛媛県",
    "city": "伊予市",
    "area": "大平",
    "lat": 33.719261,
    "lon": 132.707854,
    "households": 2,
    "startTime": "2026/08/07 16:40:34",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  },
  {
    "id": "out-0b894b22",
    "pref": "愛媛県",
    "city": "伊予市",
    "area": "平岡",
    "lat": 33.708059,
    "lon": 132.721853,
    "households": 23,
    "startTime": "2026/08/07 16:40:34",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  }
];
window.OUTAGE_SUMMARY = {"total": 25, "updated": "2026-08-07 19:35"};
