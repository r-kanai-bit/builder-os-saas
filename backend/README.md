# Excel帳票エンジン - バックエンド設計書

## システム概要

Excel帳票エンジンは、テンプレートベースのExcel生成システムです。データベースで定義されたセルマッピングを使用し、テンプレートファイルにデータを高速に埋め込むことで、複雑な帳票を効率的に生成します。

### 特徴
- **テンプレートベース設計**: OpenPyXLを使用したテンプレートベースのExcel生成
- **マルチテナント対応**: テナント単位での完全な隔離
- **柔軟なセルマッピング**: DBで定義可能なセル→フィールドマッピング
- **署名付きダウンロードURL**: セキュアなファイルダウンロード
- **複数ストレージ対応**: ローカルストレージ/S3互換対応
- **生成履歴管理**: すべての生成処理を記録

---

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI アプリケーション層                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /api/      │  │   /api/      │  │   /api/      │      │
│  │  templates   │  │   generate   │  │   download   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           テナント検証・認証ミドルウェア              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
├─────────────────────────────────────────────────────────────┤
│                   ビジネスロジック層                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐     ┌──────────────────────────┐  │
│  │  ExcelService       │     │   StorageService         │  │
│  │ ─────────────────── │     │ ──────────────────────── │  │
│  │ • load_template()   │     │ • save()                 │  │
│  │ • fill_cells()      │     │ • get()                  │  │
│  │ • generate()        │     │ • delete()               │  │
│  │ • validate_merge()  │     │ • generate_signed_url()  │  │
│  └─────────────────────┘     └──────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         SecurityService (署名URL管理)               │   │
│  │ • generate_signed_url()                             │   │
│  │ • verify_signed_token()                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    データ永続化層                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐     ┌──────────────────────────┐  │
│  │   SQLAlchemy ORM    │     │   ストレージバックエンド  │  │
│  │ ─────────────────── │     │ ──────────────────────── │  │
│  │ • ExcelTemplate     │     │ • LocalStorage           │  │
│  │ • CellMapping       │     │ • S3Storage              │  │
│  │ • GenerationHistory │     │ • (将来対応予定)         │  │
│  └─────────────────────┘     └──────────────────────────┘  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    外部システム                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐   ┌────────────┐   │
│  │  PostgreSQL  │      │   Local FS   │   │ S3互換     │   │
│  │   Database   │      │   /storage   │   │  Storage   │   │
│  └──────────────┘      └──────────────┘   └────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構造

```
backend/
├── README.md                          # このファイル
├── requirements.txt                   # Python依存関係
├── Dockerfile                         # コンテナイメージ定義
├── docker-compose.yml                 # 開発環境構築
│
├── app/
│   ├── __init__.py                    # パッケージマーカー
│   ├── main.py                        # FastAPI アプリケーション
│   ├── config.py                      # 設定管理 (pydantic-settings)
│   ├── database.py                    # SQLAlchemy セットアップ
│   ├── security.py                    # JWT・署名URL管理
│   │
│   ├── models/                        # SQLAlchemy ORM モデル
│   │   ├── __init__.py
│   │   └── template.py                # ExcelTemplate, CellMapping, GenerationHistory
│   │
│   ├── schemas/                       # Pydantic スキーマ
│   │   ├── __init__.py
│   │   └── template.py                # リクエスト/レスポンス定義
│   │
│   ├── services/                      # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── excel_service.py           # Excel生成ロジック
│   │   └── storage_service.py         # ストレージ抽象化
│   │
│   └── api/                           # APIエンドポイント
│       ├── __init__.py
│       ├── router.py                  # ルータ統合
│       ├── deps.py                    # 依存性注入
│       │
│       └── endpoints/
│           ├── __init__.py
│           ├── templates.py           # CRUD操作
│           ├── generate.py            # 生成エンドポイント
│           └── download.py            # ダウンロードエンドポイント
│
├── alembic/                           # Alembic データベースマイグレーション
│   ├── versions/                      # マイグレーション定義
│   ├── env.py                         # 環境設定
│   ├── script.py.mako                 # テンプレート
│   └── README                         # Alembic説明
│
├── alembic.ini                        # Alembic設定
│
├── templates/                         # Excelテンプレートファイル
│   └── .gitkeep
│
├── storage/                           # ローカルストレージ
│   ├── .gitkeep
│   └── (生成されたExcelファイル)
│
└── tests/                             # テスト
    ├── __init__.py
    └── test_excel_service.py          # ExcelServiceテスト
```

