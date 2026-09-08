// 停電情報（四国電力送配電）
// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)
// 生成: tools/fetch_teiden.py（10分間隔リロード対象）
// 取得時刻: 2026-09-08 10:27
window.OUTAGE_DATA = [
  {
    "id": "out-1e507229",
    "pref": "香川県",
    "city": "高松市",
    "area": "郷東町",
    "lat": 34.34705,
    "lon": 134.015386,
    "households": 9,
    "startTime": "2026/09/08 08:48:41",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  },
  {
    "id": "out-92f5970b",
    "pref": "香川県",
    "city": "さぬき市",
    "area": "前山",
    "lat": 34.214992,
    "lon": 134.184919,
    "households": 13,
    "startTime": "2026/09/08 06:07:20",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  }
];
window.OUTAGE_SUMMARY = {"total": 22, "updated": "2026-09-08 10:27"};
