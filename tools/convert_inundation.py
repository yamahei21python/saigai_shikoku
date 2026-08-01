#!/usr/bin/env python3
"""
四国 津波浸水想定データ コンバーター
国土数値情報 (MLIT) A40-16 シェープファイル → 軽量JSファイル

使い方:
  /usr/bin/python3 tools/convert_inundation.py   (Python 3.9+, fiona/shapely 必須)

出力:
  data/tsunami_inundation.js  — 軽量化ポリゴンデータ（県×ランクで統合済み・度座標）
  data/tsunami_inundation_raw.js — 生GeoJSON（デバッグ用）

注: 実データは GCS_JGD_2011（度単位）。fiona が crs を誤報告するため座標変換は行わない。
"""

import io
import json
import os
import re
import sys
import urllib.request
import zipfile
import shutil

try:
    import fiona
    import shapely.geometry as sg
    import shapely.ops as so
except ImportError:
    print("fiona と shapely が必要: /usr/bin/python3 -m pip install fiona shapely")
    sys.exit(1)

# ─── 設定 ─────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
URLS = {
    'tokushima': 'https://nlftp.mlit.go.jp/ksj/gml/data/A40/A40-16/A40-16_36_GML.zip',
    'ehime':     'https://nlftp.mlit.go.jp/ksj/gml/data/A40/A40-16/A40-16_38_GML.zip',
    'kochi':     'https://nlftp.mlit.go.jp/ksj/gml/data/A40/A40-16/A40-16_39_GML.zip',
}

# 簡略化許容差 (度) — 実データは度単位 (GCS_JGD_2011)。0.001度 ≈ 100m
SIMPLIFY_TOLERANCE = 0.0015  # ≈150m


def parse_depth_m(rank):
    """ランク文字列 → 下限値 (m)。例: '3m以上 〜 4m未満' → 3.0, '20m以上' → 30.0"""
    if not rank:
        return 0
    m = re.search(r'(\d+(?:\.\d+)?)m以上', rank)
    if m:
        val = float(m.group(1))
        # 上限なしは +10m マージン（色分け用）
        if '未満' not in rank:
            return val + 10.0
        return val
    return 0


def download_zip(url):
    """ZIPダウンロードしてメモリ上に展開"""
    print(f'  DL: {url}')
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = resp.read()
    z = zipfile.ZipFile(io.BytesIO(data))
    shp = None
    for name in z.namelist():
        if name.endswith('.shp') and not name.startswith('__'):
            shp = name
            break
    if not shp:
        raise RuntimeError('Shapefile not found in zip')
    tmpdir = f'/tmp/inundation_{os.urandom(4).hex()}'
    os.makedirs(tmpdir, exist_ok=True)
    for name in z.namelist():
        z.extract(name, tmpdir)
    return os.path.join(tmpdir, shp), tmpdir


def read_shapes(shp_path):
    """Shapefile → [(pref, depth_rank, depth_m, shapely_geometry)]"""
    items = []
    with fiona.open(shp_path, encoding='shift-jis') as src:
        for i, feat in enumerate(src):
            geom = feat.geometry
            props = feat.properties
            depth_rank = props.get('A40_003') or props.get('rank') or '不明'
            depth_m = parse_depth_m(depth_rank)
            try:
                shape = sg.shape(geom)
                if shape.is_empty:
                    continue
                items.append({
                    'pref': props.get('A40_001', ''),
                    'depth_rank': depth_rank,
                    'depth_m': depth_m,
                    'geom': shape,
                })
            except Exception as e:
                print(f'  WARN: feature #{i} skipped: {e}')
                continue
    print(f'  → {len(items)} geometries')
    return items


def aggregate(items):
    """県 × 浸水深ランク ごとに unary_union で統合"""
    groups = {}
    for it in items:
        key = (it['pref'], it['depth_rank'])
        groups.setdefault(key, []).append(it['geom'])

    merged = []
    for (pref, rank), geoms in groups.items():
        try:
            unioned = so.unary_union(geoms)
            if unioned.is_empty:
                continue
            merged.append({
                'pref': pref,
                'depth_rank': rank,
                'depth_m': parse_depth_m(rank),
                'geom': unioned,
            })
        except Exception as e:
            print(f'  WARN: union failed {pref}/{rank}: {e}')
            continue
    return merged


def count_coords(c):
    if isinstance(c, (int, float)):
        return 1
    return sum(count_coords(x) for x in c)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    all_items = []
    for pref_key, url in URLS.items():
        print(f'--- {pref_key} ---')
        try:
            shp_path, tmpdir = download_zip(url)
            all_items.extend(read_shapes(shp_path))
            shutil.rmtree(tmpdir, ignore_errors=True)
        except Exception as e:
            print(f'  ERROR: {e}')
            continue

    if not all_items:
        print('データ取得失敗')
        sys.exit(1)

    # ── 統合（県×ランク）→ 簡略化 ──
    merged = aggregate(all_items)
    print(f'統合後: {len(merged)} ポリゴン')

    compact = []
    for m in merged:
        geom = m['geom'].simplify(SIMPLIFY_TOLERANCE, preserve_topology=False)
        if geom.is_empty:
            continue
        if geom.geom_type == 'Polygon':
            geom = sg.MultiPolygon([geom])
        coords = json.loads(json.dumps(geom.__geo_interface__))['coordinates']
        compact.append({
            'p': m['pref'],
            'd': m['depth_m'],
            'r': m['depth_rank'],
            'c': coords,
        })

    # depth でソート（凡例順）
    compact.sort(key=lambda x: x['d'])

    js_path = os.path.join(OUT_DIR, 'tsunami_inundation.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write('// 津波浸水想定ポリゴンデータ（簡略化・統合版）\n')
        f.write('// 出典: 国土数値情報 津波浸水想定データ (MLIT A40-16, CC BY 4.0)\n')
        f.write('// 最終更新: 2016年度（平成28年度）版\n')
        f.write('// 座標系: GCS_JGD_2011（度） / 浸水深ランク単位で統合済み・150m簡略化\n')
        f.write('//\n')
        f.write('// 各エントリ:\n')
        f.write('//   p: 県名, d: 浸水深(m)下限値, r: ランク, c: 座標[][][]\n')
        f.write('window.TSUNAMI_INUNDATION = ')
        f.write(json.dumps(compact, ensure_ascii=False))
        f.write(';\n')
    total_coords = sum(count_coords(c['c']) for c in compact)
    print(f'軽量データ保存: {js_path} ({len(compact)} features, {os.path.getsize(js_path)/1024:.0f}KB, {total_coords} coords)')

    # 統計
    pref_counts = {}
    for c in compact:
        pref_counts[c['p']] = pref_counts.get(c['p'], 0) + 1
    print(f'県別件数: {pref_counts}')
    for c in compact:
        print(f"  {c['p']} {c['r']} (d={c['d']})")
    print('完了 ✅')


if __name__ == '__main__':
    main()
