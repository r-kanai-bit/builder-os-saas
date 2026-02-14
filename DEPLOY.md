# Builder OS SaaS - デプロイ手順書

## 前提条件
- Node.js 18以上
- GitHubアカウント
- Vercelアカウント (https://vercel.com)
- Supabaseアカウント (https://supabase.com)
- Stripeアカウント (https://stripe.com)

---

## Step 1: Supabase セットアップ

1. https://supabase.com でプロジェクト作成
2. **SQL Editor** で `supabase/schema.sql` を実行
3. **Authentication > Providers** で Email と Google を有効化
4. Google OAuth の場合: GCP で OAuth クライアントID取得 → Supabase に設定
5. **Settings > API** から以下をメモ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Stripe セットアップ

1. https://dashboard.stripe.com でアカウント作成
2. **Products** で2つの商品を作成:
   - スターター: ¥9,980/月 (recurring)
   - プロ: ¥24,980/月 (recurring)
3. 各商品の Price ID をメモ
4. **Developers > API keys** から:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. **Developers > Webhooks** でエンドポイント追加:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Signing secret → `STRIPE_WEBHOOK_SECRET`

## Step 3: GitHub リポジトリ作成

```bash
cd builder-os-saas
git add .
git commit -m "Initial commit: Builder OS SaaS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/builder-os-saas.git
git push -u origin main
```

## Step 4: Vercel デプロイ

1. https://vercel.com で **New Project**
2. GitHub リポジトリを選択
3. **Environment Variables** に以下を設定:

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Stripe starter plan price ID |
| `STRIPE_PRICE_PRO` | Stripe pro plan price ID |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

4. **Deploy** をクリック

## Step 5: ドメイン設定

1. builderios.jp 等のドメインを取得
2. Vercel > Settings > Domains でカスタムドメイン追加
3. DNS レコードを設定 (Vercel が指示する CNAME/A レコード)
4. SSL は Vercel が自動発行

## Step 6: 本番環境チェック

- [ ] LP 表示確認
- [ ] ユーザー登録・ログイン動作
- [ ] Google OAuth 動作
- [ ] Stripe 決済フロー
- [ ] Webhook 受信
- [ ] ダッシュボード表示
- [ ] モバイル表示
- [ ] SSL 有効

---

## ローカル開発

```bash
# .env.local.example を .env.local にコピーして値を設定
cp .env.local.example .env.local

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```