---

## モジュール設計

### 1. **ExcelService モジュール**
Excelテンプレート処理の中核ロジック

**責務**:
- テンプレートの読み込み (`load_workbook` を使用)
- セルデータの安全な書き込み (マージセル対応)
- データ検証とフォーマット処理
- 完成したワークブックの保存

**重要な実装詳細**:
- `load_workbook(data_only=False)` を使用して数式を保持
- マージセルの場合は、マージ範囲の左上セルを特定して書き込み
- テンプレートに既存するセルスタイルと数式を保全

### 2. **StorageService モジュール**
ストレージバックエンドの抽象化

**インターフェース**:
```python
class StorageService(ABC):
    async def save(file_path: str, content: bytes) -> None
    async def get(file_path: str) -> bytes
    async def delete(file_path: str) -> None
    async def generate_signed_url(file_path: str, expiry_seconds: int) -> str
```

**実装**:
- `LocalStorage`: ローカルファイルシステム使用 (`/storage`)
- `S3Storage`: AWS S3互換ストレージ (将来対応予定)

**利点**:
- 本番環境ではS3に切り替え可能
- テスト環境ではLocalStorageを使用
- ストレージ層の詳細がビジネスロジックに影響しない

### 3. **SecurityService モジュール**
署名URL生成・検証

**機能**:
- HMAC-SHA256署名を使用した署名URL生成
- タイムスタンプベースの有効期限管理
- トークン検証とテナント隔離

**セキュリティ**:
- シークレットキーは環境変数から読み込み
- 署名には tenant_id を含める
- URLの有効期限は設定可能 (デフォルト: 3600秒)

---

## データベース設計

### ER図

```
┌─────────────────────────┐
│   ExcelTemplate         │
├─────────────────────────┤
│ id (PK)                 │
│ tenant_id (FK)          │──┐
│ name                    │  │
│ slug                    │  │
│ file_path               │  │
│ description             │  │
│ version                 │  │
│ is_active               │  │
│ created_at              │  │
│ updated_at              │  │
└─────────────────────────┘  │
         │                   │
         │ 1:N               │
         │                   │
┌────────┴──────────────────────┐     ┌──────────────────────┐
│   CellMapping                  │     │  GenerationHistory   │
├────────────────────────────────┤     ├──────────────────────┤
│ id (PK)                        │     │ id (PK)              │
│ template_id (FK) ───────────────────→ template_id (FK)    │
│ cell_ref (A1, B2, etc.)        │     │ tenant_id            │
│ field_name                     │     │ user_id              │
│ data_type (string/int/float)   │     │ input_data (JSON)    │
│ format_pattern (optional)      │     │ output_path          │
│ description                    │     │ file_size (bytes)    │
│ sort_order                     │     │ status (enum)        │
│ created_at                     │     │ error_message        │
│ updated_at                     │     │ created_at           │
└────────────────────────────────┘     └──────────────────────┘
         │
         │ N:1 (template_id)
         │
         └──────────────────────→ ExcelTemplate
```

### テーブル仕様

#### ExcelTemplate
```sql
CREATE TABLE excel_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,                          -- テナント識別子
    name VARCHAR(255) NOT NULL,                         -- テンプレート名
    slug VARCHAR(255) NOT NULL UNIQUE,                  -- URL友好なID
    file_path VARCHAR(512) NOT NULL,                    -- テンプレートファイルパス
    description TEXT,                                   -- 説明
    version INT DEFAULT 1,                              -- バージョン
    is_active BOOLEAN DEFAULT TRUE,                     -- 有効フラグ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- 作成日時
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- 更新日時

    UNIQUE KEY uk_tenant_slug (tenant_id, slug),
    INDEX idx_tenant_active (tenant_id, is_active)
);
```

