#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GSI 指定緊急避難場所・指定避難所データ (CSV) → data/*.js 変換ツール
- 指定避難所: SHELTERS_DATA (全件 canvas 用)
- 指定緊急避難場所 (津波=1): TSUNAMI_TOWERS (type: tower/building/highground)
データ元: 国土地理院 避難所等データダウンロードサイト
  https://hinanmap.gsi.go.jp/hinanjocp/hinanbasho/koukaidate.html
実行: /usr/bin/python3 tools/convert_shelters.py
入力: /tmp/hinan/sh_*.csv (避難所), /tmp/hinan/ev_*.csv (緊急避難場所)
"""
import csv
import json
import os
import re

BASE = "/tmp/hinan"
PREFS = {"36": "徳島", "37": "香川", "38": "愛媛", "39": "高知"}

def load_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.reader(f))

def extract_muni(address, pref):
    """住所から市町村名を抽出。例: 徳島県阿南市津乃峰町... → 阿南市"""
    rest = address.replace(f"{pref}県", "").replace(f"{pref}府", "").replace(f"{pref}都", "")
    m = re.match(r"^([^市町村]+[市町村])", rest)
    return m.group(1) if m else rest[:6]

def col_idx(header, name):
    """ヘッダ行からカラム位置を動的解決"""
    for i, h in enumerate(header):
        if h.strip() == name:
            return i
    raise ValueError(f"column not found: {name}")

def main():
    shelters, towers = [], []
    for code, pref in PREFS.items():
        # ---- 指定避難所 (sh) ----
        rows = load_csv(os.path.join(BASE, f"sh_{code}.csv"))
        header = rows[0]
        ci_name = col_idx(header, "施設・場所名")
        ci_addr = col_idx(header, "住所")
        ci_lat = col_idx(header, "緯度")
        ci_lon = col_idx(header, "経度")
        for r in rows[1:]:
            if len(r) <= ci_lon or not r[ci_lat]:
                continue
            try:
                lat, lon = float(r[ci_lat]), float(r[ci_lon])
            except (ValueError, IndexError):
                continue
            address = r[ci_addr] if len(r) > ci_addr else ""
            shelters.append({
                "id": f"shlt-{code}-{r[0]}",
                "name": r[ci_name],
                "pref": pref,
                "muni": extract_muni(address, pref),
                "address": address,
                "lat": lat,
                "lon": lon,
                "status": "unknown",
                "capacity": None,
                "people": None,
            })
        # ---- 指定緊急避難場所 (ev) - 津波=1 ----
        rows = load_csv(os.path.join(BASE, f"ev_{code}.csv"))
        header = rows[0]
        ci_name = col_idx(header, "施設・場所名")
        ci_addr = col_idx(header, "住所")
        ci_lat = col_idx(header, "緯度")
        ci_lon = col_idx(header, "経度")
        ci_tsu = col_idx(header, "津波")
        for r in rows[1:]:
            if len(r) <= ci_lon or not r[ci_lat]:
                continue
            if r[ci_tsu] != "1":  # 津波区分
                continue
            try:
                lat, lon = float(r[ci_lat]), float(r[ci_lon])
            except (ValueError, IndexError):
                continue
            name = r[ci_name]
            address = r[ci_addr] if len(r) > ci_addr else ""
            if "タワー" in name:
                ftype = "tower"
            elif "ビル" in name or "ビルディング" in name:
                ftype = "building"
            else:
                ftype = "highground"
            towers.append({
                "id": f"twr-{code}-{r[0]}",
                "name": name,
                "pref": pref,
                "muni": extract_muni(address, pref),
                "address": address,
                "lat": lat,
                "lon": lon,
                "type": ftype,
                "capacity": None,
                "note": "指定緊急避難場所（津波）",
            })

    # ---- 出力: data/shelters.js ----
    out_s = os.path.join(os.path.dirname(__file__), "../data/shelters.js")
    with open(out_s, "w", encoding="utf-8") as f:
        f.write("// 指定避難所データ（国土地理院 避難所等データ 2026年更新）\n")
        f.write("// 全件表示用: 表示は canvas レンダラー + zoom 制御\n")
        f.write("// データ元: https://hinanmap.gsi.go.jp/ (国土地理院)\n")
        f.write("window.SHELTERS_DATA = ")
        f.write(json.dumps(shelters, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")

    # ---- 出力: data/tsunami_towers.js ----
    out_t = os.path.join(os.path.dirname(__file__), "../data/tsunami_towers.js")
    with open(out_t, "w", encoding="utf-8") as f:
        f.write("// 津波避難施設データ（国土地理院 指定緊急避難場所[津波] 2026年更新）\n")
        f.write("// type: tower=津波避難タワー / building=津波避難ビル / highground=高台・その他避難場所\n")
        f.write("// データ元: https://hinanmap.gsi.go.jp/ (国土地理院)\n")
        f.write("window.TSUNAMI_TOWERS = ")
        f.write(json.dumps(towers, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")

    print(f"避難所: {len(shelters)}件")
    print(f"津波避難施設: {len(towers)}件 "
          f"(tower={sum(1 for t in towers if t['type']=='tower')}, "
          f"building={sum(1 for t in towers if t['type']=='building')}, "
          f"highground={sum(1 for t in towers if t['type']=='highground')})")
    print(f"出力: {out_s} ({os.path.getsize(out_s)//1024}KB)")
    print(f"出力: {out_t} ({os.path.getsize(out_t)//1024}KB)")

if __name__ == "__main__":
    main()
