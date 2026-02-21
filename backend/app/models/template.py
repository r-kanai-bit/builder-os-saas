"""
Excel帳票テンプレート関連モデル

ExcelTemplate、CellMapping、GenerationHistory のSQLAlchemy ORM定義です。
"""

import enum
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    Index,
    ForeignKey,
)
from sqlalchemy.orm import relationship

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

    # 主キー
    id: int = Integer(primary_key=True, index=True)

    # テナント情報
    tenant_id: int = Integer(nullable=False, index=True)

    # テンプレート情報
    name: str = String(255, nullable=False)
    slug: str = String(255, nullable=False)  # URL友好なID
    file_path: str = String(512, nullable=False)
    description: str = Text
    version: int = Integer(default=1)
    is_active: bool = Boolean(default=True)

    # タイムスタンプ
    created_at: datetime = DateTime(
        nullable=False,
        default=datetime.utcnow,
        server_default=func.now(),
    )
    updated_at: datetime = DateTime(
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=func.now(),
    )

    # リレーション
    cell_mappings = relationship(
        "CellMapping",
        back_populates="template",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    generation_histories = relationship(
        "GenerationHistory",
        back_populates="template",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ユニーク制約
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

    # 主キー
    id: int = Integer(primary_key=True, index=True)

    # 外部キー
    template_id: int = Integer(
        ForeignKey("excel_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # セル情報
    cell_ref: str = String(20, nullable=False)  # A1, B2:D5など
    field_name: str = String(255, nullable=False)

    # データ型・フォーマット
    data_type: str = String(50, default="string")  # string, int, float, date
    format_pattern: str = String(255)  # #,##0.00 など

    # その他
    description: str = String(500)
    sort_order: int = Integer(default=0)

    # タイムスタンプ
    created_at: datetime = DateTime(
        nullable=False,
        default=datetime.utcnow,
        server_default=func.now(),
    )
    updated_at: datetime = DateTime(
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default=func.now(),
    )

    # リレーション
    template = relationship("ExcelTemplate", back_populates="cell_mappings")

    # ユニーク制約
    __table_args__ = (
        UniqueConstraint("template_id", "cell_ref", name="uk_template_cellref"),
        Index("idx_template_field", "template_id", "field_name"),
    )

    def __repr__(self) -> str:
        return (
            f"<CellMapping(id={self.id}, cell_ref={self.cell_ref}, "
            f"field_name={self.field_name})>"
        )


class GenerationHistory(Base):
    """
    生成履歴レコード

    Excelファイル生成の実行履歴を記録します。
    テナント単位での隔離と監査ログとしての役割を果たします。
    """

    __tablename__ = "generation_histories"

    # 主キー
    id: int = Integer(primary_key=True, index=True)

    # 外部キー・テナント情報
    template_id: int = Integer(
        ForeignKey("excel_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tenant_id: int = Integer(nullable=False, index=True)
    user_id: int = Integer(nullable=False)

    # 入出力情報
    input_data: dict = JSON(nullable=True)  # 入力データ (検索用)
    output_path: str = String(512)  # 出力ファイルパス
    file_size: int = Integer()  # ファイルサイズ (bytes)

    # ステータス
    status: GenerationStatus = Enum(
        GenerationStatus,
        default=GenerationStatus.PENDING,
    )
    error_message: str = Text

    # タイムスタンプ
    created_at: datetime = DateTime(
        nullable=False,
        default=datetime.utcnow,
        index=True,
        server_default=func.now(),
    )

    # リレーション
    template = relationship("ExcelTemplate", back_populates="generation_histories")

    # インデックス
    __table_args__ = (
        Index("idx_tenant_created", "tenant_id", "created_at"),
        Index("idx_template_status", "template_id", "status"),
        Index("idx_user_created", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<GenerationHistory(id={self.id}, template_id={self.template_id}, "
            f"status={self.status})>"
        )
