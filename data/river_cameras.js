// 四国 河川カメラ・水位観測所
// 参照ロジック: src/logic/river.js (calcRiverRisk / filterRiverByLevel)
// 実在の観測所・カメラをモデルに作成。level は現在水位(m)、dangerLevel は氾濫危険水位(m)
// 出典: 国土交通省 川の防災情報・各県水防情報（URLは公式リンク）
window.RIVER_CAMERAS = [
  // ── 徳島県 ──
  {
    id: "cam-36-01", name: "吉野川 池田観測所", river: "吉野川", pref: "徳島",
    lat: 34.0280, lon: 133.8060, type: "gauge", url: "https://www.river.go.jp/",
    level: 1.8, warningLevel: 4.0, dangerLevel: 5.2,
    note: "四国最大の河川・水源地域",
  },
  {
    id: "cam-36-02", name: "吉野川 飯尾観測所", river: "吉野川", pref: "徳島",
    lat: 34.0560, lon: 134.2500, type: "camera", url: "https://www.river.go.jp/",
    level: 2.1, warningLevel: 3.5, dangerLevel: 4.5,
    note: "徳島市上流・下流部カメラ",
  },
  {
    id: "cam-36-03", name: "那賀川 古津賀観測所", river: "那賀川", pref: "徳島",
    lat: 33.8500, lon: 134.5600, type: "gauge", url: "https://www.river.go.jp/",
    level: 1.2, warningLevel: 3.0, dangerLevel: 4.0,
    note: "那賀川中流部",
  },
  {
    id: "cam-36-04", name: "勝浦川 小松島観測所", river: "勝浦川", pref: "徳島",
    lat: 33.9850, lon: 134.6100, type: "camera", url: "https://www.river.go.jp/",
    level: 0.8, warningLevel: 2.5, dangerLevel: 3.5,
    note: "徳島東部の雨量に敏感な河川",
  },

  // ── 香川県 ──
  {
    id: "cam-37-01", name: "香東川 高松観測所", river: "香東川", pref: "香川",
    lat: 34.3200, lon: 133.9800, type: "gauge", url: "https://www.river.go.jp/",
    level: 0.6, warningLevel: 2.0, dangerLevel: 2.8,
    note: "高松市街を流れる都市河川",
  },
  {
    id: "cam-37-02", name: "綾川 綾上観測所", river: "綾川", pref: "香川",
    lat: 34.2200, lon: 133.8900, type: "camera", url: "https://www.river.go.jp/",
    level: 0.9, warningLevel: 2.2, dangerLevel: 3.0,
    note: "綾川流域・田園地帯",
  },
  {
    id: "cam-37-03", name: "土器川 善通寺観測所", river: "土器川", pref: "香川",
    lat: 34.2300, lon: 133.7800, type: "gauge", url: "https://www.river.go.jp/",
    level: 1.1, warningLevel: 2.4, dangerLevel: 3.2,
    note: "丸亀平野を流れる一級河川",
  },

  // ── 愛媛県 ──
  {
    id: "cam-38-01", name: "重信川 松山観測所", river: "重信川", pref: "愛媛",
    lat: 33.8300, lon: 132.7300, type: "gauge", url: "https://www.river.go.jp/",
    level: 1.5, warningLevel: 2.8, dangerLevel: 3.8,
    note: "松山平野の主要河川",
  },
  {
    id: "cam-38-02", name: "肱川 大洲観測所", river: "肱川", pref: "愛媛",
    lat: 33.5100, lon: 132.5400, type: "camera", url: "https://www.river.go.jp/",
    level: 2.4, warningLevel: 3.2, dangerLevel: 4.2,
    note: "豪雨時に氾濫リスクが高い肱川",
  },
  {
    id: "cam-38-03", name: "宇和島 岩松川観測所", river: "岩松川", pref: "愛媛",
    lat: 33.2000, lon: 132.5300, type: "gauge", url: "https://www.river.go.jp/",
    level: 0.7, warningLevel: 2.0, dangerLevel: 2.9,
    note: "宇和島市街地を流れる河川",
  },

  // ── 高知県 ──
  {
    id: "cam-39-01", name: "仁淀川 伊野観測所", river: "仁淀川", pref: "高知",
    lat: 33.5700, lon: 133.4300, type: "gauge", url: "https://www.river.go.jp/",
    level: 2.0, warningLevel: 4.0, dangerLevel: 5.0,
    note: "仁淀ブルーで有名な清流",
  },
  {
    id: "cam-39-02", name: "四万十川 中村観測所", river: "四万十川", pref: "高知",
    lat: 32.9800, lon: 132.9300, type: "camera", url: "https://www.river.go.jp/",
    level: 3.5, warningLevel: 3.2, dangerLevel: 4.0,
    note: "日本最後の清流・氾濫注意",
  },
  {
    id: "cam-39-03", name: "物部川 香美観測所", river: "物部川", pref: "高知",
    lat: 33.6000, lon: 133.7000, type: "gauge", url: "https://www.river.go.jp/",
    level: 1.3, warningLevel: 2.8, dangerLevel: 3.7,
    note: "高知東部の急流河川",
  },
  {
    id: "cam-39-04", name: "鏡川 高知観測所", river: "鏡川", pref: "高知",
    lat: 33.5200, lon: 133.5600, type: "camera", url: "https://www.river.go.jp/",
    level: 0.9, warningLevel: 2.2, dangerLevel: 3.1,
    note: "高知市中心部を流れる河川",
  },
];
