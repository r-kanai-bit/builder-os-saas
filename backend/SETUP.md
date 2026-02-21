# Excel帳票エンジン - セットアップガイド

完全なバックエンドアーキテクチャが実装されました。このガイドでセットアップと実行を行います。

## ファイル構成確認

```
backend/
├── README.md                          # アーキテクチャ設計書（日本語）
├── SETUP.md                          # このファイル
├── requirements.txt                  # Python依存関係
├── .env.example                      # 環境変数テンプレート
├── Dockerfile                        # コンテナイメージ
├── docker-compose.yml               # 開発環境構築
├── alembic.ini                       # Alembic設定
│
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI メインアプリケーション
│   ├── config.py                     # 設定管理（pydantic-settings）
│   ├── database.py                   # SQLAlchemy セットアップ
│   ├── security.py                   # JWT・署名URL管理
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── template.py               # ORM モデル定義
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── template.py               # Pydantic スキーマ
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── excel_service.py          # Excel生成ロジック
│   │   └── storage_service.py        # ストレージ抽象化
│   │
│   └── api/
│       ├── __init__.py
│       ├── router.py                 # ルータ統合
│       ├── deps.py                   # 依存性注入
│       └── endpoints/
│           ├── __init__.py
│           ├── templates.py          # テンプレート CRUD
│           ├── generate.py           # 生成エンドポイント
│           └── download.py           # ダウンロード
│
├── alembic/
│   ├── env.py                        # マイグレーション環境
│   ├── script.py.mako                # テンプレート
│   ├── versions/
│   │   └── 001_initial_schema.py    # 初期スキーマ
│   └── README                        # Alembic ガイド
│
├── templates/                        # Excelテンプレート置き場
│   └── .gitkeep
│
├── storage/                          # ファイル出力置き場
│   └── .gitkeep
│
└── tests/
    ├── __init__.py
    └── test_excel_service.py         # ユニットテスト
```

## 必須環境

- Python 3.11+
- Docker & Docker Compose（推奨）
- PostgreSQL 15+ （ローカル開発時）

## セットアップ手順

### 1. 環境変数設定

```bash
cd backend

# .env ファイルを作成
cp .env.example .env

# 本番環境の場合は SECRET_KEY を変更
# vim .env
```

### 2a. Docker Compose での実行（推奨）

```bash
# イメージをビルドしてコンテナを起動
docker-compose up --build

# ログを確認
docker-compose logs -f backend

# 別ターミナルで確認
curl http://localhost:8000/health
```

出力:
```json
{
  "status": "healthy",
  "app": "Excel帳票エンジン",
  "version": "1.0.0"
}
```

### 2b. ローカル開発環境での実行

```bash
# Python 3.11+ が必要
python --version

# 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係をインストール
pip install -r requirements.txt

# PostgreSQL を起動（別ターミナル）
docker run --name excel-postgres \
  -e POSTGRES_USER=excel_user \
  -e POSTGRES_PASSWORD=excel_password \
  -e POSTGRES_DB=excel_engine \
  -p 5432:5432 \
  -d postgres:15-alpine

# DB接続を確認
sleep 2
psql -U excel_user -d excel_engine -h localhost

# マイグレーションを実行
alembic upgrade head

# サーバーを起動
uvicorn app.main:app --reload

# ブラウザでアクセス
# http://localhost:8000/docs
# http://localhost:8000/health
```

## API テスト

### ヘルスチェック

```bash
curl http://localhost:8000/health
```

### テンプレート作成

```bash
# テンプレートファイルを準備
# backend/templates/sample.xlsx を手動で作成

# テンプレートを登録
curl -X POST http://localhost:8000/api/v1/templates \
  -H "X-Tenant-ID: 1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "請求書テンプレート",
    "slug": "invoice-template",
    "file_path": "templates/sample.xlsx",
    "description": "月次請求書"
  }'
```

### セルマッピング作成

```bash
curl -X POST http://localhost:8000/api/v1/templates/1/mappings \
  -H "X-Tenant-ID: 1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cell_ref": "A1",
    "field_name": "company_name",
    "data_type": "string",
    "sort_order": 1
  }'
```

### Excel 生成

```bash
curl -X POST http://localhost:8000/api/v1/generate/invoice-template \
  -H "X-Tenant-ID: 1" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "company_name": "株式会社ABC",
      "invoice_number": "INV-001",
      "amount": 1000000
    }
  }'
```

## テスト実行

```bash
# ユニットテスト
pytest tests/ -v

# カバレッジ確認
pytest tests/ --cov=app --cov-report=html
```

## ログレベル変更

```bash
# .env で設定
LOG_LEVEL=DEBUG

# または環境変数で
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload
```

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQL が起動しているか確認
docker ps

# または
psql -U excel_user -d excel_engine -h localhost
```

### マイグレーション失敗

```bash
# マイグレーション履歴確認
alembic history

# 現在のリビジョン確認
alembic current

# 初期状態にリセット（開発環境のみ）
alembic downgrade base
alembic upgrade head
```

### ポート競合

```bash
# 別のポートで起動
uvicorn app.main:app --port 8001 --reload
```

### 依存関係問題

```bash
# 最新版にアップグレード
pip install --upgrade pip
pip install -r requirements.txt --upgrade
```

## 本番環境への展開

### 1. 環境変数を設定

```bash
# .env を編集
DEBUG=False
SECRET_KEY=<生成された安全なキー>
DATABASE_URL=<本番DB接続情報>
STORAGE_TYPE=s3
S3_BUCKET=<バケット名>
S3_ACCESS_KEY_ID=<キー>
S3_SECRET_ACCESS_KEY=<シークレット>
```

### 2. Docker イメージをビルド

```bash
docker build -t excel-engine:latest .
```

### 3. Kubernetes または Docker Compose で起動

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# または Kubernetes
kubectl apply -f k8s/
```

### 4. データベースマイグレーション

```bash
kubectl run --rm -it migration --image=excel-engine:latest \
  --restart=Never -- alembic upgrade head
```

## パフォーマンスチューニング

### データベース接続プール

```python
# app/config.py で設定
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### ログレベル最適化

本番環境では `LOG_LEVEL=WARNING` に設定して、ディスク I/O を削減します。

### キャッシング

Redisを統合してキャッシュを追加可能:

```bash
pip install redis aioredis
```

## セキュリティチェックリスト

- [ ] `SECRET_KEY` を本番環境用に変更
- [ ] HTTPS を有効化（TLS/SSL）
- [ ] CORS origins を制限
- [ ] データベースパスワードを安全に保管
- [ ] S3 認証情報を環境変数で管理
- [ ] ログに機密情報を出力しない設定
- [ ] ファイアウォール設定を確認
- [ ] 定期的なセキュリティアップデート

## 監視・ロギング

### ログファイル保存

```python
# app/config.py に追加
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "class": "logging.FileHandler",
            "filename": "logs/app.log",
        },
    },
}
```

### メトリクス収集

Prometheus 統合:

```bash
pip install prometheus-client
```

## サポート

問題が発生した場合:

1. `README.md` のトラブルシューティングセクションを確認
2. ログを確認: `docker-compose logs backend`
3. Alembic ガイド: `backend/alembic/README`

---

最終更新: 2024年
