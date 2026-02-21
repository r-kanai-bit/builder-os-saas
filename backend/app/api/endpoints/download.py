"""
ファイルダウンロードエンドポイント

署名付きURLを使用したセキュアなファイルダウンロードを実現します。
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse

from app.api.deps import get_current_tenant
from app.security import verify_signed_download_url
from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/download", tags=["download"])


@router.get("/{token}")
async def download_file(
    token: str,
    current_tenant: int = Depends(get_current_tenant),
) -> FileResponse:
    """
    署名付きURLでファイルをダウンロード

    署名付きトークンを検証し、ファイルを返します。
    テナント隔離が強制されます。

    Args:
        token: 署名付きトークン
        current_tenant: 現在のテナントID

    Returns:
        ファイルレスポンス

    Raises:
        HTTPException: トークンが無効、または有効期限切れの場合
    """
    try:
        logger.debug(f"ダウンロード要求: token={token[:20]}..., tenant={current_tenant}")

        # トークンを検証
        file_path = verify_signed_download_url(token, current_tenant)

        if not file_path:
            logger.warning(
                f"トークン検証失敗: tenant={current_tenant}, "
                f"token={token[:20]}..."
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="トークンが無効、または有効期限切れです",
            )

        # ストレージからファイルを取得
        storage = get_storage_service()

        # ファイルの存在確認
        exists = await storage.exists(file_path)
        if not exists:
            logger.warning(f"ファイル見つからず: {file_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ファイルが見つかりません",
            )

        # ファイルをダウンロード
        file_content = await storage.get(file_path)

        # ファイル名を抽出
        file_name = file_path.split("/")[-1]

        logger.info(f"ファイルダウンロード: {file_path} ({len(file_content)} bytes)")

        # ファイルレスポンスを返す
        return FileResponse(
            path=str(file_path),  # ローカルストレージの場合はパスを直接指定
            filename=file_name,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{file_name}",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ファイルダウンロードエラー: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ファイルのダウンロードに失敗しました",
        )
