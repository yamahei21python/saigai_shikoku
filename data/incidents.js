// 四国 被害情報データ
// time: 評価時の経過時間検証用に Date.now() からの相対指定
// cls: official(公的) / media(報道) / user(市民投稿)
// loc_precision: exact(ピンポイント) / approx(市町村単位)
window.INCIDENTS_DATA = [
  // ── 高知県 ──
  {
    id: "inc-01",
    lat: 33.5582,
    lon: 133.5312,
    type: "rescue",
    title: "高知市はりまや町 建物倒壊による閉じ込め",
    detail: "木造住宅が倒壊し1名閉じ込め。消防隊が救助活動中。",
    src: "高知市消防局",
    url: "https://www.bousai.pref.kochi.lg.jp/",
    time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "exact"
  },
  {
    id: "inc-02",
    lat: 33.4480,
    lon: 133.4220,
    type: "landslide",
    title: "国道56号 須崎市多ノ郷 土砂崩れ",
    detail: "片側交互通行。土砂撤去作業中。大雨注意。",
    src: "高知県土木部",
    url: "https://www.bousai.pref.kochi.lg.jp/",
    time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "approx"
  },
  {
    id: "inc-03",
    lat: 33.5020,
    lon: 133.5420,
    type: "building",
    title: "高知市帯屋町 店舗ガラス破損",
    detail: "地震の揺れで商店街複数店舗のショーウィンドウ破損。ケガ人なし。",
    src: "高知新聞",
    url: "https://www.kochinews.co.jp/",
    time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    cls: "media",
    loc_precision: "exact"
  },

  // ── 徳島県 ──
  {
    id: "inc-04",
    lat: 33.8681,
    lon: 134.6912,
    type: "road",
    title: "国道55号 阿南市福井町 全面通行止め",
    detail: "路面亀裂および崖崩れのため上下線とも全面通行止め。迂回路なし。",
    src: "徳島河川国道事務所",
    url: "https://www.skr.mlit.go.jp/tokushima/",
    time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "exact"
  },
  {
    id: "inc-05",
    lat: 34.0730,
    lon: 134.5520,
    type: "building",
    title: "徳島市 中央卸売市場 天井崩落",
    detail: "市場施設の天井材一部崩落。けが人なし。立ち入り禁止。",
    src: "徳島市防災安全課",
    url: "https://www.city.tokushima.tokushima.jp/",
    time: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "approx"
  },

  // ── 愛媛県 ──
  {
    id: "inc-06",
    lat: 33.5121,
    lon: 132.5421,
    type: "landslide",
    title: "大洲市肱川町 県道土砂崩落",
    detail: "県道沿い斜面が崩落。県警が現場警戒中。通行止め。",
    src: "南海放送ニュース",
    url: "https://www.rnb.co.jp/",
    time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    cls: "media",
    loc_precision: "approx"
  },
  {
    id: "inc-07",
    lat: 33.8400,
    lon: 132.7600,
    type: "fire",
    title: "松山市一番町 商業ビル火災",
    detail: "3階建て商業ビルから出火。消防隊消火活動中。周辺避難指示。",
    src: "愛媛県警",
    url: "https://www.police.pref.ehime.jp/",
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "exact"
  },
  {
    id: "inc-08",
    lat: 33.8500,
    lon: 132.6850,
    type: "road",
    title: "松山自動車道 松山IC付近 路肩崩落",
    detail: "路肩が約30mにわたり崩落。片側通行中。復旧見込み未定。",
    src: "NEXCO西日本",
    url: "https://www.w-nexco.co.jp/",
    time: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "exact"
  },

  // ── 香川県 ──
  {
    id: "inc-09",
    lat: 34.3420,
    lon: 134.0480,
    type: "road",
    title: "高松市番町 水道管破裂",
    detail: "地震により水道本管が破裂。周辺約500世帯で断水。復旧作業中。",
    src: "香川県水道局",
    url: "https://www.pref.kagawa.lg.jp/",
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    cls: "official",
    loc_precision: "exact"
  },
  {
    id: "inc-10",
    lat: 34.2950,
    lon: 133.8220,
    type: "rescue",
    title: "丸亀市港町 高齢者取り残し",
    detail: "避難行動要支援者が自宅に取り残されている。消防が救助予定。",
    src: "市民投稿（近隣住民）",
    url: "",
    time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    cls: "user",
    loc_precision: "approx"
  }
];
