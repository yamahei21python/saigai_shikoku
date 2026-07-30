// 消防庁 被害報告サマリー（第N報）
// 実際はparseFDMA()でPDF→構造化したデータを格納
window.FDMA_LATEST = {
  reportNo: 7,
  reportTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
  prefectures: [
    {
      name: "高知県",
      dead: 2,
      injuredHeavy: 5,
      injuredLight: 23,
      collapsed: 12,
      halfCollapsed: 45,
      partiallyDamaged: 120,
      floodedAbove: 3,
      floodedBelow: 7
    },
    {
      name: "徳島県",
      dead: 0,
      injuredHeavy: 2,
      injuredLight: 15,
      collapsed: 3,
      halfCollapsed: 28,
      partiallyDamaged: 89,
      floodedAbove: 0,
      floodedBelow: 2
    },
    {
      name: "愛媛県",
      dead: 1,
      injuredHeavy: 3,
      injuredLight: 18,
      collapsed: 8,
      halfCollapsed: 31,
      partiallyDamaged: 95,
      floodedAbove: 5,
      floodedBelow: 12
    },
    {
      name: "香川県",
      dead: 0,
      injuredHeavy: 1,
      injuredLight: 9,
      collapsed: 1,
      halfCollapsed: 12,
      partiallyDamaged: 56,
      floodedAbove: 1,
      floodedBelow: 4
    }
  ],
  // 四国合計
  get total() {
    const t = { dead:0, injuredHeavy:0, injuredLight:0, collapsed:0, halfCollapsed:0, partiallyDamaged:0, floodedAbove:0, floodedBelow:0 };
    for (const p of this.prefectures) {
      for (const k of Object.keys(t)) t[k] += p[k];
    }
    return t;
  },
  source: "消防庁 被害状況第7報",
  sourceUrl: "https://www.fdma.go.jp/"
};
