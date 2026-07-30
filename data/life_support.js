// 四国 生活支援データ（9カテゴリ）
// asOf: 評価時の経過時間検証用に Date.now() からの相対指定
window.LIFE_SUPPORT_DATA = [
  // ── 給水所 (water) ──
  {
    id: "w-01",
    cat: "water",
    name: "高知市 中央公園 応急給水所",
    muni: "高知市",
    lat: 33.5597,
    lon: 133.5311,
    status: "open",
    asOf: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h前 → active 🟢
    detail: "1人あたり10Lまで。容器持参。"
  },
  {
    id: "w-02",
    cat: "water",
    name: "徳島市 眉山湧水給水ポイント",
    muni: "徳島市",
    lat: 34.0682,
    lon: 134.5422,
    status: "open",
    asOf: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // 26h前 → expired ⚫
    detail: "給水用ポリタンク配布中"
  },
  {
    id: "w-03",
    cat: "water",
    name: "松山市 城山公園 給水所",
    muni: "松山市",
    lat: 33.8452,
    lon: 132.7695,
    status: "limited",
    asOf: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8h前 → warning 🟡
    detail: "水道復旧につき給水制限中"
  },

  // ── 避難所 (shelter) ──
  {
    id: "s-01",
    cat: "shelter",
    name: "高知市立潮江小学校 避難所",
    muni: "高知市",
    lat: 33.5482,
    lon: 133.5412,
    status: "open",
    capacity: 300,
    people: 120,
    asOf: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    detail: "ペット同行避難可（屋外スペース）"
  },
  {
    id: "s-02",
    cat: "shelter",
    name: "徳島県立中央体育館 避難所",
    muni: "徳島市",
    lat: 34.0796,
    lon: 134.5385,
    status: "open",
    capacity: 500,
    people: 230,
    asOf: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    detail: "毛布・簡易ベッド支給あり"
  },
  {
    id: "s-03",
    cat: "shelter",
    name: "香川県民ホール 避難所",
    muni: "高松市",
    lat: 34.3455,
    lon: 134.0462,
    status: "full",
    capacity: 400,
    people: 400,
    asOf: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    detail: "満員につき受け入れ停止中"
  },

  // ── 医療機関 (medical) ──
  {
    id: "m-01",
    cat: "medical",
    name: "高知赤十字病院（災害拠点病院）",
    muni: "高知市",
    lat: 33.5781,
    lon: 133.5512,
    status: "open",
    er: "accepting",
    tel: "088-822-1201",
    asOf: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    detail: "救急外来受入中。軽症者は診療所へ"
  },
  {
    id: "m-02",
    cat: "medical",
    name: "松山赤十字病院",
    muni: "松山市",
    lat: 33.8352,
    lon: 132.7742,
    status: "open",
    er: "limited",
    tel: "089-924-1111",
    asOf: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    detail: "重症者優先。軽症は翌日以降"
  },

  // ── 充電スポット (charge) ──
  {
    id: "c-01",
    cat: "charge",
    name: "高松市役所 1F 充電コーナー",
    muni: "高松市",
    lat: 34.3421,
    lon: 134.0462,
    status: "open",
    asOf: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    detail: "iPhone/Androidケーブルあり。自家発電"
  },
  {
    id: "c-02",
    cat: "charge",
    name: "イオンモール高知 充電スポット",
    muni: "高知市",
    lat: 33.5622,
    lon: 133.5432,
    status: "open",
    asOf: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    detail: "2Fフードコート付近・無料"
  },

  // ── 入浴・トイレ (bath) ──
  {
    id: "b-01",
    cat: "bath",
    name: "道後温泉別館 飛鳥乃湯（無料開放）",
    muni: "松山市",
    lat: 33.8512,
    lon: 132.7862,
    status: "open",
    asOf: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    detail: "被災者向け無料入浴。タオル持参"
  },
  {
    id: "b-02",
    cat: "bath",
    name: "高知市 鏡川河川敷 仮設風呂",
    muni: "高知市",
    lat: 33.5540,
    lon: 133.5505,
    status: "open",
    asOf: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    detail: "自衛隊による仮設風呂（男女時間制）"
  },

  // ── 燃料 (fuel) ──
  {
    id: "f-01",
    cat: "fuel",
    name: "徳島県庁 公用車給油所（一般開放）",
    muni: "徳島市",
    lat: 34.0707,
    lon: 134.5487,
    status: "limited",
    asOf: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    detail: "1台20Lまで。長蛇の列"
  },

  // ── 生活物資 (goods) ──
  {
    id: "g-01",
    cat: "goods",
    name: "四国中央市 市民体育館 物資拠点",
    muni: "四国中央市",
    lat: 33.9828,
    lon: 133.5490,
    status: "open",
    asOf: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    detail: "水・食料・衛生用品配布中"
  },

  // ── 情報端末 (terminal) ──
  {
    id: "t-01",
    cat: "terminal",
    name: "高知県立図書館 情報端末コーナー",
    muni: "高知市",
    lat: 33.5608,
    lon: 133.5375,
    status: "open",
    asOf: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    detail: "Wi-Fi・PC10台無料開放"
  }
];
