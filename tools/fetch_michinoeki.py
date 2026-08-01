#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""四国地区「道の駅」連絡会公式サイトから全駅一覧をスクレイピング
出力: /tmp/hinan/michinoeki_official.csv (name,address,tel,pref)
"""
import csv
import re
import time
import requests

BASE = "https://www.sk-michinoeki.jp"
PREFS = {
    "徳島": "tokushima",
    "香川": "kagawa",
    "愛媛": "ehime",
    "高知": "kochi",
}
HEADERS = {"User-Agent": "Mozilla/5.0 (shikoku-disaster-map collector)"}

rows = []
for pref, slug in PREFS.items():
    page = 1
    while True:
        url = f"{BASE}/michinoeki/michinoeki_pref/{slug}/page/{page}" if page > 1 \
            else f"{BASE}/michinoeki/michinoeki_pref/{slug}"
        r = requests.get(url, headers=HEADERS, timeout=30)
        r.raise_for_status()
        html = r.text
        # 駅名: <h2 class="rs-name ..."><a ...><span>道の駅</span>&nbsp;<strong>名前</strong></a></h2>
        items = re.findall(r'rs-name[^>]*"><a[^>]*>.*?<strong>(.*?)</strong>', html, re.S)
        # 所在地・TEL（table 内）
        addrs = re.findall(r'所在地</th>\s*<td>(.*?)(?:<a|</td>)', html, re.S)
        tels = re.findall(r'TEL</th>\s*<td>(.*?)(?:<a|</td>)', html, re.S)
        # 住所・TELを正規化
        addrs = [re.sub(r'<[^>]+>', '', a).strip() for a in addrs]
        tels = [re.sub(r'<[^>]+>', '', t).strip() for t in tels]
        print(f"[{pref}] page{page}: items={len(items)} addrs={len(addrs)} tels={len(tels)}")
        for i, name in enumerate(items):
            name = re.sub(r'<[^>]+>', '', name).strip()
            addr = addrs[i] if i < len(addrs) else ""
            tel = tels[i] if i < len(tels) else ""
            rows.append({"pref": pref, "name": name, "address": addr, "tel": tel})
        # 次ページ判定
        m = re.search(r'href="[^"]*/page/(\d+)"[^>]*>[^<]*次', html) or \
            re.search(r'class="[^"]*next[^"]*"[^>]*href="[^"]*/page/(\d+)"', html)
        has_next = 'page/%d' % (page + 1) in html
        if not has_next:
            break
        page += 1
        time.sleep(0.5)

# 重複除去（同じ駅が複数回出る場合）
seen = set()
uniq = []
for r in rows:
    key = (r["pref"], r["name"])
    if key not in seen:
        seen.add(key)
        uniq.append(r)

with open("/tmp/hinan/michinoeki_official.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["pref", "name", "address", "tel"])
    w.writeheader()
    w.writerows(uniq)
print(f"TOTAL: {len(uniq)} stations -> /tmp/hinan/michinoeki_official.csv")
for pref in PREFS:
    n = sum(1 for r in uniq if r["pref"] == pref)
    print(f"  {pref}: {n}")
