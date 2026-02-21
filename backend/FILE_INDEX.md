# Excel帳票エンジン - ファイルインデックス

完成したバックエンドアーキテクチャの全ファイル一覧と説明です。

## ドキュメント

### 1. **README.md** (25KB)
- システムアーキテクチャ概要（日本語）
- システム図・ER図・フロー図
- ディレクトリ構造
- モジュール設計説明
- データベース設計
- API仕様
- 将来の拡張性
- トラブルシューティング

### 2. **SETUP.md** (9KB)
- セットアップ手順
- 環境構築（Docker/ローカル）
- APIテスト例
- テスト実行方法
- トラブルシューティング
- 本番環境への展開ガイド

### 3. **FILE_INDEX.md** (このファイル)
- ファイル一覧と説明

---

## コア設定ファイル

### **app/config.py** (2.5KB)
Pydantic-settings を使用した環境変数管理
- アプリケーション基本設定
- データベース接続設定
- セキュリティ設定
- ストレージ設定
- S3設定
- API設定
- 本番環境チェック

### **app/database.py** (1.5KB)
SQLAlchemy 非同期セットアップ
- 非同期エンジン作成
- セッションファクトリ
- Base クラス定義
- 依存性注入 (get_db)

### **app/security.py** (4.5KB)
セキュリティ機能実装
- JWT トークン生成・検証
- HMAC-SHA256 署名URL生成
- トークンデータ管理
- 有効期限管理

---

## ORM モデル

### **app/models/template.py** (4.5KB)
SQLAlchemy モデル定義

#### ExcelTemplate
- テンプレート情報管理
- テナント単位での隔離
- リレーション: CellMapping、GenerationHistory
- インデックス: tenant_id, is_active

#### CellMapping
- セルアドレス ↔ フィールド マッピング
- データ型・フォーマット定義
- ソート順序管理

#### GenerationHistory
- 生成実行履歴記録
- 入力データ・出力パス・ファイルサイズ
- ステータス管理（pending/processing/completed/failed）
- 監査ログ用

---

## リクエスト・レスポンススキーマ

### **app/schemas/template.py** (3.5KB)
Pydantic スキーマ定義

- **CellMappingCreate/Response**: セルマッピング定義
- **ExcelTemplateCreate/Response**: テンプレート定義
- **GenerateRequest/Response**: 生成リクエスト・結果
- **GenerationHistoryResponse**: 履歴レスポンス
- **ErrorResponse**: エラーレスポンス

---

## ビジネスロジック

### **app/services/excel_service.py** (6.5KB)
Excel生成コアロジック

**ExcelService クラス**:
- `load_template()`: テンプレート読み込み (data_only=False で数式保持)
- `fill_cells()`: データ埋め込み
- `_safe_write_cell()`: マージセル対応の安全な書き込み
- `_find_merge_range_top_left()`: マージセル検出
- `generate()`: 完全な生成フロー
- `_save_workbook()`: ファイル保存

**マージセル処理**:
- マージ範囲の左上セルを自動検出
- マージセルの複数呼び出しに対応
- セル参照の正規化

### **app/services/storage_service.py** (8.5KB)
ストレージ抽象化層

**StorageService (ABC)**:
- `save()`: ファイル保存
- `get()`: ファイル取得
- `delete()`: ファイル削除
- `exists()`: 存在確認
- `get_file_size()`: サイズ取得
- `generate_signed_url()`: 署名付きURL生成

**LocalStorage 実装**:
- ローカルファイルシステム使用
- 開発環境/テスト環境向け

**S3Storage 実装**:
- AWS S3互換ストレージ対応
- Boto3 を使用
- 本番環境向け

**ファクトリ関数**:
- `get_storage_service()`: 設定に基づいて実装を選択

---

## APIエンドポイント

### **app/api/deps.py** (2.5KB)
依存性注入関数

- `get_current_tenant()`: テナントID取得
- `get_current_user()`: ユーザー認証
- `verify_tenant_match()`: テナント一致確認
- `get_db_session()`: DB接続取得

### **app/api/endpoints/templates.py** (6.5KB)
テンプレート管理エンドポイント

```
GET    /api/v1/templates              - テンプレート一覧
POST   /api/v1/templates              - テンプレート作成
GET    /api/v1/templates/{id}         - テンプレート取得
GET    /api/v1/templates/{id}/mappings - セルマッピング一覧
POST   /api/v1/templates/{id}/mappings - セルマッピング作成
```

### **app/api/endpoints/generate.py** (4.5KB)
Excel生成エンドポイント

```
POST   /api/v1/generate/{template_slug} - Excel生成
```

入力データをバリデーション → ExcelService で生成 → 署名URL生成

### **app/api/endpoints/download.py** (3.5KB)
ダウンロードエンドポイント

```
GET    /api/v1/download/{token} - 署名付きダウンロード
```

署名検証 → テナント確認 → ファイル返却

### **app/api/router.py** (0.5KB)
ルータ統合
- すべてのエンドポイントを統合

---

## メインアプリケーション

### **app/main.py** (2.5KB)
FastAPI アプリケーション

