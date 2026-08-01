#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""停電情報取得: 四国電力送配電 停電地図 topoJSON から data/outage.js 生成
出典: https://teidenchizushikoku.com/TEIDENINFOTOPOJSON.topojson
  - 停電ゼロ時: topoJSON が空 → OUTAGE_DATA は空配列
  - 停電発生時: TEIDENKBN=1(停電) / 2(復旧作業中) のポリゴンと軒数・時刻を抽出
失敗時は既存 data/outage.js を維持（例外で停止しない）
"""
import hashlib
import json
import sys
import urllib.request
from datetime import datetime, timezone, timedelta

URL = "https://teidenchizushikoku.com/TEIDENINFOTOPOJSON.topojson"
OUT = "data/outage.js"

JST = timezone(timedelta(hours=9))


def to_float(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def to_int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def stable_id(pref, city, area, lat, lon):
    """順序に依存しない安定 id（同一地域は再取得後も同一 id）"""
    seed = f"{pref}|{city}|{area}|{lat:.4f}|{lon:.4f}"
    return "out-" + hashlib.md5(seed.encode("utf-8")).hexdigest()[:8]


def main():
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (shikoku-disaster-map)"})
        with urllib.request.urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"fetch_teiden: 取得失敗（既存 data/outage.js を維持）: {e}", file=sys.stderr)
        return 1

    geoms = (data.get("objects") or {}).get("TEIDENINFOGEOJSON", {}).get("geometries", [])

    entries = []
    for g in geoms:
        p = g.get("properties") or {}
        kbn = p.get("TEIDENKBN")
        if kbn not in ("1", "2"):
            continue
        lat = to_float(p.get("Y_CODE"))   # Google Maps 用: 緯度
        lon = to_float(p.get("X_CODE"))   # 経度
        if lat is None or lon is None:
            continue
        households = to_int(p.get("TEIDENKOSU"))
        if households <= 0:               # 0軒エントリは出力しない
            continue
        pref = (p.get("PREF_NAME") or "").strip()
        city = (p.get("CITY_NAME") or "").strip()
        area = (p.get("S_NAME") or "").strip()
        entries.append({
            "id": stable_id(pref, city, area, lat, lon),
            "pref": pref,
            "city": city,
            "area": area,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "households": households,
            "startTime": (p.get("TEIDENSTARTDT") or "").strip(),
            "status": "outage" if kbn == "1" else "restoring",
            "reason": (p.get("GENINMSG") or "").strip(),
            "note": (p.get("JOKYOMSG") or "").strip(),
        })

    now = datetime.now(JST)
    updated = now.strftime("%Y-%m-%d %H:%M")
    total = sum(e["households"] for e in entries)

    lines = []
    lines.append("// 停電情報（四国電力送配電）")
    lines.append("// 出典: 四国電力送配電 停電地図 topoJSON (teidenchizushikoku.com)")
    lines.append("// 生成: tools/fetch_teiden.py（10分間隔リロード対象）")
    lines.append(f"// 取得時刻: {updated}")
    # json.dumps: 外部由来の " や \ や改行も安全にエスケープ
    lines.append("window.OUTAGE_DATA = " + json.dumps(entries, ensure_ascii=False, indent=2) + ";")
    lines.append("window.OUTAGE_SUMMARY = " + json.dumps(
        {"total": total, "updated": updated}, ensure_ascii=False) + ";")
    lines.append("")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"data/outage.js 生成: 停電地域 {len(entries)}件 / 軒数合計 {total} / 更新 {updated}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
