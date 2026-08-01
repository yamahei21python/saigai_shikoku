window.CONFIG = {
  APP_TITLE: "四国版 災害情報マップ",
  INITIAL_CENTER: [33.6, 133.5], // 四国中心
  INITIAL_ZOOM: 8.5,

  // 4県切替定義
  REGIONS: {
    all:       { name: "全四国",    center: [33.6, 133.5], zoom: 8.5 },
    tokushima: { name: "徳島県",    center: [33.90, 134.35], zoom: 10 },
    kagawa:    { name: "香川県",    center: [34.25, 134.00], zoom: 10 },
    ehime:     { name: "愛媛県",    center: [33.70, 132.80], zoom: 9.5 },
    kochi:     { name: "高知県",    center: [33.35, 133.30], zoom: 9.5 }
  },

  // 県境界（簡略矩形・四国領域表示用）
  PREF_BOUNDS: {
    tokushima: [[33.50, 133.85], [34.32, 134.85]],
    kagawa:    [[34.10, 133.50], [34.60, 134.40]],
    ehime:     [[32.95, 132.10], [34.40, 133.35]],
    kochi:     [[32.65, 132.50], [33.90, 134.40]]
  },

  // P1-5: 四国関連リソースリンク
  RESOURCES: {
    common: [
      { label: "気象庁 南海トラフ地震関連", url: "https://www.jma.go.jp/jma/kishou/know/tokai/index.html", icon: "🌊" },
      { label: "気象庁 キキクル（危険度分布）", url: "https://www.jma.go.jp/bosai/risk/", icon: "⛈️" },
      { label: "国交省 川の防災情報", url: "https://www.river.go.jp/", icon: "🌊" },
      { label: "四国地方整備局", url: "https://www.skr.mlit.go.jp/", icon: "🏗️" },
      { label: "四国電力送配電 停電情報", url: "https://www.yonden.co.jp/nw/teiden-info/", icon: "💡" },
      { label: "JR四国 運行情報", url: "https://www.jr-shikoku.co.jp/", icon: "🚃" },
      { label: "NEXCO西日本（四国エリア）", url: "https://www.w-nexco.co.jp/", icon: "🛣️" },
      { label: "JARTIC 道路交通情報", url: "https://www.jartic.or.jp/", icon: "🚗" }
    ],
    prefs: {
      tokushima: { name: "徳島県", portal: "安心とくしま", url: "https://www.pref.tokushima.lg.jp/anshin/", police: "https://www.police.pref.tokushima.jp/" },
      kagawa:    { name: "香川県", portal: "かがわ防災Webポータル", url: "https://www.bousai-kagawa.jp/", police: "https://www.police.pref.kagawa.jp/" },
      ehime:     { name: "愛媛県", portal: "えひめのぼうさいポータル", url: "https://www.pref.ehime.jp/site/bousai/", police: "https://www.police.pref.ehime.jp/" },
      kochi:     { name: "高知県", portal: "こうち防災情報", url: "https://kochi-bousai.my.site.com/", police: "https://www.police.pref.kochi.jp/" }
    }
  },

  // 地理院タイル
  GSI_TILES: {
    std:  "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    pale: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    photo: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
  },

  // 自動更新間隔
  AUTO_RELOAD_INTERVAL_MS: 10 * 60 * 1000,

  // 四国範囲（トリアージ用）
  SIKOKU_BOUNDS: {
    latMin: 32.5, latMax: 34.5,
    lonMin: 132.0, lonMax: 135.0
  }
};
