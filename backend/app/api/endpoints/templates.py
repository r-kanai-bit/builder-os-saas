"""
テンプレート管理エンドポイント

テンプレートのCRUD操作とセルマッピング管理を行います。
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
from app.models.template import CellMapping, ExcelTemplate
from app.schemas.template import (
    CellMappingCreate,
    CellMappingResponse,
    ExcelTemplateCreate,
    ExcelTemplateListResponse,
    ExcelTemplateResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=ExcelTemplateListResponse)
async def list_templates(
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
    skip: int = 0,
    limit: int = 10,
) -> ExcelTemplateListResponse:
    """
    テンプレート一覧を取得

    Args:
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報
        skip: スキップするレコード数
        limit: 取得するレコード数

    Returns:
        テンプレート一覧
    """
    try:
        # クエリを構築
        query = (
            select(ExcelTemplate)
            .where(ExcelTemplate.tenant_id == current_tenant)
            .order_by(ExcelTemplate.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        # セルマッピングをロード
        query = query.options(joinedload(ExcelTemplate.cell_mappings))

        result = await db.execute(query)
        templates = result.unique().scalars().all()

        # 総数を取得
        count_query = select(func.count(ExcelTemplate.id)).where(
            ExcelTemplate.tenant_id == current_tenant
        )
        count_result = await db.execute(count_query)
        total = count_result.scalar()

        logger.info(
            f"テンプレート一覧取得: tenant={current_tenant}, "
            f"count={len(templates)}, total={total}"
        )

        return ExcelTemplateListResponse(
            total=total,
            templates=[ExcelTemplateResponse.from_orm(t) for t in templates],
        )
    except Exception as e:
        logger.error(f"テンプレート一覧取得エラー: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="テンプレート一覧の取得に失敗しました",
        )


@router.post("", response_model=ExcelTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    request: ExcelTemplateCreate,
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
) -> ExcelTemplateResponse:
    """
    新規テンプレートを作成

    Args:
        request: テンプレート作成リクエスト
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報

    Returns:
        作成されたテンプレート

    Raises:
        HTTPException: テンプレートが既に存在する場合
    """
    try:
        # スラグの重複確認
        existing = await db.execute(
            select(ExcelTemplate).where(
                (ExcelTemplate.tenant_id == current_tenant)
                & (ExcelTemplate.slug == request.slug)
            )
        )

        if existing.scalar():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="このスラグは既に存在します",
            )

        # テンプレートを作成
        template = ExcelTemplate(
            tenant_id=current_tenant,
            name=request.name,
            slug=request.slug,
            file_path=request.file_path,
            description=request.description,
        )

        db.add(template)
        await db.commit()
        await db.refresh(template)

        logger.info(
            f"テンプレート作成完了: tenant={current_tenant}, "
            f"template_id={template.id}, slug={template.slug}"
        )

        return ExcelTemplateResponse.from_orm(template)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"テンプレート作成エラー: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="テンプレートの作成に失敗しました",
        )


@router.get("/{template_id}", response_model=ExcelTemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
) -> ExcelTemplateResponse:
    """
    テンプレートを取得

    Args:
        template_id: テンプレートID
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報

    Returns:
        テンプレート

    Raises:
        HTTPException: テンプレートが見つからない場合
    """
    try:
        query = (
            select(ExcelTemplate)
            .where(
                (ExcelTemplate.id == template_id)
                & (ExcelTemplate.tenant_id == current_tenant)
            )
            .options(joinedload(ExcelTemplate.cell_mappings))
        )

        result = await db.execute(query)
        template = result.unique().scalar()

        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="テンプレートが見つかりません",
            )

        return ExcelTemplateResponse.from_orm(template)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"テンプレート取得エラー: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="テンプレートの取得に失敗しました",
        )


@router.get("/{template_id}/mappings", response_model=list[CellMappingResponse])
async def list_cell_mappings(
    template_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
) -> list[CellMappingResponse]:
    """
    セルマッピング一覧を取得

    Args:
        template_id: テンプレートID
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報

    Returns:
        セルマッピング一覧

    Raises:
        HTTPException: テンプレートが見つからない場合
    """
    try:
        # テンプレート所有権確認
        template = await db.execute(
            select(ExcelTemplate).where(
                (ExcelTemplate.id == template_id)
                & (ExcelTemplate.tenant_id == current_tenant)
            )
        )

        if not template.scalar():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="テンプレートが見つかりません",
            )

        # マッピングを取得
        mappings = await db.execute(
            select(CellMapping)
            .where(CellMapping.template_id == template_id)
            .order_by(CellMapping.sort_order)
        )

        return [
            CellMappingResponse.from_orm(m) for m in mappings.scalars().all()
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"セルマッピング一覧取得エラー: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="セルマッピングの取得に失敗しました",
        )


@router.post(
    "/{template_id}/mappings",
    response_model=CellMappingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_cell_mapping(
    template_id: int,
    request: CellMappingCreate,
    db: AsyncSession = Depends(get_db_session),
    current_tenant: int = Depends(get_current_tenant),
    current_user: dict = Depends(verify_tenant_match),
) -> CellMappingResponse:
    """
    新規セルマッピングを作成

    Args:
        template_id: テンプレートID
        request: マッピング作成リクエスト
        db: データベースセッション
        current_tenant: 現在のテナントID
        current_user: 現在のユーザー情報

    Returns:
        作成されたマッピング

    Raises:
        HTTPException: テンプレートが見つからない場合またはセルが既にマッピング済みの場合
    """
    try:
        # テンプレート所有権確認
        template = await db.execute(
            select(ExcelTemplate).where(
                (ExcelTemplate.id == template_id)
                & (ExcelTemplate.tenant_id == current_tenant)
            )
        )

        if not template.scalar():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="テンプレートが見つかりません",
            )

        # セル重複確認
        existing = await db.execute(
            select(CellMapping).where(
                (CellMapping.template_id == template_id)
                & (CellMapping.cell_ref == request.cell_ref)
            )
        )

        if existing.scalar():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="このセルは既にマッピングされています",
            )

        # マッピング作成
        mapping = CellMapping(
            template_id=template_id,
            cell_ref=request.cell_ref,
            field_name=request.field_name,
            data_type=request.data_type,
            format_pattern=request.format_pattern,
            description=request.description,
            sort_order=request.sort_order,
        )

        db.add(mapping)
        await db.commit()
        await db.refresh(mapping)

        logger.info(
            f"セルマッピング作成完了: template={template_id}, "
            f"cell={request.cell_ref}, field={request.field_name}"
        )

        return CellMappingResponse.from_orm(mapping)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"セルマッピング作成エラー: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="セルマッピングの作成に失敗しました",
        )


# Missing import
from sqlalchemy import func
