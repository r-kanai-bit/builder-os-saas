"""
FastAPI アプリケーション

Excel帳票エンジンのメインアプリケーション定義です。
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from openpyxl import Workbook, load_workbook
from openpyxl.worksheet.worksheet import Worksheet
from pydantic import BaseModel

from app.api.router import api_router
from app.config import settings
from app.database import dispose_db, init_db

# ロギング設定
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションのライフサイクル管理

    起動時と終了時の処理を定義します。
    """
    # 起動処理
    logger.info(f"アプリケーション起動: {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"DEBUG={settings.DEBUG}, LOG_LEVEL={settings.LOG_LEVEL}")
    logger.info(f"STORAGE_TYPE={settings.STORAGE_TYPE}")

    try:
        await init_db()
        logger.info("データベース初期化完了")
    except Exception as e:
        logger.error(f"データベース初期化エラー: {str(e)}")
        raise

    yield

    # 終了処理
    logger.info("アプリケーション終了中...")
    try:
        await dispose_db()
        logger.info("データベース接続をクローズしました")
    except Exception as e:
        logger.error(f"データベース接続クローズエラー: {str(e)}")

    logger.info("アプリケーション終了完了")


# FastAPI アプリケーション作成
app = FastAPI(
    title=settings.APP_NAME,
    description="Excel帳票エンジン - テンプレートベースのExcelファイル生成システム",
    version=settings.APP_VERSION,
    openapi_url=settings.API_OPENAPI_URL,
    docs_url=settings.API_DOCS_URL,
    redoc_url=settings.API_REDOC_URL,
    lifespan=lifespan,
)

# CORS ミドルウェア設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)


# ============================================================
# ルートエンドポイント（Railway ステータス確認用）
# ============================================================

@app.get("/", tags=["status"])
async def root():
    """Railway ステータス確認"""
    return {"status": "Postgres connected"}


# ============================================================
# ヘルスチェック
# ============================================================

@app.get("/health", tags=["health"])
async def health_check():
    """
    ヘルスチェック

    アプリケーションが正常に動作しているか確認します。
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ============================================================
# テンプレートベース Excel 生成 ヘルパー
# ============================================================

# テンプレートファイルパス（Railway デプロイ時は COPY 済み）
ESTIMATE_TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "storage" / "templates" / "estimate_v2.xlsx"


def _find_merge_top_left(ws: Worksheet, cell_ref: str) -> Optional[str]:
    """マージセルの左上セルを検出"""
    for merged_range in ws.merged_cells.ranges:
        if cell_ref in merged_range:
            return merged_range.start_cell.coordinate
    return None


def _safe_write(ws: Worksheet, cell_ref: str, value: Any) -> None:
    """マージセル対応の安全書き込み"""
    top_left = _find_merge_top_left(ws, cell_ref)
    ws[top_left or cell_ref] = value


# ============================================================
# 見積書 Excel 生成 API（テンプレートベース）
# ============================================================

# セルマッピング定義（init_db.py と同じ36マッピング）
ESTIMATE_CELL_MAPPINGS = {
    "customer_name":     "B5",
    "estimate_date":     "N5",
    "total_with_tax_2":  "K10",
    "body_price":        "N20",
    "option_total":      "N22",
    "futai_total":       "N24",
    "contract_amount":   "N27",
    "tax":               "N30",
    "total_with_tax":    "N33",
    "body_price_detail": "X65",
    "opt_01_amount":     "U69",
    "opt_02_amount":     "U70",
    "opt_03_amount":     "U71",
    "opt_04_amount":     "U72",
    "opt_05_amount":     "U73",
    "opt_06_amount":     "U74",
    "opt_07_amount":     "U75",
    "opt_08_amount":     "U76",
    "opt_09_amount":     "U77",
    "opt_10_amount":     "U78",
    "option_subtotal":   "N82",
    "futai_01_amount":   "U86",
    "futai_02_amount":   "U87",
    "futai_03_amount":   "U88",
    "futai_04_amount":   "U89",
    "futai_05_amount":   "U90",
    "futai_06_amount":   "U91",
    "futai_07_amount":   "U92",
    "futai_08_amount":   "U93",
    "futai_subtotal":    "N96",
    "floor_1f_sqm":      "E48",
    "floor_1f_tsubo":    "I48",
    "floor_2f_sqm":      "E49",
    "floor_2f_tsubo":    "I49",
    "floor_total_sqm":   "E51",
    "floor_total_tsubo": "I51",
}


class EstimateRequest(BaseModel):
    """見積書Excel生成リクエスト（テンプレートベース）"""
    # 基本情報
    customer_name: str = ""
    estimate_date: str = ""
    # 金額
    body_price: Optional[float] = None
    option_total: Optional[float] = None
    futai_total: Optional[float] = None
    contract_amount: Optional[float] = None
    tax: Optional[float] = None
    total_with_tax: Optional[float] = None
    total_with_tax_2: Optional[float] = None
    body_price_detail: Optional[float] = None
    # オプション工事 (10行)
    opt_01_amount: Optional[float] = None
    opt_02_amount: Optional[float] = None
    opt_03_amount: Optional[float] = None
    opt_04_amount: Optional[float] = None
    opt_05_amount: Optional[float] = None
    opt_06_amount: Optional[float] = None
    opt_07_amount: Optional[float] = None
    opt_08_amount: Optional[float] = None
    opt_09_amount: Optional[float] = None
    opt_10_amount: Optional[float] = None
    option_subtotal: Optional[float] = None
    # 付帯工事 (8行)
    futai_01_amount: Optional[float] = None
    futai_02_amount: Optional[float] = None
    futai_03_amount: Optional[float] = None
    futai_04_amount: Optional[float] = None
    futai_05_amount: Optional[float] = None
    futai_06_amount: Optional[float] = None
    futai_07_amount: Optional[float] = None
    futai_08_amount: Optional[float] = None
    futai_subtotal: Optional[float] = None
    # 床面積
    floor_1f_sqm: Optional[float] = None
    floor_1f_tsubo: Optional[float] = None
    floor_2f_sqm: Optional[float] = None
    floor_2f_tsubo: Optional[float] = None
    floor_total_sqm: Optional[float] = None
    floor_total_tsubo: Optional[float] = None


class GenerateRequest(BaseModel):
    """見積書Excel生成リクエスト（基本3フィールド互換）"""
    project_name: str = ""
    version: str = ""
    author: str = ""


class SpecSheetRequest(BaseModel):
    """仕様書Excel生成リクエスト（全フィールド対応）"""
    project: str = ""
    category: str = ""
    structure: str = ""
    floors: str = ""
    foundation: str = ""
    roofing: str = ""
    exterior: str = ""
    insulation: str = ""
    window: str = ""
    flooring: str = ""
    kitchen: str = ""
    bath: str = ""
    toilet: str = ""
    aircon: str = ""
    ventilation: str = ""
    note: str = ""
    date: str = ""
    status: str = ""


# 共通スタイル定義
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

_TITLE_FONT = Font(bold=True, size=16, color="0D9488")
_SECTION_FONT = Font(bold=True, size=12, color="FFFFFF")
_HEADER_FONT = Font(bold=True, size=10)
_VALUE_FONT = Font(size=10)
_HEADER_FILL = PatternFill(start_color="E0F2F1", end_color="E0F2F1", fill_type="solid")
_SECTION_FILL = PatternFill(start_color="0D9488", end_color="0D9488", fill_type="solid")
_NOTE_FILL = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
_THIN_BORDER = Border(
    left=Side(style="thin", color="CCCCCC"),
    right=Side(style="thin", color="CCCCCC"),
    top=Side(style="thin", color="CCCCCC"),
    bottom=Side(style="thin", color="CCCCCC"),
)
_CENTER = Alignment(horizontal="center", vertical="center")
_LEFT = Alignment(vertical="center")


def _build_spec_workbook(data: dict) -> Workbook:
    """仕様書Excelワークブックを構築"""
    wb = Workbook()
    ws = wb.active
    ws.title = "仕様書"

    # 列幅
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 45

    # 印刷設定
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = "portrait"
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = 0.6
    ws.page_margins.right = 0.6

    row = 1

    # === タイトル ===
    ws.merge_cells("A1:B1")
    title_cell = ws.cell(row=1, column=1, value="建 築 仕 様 書")
    title_cell.font = _TITLE_FONT
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 40
    row = 3

    # === 基本情報セクション ===
    basic_fields = [
        ("工事名", data.get("project", "")),
        ("仕様区分", data.get("category", "")),
        ("作成日", data.get("date", datetime.now().strftime("%Y-%m-%d"))),
        ("ステータス", data.get("status", "")),
    ]
    ws.merge_cells(f"A{row}:B{row}")
    sec = ws.cell(row=row, column=1, value="基本情報")
    sec.font = _SECTION_FONT
    sec.fill = _SECTION_FILL
    sec.alignment = _CENTER
    ws.cell(row=row, column=2).fill = _SECTION_FILL
    ws.row_dimensions[row].height = 28
    row += 1

    for label, val in basic_fields:
        ws.cell(row=row, column=1, value=label).font = _HEADER_FONT
        ws.cell(row=row, column=1).fill = _HEADER_FILL
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=1).alignment = _LEFT
        ws.cell(row=row, column=2, value=val).font = _VALUE_FONT
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.cell(row=row, column=2).alignment = _LEFT
        ws.row_dimensions[row].height = 24
        row += 1

    row += 1

    # === 構造・躯体セクション ===
    struct_fields = [
        ("構造種別", data.get("structure", "")),
        ("階数", data.get("floors", "")),
        ("基礎形式", data.get("foundation", "")),
        ("屋根材", data.get("roofing", "")),
        ("外壁材", data.get("exterior", "")),
    ]
    ws.merge_cells(f"A{row}:B{row}")
    sec = ws.cell(row=row, column=1, value="構造・躯体")
    sec.font = _SECTION_FONT
    sec.fill = _SECTION_FILL
    sec.alignment = _CENTER
    ws.cell(row=row, column=2).fill = _SECTION_FILL
    ws.row_dimensions[row].height = 28
    row += 1

    for label, val in struct_fields:
        ws.cell(row=row, column=1, value=label).font = _HEADER_FONT
        ws.cell(row=row, column=1).fill = _HEADER_FILL
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=1).alignment = _LEFT
        ws.cell(row=row, column=2, value=val).font = _VALUE_FONT
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.cell(row=row, column=2).alignment = _LEFT
        ws.row_dimensions[row].height = 24
        row += 1

    row += 1

    # === 断熱・開口部セクション ===
    insul_fields = [
        ("断熱仕様", data.get("insulation", "")),
        ("サッシ・窓", data.get("window", "")),
    ]
    ws.merge_cells(f"A{row}:B{row}")
    sec = ws.cell(row=row, column=1, value="断熱・開口部")
    sec.font = _SECTION_FONT
    sec.fill = _SECTION_FILL
    sec.alignment = _CENTER
    ws.cell(row=row, column=2).fill = _SECTION_FILL
    ws.row_dimensions[row].height = 28
    row += 1

    for label, val in insul_fields:
        ws.cell(row=row, column=1, value=label).font = _HEADER_FONT
        ws.cell(row=row, column=1).fill = _HEADER_FILL
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=1).alignment = _LEFT
        ws.cell(row=row, column=2, value=val).font = _VALUE_FONT
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.cell(row=row, column=2).alignment = _LEFT
        ws.row_dimensions[row].height = 24
        row += 1

    row += 1

    # === 内装・設備セクション ===
    equip_fields = [
        ("床材（LDK）", data.get("flooring", "")),
        ("キッチン", data.get("kitchen", "")),
        ("UB", data.get("bath", "")),
        ("トイレ", data.get("toilet", "")),
    ]
    ws.merge_cells(f"A{row}:B{row}")
    sec = ws.cell(row=row, column=1, value="内装・設備")
    sec.font = _SECTION_FONT
    sec.fill = _SECTION_FILL
    sec.alignment = _CENTER
    ws.cell(row=row, column=2).fill = _SECTION_FILL
    ws.row_dimensions[row].height = 28
    row += 1

    for label, val in equip_fields:
        ws.cell(row=row, column=1, value=label).font = _HEADER_FONT
        ws.cell(row=row, column=1).fill = _HEADER_FILL
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=1).alignment = _LEFT
        ws.cell(row=row, column=2, value=val).font = _VALUE_FONT
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.cell(row=row, column=2).alignment = _LEFT
        ws.row_dimensions[row].height = 24
        row += 1

    row += 1

    # === 空調・換気セクション ===
    hvac_fields = [
        ("空調方式", data.get("aircon", "")),
        ("換気方式", data.get("ventilation", "")),
    ]
    ws.merge_cells(f"A{row}:B{row}")
    sec = ws.cell(row=row, column=1, value="空調・換気")
    sec.font = _SECTION_FONT
    sec.fill = _SECTION_FILL
    sec.alignment = _CENTER
    ws.cell(row=row, column=2).fill = _SECTION_FILL
    ws.row_dimensions[row].height = 28
    row += 1

    for label, val in hvac_fields:
        ws.cell(row=row, column=1, value=label).font = _HEADER_FONT
        ws.cell(row=row, column=1).fill = _HEADER_FILL
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=1).alignment = _LEFT
        ws.cell(row=row, column=2, value=val).font = _VALUE_FONT
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.cell(row=row, column=2).alignment = _LEFT
        ws.row_dimensions[row].height = 24
        row += 1

    row += 1

    # === 特記事項 ===
    note = data.get("note", "")
    if note:
        ws.merge_cells(f"A{row}:B{row}")
        sec = ws.cell(row=row, column=1, value="特記事項")
        sec.font = _SECTION_FONT
        sec.fill = _SECTION_FILL
        sec.alignment = _CENTER
        ws.cell(row=row, column=2).fill = _SECTION_FILL
        ws.row_dimensions[row].height = 28
        row += 1
        ws.merge_cells(f"A{row}:B{row}")
        note_cell = ws.cell(row=row, column=1, value=note)
        note_cell.font = _VALUE_FONT
        note_cell.fill = _NOTE_FILL
        note_cell.border = _THIN_BORDER
        note_cell.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[row].height = 60
        row += 1

    row += 2

    # === 承認欄 ===
    ws.merge_cells(f"A{row}:B{row}")
    ws.cell(row=row, column=1, value="承認").font = Font(bold=True, size=10, color="666666")
    ws.cell(row=row, column=1).alignment = Alignment(horizontal="right")
    row += 1
    for label in ["設計", "施工", "承認"]:
        ws.cell(row=row, column=1, value=label).font = Font(size=9, color="999999")
        ws.cell(row=row, column=1).alignment = _CENTER
        ws.cell(row=row, column=1).border = _THIN_BORDER
        ws.cell(row=row, column=2).border = _THIN_BORDER
        ws.row_dimensions[row].height = 40
        row += 1

    return wb


@app.post("/generate", tags=["generate"])
async def generate_estimate_excel(req: GenerateRequest):
    """
    見積書Excelを生成してダウンロード（基本3フィールド互換版）

    アップロード済みテンプレート（estimate_v2.xlsx）を読み込み、
    データを埋め込んでFileResponseで返します。
    """
    if not ESTIMATE_TEMPLATE_PATH.exists():
        logger.error(f"テンプレートが見つかりません: {ESTIMATE_TEMPLATE_PATH}")
        return {"error": "テンプレートファイルが見つかりません"}

    wb = load_workbook(str(ESTIMATE_TEMPLATE_PATH), data_only=False)
    ws = wb.active

    # 基本3フィールドをセルに書き込み
    _safe_write(ws, "B5", req.project_name)  # お客様名/工事名
    _safe_write(ws, "N5", datetime.now().strftime("%Y-%m-%d"))  # 見積日

    filename = f"estimate_{uuid.uuid4().hex[:8]}.xlsx"
    filepath = os.path.join("/tmp", filename)
    wb.save(filepath)

    safe_name = req.project_name.replace("/", "_").replace("\\", "_") if req.project_name else "見積書"
    download_name = f"見積書_{safe_name}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return FileResponse(
        path=filepath,
        filename=download_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.post("/generate-estimate", tags=["generate"])
async def generate_full_estimate_excel(req: EstimateRequest):
    """
    見積書Excelを生成してダウンロード（全36フィールド対応）

    アップロード済みテンプレート（estimate_v2.xlsx）を読み込み、
    36個のセルマッピングに基づいてデータを埋め込みます。
    マージセル（180箇所）にも安全に対応。
    """
    if not ESTIMATE_TEMPLATE_PATH.exists():
        logger.error(f"テンプレートが見つかりません: {ESTIMATE_TEMPLATE_PATH}")
        return {"error": "テンプレートファイルが見つかりません"}

    wb = load_workbook(str(ESTIMATE_TEMPLATE_PATH), data_only=False)
    ws = wb.active

    # リクエストデータをdict化
    data = req.model_dump(exclude_none=True)

    # セルマッピングに基づいてデータを埋め込み
    for field_name, cell_ref in ESTIMATE_CELL_MAPPINGS.items():
        if field_name in data and data[field_name] is not None:
            value = data[field_name]
            # 日付フィールドの処理
            if field_name == "estimate_date" and isinstance(value, str) and value:
                try:
                    value = datetime.fromisoformat(value)
                except ValueError:
                    pass  # ISO形式でなければ文字列のまま
            _safe_write(ws, cell_ref, value)

    logger.info(f"見積書生成完了: {len(data)}フィールド埋め込み")

    filename = f"estimate_{uuid.uuid4().hex[:8]}.xlsx"
    filepath = os.path.join("/tmp", filename)
    wb.save(filepath)

    safe_name = req.customer_name.replace("/", "_").replace("\\", "_") if req.customer_name else "見積書"
    download_name = f"見積書_{safe_name}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return FileResponse(
        path=filepath,
        filename=download_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.post("/generate-spec", tags=["generate"])
async def generate_full_spec_excel(req: SpecSheetRequest):
    """
    仕様書Excelを生成してダウンロード（全フィールド版）

    フロントエンドのSpecSheetコンポーネントから全仕様フィールドを受け取り、
    セクション分けされた帳票Excelを生成します。
    """
    wb = _build_spec_workbook(req.model_dump())

    filename = f"spec_{uuid.uuid4().hex[:8]}.xlsx"
    filepath = os.path.join("/tmp", filename)
    wb.save(filepath)

    safe_name = req.project.replace("/", "_").replace("\\", "_") if req.project else "仕様書"
    download_name = f"仕様書_{safe_name}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return FileResponse(
        path=filepath,
        filename=download_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ルータを組み込む
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
    )
