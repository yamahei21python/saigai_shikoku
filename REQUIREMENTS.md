# 四国版 災害情報マップ 要件定義書

## 概要

熊本地震被害情報マップ（v3: サグリ株式会社）の全機能をリバースエンジニアリングし、
四国地方の固有リスク（南海トラフ地震・中央構造線断層帯・豪雨土砂災害・孤立集落）に
対応する拡張を加えた防災情報プラットフォーム。

---

## フェーズ構成（全4フェーズ）

| フェーズ | 期間目安 | 分類 | 優先度 |
|---|---|---|---|
| **P0: ベース移植** | 即時 | v3核機能 | 🔴 最優先 |
| **P1: 四国固有対応** | 1週間 | 新規開発 | 🔴 高 |
| **P2: インフラ連携** | 2週間 | 拡張 | 🟡 中 |
| **P3: オフライン・UX** | 3週間〜 | 強化 | 🟢 低 |

---

## P0 🚨 v3核機能移植（最優先）

### 0-1. 地図基盤
```
ライブラリ: Leaflet 1.9.4
タイル: 地理院タイル3種（淡色/標準/空中写真）
初期表示: [33.6, 133.5] / zoom 9（四国全体）
```

### 0-2. 地震自動取得
```
データ元: 気象庁 地震情報JSON
  → https://www.jma.go.jp/bosai/quake/data/list.json
フィルタ: 四国周辺（lat 32.0-34.5, lon 131.5-135.0）
表示: 震度分布（7/6強/6弱/5強/5弱）＋ 余震マーカー
フォールバック: 取得失敗時は保存データ
```

### 0-3. 生活支援ビュー（キラー機能）
**被害情報MAPと生活支援把握MAPの2画面切替**

生活支援の9カテゴリ（水/食料/避難所/トイレ/風呂/医療/充電/燃料/通行止め）:
- 状態3段階: 🟢利用可 / 🟡要確認・時間外 / ⚫終了
- 現在地から近い順ソート（端末内のみ、外部非送信）
- 24h経過で自動グレーアウト（古い情報の誤判断防止）
- チップUIでカテゴリ選択

### 0-4. 被害情報管理
```
データ形式: INCIDENTS[{lat,lon,type,title,detail,src,url,time,cls,loc_precision}]
種別: rescue/building/road/bridge/fire/rail/liquefaction/landslide/water/farm/other
情報源(CLS): official/gov/operator/media/unconf/user
位置精度: exact/pin/approx/city
フィルター: 市町村/種別/キーワード/写真有/鮮度
```

### 0-5. AI一次審査つき投稿システム
```
投稿フロー:
  1. ユーザーが地図タップ or GPS自動取得で位置指定
  2. 種別選択＋写真添付（JPEG圧縮: 640px max, 0.7品質）
  3. 救助要請時: 人数/生存反応/状況/配慮事項のトリアージ
  4. AI一次審査（ルールベース＋LLM）:
     - NGワードフィルタ → reject
     - 対象地域外チェック → reject
     - 写真有/長文/同一所在地複数報告で加点
     - score>=2 → approve / それ以外 → hold
  5. 運営が承認/却下/位置修正
API: POST /api/reports → POST /api/reports/decision
```

### 0-6. 消防庁被害報PDF自動解析
```
対象: https://www.fdma.go.jp/disaster/ のPDF
自動抽出: 死者数/重軽傷/火災件数/救助件数/対応中事案
表示: 第N報 形式でパネル表示（最新1件）
```

### 0-7. 医療機関マップ
```
データ元: 四国各県の災害拠点病院リスト + 国土数値情報
表示: 🏥マーカー（災害拠点病院は大アイコン）
必須: 電話番号（確認導線）、受入状況（er: open/limited/closed/unknown）
```

### 0-8. 避難所マップ
```
データ元: 各県防災ポータル自動取得（10分ごと）
表示条件: zoom<11 は満員/混雑有のみ表示
ステータス: open/full/closed/unknown
必須フィールド: 収容人数/避難者数/混雑状況/住所
```

### 0-9. 運営管理画面 (#mod)
```
機能:
  - 投稿一覧（保留/承認/却下）
  - 写真全件確認グリッド
  - 位置修正（ドラッグ可能ピン）
  - 内容編集（AI推測の上書き）
  - 対応ステータス管理（未対応→確認中→部隊割当→現場→完了）
  - CSV/GeoJSONエクスポート
  - 問い合わせ管理/返信
  - 審査モード切替（人力/AI自動）
```

