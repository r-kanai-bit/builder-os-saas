"""
データベース接続管理

SQLAlchemy非同期セットアップとセッション管理を提供します。
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# ベースクラス (全モデルが継承)
Base = declarative_base()

# 非同期エンジンの作成
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=settings.DATABASE_POOL_PRE_PING,
    future=True,
)

# 非同期セッションファクトリ
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """
    データベースの初期化

    すべてのテーブルを作成します。
    本番環境では Alembic マイグレーションを使用してください。
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def dispose_db() -> None:
    """
    データベース接続のクリーンアップ

    アプリケーション終了時に呼び出します。
    """
    await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    データベースセッションの依存性注入

    使用例:
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
            result = await db.execute(...)
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
