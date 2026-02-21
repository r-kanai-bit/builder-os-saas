"""
ストレージサービス

ローカルファイルシステムとS3の抽象化層です。
"""

import logging
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

from app.config import settings
from app.security import generate_signed_download_url

logger = logging.getLogger(__name__)


class StorageService(ABC):
    """
    ストレージサービスの抽象基底クラス

    具体的な実装（LocalStorage、S3Storage）はこのインターフェースを実装します。
    """

    @abstractmethod
    async def save(self, file_path: str, content: bytes) -> None:
        """
        ファイルを保存

        Args:
            file_path: 保存先パス
            content: ファイルコンテンツ
        """
        pass

    @abstractmethod
    async def get(self, file_path: str) -> bytes:
        """
        ファイルを取得

        Args:
            file_path: ファイルパス

        Returns:
            ファイルコンテンツ
        """
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> None:
        """
        ファイルを削除

        Args:
            file_path: ファイルパス
        """
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """
        ファイルが存在するか確認

        Args:
            file_path: ファイルパス

        Returns:
            ファイルが存在する場合 True
        """
        pass

    @abstractmethod
    async def get_file_size(self, file_path: str) -> int:
        """
        ファイルサイズを取得

        Args:
            file_path: ファイルパス

        Returns:
            ファイルサイズ（バイト数）
        """
        pass

    @abstractmethod
    async def generate_signed_url(
        self,
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
            署名付きURL
        """
        pass


class LocalStorage(StorageService):
    """
    ローカルファイルシステムストレージ

    開発環境およびテスト環境で使用します。
    """

    def __init__(self, base_path: str = "storage"):
        """
        初期化

        Args:
            base_path: ストレージのベースパス
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"LocalStorage 初期化: {self.base_path}")

    async def save(self, file_path: str, content: bytes) -> None:
        """
        ファイルを保存

        Args:
            file_path: 相対パス
            content: ファイルコンテンツ
        """
        try:
            full_path = self.base_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)

            with open(full_path, "wb") as f:
                f.write(content)

            logger.info(f"ファイル保存: {file_path} ({len(content)} bytes)")
        except Exception as e:
            logger.error(f"ファイル保存エラー: {file_path}: {str(e)}")
            raise

    async def get(self, file_path: str) -> bytes:
        """
        ファイルを取得

        Args:
            file_path: 相対パス

        Returns:
            ファイルコンテンツ

        Raises:
            FileNotFoundError: ファイルが見つからない
        """
        try:
            full_path = self.base_path / file_path

            if not full_path.exists():
                raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")

            with open(full_path, "rb") as f:
                content = f.read()

            logger.debug(f"ファイル取得: {file_path} ({len(content)} bytes)")
            return content
        except Exception as e:
            logger.error(f"ファイル取得エラー: {file_path}: {str(e)}")
            raise

    async def delete(self, file_path: str) -> None:
        """
        ファイルを削除

        Args:
            file_path: 相対パス
        """
        try:
            full_path = self.base_path / file_path

            if not full_path.exists():
                logger.warning(f"削除対象ファイルが見つかりません: {file_path}")
                return

            full_path.unlink()
            logger.info(f"ファイル削除: {file_path}")
        except Exception as e:
            logger.error(f"ファイル削除エラー: {file_path}: {str(e)}")
            raise

    async def exists(self, file_path: str) -> bool:
        """
        ファイルが存在するか確認

        Args:
            file_path: 相対パス

        Returns:
            ファイルが存在する場合 True
        """
        full_path = self.base_path / file_path
        return full_path.exists()

    async def get_file_size(self, file_path: str) -> int:
        """
        ファイルサイズを取得

        Args:
            file_path: 相対パス

        Returns:
            ファイルサイズ（バイト数）

        Raises:
            FileNotFoundError: ファイルが見つからない
        """
        try:
            full_path = self.base_path / file_path

            if not full_path.exists():
                raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")

            size = full_path.stat().st_size
            logger.debug(f"ファイルサイズ取得: {file_path} ({size} bytes)")
            return size
        except Exception as e:
            logger.error(f"ファイルサイズ取得エラー: {file_path}: {str(e)}")
            raise

    async def generate_signed_url(
        self,
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
            署名付きURL
        """
        return generate_signed_download_url(
            file_path=file_path,
            tenant_id=tenant_id,
            expiry_seconds=expiry_seconds,
        )


class S3Storage(StorageService):
    """
    AWS S3互換ストレージ

    本番環境で使用します。
    MinIO などの S3互換ストレージにも対応可能です。
    """

    def __init__(self):
        """初期化"""
        try:
            import boto3

            self.s3_client = boto3.client(
                "s3",
                region_name=settings.S3_REGION,
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY_ID,
                aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            )
            self.bucket_name = settings.S3_BUCKET
            logger.info(f"S3Storage 初期化: bucket={self.bucket_name}")
        except ImportError:
            raise ImportError("boto3 が必要です。pip install boto3")
        except Exception as e:
            logger.error(f"S3Storage 初期化エラー: {str(e)}")
            raise

    async def save(self, file_path: str, content: bytes) -> None:
        """
        ファイルをS3に保存

        Args:
            file_path: S3キー（相対パス）
            content: ファイルコンテンツ
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_path,
                Body=content,
            )
            logger.info(f"S3ファイル保存: s3://{self.bucket_name}/{file_path}")
        except Exception as e:
            logger.error(f"S3ファイル保存エラー: {file_path}: {str(e)}")
            raise

    async def get(self, file_path: str) -> bytes:
        """
        S3からファイルを取得

        Args:
            file_path: S3キー（相対パス）

        Returns:
            ファイルコンテンツ
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=file_path,
            )
            content = response["Body"].read()
            logger.debug(f"S3ファイル取得: {file_path}")
            return content
        except Exception as e:
            logger.error(f"S3ファイル取得エラー: {file_path}: {str(e)}")
            raise

    async def delete(self, file_path: str) -> None:
        """
        S3からファイルを削除

        Args:
            file_path: S3キー（相対パス）
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_path,
            )
            logger.info(f"S3ファイル削除: {file_path}")
        except Exception as e:
            logger.error(f"S3ファイル削除エラー: {file_path}: {str(e)}")
            raise

    async def exists(self, file_path: str) -> bool:
        """
        S3にファイルが存在するか確認

        Args:
            file_path: S3キー（相対パス）

        Returns:
            ファイルが存在する場合 True
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_path,
            )
            return True
        except self.s3_client.exceptions.NoSuchKey:
            return False
        except Exception as e:
            logger.error(f"S3ファイル存在確認エラー: {file_path}: {str(e)}")
            raise

    async def get_file_size(self, file_path: str) -> int:
        """
        S3のファイルサイズを取得

        Args:
            file_path: S3キー（相対パス）

        Returns:
            ファイルサイズ（バイト数）
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_path,
            )
            size = response["ContentLength"]
            logger.debug(f"S3ファイルサイズ: {file_path} ({size} bytes)")
            return size
        except Exception as e:
            logger.error(f"S3ファイルサイズ取得エラー: {file_path}: {str(e)}")
            raise

    async def generate_signed_url(
        self,
        file_path: str,
        tenant_id: int,
        expiry_seconds: Optional[int] = None,
    ) -> str:
        """
        S3の署名付きダウンロードURLを生成

        Args:
            file_path: ファイルパス
            tenant_id: テナントID
            expiry_seconds: 有効期限（秒）

        Returns:
            S3署名付きURL
        """
        try:
            if expiry_seconds is None:
                expiry_seconds = settings.SIGNED_URL_EXPIRE_SECONDS

            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": file_path,
                },
                ExpiresIn=expiry_seconds,
            )
            logger.debug(f"S3署名付きURL生成: {file_path}")
            return url
        except Exception as e:
            logger.error(f"S3署名付きURL生成エラー: {file_path}: {str(e)}")
            raise


def get_storage_service() -> StorageService:
    """
    ストレージサービスのファクトリ関数

    設定に基づいて適切なストレージサービスインスタンスを返します。

    Returns:
        StorageService の実装インスタンス
    """
    if settings.STORAGE_TYPE == "s3":
        return S3Storage()
    else:
        return LocalStorage(base_path=settings.STORAGE_LOCAL_PATH)
