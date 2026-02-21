"""
Excel帳票生成サービス

テンプレートの読み込み、データの埋め込み、ファイル保存を行います。
マージセルへの対応を含みます。
"""

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from openpyxl import load_workbook
from openpyxl.worksheet.worksheet import Worksheet
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.template import (
    CellMapping,
    ExcelTemplate,
    GenerationHistory,
    GenerationStatus,
)
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class ExcelService:
    """
    Excel帳票生成サービス

    テンプレートベースのExcel生成ロジックを管理します。
    OpenPyXLを使用してテンプレートを読み込み、
    データを安全に埋め込みます。
    """

    def __init__(self, storage_service: StorageService):
        """
        初期化

        Args:
            storage_service: ストレージサービスインスタンス
        """
        self.storage = storage_service

    async def load_template(self, template_path: str) -> Any:
        """
        Excelテンプレートを読み込む

        data_only=False で数式を保持します。

        Args:
            template_path: テンプレートファイルパス

        Returns:
            openpyxl.Workbook オブジェクト

        Raises:
            FileNotFoundError: テンプレートが見つからない
            ValueError: テンプレートが無効なExcelファイル
        """
        try:
            # ローカルストレージからテンプレートを読み込む
            template_full_path = Path(settings.STORAGE_TEMPLATES_PATH) / template_path
            logger.info(f"テンプレート読み込み: {template_full_path}")

            if not template_full_path.exists():
                raise FileNotFoundError(f"テンプレートが見つかりません: {template_path}")

            # data_only=False で数式を保持
            workbook = load_workbook(str(template_full_path), data_only=False)
            logger.debug(f"テンプレート読み込み成功: {template_path}")
            return workbook

        except Exception as e:
            logger.error(f"テンプレート読み込みエラー: {str(e)}")
            raise

    def _find_merge_range_top_left(
        self,
        worksheet: Worksheet,
        target_cell: str,
    ) -> Optional[str]:
        """
        マージされたセル範囲の左上セルを検出

        ターゲットセルがマージセルの一部の場合、
        そのマージ範囲の左上セルアドレスを返します。
        マージセルでない場合は None を返します。

        Args:
            worksheet: ワークシートオブジェクト
            target_cell: セルアドレス (A1など)

        Returns:
            マージ範囲の左上セルアドレス、またはマージセルでない場合は None
        """
        for merged_range in worksheet.merged_cells.ranges:
            if target_cell in merged_range:
                # マージ範囲の左上セルを取得
                top_left = merged_range.start_cell.coordinate
                logger.debug(
                    f"マージセル検出: {target_cell} -> {top_left} "
                    f"(範囲: {merged_range})"
                )
                return top_left

        return None

    def _safe_write_cell(
        self,
        worksheet: Worksheet,
        cell_ref: str,
        value: Any,
    ) -> None:
        """
        セルに安全にデータを書き込む

        マージセルの場合は、マージ範囲の左上セルに書き込みます。

        Args:
            worksheet: ワークシートオブジェクト
            cell_ref: セルアドレス
            value: 書き込む値
        """
        # マージセルをチェック
        merge_top_left = self._find_merge_range_top_left(worksheet, cell_ref)
        write_cell = merge_top_left or cell_ref

        try:
            worksheet[write_cell] = value
            logger.debug(f"セル書き込み成功: {write_cell} = {value}")
        except Exception as e:
            logger.error(f"セル書き込みエラー: {write_cell} = {value}: {str(e)}")
            raise

    async def fill_cells(
        self,
        workbook: Any,
        cell_mappings: list[CellMapping],
        input_data: dict[str, Any],
    ) -> Any:
        """
        セルマッピングに基づいてデータを埋め込む

        Args:
            workbook: openpyxl.Workbook オブジェクト
            cell_mappings: CellMapping オブジェクトのリスト
            input_data: 入力データ辞書

        Returns:
            データが埋め込まれたワークブック

        Raises:
            ValueError: 必須フィールドが不足している
        """
        try:
            # アクティブなワークシートを取得
            worksheet = workbook.active

            # セルマッピングをソート順でソート
            sorted_mappings = sorted(cell_mappings, key=lambda m: m.sort_order)

            for mapping in sorted_mappings:
                field_name = mapping.field_name

                # 入力データからフィールド値を取得
                if field_name not in input_data:
                    logger.warning(f"フィールドが見つかりません: {field_name}")
                    continue

                value = input_data[field_name]

                # データ型に基づいて値を変換
                if mapping.data_type == "int":
                    value = int(value) if value is not None else None
                elif mapping.data_type == "float":
                    value = float(value) if value is not None else None
                elif mapping.data_type == "date":
                    if isinstance(value, str):
                        # ISO形式の日付文字列を datetime に変換
                        value = datetime.fromisoformat(value)

                # セルに値を書き込む
                self._safe_write_cell(worksheet, mapping.cell_ref, value)

            logger.info(f"セル埋め込み完了: {len(sorted_mappings)}個のセル")
            return workbook

        except Exception as e:
            logger.error(f"セル埋め込みエラー: {str(e)}")
            raise

    async def generate(
        self,
        template_id: int,
        tenant_id: int,
        user_id: int,
        input_data: dict[str, Any],
        cell_mappings: list[CellMapping],
        file_path: str,
    ) -> GenerationHistory:
        """
        Excelレポートを生成

        テンプレートを読み込み、データを埋め込み、ファイルを保存します。

        Args:
            template_id: テンプレートID
            tenant_id: テナントID
            user_id: ユーザーID
            input_data: 入力データ
            cell_mappings: セルマッピングのリスト
            file_path: 出力ファイルパス

        Returns:
            GenerationHistory オブジェクト

        Raises:
            Exception: 生成処理に失敗した場合
        """
        history = GenerationHistory(
            template_id=template_id,
            tenant_id=tenant_id,
            user_id=user_id,
            input_data=input_data,
            status=GenerationStatus.PROCESSING,
        )

        try:
            logger.info(f"Excel生成開始: template_id={template_id}")

            # テンプレート情報から file_path を取得
            # (実際には呼び出し元で ExcelTemplate から取得した file_path を渡す)
            template_file_path = file_path  # これはテンプレートのファイルパス

            # テンプレートを読み込む
            workbook = await self.load_template(template_file_path)

            # データを埋め込む
            workbook = await self.fill_cells(workbook, cell_mappings, input_data)

            # ファイルを保存
            output_path = await self._save_workbook(workbook, template_id, user_id)
            history.output_path = output_path

            # ファイルサイズを取得
            file_size = await self.storage.get_file_size(output_path)
            history.file_size = file_size

            history.status = GenerationStatus.COMPLETED
            logger.info(
                f"Excel生成完了: {output_path} (size={file_size} bytes)"
            )

            return history

        except Exception as e:
            logger.error(f"Excel生成失敗: {str(e)}", exc_info=True)
            history.status = GenerationStatus.FAILED
            history.error_message = str(e)
            return history

    async def _save_workbook(self, workbook: Any, template_id: int, user_id: int) -> str:
        """
        ワークブックをファイルに保存

        Args:
            workbook: openpyxl.Workbook オブジェクト
            template_id: テンプレートID
            user_id: ユーザーID

        Returns:
            保存されたファイルパス
        """
        try:
            # 出力ファイルパスを生成
            now = datetime.utcnow()
            timestamp = now.strftime("%Y%m%d_%H%M%S")
            output_filename = f"{timestamp}_{template_id}_{user_id}.xlsx"

            # ディレクトリ構造: outputs/YYYY/MM/DD/
            output_dir = Path(settings.STORAGE_OUTPUTS_PATH) / str(now.year) / f"{now.month:02d}" / f"{now.day:02d}"
            output_dir.mkdir(parents=True, exist_ok=True)

            output_path = output_dir / output_filename
            logger.debug(f"ワークブック保存: {output_path}")

            # メモリにファイルを保存してからストレージに転送
            workbook.save(str(output_path))

            logger.info(f"ワークブック保存成功: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"ワークブック保存エラー: {str(e)}")
            raise
