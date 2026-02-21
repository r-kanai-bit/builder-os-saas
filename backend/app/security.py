"""
セキュリティ機能

JWT トークン管理と署名付きURL生成・検証を提供します。
"""

import hashlib
import hmac
import time
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

from app.config import settings


class TokenData:
    """トークンペイロード"""

    def __init__(self, tenant_id: int, user_id: int, scope: str = ""):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.scope = scope


def create_access_token(
    tenant_id: int,
    user_id: int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    アクセストークンを作成

    Args:
        tenant_id: テナントID
        user_id: ユーザーID
        expires_delta: 有効期限（デフォルト: 30分）

    Returns:
        JWT トークン文字列
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "exp": expire,
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_access_token(token: str) -> Optional[TokenData]:
    """
    アクセストークンを検証

    Args:
        token: JWT トークン文字列

    Returns:
        TokenData オブジェクト、またはトークンが無効な場合は None
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        tenant_id: int = payload.get("tenant_id")
        user_id: int = payload.get("user_id")

        if tenant_id is None or user_id is None:
            return None

        return TokenData(
            tenant_id=tenant_id,
            user_id=user_id,
            scope=payload.get("scope", ""),
        )
    except JWTError:
        return None


class SignedURLManager:
    """
    署名付きURL管理

    HMAC-SHA256を使用した署名付きURLの生成と検証を行います。
    """

    @staticmethod
    def generate_signed_token(
        file_path: str,
        tenant_id: int,
        expiry_seconds: Optional[int] = None,
    ) -> str:
        """
        署名付きトークンを生成

        Args:
            file_path: ファイルパス
            tenant_id: テナントID
            expiry_seconds: 有効期限（秒）（デフォルト: 1時間）

        Returns:
            署名付きトークン文字列
        """
        if expiry_seconds is None:
            expiry_seconds = settings.SIGNED_URL_EXPIRE_SECONDS

        timestamp = int(time.time())
        expiry = timestamp + expiry_seconds

        # メッセージの生成
        message = f"{file_path}|{tenant_id}|{expiry}"

        # HMAC-SHA256署名
        signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()

        # トークンを作成 (message:signature 形式)
        token = f"{message}:{signature}"
        return token

    @staticmethod
    def verify_signed_token(token: str, tenant_id: int) -> Optional[str]:
        """
        署名付きトークンを検証

        Args:
            token: 署名付きトークン文字列
            tenant_id: 現在のテナントID

        Returns:
            ファイルパス（有効な場合）、または None（無効な場合）

        Raises:
            ValueError: トークン形式が無効な場合
        """
        try:
            message, signature = token.rsplit(":", 1)
            file_path, token_tenant_id, expiry_str = message.rsplit("|", 2)

            # テナント隔離の確認
            if int(token_tenant_id) != tenant_id:
                return None

            # 有効期限の確認
            expiry = int(expiry_str)
            if time.time() > expiry:
                return None

            # 署名の検証
            expected_signature = hmac.new(
                settings.SECRET_KEY.encode(),
                message.encode(),
                hashlib.sha256,
            ).hexdigest()

            if not hmac.compare_digest(signature, expected_signature):
                return None

            return file_path
        except (ValueError, IndexError):
            return None


def generate_signed_download_url(
    file_path: str,
    tenant_id: int,
    expiry_seconds: Optional[int] = None,
) -> str:
    """
    署名付きダウンロードURLを生成

    Args:
        file_path: ファイルパス
        tenant_id: テナントID
        expiry_seconds: 有効期限（秒）

    Returns:
        署名付きダウンロードURL
    """
    token = SignedURLManager.generate_signed_token(
        file_path=file_path,
        tenant_id=tenant_id,
        expiry_seconds=expiry_seconds,
    )
    return f"/api/v1/download/{token}"


def verify_signed_download_url(token: str, tenant_id: int) -> Optional[str]:
    """
    署名付きダウンロードURLを検証

    Args:
        token: 署名付きトークン
        tenant_id: 現在のテナントID

    Returns:
        ファイルパス（有効な場合）、または None（無効な場合）
    """
    return SignedURLManager.verify_signed_token(token, tenant_id)
