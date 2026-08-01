// 四国4県 災害拠点病院（サンプル）
window.HOSPITALS_DATA = [
  {
    id: "hosp-39-01",
    name: "高知赤十字病院",
    pref: "高知",
    muni: "高知市",
    lat: 33.5781,
    lon: 133.5512,
    er: "open",
    tel: "088-822-1201",
    type: "災害拠点病院",
    asOf: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-39-02",
    name: "高知大学医学部附属病院",
    pref: "高知",
    muni: "南国市",
    lat: 33.6072,
    lon: 133.6181,
    er: "open",
    tel: "088-866-5811",
    type: "特定機能病院",
    asOf: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: "hosp-39-03",
    name: "高知県立あき総合病院",
    pref: "高知",
    muni: "安芸市",
    lat: 33.5012,
    lon: 133.9112,
    er: "limited",
    tel: "0887-34-5111",
    type: "地域中核病院",
    asOf: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "hosp-36-01",
    name: "徳島県立中央病院",
    pref: "徳島",
    muni: "徳島市",
    lat: 34.0782,
    lon: 134.5612,
    er: "open",
    tel: "088-631-7151",
    type: "基幹災害拠点病院",
    asOf: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-36-02",
    name: "徳島赤十字病院",
    pref: "徳島",
    muni: "小松島市",
    lat: 34.0012,
    lon: 134.5912,
    er: "open",
    tel: "0885-32-2555",
    type: "災害拠点病院",
    asOf: new Date(Date.now() - 50 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-38-01",
    name: "愛媛県立中央病院",
    pref: "愛媛",
    muni: "松山市",
    lat: 33.8341,
    lon: 132.7612,
    er: "limited",
    tel: "089-947-1111",
    type: "基幹災害拠点病院",
    asOf: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-38-02",
    name: "松山赤十字病院",
    pref: "愛媛",
    muni: "松山市",
    lat: 33.8352,
    lon: 132.7742,
    er: "open",
    tel: "089-924-1111",
    type: "災害拠点病院",
    asOf: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-37-01",
    name: "香川県立中央病院",
    pref: "香川",
    muni: "高松市",
    lat: 34.3512,
    lon: 134.0512,
    er: "open",
    tel: "087-811-3333",
    type: "基幹災害拠点病院",
    asOf: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: "hosp-37-02",
    name: "香川大学医学部附属病院",
    pref: "香川",
    muni: "木田郡",
    lat: 34.2812,
    lon: 134.0612,
    er: "open",
    tel: "087-891-2222",
    type: "特定機能病院",
    asOf: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];

// 四国4県 避難所データは data/shelters.js を参照
// （国土地理院 指定避難所データ 2026年更新、canvas レンダラー表示用）

