"""
FastAPI アプリケーション

Excel帳票エンジンのメインアプリケーション定義です。
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from openpyxl import Workbook
from pydantic import BaseModel

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


# ============================================================
# ルートエンドポイント（Railway ステータス確認用）
# ============================================================

@app.get("/", tags=["status"])
async def root():
    """Railway ステータス確認"""
    return {"status": "Postgres connected"}


# ============================================================
# ヘルスチェック
# ============================================================

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


# ============================================================
# 仕様書 Excel 自動生成 API（DB不使用・最短パス）
# ============================================================

class GenerateRequest(BaseModel):
    """仕様書Excel生成リクエスト"""
    project_name: str = ""
    version: str = ""
    author: str = ""


@app.post("/generate", tags=["generate"])
async def generate_spec_excel(req: GenerateRequest):
    """
    仕様書Excelを生成してダウンロード

    入力JSONを受け取り、openpyxlでExcelを生成し、FileResponseで返します。
    /tmp 配下に一時保存してからレスポンスします。
    """
    # Excel ワークブック作成
    wb = Workbook()
    ws = wb.active
    ws.title = "仕様書"

    # ヘッダー列幅設定
    ws.column_dimensions["A"].width = 20
    ws.column_dimensions["B"].width = 40

    # データ書き込み
    ws["A1"] = "プロジェクト名"
    ws["B1"] = req.project_name
    ws["A2"] = "バージョン"
    ws["B2"] = req.version
    ws["A3"] = "作成者"
    ws["B3"] = req.author

    # ヘッダー行のスタイル（太字）
    from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
    header_font = Font(bold=True, size=11)
    header_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
    thin_border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )
    for row in range(1, 4):
        ws.cell(row=row, column=1).font = header_font
        ws.cell(row=row, column=1).fill = header_fill
        ws.cell(row=row, column=1).border = thin_border
        ws.cell(row=row, column=1).alignment = Alignment(vertical="center")
        ws.cell(row=row, column=2).border = thin_border
        ws.cell(row=row, column=2).alignment = Alignment(vertical="center")

    # /tmp に保存（Railway はエフェメラルなので /tmp を使用）
    filename = f"spec_{uuid.uuid4().hex[:8]}.xlsx"
    filepath = os.path.join("/tmp", filename)
    wb.save(filepath)

    # ダウンロード用ファイル名
    safe_name = req.project_name.replace("/", "_").replace("\\", "_") if req.project_name else "仕様書"
    download_name = f"仕様書_{safe_name}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return FileResponse(
        path=filepath,
        filename=download_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


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
