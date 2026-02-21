"""
APIルータ統合

すべてのエンドポイントをまとめてアプリケーションに組み込みます。
"""

from fastapi import APIRouter

from app.api.endpoints import download, generate, templates

# ルータを作成
api_router = APIRouter()

# エンドポイントを登録
api_router.include_router(templates.router)
api_router.include_router(generate.router)
api_router.include_router(download.router)
