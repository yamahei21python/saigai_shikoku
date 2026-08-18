// 停電情報（四国電力送配電）
// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)
// 生成: tools/fetch_teiden.py（10分間隔リロード対象）
// 取得時刻: 2026-08-18 18:04
window.OUTAGE_DATA = [
  {
    "id": "out-9b8e28d6",
    "pref": "愛媛県",
    "city": "上浮穴郡　久万高原町",
    "area": "直瀬",
    "lat": 33.703997,
    "lon": 132.965582,
    "households": 63,
    "startTime": "2026/08/18 16:57:40",
    "status": "outage",
    "reason": "調査中",
    "note": "現在、停電地域において故障箇所と原因を特定中です。"
  },
  {
    "id": "out-c77f12d4",
    "pref": "愛媛県",
    "city": "松山市",
    "area": "東大栗町",
    "lat": 33.903938,
    "lon": 132.783522,
    "households": 2,
    "startTime": "2026/08/18 10:57:00",
    "status": "restoring",
    "reason": "倒木による影響",
    "note": "現在、復旧作業中です。復旧は１９時頃を見込んでいます。"
  },
  {
    "id": "out-b60307ac",
    "pref": "愛媛県",
    "city": "松山市",
    "area": "福角町",
    "lat": 33.897783,
    "lon": 132.761835,
    "households": 5,
    "startTime": "2026/08/18 10:57:00",
    "status": "restoring",
    "reason": "倒木による影響",
    "note": "現在、復旧作業中です。復旧は１９時頃を見込んでいます。"
  }
];
window.OUTAGE_SUMMARY = {"total": 70, "updated": "2026-08-18 18:04"};
