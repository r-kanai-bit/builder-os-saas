"""
テンプレート関連スキーマ

リクエスト・レスポンスのPydantic定義です。
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from app.models.template import GenerationStatus


class CellMappingCreate(BaseModel):
    """セルマッピング作成リクエスト"""

    cell_ref: str = Field(..., description="セルアドレス (A1, B2など)")
    field_name: str = Field(..., description="フィールド名")
    data_type: str = Field(default="string", description="データ型")
    format_pattern: Optional[str] = Field(None, description="フォーマットパターン")
    description: Optional[str] = Field(None, description="説明")
    sort_order: int = Field(default=0, description="ソート順序")


class CellMappingResponse(CellMappingCreate):
    """セルマッピングレスポンス"""

    id: int
    template_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExcelTemplateCreate(BaseModel):
    """テンプレート作成リクエスト"""

    name: str = Field(..., description="テンプレート名")
    slug: str = Field(..., description="URL友好なID")
    description: Optional[str] = Field(None, description="説明")
    file_path: str = Field(..., description="ファイルパス")


class ExcelTemplateResponse(ExcelTemplateCreate):
    """テンプレートレスポンス"""

    id: int
    tenant_id: int
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    cell_mappings: list[CellMappingResponse] = []

    class Config:
        from_attributes = True


class ExcelTemplateListResponse(BaseModel):
    """テンプレート一覧レスポンス"""

    total: int
    templates: list[ExcelTemplateResponse]


class GenerateRequest(BaseModel):
    """Excel生成リクエスト"""

    data: dict[str, Any] = Field(..., description="入力データ")


class GenerateResponse(BaseModel):
    """Excel生成レスポンス"""

    id: int = Field(..., description="生成履歴ID")
    status: GenerationStatus = Field(..., description="ステータス")
    file_url: Optional[str] = Field(None, description="ダウンロードURL")
    file_size: Optional[int] = Field(None, description="ファイルサイズ (bytes)")
    error_message: Optional[str] = Field(None, description="エラーメッセージ")
    created_at: datetime = Field(..., description="作成日時")


class GenerationHistoryResponse(BaseModel):
    """生成履歴レスポンス"""

    id: int
    template_id: int
    tenant_id: int
    user_id: int
    input_data: Optional[dict[str, Any]]
    output_path: Optional[str]
    file_size: Optional[int]
    status: GenerationStatus
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GenerationHistoryListResponse(BaseModel):
    """生成履歴一覧レスポンス"""

    total: int
    histories: list[GenerationHistoryResponse]


class ErrorResponse(BaseModel):
    """エラーレスポンス"""

    error: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
