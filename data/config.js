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
