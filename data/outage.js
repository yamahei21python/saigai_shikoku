// 停電情報（四国電力送配電）
// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)
// 生成: tools/fetch_teiden.py（10分間隔リロード対象）
// 取得時刻: 2026-08-04 14:55
window.OUTAGE_DATA = [
  {
    "id": "out-f5f4ecff",
    "pref": "高知県",
    "city": "安芸郡　芸西村",
    "area": "国光",
    "lat": 33.5771,
    "lon": 133.833468,
    "households": 2,
    "startTime": "2026/08/04 12:25:22",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  },
  {
    "id": "out-90d86d19",
    "pref": "香川県",
    "city": "高松市",
    "area": "塩江町　安原下",
    "lat": 34.198447,
    "lon": 134.083259,
    "households": 14,
    "startTime": "2026/08/04 11:59:00",
    "status": "restoring",
    "reason": "倒木による影響",
    "note": "現在、復旧作業中です。復旧は１７時頃を見込んでいます。"
  },
  {
    "id": "out-bbca9dde",
    "pref": "香川県",
    "city": "高松市",
    "area": "塩江町　安原下",
    "lat": 34.175996,
    "lon": 134.042057,
    "households": 14,
    "startTime": "2026/08/04 11:59:00",
    "status": "restoring",
    "reason": "倒木による影響",
    "note": "現在、復旧作業中です。復旧は１７時頃を見込んでいます。"
  },
  {
    "id": "out-7ff957c2",
    "pref": "徳島県",
    "city": "勝浦郡　上勝町",
    "area": "大字旭",
    "lat": 33.873332,
    "lon": 134.359991,
    "households": 9,
    "startTime": "2026/08/04 10:45:00",
    "status": "restoring",
    "reason": "倒木による影響",
    "note": "現在、復旧作業中です。復旧は１９時頃を見込んでいます。"
  }
];
window.OUTAGE_SUMMARY = {"total": 39, "updated": "2026-08-04 14:55"};
