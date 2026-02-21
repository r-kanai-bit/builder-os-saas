"""
FastAPI アプリケーション

Excel帳票エンジンのメインアプリケーション定義です。
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.database import dispose_db, init_db

# ロギング設定
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションのライフサイクル管理

    起動時と終了時の処理を定義します。
    """
    # 起動処理
    logger.info(f"アプリケーション起動: {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"DEBUG={settings.DEBUG}, LOG_LEVEL={settings.LOG_LEVEL}")
    logger.info(f"STORAGE_TYPE={settings.STORAGE_TYPE}")

    try:
        await init_db()
        logger.info("データベース初期化完了")
    except Exception as e:
        logger.error(f"データベース初期化エラー: {str(e)}")
        raise

    yield

    # 終了処理
    logger.info("アプリケーション終了中...")
    try:
        await dispose_db()
        logger.info("データベース接続をクローズしました")
    except Exception as e:
        logger.error(f"データベース接続クローズエラー: {str(e)}")

    logger.info("アプリケーション終了完了")


# FastAPI アプリケーション作成
app = FastAPI(
    title=settings.APP_NAME,
    description="Excel帳票エンジン - テンプレートベースのExcelファイル生成システム",
    version=settings.APP_VERSION,
    openapi_url=settings.API_OPENAPI_URL,
    docs_url=settings.API_DOCS_URL,
    redoc_url=settings.API_REDOC_URL,
    lifespan=lifespan,
)

# CORS ミドルウェア設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)


# ヘルスチェックエンドポイント
@app.get("/health", tags=["health"])
async def health_check():
    """
    ヘルスチェック

    アプリケーションが正常に動作しているか確認します。
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ルータを組み込む
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
    )
