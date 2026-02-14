# Builder OS - 建設業向け業務効率化クラウドシステム

建設業に必要な14のツールをワンストップで提供するSaaSアプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 16 + TailwindCSS 4
- **認証**: Supabase Auth (Email / Google OAuth)
- **データベース**: Supabase PostgreSQL (RLS対応)
- **決済**: Stripe (月額サブスクリプション)
- **ホスティング**: Vercel

## プロジェクト構成

```
builder-os-saas/
├── app/                    # Next.js App Router
│   ├── page.tsx            # ランディングページ
│   ├── contact/            # お問い合わせフォーム
│   ├── auth/               # ログイン / 新規登録 / OAuth コールバック
│   ├── dashboard/          # ダッシュボード (認証後)
│   └── api/stripe/         # Stripe API (Checkout / Webhook)
├── components/             # UIコンポーネント (Header, Hero, Features, Pricing, etc.)
├── lib/                    # ユーティリティ (Supabase client, Stripe config)
├── supabase/schema.sql     # DBスキーマ (Supabase SQL Editorで実行)
├── middleware.ts            # 認証ミドルウェア (ルート保護)
├── vercel.json             # Vercelデプロイ設定
├── setup.sh                # セットアップスクリプト
├── DEPLOY.md               # 詳細デプロイ手順書
└── preview.html            # LP プレビュー (ブラウザで直接開けます)
```

## クイックスタート

### 1. LPプレビュー確認
`preview.html` をブラウザで開くと、ランディングページのプレビューを確認できます。

### 2. 環境設定
```bash
cp .env.local.example .env.local
# .env.local に各サービスのAPIキーを設定
```

### 3. セットアップ実行
```bash
bash setup.sh
```

### 4. ローカル開発
```bash
npm run dev
```

## 料金プラン

| プラン | 月額(税別) | ユーザー数 |
|--------|-----------|-----------|
| スターター | ¥9,980 | 5名まで |
| プロ | ¥24,980 | 20名まで |
| エンタープライズ | カスタム | 無制限 |

## 搭載ツール (14種)

工事台帳 / 見積作成 / 実行予算 / 発注管理 / 工程管理 / 入金管理 / 原価管理 / 日報管理 / 写真管理 / 顧客管理 / アフター管理 / 書類管理 / 業者管理 / 経営分析

## デプロイ

詳細は [DEPLOY.md](./DEPLOY.md) を参照してください。

---

&copy; 2026 Harmony Inc. All rights reserved.