### 0-10. 10分自動リロード
```
全data/*.js を ?t=timestamp で再取得
地図レイヤー差分更新
```

---

## P1 🔴 四国固有リスク対応（高優先度）

### 1-1. 津波浸水想定オーバーレイ
```
データ元: 国土交通省「津波浸水想定データ」（GeoJSON）
  → 四国4県の南海トラフ最大クラス浸水域
実装:
  - L.geoJSON で半透明ポリゴン表示
  - レイヤー切替でON/OFF
  - 凡例に浸水深(m)の色分け
API設計:
  /data/tsunami_inundation.js
    const TSUNAMI_ZONES = [{depth_max: 10, geometry: {...}}, ...]
```

### 1-2. 津波避難施設レイヤー
```
データ元: 国土数値情報「津波避難施設」
  → https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-P10.html
実装:
  - 避難タワー/避難ビル/高台避難所をアイコン表示
  - クリックで収容人数/高さ/管理者
  - 現在地から最寄りの避難施設への方角＋距離表示
  - 凡例: 🗼津波避難タワー / 🏢津波避難ビル
API設計:
  /data/tsunami_towers.js
    const TSUNAMI_TOWERS = [{name, lat, lon, capacity, height, type, note}]
```

### 1-3. 孤立可能性エリア＋海上輸送ルート
```
データ元:
  - 四国山地の集落分布（国勢調査メッシュ）
  - 港湾・漁港一覧（国土数値情報）
  - 国道/県道データ（道路ネットワーク）
実装:
  - 単線道路沿いの集落を「孤立可能性」マーク
  - 港湾/漁港の稼働状況ピン（⚓）
  - 海上支援ルートのライン表示
API設計:
  /data/ports.js
    const PORTS = [{name, lat, lon, status, depth, berth}]
```

### 1-4. 4県切り替えタブ
```
UI: 「全四国/徳島/香川/愛媛/高知」ワンタップ切替
実装:
  - map.setView() + setZoom()
  - 県境GeoJSONを薄く表示
  - 県ごとの防災ポータルリンクを動的切替
県中心座標:
  徳島: [34.0, 134.3] zoom 10
  香川: [34.3, 134.0] zoom 10
  愛媛: [33.8, 132.8] zoom 10
  高知: [33.5, 133.5] zoom 10
```

### 1-5. 四国関連リソースリンク
```
v3の関連マップリストを四国版に全差し替え:
  - 四国電力 停電情報
  - JR四国 運行情報
  - 各県防災ポータル（4県）
  - 四国地方整備局 川の防災情報
  - 南海トラフ地震関連（気象庁）
  - NEXCO西日本（四国エリア）
  - 各県警察本部 交通規制情報
```

---

## P2 🟡 リアルタイムインフラ連携（中優先度）

### 2-1. 河川カメラ・水位計
```
データ元:
  - 国土交通省「川の防災情報」API
  - 四国地方整備局 河川カメラ一覧
実装:
  - 📹マーカー: クリックで最新画像表示（imgタグ）
  - 📊マーカー: 水位グラフ（現在水位/氾濫危険/避難判断）
  - 県管理河川も対象（4県の河川課データ）
API設計:
  /data/river_cameras.js
    const RIVER_CAMERAS = [{name, river, lat, lon, type:'camera'|'gauge', url, level}]
```

### 2-2. 道の駅・防災拠点レイヤー
```
データ元: 四国各県道の駅一覧（約90箇所）
実装:
  - 防災機能アイコン表示（自家発電/備蓄/トイレ/給水）
  - クリックで機能一覧ポップアップ
  - 大規模災害時の広域物資拠点として明示
API設計:
  /data/michinoeki.js
    const MICHINOEKI = [{name, lat, lon, generator, stockpile, toilet_24h, water, note}]
```

### 2-3. 停電エリア
```
データ元: 四国電力送配電 停電情報（スクレイピング）
実装: 円マーカー＋軒数表示（v3と同方式）
```

### 2-4. 通信障害エリア
```
データ元: 各キャリア（Docomo/au/SoftBank/Rakuten）復旧情報
実装: リンク集＋エリアマップ外部連携
```

---

## P3 🟢 オフライン・UX強化（低優先度〜段階導入）

