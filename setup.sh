#!/bin/bash
# =============================================
# Builder OS SaaS - セットアップスクリプト
# =============================================
# 使い方: bash setup.sh
# =============================================

set -e

echo ""
echo "========================================="
echo "  Builder OS SaaS セットアップ"
echo "========================================="
echo ""

# --- Step 1: 環境変数ファイルの確認 ---
if [ ! -f .env.local ]; then
  echo "[1/5] 環境変数ファイルを作成します..."
  cp .env.local.example .env.local
  echo ""
  echo "  .env.local が作成されました。"
  echo "  以下の値を設定してください:"
  echo ""
  echo "  NEXT_PUBLIC_SUPABASE_URL     = Supabase Project URL"
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY = Supabase anon public key"
  echo "  SUPABASE_SERVICE_ROLE_KEY     = Supabase service role key"
  echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = Stripe publishable key"
  echo "  STRIPE_SECRET_KEY             = Stripe secret key"
  echo "  STRIPE_WEBHOOK_SECRET         = Stripe webhook signing secret"
  echo "  STRIPE_PRICE_STARTER          = Stripe starter plan price ID"
  echo "  STRIPE_PRICE_PRO              = Stripe pro plan price ID"
  echo "  NEXT_PUBLIC_APP_URL           = https://your-domain.com"
  echo ""
  echo "  設定後、再度 bash setup.sh を実行してください。"
  exit 0
else
  echo "[1/5] 環境変数ファイル: OK"
fi

# --- Step 2: 依存関係インストール ---
echo "[2/5] 依存関係をインストール中..."
npm install --silent
echo "  依存関係: OK"

# --- Step 3: ビルド ---
echo "[3/5] プロジェクトをビルド中..."
npm run build
echo "  ビルド: OK"

# --- Step 4: Git ---
echo "[4/5] Gitリポジトリを設定中..."
if [ ! -d .git ]; then
  git init
fi

git add -A
git commit -m "Builder OS SaaS - Initial release" --allow-empty 2>/dev/null || true
echo "  Git: OK"

# --- Step 5: デプロイ案内 ---
echo ""
echo "========================================="
echo "  セットアップ完了！"
echo "========================================="
echo ""
echo "  ローカルで確認:"
echo "    npm run dev"
echo ""
echo "  Vercelにデプロイ:"
echo "    1. https://github.com/new でリポジトリ作成"
echo "    2. git remote add origin <URL>"
echo "    3. git push -u origin main"
echo "    4. https://vercel.com/new でインポート"
echo "    5. 環境変数を設定してデプロイ"
echo ""
echo "  Stripe Webhook URL:"
echo "    https://your-domain.com/api/stripe/webhook"
echo ""
echo "  詳細は DEPLOY.md を参照してください。"
echo ""
