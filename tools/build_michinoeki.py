#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""道の駅データ生成v2: 公式一覧 + OSM座標 + 手動マッピング + Nominatim
出力: data/michinoeki.js (window.MICHINOEKI_DATA)

入力スナップショット（tools/input/）:
  - michinoeki_official.csv: 四国地区「道の駅」連絡会 公式一覧（tools/fetch_michinoeki.py で取得）
  - michinoeki_raw.json:    OSM Overpass API の4県エリア抽出結果（道の駅ノード・ウェイ中心点）
"""
import csv
import itertools
import json
import os
import re
import time
import urllib.parse
import urllib.request

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "input")

# ---------- 名前正規化 ----------
def strip_name(s, strip_yomigana=True):
    """「道の駅」・よみがな・カッコ・空白・中点を除去して正規化"""
    n = s
    n = n.replace("（", "(").replace("）", ")")
    if strip_yomigana:
        n = re.sub(r"\([^)]*\)", "", n)       # よみがな削除
    n = re.sub(r"^道の駅", "", n)              # 先頭のみ
    n = re.sub(r"「|」|　|\s|・", "", n)       # カッコ・空白・中点除去
    n = re.sub(r";.*$", "", n)
    n = n.replace("‐", "-").replace("ー", "-")
    n = n.replace("南國", "南国")
    return n

# ---------- OSM データ読み込み ----------
raw = json.load(open(os.path.join(BASE, "michinoeki_raw.json"), encoding="utf-8"))
osm_stations = {}
for e in raw["elements"]:
    t = e.get("tags", {})
    name = t.get("name") or ""
    if not name or "道の駅" not in name:
        continue
    lat = e.get("lat") or (e.get("center") or {}).get("lat")
    lon = e.get("lon") or (e.get("center") or {}).get("lon")
    if lat is None or lon is None:
        continue
    key = strip_name(name, strip_yomigana=False)
    if key and key not in osm_stations:
        osm_stations[key] = (lat, lon, name)

# ---------- 公式 CSV 読み込み ----------
rows = list(csv.DictReader(open(os.path.join(BASE, "michinoeki_official.csv"), encoding="utf-8")))

# ---------- 手動マッピング（公式名 → OSM 生名） ----------
MANUAL = {
    "わじき": "道の駅 鷲敷",
    "小豆島オリーブ公園": "道の駅 豆島オリーブ公園",
    "ふたみ": "道の駅 ふたみ ふたみシーサイド公園",
    "内子フレッシュパークからり": "道の駅内子",
    "伯方S・Cパーク": "道の駅伯方SCパーク",
    "津島熱田温泉（旧 津島やすらぎの里）": "道の駅津島",
    "なぶら土佐佐賀": "道の駅土佐佐賀",
    "まきのさんの道の駅・佐川": "道の駅「まきのさんの道の駅・佐川」",
}

# ---------- 手動座標（OSM に道の駅登録なし / Nominatim 誤解決・レート制限） ----------
# 出典: 2026-08-01 Nominatim 解決結果のキャッシュ / ikachi.org 座標 / 公式ページ住所
MANUAL_GEO = {
    "佐田岬半島ミュージアム（旧 瀬戸農業公園）": (33.488571, 132.354172),  # ikachi.org
    "八幡浜みなっと": (33.462883, 132.42337),  # ikachi.org
    "東洋町": (33.527966, 134.28006),  # ikachi.org（Nominatim が北海道を誤返却）
    "ことひき": (34.12847, 133.66287),  # Nominatim「道の駅 ことひき 香川」
    "ふれあいパークみの": (34.19869, 133.71793),  # Nominatim
    "空の夢もみの木パーク": (34.15503, 133.82198),  # Nominatim
    "恋人の聖地うたづ臨海公園": (34.31054, 133.82563),  # Nominatim
    "マイントピア別子": (33.96035, 133.28359),  # Nominatim
    "日吉夢産地": (33.25347, 132.69226),  # Nominatim
    "小松オアシス": (33.91945, 133.18133),  # Nominatim
    "風早の郷 風和里": (33.83952, 132.76535),  # Nominatim
}

# 四国範囲チェック
def in_shikoku(lat, lon):
    return 32.0 <= lat <= 34.7 and 131.0 <= lon <= 135.0

# ---------- マッチング ----------
matched, missing = [], []
for r in rows:
    key = strip_name(r["name"])
    if key in osm_stations:
        lat, lon, osm_name = osm_stations[key]
        r["lat"], r["lon"] = lat, lon
        r["osm_match"] = osm_name
        matched.append(r)
    elif r["name"] in MANUAL and strip_name(MANUAL[r["name"]], strip_yomigana=False) in osm_stations:
        lat, lon, osm_name = osm_stations[strip_name(MANUAL[r["name"]], strip_yomigana=False)]
        r["lat"], r["lon"] = lat, lon
        r["osm_match"] = osm_name + " (手動)"
        matched.append(r)
    elif r["name"] in MANUAL_GEO:
        lat, lon = MANUAL_GEO[r["name"]]
        r["lat"], r["lon"] = lat, lon
        r["osm_match"] = "手動座標"
        print(f"  OK MANUAL_GEO: {r['pref']} {r['name']} -> {lat:.5f},{lon:.5f}")
        matched.append(r)
    else:
        missing.append(r)

print(f"OSMマッチ: {len(matched)} / 未マッチ: {len(missing)}")
for m in missing:
    print(f"  ? {m['pref']} {m['name']} @ {m['address']}")

# ---------- Nominatim 補完（道の駅名で検索 + 住所フォールバック） ----------
def geocode(name, pref, address):
    pref_short = {"徳島": "徳島県", "香川": "香川県", "愛媛": "愛媛県", "高知": "高知県"}[pref]
    # 住所から市町村レベルを抽出（例: 那賀郡那賀町 → 那賀郡那賀町）
    muni_match = re.match(r"([^0-9０-９]+?郡)?([^0-9０-９]+?[町村市])", address)
    muni = muni_match.group(0) if muni_match else ""
    queries = [
        f"道の駅 {name} {pref}",
        f"道の駅 {name}",
        f"{pref_short} {muni}",
        f"{pref_short} {address}",
        f"{pref} {name}",
    ]
    for q in queries:
        url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + \
            urllib.parse.quote(q)
        req = urllib.request.Request(url, headers={"User-Agent": "shikoku-disaster-map"})
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                data = json.loads(res.read().decode("utf-8"))
            if data:
                lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
                if in_shikoku(lat, lon):
                    return lat, lon, q
        except Exception:
            pass
    return None, None, None

for r in missing:
    lat, lon, q = geocode(r["name"], r["pref"], r["address"])
    if lat:
        r["lat"], r["lon"] = lat, lon
        r["osm_match"] = f"nominatim({q})"
        print(f"  OK Nominatim: {r['pref']} {r['name']} -> {lat:.5f},{lon:.5f}")
    else:
        print(f"  NG Nominatim: {r['pref']} {r['name']}")
    time.sleep(1.1)

# ---------- 結果確認 ----------
final = [r for r in matched + missing if r.get("lat")]
not_found = [r for r in matched + missing if not r.get("lat")]
print(f"最終: {len(final)}件 / 座標なし: {len(not_found)}")
for nf in not_found:
    print(f"  X {nf['pref']} {nf['name']}")

# ---------- data/michinoeki.js 生成 ----------
PREF_CODE = {"徳島": "36", "香川": "37", "愛媛": "38", "高知": "39"}
def make_js(final):
    lines = []
    lines.append("// 道の駅・防災拠点データ（四国4県 全91駅）")
    lines.append("// 出典: 四国地区「道の駅」連絡会 公式一覧（駅名・住所・TEL）")
    lines.append("// 座標: OpenStreetMap / Nominatim / 手動（tools/input/ スナップショットから生成）")
    lines.append("// 防災フラグ: funcInfo=false は未収集（実地確認後に true 化）")
    lines.append("window.MICHINOEKI_DATA = [")
    # 県内連番で id 採番（並び順が変わっても id が安定）
    for pref, group in itertools.groupby(
            sorted(final, key=lambda x: (x["pref"], x["name"])),
            key=lambda x: x["pref"]):
        for i, r in enumerate(group, 1):
            name = r["name"].replace('"', '\\"')
            addr = r["address"].replace('"', '\\"')
            tel = r["tel"].replace('"', '\\"')
            lat = f"{r['lat']:.6f}"
            lon = f"{r['lon']:.6f}"
            lines.append(f"  {{")
            lines.append(f"    id: \"michi-{PREF_CODE[pref]}-{i:02d}\",")
            lines.append(f"    name: \"{name}\",")
            lines.append(f"    pref: \"{pref}\",")
            lines.append(f"    address: \"{addr}\",")
            lines.append(f"    tel: \"{tel}\",")
            lines.append(f"    lat: {lat},")
            lines.append(f"    lon: {lon},")
            lines.append(f"    funcInfo: false,")
            lines.append(f"    generator: false,")
            lines.append(f"    stockpile: false,")
            lines.append(f"    toilet24h: false,")
            lines.append(f"    water: false,")
            if r.get("osm_match"):
                src = "nominatim" if r["osm_match"].startswith("nominatim") \
                    else "osm" if r["osm_match"] != "手動座標" else "manual"
                lines.append(f"    source: \"{src}\",")
            lines.append(f"  }},")
    lines.append("];")
    return "\n".join(lines)

js = make_js(final)
with open("data/michinoeki.js", "w", encoding="utf-8") as f:
    f.write(js)
print(f"data/michinoeki.js 生成: {len(final)}件")
