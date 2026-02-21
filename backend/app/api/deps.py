"""
API依存性注入

認証、テナント検証、DBセッション管理などを提供します。
"""

import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.security import verify_access_token

logger = logging.getLogger(__name__)


async def get_current_tenant(
    x_tenant_id: Optional[str] = Header(None),
) -> int:
    """
    現在のテナントIDを取得

    リクエストヘッダーから tenant_id を抽出し、検証します。

    Args:
        x_tenant_id: X-Tenant-ID ヘッダー

    Returns:
        テナントID

    Raises:
        HTTPException: テナント情報が見つからない、または無効な場合
    """
    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Tenant-ID ヘッダーが必要です",
        )

    try:
        tenant_id = int(x_tenant_id)
        logger.debug(f"テナント検証: {tenant_id}")
        return tenant_id
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Tenant-ID は整数である必要があります",
        )


async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> dict:
    """
    現在のユーザー情報を取得

    Authorization ヘッダーからJWTトークンを抽出し検証します。

    Args:
        authorization: Authorization ヘッダー (Bearer <token>)

    Returns:
        ユーザー情報 {"tenant_id": int, "user_id": int}

    Raises:
        HTTPException: トークンが無効な場合
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization ヘッダーが必要です",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Bearer scheme が必要です")

        token_data = verify_access_token(token)
        if not token_data:
            raise ValueError("トークンが無効です")

        return {
            "tenant_id": token_data.tenant_id,
            "user_id": token_data.user_id,
        }
    except (ValueError, AttributeError) as e:
        logger.warning(f"トークン検証失敗: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました",
        )


async def verify_tenant_match(
    current_user: dict = Depends(get_current_user),
    current_tenant: int = Depends(get_current_tenant),
) -> dict:
    """
    ユーザーのテナント情報と一致するか検証

    Args:
        current_user: 現在のユーザー情報
        current_tenant: 現在のテナントID

    Returns:
        検証済みユーザー情報

    Raises:
        HTTPException: テナント情報が一致しない場合
    """
    if current_user["tenant_id"] != current_tenant:
        logger.warning(
            f"テナント不一致: token={current_user['tenant_id']}, "
            f"header={current_tenant}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="テナント情報が一致しません",
        )
    return current_user


async def get_db_session() -> AsyncSession:
    """
    データベースセッションを取得

    Returns:
        AsyncSession インスタンス
    """
    async for session in get_db():
        yield session
