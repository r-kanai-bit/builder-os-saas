#!/bin/bash
# ============================================================
# Excel帳票エンジン - ローカル起動スクリプト
# ============================================================
# usage:
#   cd backend
#   chmod +x start.sh
#   ./start.sh          # 通常起動
#   ./start.sh --seed   # DB初期化 + テンプレート登録 + 起動
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Excel帳票エンジン ローカル起動"
echo "=========================================="

# .env ファイルがなければ作成
if [ ! -f .env ]; then
  echo "📋 .env ファイルを .env.example からコピーします..."
  cp .env.example .env
  echo "  → .env 作成完了（必要に応じて編集してください）"
fi

# storage ディレクトリ確認
mkdir -p storage/templates storage/outputs

# テンプレートファイル確認
if [ ! -f "storage/templates/【クロード用】見積書.xlsx" ]; then
  echo "⚠️  テンプレートファイルが未配置です"
  echo "  → storage/templates/【クロード用】見積書.xlsx を配置してください"
fi

# DB初期化（--seed オプション）
if [ "$1" = "--seed" ]; then
  echo ""
  echo "🗄️  DB初期化 + テンプレート登録..."
  python -m scripts.init_db --seed
fi

# FastAPI 起動
echo ""
echo "🚀 FastAPI サーバー起動 (http://localhost:8000)"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health:   http://localhost:8000/health"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