### 3-1. PWA + タイルキャッシュ
```
Service Worker戦略:
  - data/*.js: Network First（10分更新）
  - 地理院タイル: Cache First（容量制限つき）
  - lib/*: Cache First（不変）
  - 投稿API: オフライン時はIndexedDBにキュー→復旧後自動再送
IndexedDB容量: 最大50MB
```

### 3-2. 多言語対応
```
初期対応: 日本語 / English
対象UI:
  - 投稿フォームの種別選択
  - ステータスラベル（未対応/確認中...）
  - 救助要請トリアージ項目
実装: i18nオブジェクトによるキー参照
```

### 3-3. ボランティア・物資マッチング
```
避難所ごとの「不足物資/過剰物資」ボード
CSV出力で行政連携
```

### 3-4. RTDS代替（通行実績）
```
代替案（有料PMTilesの代わり）:
  1. JARTIC通行規制スクレイピング強化
  2. OSMユーザー投稿チェックイン機能
  3. Google Maps Traffic 外部リンク
```

---

## ディレクトリ構成（確定版）

```
saigai_shikoku/
├── index.html                    ← メインUI（全ロジック）
├── REQUIREMENTS.md               ← 本要件定義書
├── README_運用手順.md            ← 運用マニュアル
├── lib/
│   └── leaflet.js                (1.9.4)
├── data/
│   ├── config.js                 ← 4県設定・LINEトークン・審査モード
│   ├── quake_data.js             ← GENERATED_AT, MAINSHOCK, INTENSITY, AFTERSHOCKS
│   ├── incidents.js              ← INCIDENTS[]（被害情報）
│   ├── sns_incidents.js          ← SNS_INCIDENTS[]（X由来・未検証）
│   ├── facilities.js             ← HOSPITALS[] + SHELTERS[]
│   ├── muni_live.js              ← MUNI_LIVE（自治体防災サイト自動取得）
│   ├── fdma_latest.js            ← FDMA_LATEST（消防庁被害報）
│   ├── pref_latest.js            ← PREF_LATEST（県対策本部会議）
│   ├── gov_latest.js             ← GOV_LATEST（省庁被害報）
│   ├── official_x.js             ← OFFICIAL_X（公的機関X）
│   ├── x_signals.js              ← X_SIGNALS（X兆候）
│   ├── water_stations.js         ← WATER_STATIONS（給水所）
│   ├── pref_shelters.js          ← PREF_SHELTERS（県防災データ）
│   ├── road_closures.js          ← ROAD_CLOSURES（通行規制）
│   ├── life_support.js           ← LIFE_SUPPORT（生活支援）
│   ├── charge_spots.js           ← CHARGE_SPOTS（充電）
│   ├── bath_toilet.js            ← BATH_TOILET（入浴・トイレ）
│   ├── fuel_spots.js             ← FUEL_SPOTS（燃料）
│   ├── muni_boundaries.js        ← MUNI_BOUNDARIES（市町村境界）
│   ├── tsunami_inundation.js     ★ 津波浸水想定
│   ├── tsunami_towers.js         ★ 津波避難施設
│   └── ports.js                  ★ 港湾・漁港
├── api/ (Cloudflare Workers)
│   ├── index.js                  ← ルーター
│   ├── status.js                 ← 状況CRUD
│   ├── reports.js                ← 投稿API
│   ├── ai-screen.js              ← AI審査（Workers AI）
│   ├── inquiries.js              ← 問い合わせ
│   ├── photo.js                  ← 写真配信
│   └── review-mode.js            ← 審査モード
├── wrangler.toml                 ← CF Workers設定
└── sw.js                         ← Service Worker
```

---

## API設計（Cloudflare Workers）

| Method | Path | 機能 |
|---|---|---|
| GET | /api/health | サーバ死活チェック |
| GET | /api/status | 全案件対応状況取得 |
| POST | /api/status | 対応状況更新（要key） |
| GET | /api/reports | 投稿一覧（status/pending/approved） |
| POST | /api/reports | 新規投稿受付 |
| POST | /api/reports/decision | 審査判定（要key） |
| GET | /api/report-photo | 投稿写真取得（要key） |
| GET | /api/photo | 公開写真取得 |
| POST | /api/inquiries | 問い合わせ送信 |
| GET | /api/inquiries | 問い合わせ一覧（要key） |
| POST | /api/inquiries/decision | 問い合わせ対応（要key） |
| GET/POST | /api/review-mode | 審査モード取得/切替 |