- CORS 設定
- ライフサイクル管理 (init_db, dispose_db)
- ヘルスチェックエンドポイント
- ルータ登録
- ロギング設定

---

## データベースマイグレーション

### **alembic/env.py** (1.5KB)
Alembic マイグレーション環境
- オフライン/オンラインモード対応
- SQLAlchemy メタデータ統合

### **alembic/versions/001_initial_schema.py** (3.5KB)
初期スキーママイグレーション

テーブル作成:
- excel_templates (テンプレート)
- cell_mappings (セルマッピング)
- generation_histories (生成履歴)

各テーブルにインデックスと制約を定義

### **alembic.ini** (1.5KB)
Alembic 設定ファイル

### **alembic/script.py.mako** (0.3KB)
マイグレーションテンプレート

### **alembic/README** (2KB)
Alembic 使用ガイド
- マイグレーション作成方法
- 適用・ロールバック方法
- ベストプラクティス

---

## 設定・環境

### **requirements.txt** (0.7KB)
Python 依存関係

Core:
- fastapi, uvicorn
- sqlalchemy, asyncpg, psycopg2-binary
- openpyxl (Excel処理)
- pydantic, pydantic-settings
- python-jose, cryptography (JWT)

Optional:
- boto3 (S3対応)

Dev:
- pytest, pytest-asyncio
- black, flake8, mypy, isort

### **.env.example** (1.7KB)
環境変数テンプレート
- アプリケーション設定
- DB接続情報
- セキュリティ設定
- ストレージ設定
- S3設定

---

## テスト

### **tests/test_excel_service.py** (6.5KB)
ExcelService ユニットテスト

テストケース:
- `test_load_template()`: テンプレート読み込み
- `test_load_template_not_found()`: テンプレート不在エラー
- `test_fill_cells()`: セルデータ埋め込み
- `test_fill_cells_with_merged_cells()`: マージセル対応
- `test_safe_write_cell_finds_merge_range()`: マージセル検出
- `test_find_merge_range_top_left()`: 左上セル検出
- `test_data_type_conversion_int()`: 整数型変換
- `test_data_type_conversion_float()`: 浮動小数点型変換

---

## Docker・コンテナ

### **Dockerfile** (1.5KB)
本番用コンテナイメージ

- ビルドステージ: Python 3.11-slim + 依存関係
- 本番ステージ: 最小イメージサイズ
- 非rootユーザーで実行
- ヘルスチェック設定

### **docker-compose.yml** (1.7KB)
開発環境構築

サービス:
- **postgres**: PostgreSQL 15-alpine
- **backend**: FastAPI アプリケーション

ネットワーク・ボリューム管理含む

---

## ディレクトリ構造（出力置き場）

### **templates/** (.gitkeep)
Excelテンプレートファイル置き場
```
templates/
├── tenant-001_invoice.xlsx
└── tenant-002_report.xlsx
```

### **storage/** (.gitkeep)
ローカルストレージ出力置き場
```
storage/
├── templates/     # テンプレートファイル
└── outputs/       # 生成ファイル
    └── 2024/01/15/
        └── 20240115_120530_1_user_123.xlsx
```

---

## 主要機能別ファイル対応表

| 機能 | ファイル |
|------|---------|
| テンプレート管理 | models/template.py, schemas/template.py, endpoints/templates.py |
| Excel生成 | services/excel_service.py, endpoints/generate.py |
| ファイルダウンロード | services/storage_service.py, endpoints/download.py, security.py |
| セキュリティ | security.py, api/deps.py |
| テナント隔離 | api/deps.py, models/template.py |
| DB管理 | database.py, alembic/* |
| 設定管理 | config.py, .env.example |

---

## 拡張ポイント

### 新しいストレージバックエンド追加
```
app/services/storage_service.py に StorageService 継承クラスを追加
```

### 新しいAPIエンドポイント追加
```
app/api/endpoints/ に新しい router.py を作成
app/api/router.py に include_router()
```

### 新しいモデル追加
```
app/models/ に新しいモデル定義
alembic/versions/ に migration を追加
```

---

## セキュリティ機能一覧

- JWT トークンベース認証
- HMAC-SHA256 署名付きダウンロードURL
- テナント単位での厳密な隔離
- パスワードハッシング (passlib)
- CORS 設定
- ファイルサイズ制限
- ファイル形式検証

---

## パフォーマンス最適化

- 非同期データベースアクセス (AsyncSession)
- コネクションプーリング (SQLAlchemy pool)
- マージセルの効率的な処理
- ローカルストレージの高速読み書き
- S3署名付きURLによるオフロード

---

## 合計統計

- **Pythonファイル**: 15個 (~75KB)
- **ドキュメント**: 5個 (~45KB)
- **設定ファイル**: 6個 (~10KB)
- **テストコード**: 1個 (~6.5KB)
- **Docker**: 2個 (~3KB)
- **Total**: 29ファイル (~140KB)

---

## 次のステップ

1. `SETUP.md` に従ってセットアップ
2. `docker-compose up --build` で起動
3. `http://localhost:8000/docs` でAPI確認
4. テンプレートを `backend/templates/` に配置
5. APIを使用して生成テスト

すべてのファイルは本番環境対応の品質水準で実装されています。

