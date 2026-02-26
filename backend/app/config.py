"""
アプリケーション設定管理

環境変数からアプリケーション設定を読み込み、型安全な設定オブジェクトを提供します。
"""

import os
from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    アプリケーション設定

    環境変数から読み込まれます。デフォルト値はローカル開発用です。
    本番環境では .env ファイルで設定をオーバーライドしてください。
    """

    # アプリケーション基本設定
    APP_NAME: str = "Excel帳票エンジン"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # CORS設定
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000", "https://builder-os-saas-five.vercel.app", "https://sunny-hope-production.up.railway.app"]
    ALLOWED_CREDENTIALS: bool = True
    ALLOWED_METHODS: list[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    ALLOWED_HEADERS: list[str] = ["*"]

    # 環境設定
    ENVIRONMENT: str = "development"

    # データベース設定
    DATABASE_URL: str = "sqlite+aiosqlite:///./excel_engine.db"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_PRE_PING: bool = True

    # セキュリティ設定
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SIGNED_URL_EXPIRE_SECONDS: int = 3600  # 1時間

    # ストレージ設定
    STORAGE_TYPE: Literal["local", "s3"] = "local"
    STORAGE_LOCAL_PATH: str = "storage"
    STORAGE_TEMPLATES_PATH: str = "storage/templates"
    STORAGE_OUTPUTS_PATH: str = "storage/outputs"

    # S3ストレージ設定
    S3_BUCKET: str = ""
    S3_REGION: str = "ap-northeast-1"
    S3_ENDPOINT: str = "https://s3.amazonaws.com"
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""

    # ファイルアップロード設定
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_FILE_EXTENSIONS: list[str] = [".xlsx", ".xlsm"]

    # テンプレート設定
    TEMPLATE_DEFAULT_TIMEOUT_SECONDS: int = 30
    TEMPLATE_MAX_CELLS: int = 10000
    TEMPLATE_MAX_MERGE_RANGES: int = 500

    # 生成履歴設定
    GENERATION_HISTORY_RETENTION_DAYS: int = 90  # 90日後に自動削除
    GENERATION_OUTPUT_RETENTION_DAYS: int = 30   # 生成ファイルは30日後に削除

    # API設定
    API_V1_PREFIX: str = "/api/v1"
    API_DOCS_URL: str = "/docs"
    API_OPENAPI_URL: str = "/openapi.json"
    API_REDOC_URL: str = "/redoc"

    class Config:
        """Pydantic設定"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def get_database_url(self) -> str:
        """データベースURL を取得"""
        return self.DATABASE_URL

    def is_development(self) -> bool:
        """開発環境かどうかを判定"""
        return self.DEBUG is True

    def is_production(self) -> bool:
        """本番環境かどうかを判定"""
        return self.ENVIRONMENT == "production"


# グローバル設定インスタンス
settings = Settings()

# 必須設定の検証（本番環境のみ）
if settings.is_production():
    if settings.SECRET_KEY == "your-secret-key-change-in-production":
        raise ValueError("本番環境では SECRET_KEY を変更してください")