---

## データ収集パイプライン（自動化）

| ジョブ | 頻度 | 対象 | 出力ファイル |
|---|---|---|---|
| quake_fetcher | ページロード時 | 気象庁API | → quake_data.js (クライアント) |
| muni_scraper | 10分 | 4県防災サイト | → muni_live.js |
| fdma_parser | 10分 | 消防庁被害報PDF | → fdma_latest.js |
| road_collector | 10分 | 各県通行規制 | → road_closures.js |
| shelter_collector | 10分 | 県防災ポータル | → pref_shelters.js |
| x_collector | 10分 | X API | → official_x.js + x_signals.js |
| water_collector | 1h | 自治体給水所情報 | → water_stations.js |

---

## 技術スタック

```
フロントエンド: Leaflet 1.9.4 + Vanilla JS（SPA単一HTML）
バックエンド: Cloudflare Workers（投稿/管理APIのみ）
データ配信: Cloudflare R2（data/*.js CDN配信、Workers通過ゼロ）
データベース: Cloudflare KV → D1（Free枠超過時移行）
AI審査: Cloudflare Workers AI（llama3.1-8b）→ タイムアウト時hold
タイル: 国土地理院（無償）
キャッシュ: Cloudflare CDN edge（s-maxage制御）
オフライン: Service Worker + IndexedDB（写真キュー50MB）
軽量GeoJSON: TopoJSON変換 + zoomレベル制御
デプロイ: Wrangler CLI → workers.dev
ドメイン: shikoku-quake-map.sagri.workers.dev（予定）
```

---

## ⚡ エッジケース対策（5つの技術補強）

### E-1. 津波浸水GeoJSONの軽量化（P1-1）

**課題**: 四国4県の最大クラス津波浸水ポリゴン（GeoJSON）は生データで **数十MB〜100MB超**。スマホで描画するとメモリ不足→地図フリーズ。

**対策**:
1. **TopoJSON変換** — 弧共有でファイルサイズ70-80%削減（Mapshaper使用）
2. **Douglas-Peucker簡略化** — 許容誤差0.001度（約100m）でポリゴン精度を間引く
3. **zoomレベル制御** — `zoom < 10` では非表示。拡大時のみレンダリング
4. **分割ロード** — 県単位または沿岸部/内陸部でファイル分割し、表示範囲に応じて動的取得

```
実装イメージ:
  zoom < 10: レイヤー非表示（メモリ節約）
  zoom 10-12: 簡略化TopoJSON（軽量版）
  zoom ≥ 13: 詳細版（必要なら）
```

### E-2. アクセス集中対策（P0-10）

**課題**: 被災直後、数万人が10分同時リロード → Workers/KV無料枠（1万req/day）超過 or コスト爆発。

**対策**:
```
cache-control設計:
  data/incidents.js         → public, max-age=60, s-maxage=300
  data/muni_live.js         → public, max-age=60, s-maxage=300
  data/road_closures.js     → public, max-age=60, s-maxage=300
  data/facilities.js        → public, max-age=120, s-maxage=600
  data/quake_data.js        → public, max-age=30, s-maxage=120
  index.html                → public, max-age=0, s-maxage=60
  lib/*.js                  → public, max-age=86400, immutable
```

