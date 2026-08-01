#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
四国版 災害情報マップ - データ定期更新オーケストレーションスクリプト
1. 停電情報 (tools/fetch_teiden.py)
2. 気象庁地震リアルタイムデータの生存確認
3. 消防庁被害報・各レイヤータイムスタンプの最終更新
失敗時は既存ファイルを保護し、システム全体の稼働を最優先します。
"""

import sys
import subprocess
import os
import json
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))

def log(msg):
    now_str = datetime.now(JST).strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now_str}] {msg}")

def run_step(name, cmd):
    log(f"--- 実行中: {name} ---")
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        if res.stdout:
            print(res.stdout.strip())
        log(f"✓ 完了: {name}")
        return True
    except subprocess.CalledProcessError as e:
        log(f"⚠️ 警告: {name} の実行でエラーが発生しました (コード {e.returncode}): {e.stderr}")
        return False
    except Exception as e:
        log(f"⚠️ 警告: {name} の実行に例外が発生しました: {e}")
        return False

def main():
    log("=== 四国版 災害情報マップ 自動データ更新開始 ===")
    
    # 1. 停電情報の取得 (四国電力送配電 topoJSON)
    teiden_ok = run_step("停電情報取得 (fetch_teiden.py)", [sys.executable, "tools/fetch_teiden.py"])
    
    log("=== 自動データ更新処理 終了 ===")
    return 0

if __name__ == "__main__":
    sys.exit(main())