#### CellMapping
```sql
CREATE TABLE cell_mappings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL,                        -- テンプレート参照
    cell_ref VARCHAR(20) NOT NULL,                      -- セルアドレス (A1, B2:D5など)
    field_name VARCHAR(255) NOT NULL,                   -- 入力フィールド名
    data_type VARCHAR(50) DEFAULT 'string',             -- データ型 (string/int/float/date)
    format_pattern VARCHAR(255),                        -- フォーマットパターン (例: #,##0.00)
    description VARCHAR(500),                           -- 説明
    sort_order INT DEFAULT 0,                           -- ソート順序
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (template_id) REFERENCES excel_templates(id) ON DELETE CASCADE,
    UNIQUE KEY uk_template_cellref (template_id, cell_ref),
    INDEX idx_template_field (template_id, field_name)
);
```

#### GenerationHistory
```sql
CREATE TABLE generation_histories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL,                        -- テンプレート参照
    tenant_id BIGINT NOT NULL,                          -- テナント隔離用
    user_id BIGINT NOT NULL,                            -- 生成ユーザーID
    input_data JSON,                                    -- 入力データ（検索用）
    output_path VARCHAR(512),                           -- 出力ファイルパス
    file_size BIGINT,                                   -- ファイルサイズ (bytes)
    status ENUM('pending','processing','completed','failed'),
    error_message TEXT,                                 -- エラーメッセージ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (template_id) REFERENCES excel_templates(id) ON DELETE CASCADE,
    INDEX idx_tenant_created (tenant_id, created_at),
    INDEX idx_template_status (template_id, status),
    INDEX idx_user_created (user_id, created_at)
);
```

---

## ストレージ設計

### ローカルストレージ構造

```
storage/
├── templates/                         # テンプレートファイル置き場
│   ├── tenant-001_template-001.xlsx
│   └── tenant-001_template-002.xlsx
│
└── outputs/                           # 生成されたファイル置き場
    └── YYYY/MM/DD/
        ├── <timestamp>_<template_id>_<user_id>.xlsx
        └── (自動削除ポリシー: 30日後)
```

### ファイルパス命名規則

**テンプレート**: `templates/{tenant_id}_{template_slug}.xlsx`
**出力ファイル**: `outputs/{year}/{month}/{day}/{timestamp}_{template_id}_{user_id}_{random}.xlsx`

### S3互換対応

```python
# 設定例
STORAGE_TYPE=s3
S3_BUCKET=document-bucket
S3_REGION=ap-northeast-1
S3_ENDPOINT=https://s3.amazonaws.com  # または MinIO等
```

---

## セキュリティ設計

### 1. テナント隔離

**すべてのクエリで tenant_id を強制**:
```python
# 悪い例
templates = await db.query(ExcelTemplate).all()

# 良い例
templates = await db.query(ExcelTemplate).filter_by(
    tenant_id=current_tenant_id
).all()
```

**ミドルウェアで自動検証**:
```python
async def get_current_tenant(request: Request) -> int:
    # ヘッダーまたはJWTから tenant_id を抽出
    # リクエストパラメータと照合して検証
    return tenant_id
```

### 2. 署名付きダウンロードURL

**生成**:
```
/api/download/{token}

token = HMAC-SHA256(
    message=f"{file_path}|{tenant_id}|{timestamp}",
    key=SECRET_KEY
)

URL有効期限: 1時間（設定可能）
```

**検証**:
1. 署名を検証
2. タイムスタンプをチェック
3. tenant_id を現在のテナントと比較
4. file_path の存在確認

### 3. ユーザー追跡

すべての生成操作で `user_id` を記録:
```python
generation_history = GenerationHistory(
    template_id=template_id,
    tenant_id=tenant_id,
    user_id=user_id,  # 認証済みユーザーのID
    ...
)
```

### 4. ファイルアクセス制御

**アップロード時**:
- XLSX形式のみを許可
- ファイルサイズ制限 (最大 50MB)
- マルウェアスキャン (オプション)

**ダウンロード時**:
- 署名付きURLのみ
- テナント隔離の確認
- ログ記録

---

## API エンドポイント仕様

### テンプレート管理

#### GET /api/templates
テンプレート一覧取得