**戦略**:
- **R2 Static Hosting** でdata/*.jsを配信（Workers通過不要）
- Cloudflare CDNエッジでキャッシュヒットさせ、Workers/KVへの直接アクセスを遮断
- Workersは投稿API（POST）と管理APIのみ担当
- Free枠超過リスクがある場合は `d1-shiki-quake` (D1) に移行検討

### E-3. AI審査LLMダウン時のフォールバック（P0-5）

**課題**: 被災直後、Workers AI（llama3.1-8b）のレートリミット超過/タイムアウト/障害発生。

**対策**:
```
判定パイプライン（直列→早期リターン）:

  1. [ルール] NGワード含む?                     → reject
  2. [ルール] 四国4県+周辺の座標範囲外?          → reject
  3. [ルール] 必須項目不足（detail<8文字）?       → hold
  4. [ルール] 写真有+同一地点複数報告で加点      → score 算出
  5. [LLM]    Workers AI呼び出し（タイムアウト3秒）

  score >= 2 + LLM承認(or タイムアウト)          → approve
  score >= 2 + LLM却下                          → hold
  score < 2                                    → hold（人力確認）
  LLM error/timeout                            → hold（システム止めない）
```

**重要: `LLM error → hold`** のデフォルト動作で、**投稿が消滅しない**設計。
救助要請（`type=rescue`）はLLM結果に関わらず常に即時表示（holdでも運営画面に即通知）。

### E-4. 119番/118番 直接通報モーダル（P0-5）

**課題**: ユーザーが「アプリに投稿したから救助が来る」と誤解し119番通報が遅れる→死亡リスク。

**対策**:
```
救助要請フォーム（type=rescue）表示条件:

  [必須] フォーム最上部に赤背景バナー:
    ┌─────────────────────────────────────────┐
    │ ⚠️ 命の危険がある場合は、今すぐ         │
    │ 📞 119番（救助・救急）へ電話してください │
    │ 🚢 海上の事故は 118番（海上保安庁）     │
    │                                          │
    │ このマップへの投稿は、消防の通報系統に   │
    │ 接続されていません。投稿だけでは救助隊は │
    │ 出動しません。                           │
    │                                          │
    │ [📞 119番に電話する] [🚢 118番に電話する]│
    └─────────────────────────────────────────┘

  [必須] 投稿ボタンを押した後の確認ダイアログ:
    「119番には電話しましたか？
    [はい、電話済み] [いいえ、電話します]」
    「いいえ」→ tel:119 にリダイレクト

  [推奨] フォーム開封から30秒間、ボタンを
  グレーアウト＋カウントダウン表示（119番へ
  誘導する時間を確保）
```

バナーは **スクロールしても追従**（position: sticky）。

### E-5. オフライン写真投稿キュー（P3-1）

**課題**: 端末オフライン時の写真投稿。LocalStorage（5MB制限）では高解像度写真が溢れて保存失敗。

**対策**:
```
保存層の切り替え:

  - テキストデータ（detail/位置/種別）: localStorage（同期的に即保存）
  - 写真データ（Blob/Base64）:  IndexedDB（非同期・大容量・構造化）

自動再送フロー:

  1. 投稿ボタン押下 → 通信状態チェック
  2. オフライン → IndexedDBにキュー保存（写真data + メタデータ）
  3. UIには「📤 通信が回復したら自動送信します」表示
  4. navigator.onLine 検知 or Service Worker Sync Event
  5. キュー先頭から順次 POST /api/reports
  6. 成功したらキューから削除
  7. 失敗（サーバエラー等）はキューに残し、次回リトライ

IndexedDBスキーマ:
  store: 'pending_posts'
  key:   auto-increment id
  value: { id, type, detail, lat, lon, photoBlob, locSource, triage, createdAt }

Service Worker:
  self.addEventListener('sync', event => {
    if (event.tag === 'sync-pending-posts') event.waitUntil(flushQueue());
  });
```

**容量上限**: 50MB（超過時は古いキューから自動削除）。

---

## 開発ロードマップ

```
Week 1: P0完了
  Day 1-2: v2フォーク修正（四国中心座標/リンク差替/レイヤー調整）
  Day 3-4: 生活支援ビュー移植（buildSupport/renderChips）
  Day 5-7: 投稿システム + AI一次審査移植
  
Week 2: P1完了
  Day 1-2: 津波浸水想定 + 避難施設レイヤー
  Day 3-4: 4県切替 + 孤立可能性 + 港湾
  Day 5-7: 消防庁PDF解析 + データ収集パイプライン

Week 3-4: P2 + 試験公開
  Day 1-3: 河川カメラ + 道の駅 + 停電
  Day 4-7: Cloudflare Workersデプロイ + テスト + 修正
```

---

## レビューアサイン

```
全体設計:                  @yamahei21python
フロントエンド実装:       big_fast_coder に委任
リファクタリング:          small_refactor（単一ファイル時）
                           middle_refactor（複数ファイル時）
データ収集パイプライン:   Pythonスクリプト + GitHub Actions
AI審査:                   Cloudflare Workers AI (llama3.1-8b)
```

---

## 備考

- 本マップは無償・広告なしで運用（サグリ株式会社の方針を踏襲）
- 掲載ルール: 公的機関発表/報道/現場写真つき投稿 の3種のみ
- SNS単独情報は掲載しない（誤情報防止）
- 免責: 避難・救助判断は必ず公的機関の指示に従うこと
