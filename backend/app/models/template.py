"""
Excel帳票テンプレート関連モデル

ExcelTemplate、CellMapping、GenerationHistory のSQLAlchemy ORM定義です。
SQLAlchemy 2.0 Mapped スタイルを使用。
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GenerationStatus(str, enum.Enum):
    """生成ステータス"""

    PENDING = "pending"           # 待機中
    PROCESSING = "processing"     # 処理中
    COMPLETED = "completed"       # 完了
    FAILED = "failed"             # 失敗


class ExcelTemplate(Base):
    """
    Excelテンプレート定義

    テンプレートはテナント毎に複数保持可能です。
    スラグはテナント内で一意である必要があります。
    """

    __tablename__ = "excel_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # リレーション
    cell_mappings: Mapped[list["CellMapping"]] = relationship(
        back_populates="template", cascade="all, delete-orphan", lazy="selectin"
    )
    generation_histories: Mapped[list["GenerationHistory"]] = relationship(
        back_populates="template", cascade="all, delete-orphan", lazy="select"
    )

    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uk_tenant_slug"),
        Index("idx_tenant_active", "tenant_id", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<ExcelTemplate(id={self.id}, name={self.name}, slug={self.slug})>"


class CellMapping(Base):
    """
    セルフィールドマッピング定義

    テンプレート内のセルアドレスとデータフィールドの対応を定義します。
    マージセルの場合は、左上セルのアドレスを指定してください。
    """

    __tablename__ = "cell_mappings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    template_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("excel_templates.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    cell_ref: Mapped[str] = mapped_column(String(20), nullable=False)
    field_name: Mapped[str] = mapped_column(String(255), nullable=False)
    data_type: Mapped[str] = mapped_column(String(50), default="string")
    format_pattern: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    template: Mapped["ExcelTemplate"] = relationship(back_populates="cell_mappings")

    __table_args__ = (
        UniqueConstraint("template_id", "cell_ref", name="uk_template_cellref"),
        Index("idx_template_field", "template_id", "field_name"),
    )

    def __repr__(self) -> str:
        return f"<CellMapping(id={self.id}, cell_ref={self.cell_ref}, field_name={self.field_name})>"


class GenerationHistory(Base):
    """
    生成履歴レコード

    Excelファイル生成の実行履歴を記録します。
    テナント単位での隔離と監査ログとしての役割を果たします。
    """

    __tablename__ = "generation_histories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    template_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("excel_templates.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    tenant_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    input_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    output_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[GenerationStatus] = mapped_column(
        Enum(GenerationStatus), default=GenerationStatus.PENDING
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, server_default=func.now()
    )

    template: Mapped["ExcelTemplate"] = relationship(back_populates="generation_histories")

    __table_args__ = (
        Index("idx_tenant_created", "tenant_id", "created_at"),
        Index("idx_template_status", "template_id", "status"),
        Index("idx_user_created", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<GenerationHistory(id={self.id}, template_id={self.template_id}, status={self.status})>"
