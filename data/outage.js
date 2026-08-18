// 停電情報（四国電力送配電）
// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)
// 生成: tools/fetch_teiden.py（10分間隔リロード対象）
// 取得時刻: 2026-08-18 16:41
window.OUTAGE_DATA = [
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
    "note": "現在、復旧作業中です。復旧は１８時頃を見込んでいます。"
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
    "note": "現在、復旧作業中です。復旧は１８時頃を見込んでいます。"
  }
];
window.OUTAGE_SUMMARY = {"total": 7, "updated": "2026-08-18 16:41"};