**レスポンス**:
```json
{
  "templates": [
    {
      "id": 1,
      "name": "請求書テンプレート",
      "slug": "invoice-template",
      "description": "月次請求書",
      "version": 1,
      "is_active": true,
      "cell_count": 2000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/templates
テンプレート新規作成

**リクエスト**:
```json
{
  "name": "請求書テンプレート",
  "slug": "invoice-template",
  "description": "月次請求書",
  "file": "<binary XLSX>"
}
```

#### GET /api/templates/{template_id}/mappings
セルマッピング一覧取得

**レスポンス**:
```json
{
  "mappings": [
    {
      "id": 1,
      "cell_ref": "A1",
      "field_name": "company_name",
      "data_type": "string",
      "format_pattern": null,
      "description": "会社名"
    }
  ]
}
```

#### POST /api/templates/{template_id}/mappings
セルマッピング作成

### データ生成

#### POST /api/generate/{template_slug}
Excelレポート生成

**リクエスト**:
```json
{
  "data": {
    "company_name": "株式会社ABC",
    "total_amount": 1000000,
    "invoice_date": "2024-01-15"
  }
}
```

**レスポンス**:
```json
{
  "id": 12345,
  "status": "completed",
  "file_url": "/api/download/signed-token-xxxxx",
  "file_size": 524288,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### ファイルダウンロード

#### GET /api/download/{token}
署名付きトークンでファイルをダウンロード

**セキュリティ**:
- トークンの署名を検証
- 有効期限を確認
- テナント隔離を確認
- ファイルの存在確認

---

## 将来の拡張性

### 1. バッチ生成
```
POST /api/batch-generate
{
  "template_slug": "invoice-template",
  "data_list": [ {...}, {...}, ... ]
}
```
複数レコードを一度に生成し、ZIP でダウンロード可能

### 2. テンプレートバージョニング
- 既存テンプレートのスナップショット機能
- バージョン間での比較
- ロールバック機能

### 3. キャッシング
- 同一データでの生成要求を検出
- 既存ファイルを再利用
- 生成コストの削減

### 4. 非同期生成
- 大規模レポートはキューイング
- Celery等での非同期処理
- メール送信による通知

### 5. テンプレートプレビュー
- サンプルデータでプレビュー機能
- セルマッピングの即座フィードバック

### 6. 監査ログ
- すべての操作を監査ログに記録
- コンプライアンス対応

### 7. データベーススキーママイグレーション
- 複雑なスキーマ変更時の自動マイグレーション
- Alembic を活用したバージョン管理

---

## 開発環境セットアップ

### 前提条件
- Python 3.11+
- Docker & Docker Compose
- Git

### ローカル開発

```bash
# リポジトリのクローン
git clone ...
cd backend

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# データベースの起動 (PostgreSQL)
docker-compose up -d

# マイグレーションの実行
alembic upgrade head

# サーバー起動
uvicorn app.main:app --reload

# 自動テスト
pytest tests/ -v
```

### Docker での起動

```bash
docker-compose up --build

# アクセス
curl http://localhost:8000/docs
```

---

## パフォーマンス考慮事項

### 1. Excelファイル生成
- テンプレート読み込み時間: ~50-100ms (96行×20列)
- セルデータ書き込み時間: ~200-500ms
- ファイル保存時間: ~100-200ms
- **合計: 350-800ms (キャッシング無し)**

### 2. データベースクエリ
- インデックス戦略:
  - `(tenant_id, is_active)` on ExcelTemplate
  - `(template_id, cell_ref)` on CellMapping
  - `(tenant_id, created_at)` on GenerationHistory

### 3. スケーリング戦略
- 読み取り専用レプリカ (コピー読み込み用)
- 接続プーリング (SQLAlchemy)
- 非同期I/O (FastAPI + asyncio)

---

## トラブルシューティング

### マージセルが正しく書き込まれない

**原因**: 非マージセルのアドレスに書き込もうとしている

**解決**:
```python
# CellMappingでセルアドレスを正確に指定
# マージセルの場合は左上セルのアドレスを指定
# 例: B2:D5 のマージセル → B2 を指定
```

### テンプレートが見つからない

**原因**: テンプレートファイルパスが設定と異なる

**解決**:
```bash
# ファイルの確認
ls -la storage/templates/

# パスの確認
sqlite3 data.db "SELECT file_path FROM excel_templates;"
```

### テナント隔離エラー

**原因**: リクエストのテナント情報が正しく渡されていない

**解決**:
```python
# deps.py で tenant_id の検証を強化
# ログでテナント情報を確認
```

---

## ライセンスと参考資料

- **OpenPyXL**: https://openpyxl.readthedocs.io/
- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Alembic**: https://alembic.sqlalchemy.org/

---

## 最終更新

作成日: 2024年
バージョン: 1.0.0

