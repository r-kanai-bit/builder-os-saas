"""
Excel生成エンドポイント

テンプレートベースのExcelファイル生成を行います。
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import (
    get_current_tenant,
    get_current_user,
    verify_tenant_match,
    get_db_session,
)
from app.models.template import ExcelTemplate, GenerationHistory
from app.schemas.template import GenerateRequest, GenerateResponse
from app.services.excel_service import ExcelService
from app.services.storage_service import get_storage_service
from app.security import generate_signed_download_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["generate"])


@router.post("/{template_slug}", response_model=GenerateResponse)
async def generate_excel(
    template_slug: str,
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
) -> GenerateResponse:
    """
    Excelレポートを生成

    テンプレートスラグを指定して、データを埋め込んだExcelファイルを生成します。

    Args:
        template_slug: テンプレートスラグ
        request: 生成リクエスト（入力データ）
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報

    Returns:
        生成結果（ステータス、ダウンロードURL等）

    Raises:
        HTTPException: テンプレートが見つからない場合、またはバリデーションエラー
    """
    try:
        logger.info(
            f"Excel生成リクエスト: tenant={current_tenant}, "
            f"template={template_slug}, user={current_user['user_id']}"
        )

        # テンプレートを取得
        query = (
            select(ExcelTemplate)
            .where(
                (ExcelTemplate.tenant_id == current_tenant)
                & (ExcelTemplate.slug == template_slug)
                & (ExcelTemplate.is_active == True)
            )
            .options(joinedload(ExcelTemplate.cell_mappings))
        )

        result = await db.execute(query)
        template = result.unique().scalar()

        if not template:
            logger.warning(
                f"テンプレート見つからず: tenant={current_tenant}, "
                f"slug={template_slug}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="テンプレートが見つかりません",
            )

        # 入力データをバリデーション
        required_fields = {m.field_name for m in template.cell_mappings}
        provided_fields = set(request.data.keys())

        if not required_fields.issubset(provided_fields):
            missing = required_fields - provided_fields
            logger.warning(f"必須フィールド不足: {missing}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"必須フィールドが不足しています: {', '.join(missing)}",
            )

        # 生成履歴を作成
        history = GenerationHistory(
            template_id=template.id,
            tenant_id=current_tenant,
            user_id=current_user["user_id"],
            input_data=request.data,
            status="processing",
        )

        db.add(history)
        await db.flush()
        history_id = history.id

        # Excel生成サービスを初期化
        storage = get_storage_service()
        excel_service = ExcelService(storage)

        # Excelを生成
        generated_history = await excel_service.generate(
            template_id=template.id,
            tenant_id=current_tenant,
            user_id=current_user["user_id"],
            input_data=request.data,
            cell_mappings=template.cell_mappings,
            file_path=template.file_path,
        )

        # 生成結果を更新
        history.status = generated_history.status
        history.output_path = generated_history.output_path
        history.file_size = generated_history.file_size
        history.error_message = generated_history.error_message

        await db.commit()
        await db.refresh(history)

        # レスポンスを構築
        response_data = {
            "id": history.id,
            "status": history.status,
            "file_size": history.file_size,
            "error_message": history.error_message,
            "created_at": history.created_at,
        }

        # 成功時のみダウンロードURLを生成
        if history.status == "completed" and history.output_path:
            response_data["file_url"] = await storage.generate_signed_url(
                file_path=history.output_path,
                tenant_id=current_tenant,
            )

        logger.info(
            f"Excel生成完了: template={template_slug}, "
            f"status={history.status}, size={history.file_size}"
        )

        return GenerateResponse(**response_data)

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        logger.error(f"Excel生成エラー: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Excelファイルの生成に失敗しました",
        )
