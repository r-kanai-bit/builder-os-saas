"""
E2Eテスト: 見積書テンプレート → データ差込 → Excel生成 → 検証

実テンプレート（estimate_v2.xlsx = 【クロード用】見積書.xlsx）を使用して、
帳票エンジンの全フローを検証します。
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from openpyxl import load_workbook

from app.config import settings
from app.database import Base, engine, async_session_maker
from app.models.template import (
    CellMapping,
    ExcelTemplate,
    GenerationHistory,
    GenerationStatus,
)
from app.services.excel_service import ExcelService
from app.services.storage_service import LocalStorage


# ============================================================
# セルマッピング定義（新テンプレート: 【クロード用】見積書.xlsx）
# ============================================================
ESTIMATE_CELL_MAPPINGS = [
    # --- 見積もりシート: 顧客情報 ---
    {"cell_ref": "B5",  "field_name": "customer_name",     "data_type": "string", "description": "顧客名（様付き）"},
    {"cell_ref": "K10", "field_name": "total_with_tax",    "data_type": "int",    "description": "税込合計金額"},

    # --- 見積もりシート: 金額サマリー ---
    {"cell_ref": "N20", "field_name": "body_price",        "data_type": "int",    "description": "本体工事費"},
    {"cell_ref": "N22", "field_name": "option_total",      "data_type": "int",    "description": "オプション工事合計"},
    {"cell_ref": "N24", "field_name": "futai_total",       "data_type": "int",    "description": "付帯工事合計"},
    {"cell_ref": "N27", "field_name": "contract_amount",   "data_type": "int",    "description": "請負金額"},
    {"cell_ref": "N30", "field_name": "tax",               "data_type": "int",    "description": "消費税"},
    {"cell_ref": "N33", "field_name": "total_with_tax_2",  "data_type": "int",    "description": "税込合計（サマリー側）"},

    # --- 見積もりシート: 本体工事 ---
    {"cell_ref": "X65", "field_name": "body_price_detail", "data_type": "int",    "description": "基本本体工事費（明細）"},

    # --- 見積もりシート: オプション工事明細 R69-R80 ---
    {"cell_ref": "U69", "field_name": "opt_01_amount",     "data_type": "int",    "description": "仮設工事"},
    {"cell_ref": "U70", "field_name": "opt_02_amount",     "data_type": "int",    "description": "基礎工事"},
    {"cell_ref": "U71", "field_name": "opt_03_amount",     "data_type": "int",    "description": "躯体工事"},
    {"cell_ref": "U72", "field_name": "opt_04_amount",     "data_type": "int",    "description": "屋根・板金工事"},
    {"cell_ref": "U73", "field_name": "opt_05_amount",     "data_type": "int",    "description": "外壁工事"},
    {"cell_ref": "U74", "field_name": "opt_06_amount",     "data_type": "int",    "description": "建具工事"},
    {"cell_ref": "U75", "field_name": "opt_07_amount",     "data_type": "int",    "description": "内装工事"},
    {"cell_ref": "U76", "field_name": "opt_08_amount",     "data_type": "int",    "description": "電気設備工事"},
    {"cell_ref": "U77", "field_name": "opt_09_amount",     "data_type": "int",    "description": "給排水衛生設備"},
    {"cell_ref": "U78", "field_name": "opt_10_amount",     "data_type": "int",    "description": "空調換気設備"},
    {"cell_ref": "N82", "field_name": "option_subtotal",   "data_type": "int",    "description": "オプション小計"},

    # --- 見積もりシート: 付帯工事明細 R86-R94 ---
    {"cell_ref": "U86", "field_name": "futai_01_amount",   "data_type": "int",    "description": "付帯工事"},
    {"cell_ref": "U87", "field_name": "futai_02_amount",   "data_type": "int",    "description": "諸経費"},
    {"cell_ref": "U88", "field_name": "futai_03_amount",   "data_type": "int",    "description": "エアコン工事"},
    {"cell_ref": "U89", "field_name": "futai_04_amount",   "data_type": "int",    "description": "防水工事"},
    {"cell_ref": "U90", "field_name": "futai_05_amount",   "data_type": "int",    "description": "太陽光"},
    {"cell_ref": "U91", "field_name": "futai_06_amount",   "data_type": "int",    "description": "蓄電池"},
    {"cell_ref": "U92", "field_name": "futai_07_amount",   "data_type": "int",    "description": "EV充電器"},
    {"cell_ref": "U93", "field_name": "futai_08_amount",   "data_type": "int",    "description": "外構工事"},
    {"cell_ref": "N96", "field_name": "futai_subtotal",    "data_type": "int",    "description": "付帯小計"},

    # --- 見積もりシート: 床面積 ---
    {"cell_ref": "E48", "field_name": "floor_1f_sqm",      "data_type": "float",  "description": "1F面積（㎡）"},
    {"cell_ref": "I48", "field_name": "floor_1f_tsubo",    "data_type": "float",  "description": "1F面積（坪）"},
    {"cell_ref": "E49", "field_name": "floor_2f_sqm",      "data_type": "float",  "description": "2F面積（㎡）"},
    {"cell_ref": "I49", "field_name": "floor_2f_tsubo",    "data_type": "float",  "description": "2F面積（坪）"},
    {"cell_ref": "E51", "field_name": "floor_total_sqm",   "data_type": "float",  "description": "延床面積（㎡）"},
    {"cell_ref": "I51", "field_name": "floor_total_tsubo", "data_type": "float",  "description": "延床面積（坪）"},
]

# ============================================================
# テストデータ: 30坪 2階建
# ============================================================
TEST_INPUT_DATA = {
    "customer_name": "テスト太郎 様",

    # 金額サマリー
    "body_price": 0,
    "option_total": 26520000,
    "futai_total": 5460000,
    "contract_amount": 31980000,
    "tax": 3198000,
    "total_with_tax": 35178000,
    "total_with_tax_2": 35178000,
    "body_price_detail": 0,

    # オプション工事明細（30坪 × 粗利30%加算）
    "opt_01_amount": 2340000,   # 仮設工事
    "opt_02_amount": 3510000,   # 基礎工事
    "opt_03_amount": 4680000,   # 躯体工事
    "opt_04_amount": 1560000,   # 屋根・板金工事
    "opt_05_amount": 2340000,   # 外壁工事
    "opt_06_amount": 2340000,   # 建具工事
    "opt_07_amount": 2340000,   # 内装工事
    "opt_08_amount": 2340000,   # 電気設備工事
    "opt_09_amount": 2730000,   # 給排水衛生設備
    "opt_10_amount": 2340000,   # 空調換気設備
    "option_subtotal": 26520000,

    # 付帯工事明細
    "futai_01_amount": 1300000,  # 付帯工事
    "futai_02_amount": 650000,   # 諸経費
    "futai_03_amount": 780000,   # エアコン工事
    "futai_04_amount": 260000,   # 防水工事
    "futai_05_amount": 1300000,  # 太陽光
    "futai_06_amount": 910000,   # 蓄電池
    "futai_07_amount": 0,        # EV充電器（なし）
    "futai_08_amount": 260000,   # 外構工事
    "futai_subtotal": 5460000,

    # 床面積（30坪 2階建）
    "floor_1f_sqm": 54.45,
    "floor_1f_tsubo": 16.5,
    "floor_2f_sqm": 44.55,
    "floor_2f_tsubo": 13.5,
    "floor_total_sqm": 99.0,
    "floor_total_tsubo": 30.0,
}


async def run_e2e_test():
    """E2Eテスト実行"""
    print("=" * 60)
    print("  帳票エンジン E2E テスト")
    print("  テンプレート: estimate_v2.xlsx（【クロード用】見積書）")
    print("=" * 60)

    # ---- Step 1: DB初期化 ----
    print("\n📋 Step 1: DB初期化...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("  ✅ テーブル作成完了")

    # ---- Step 2: テンプレート登録 ----
    print("\n📋 Step 2: テンプレート登録...")
    async with async_session_maker() as db:
        template = ExcelTemplate(
            tenant_id=1,
            name="建築見積書（新テンプレート）",
            slug="estimate-v2",
            file_path="estimate_v2.xlsx",
            description="【クロード用】見積書.xlsx - 96行×20列、結合セル多数",
            version=1,
            is_active=True,
        )
        db.add(template)
        await db.flush()
        template_id = template.id
        print(f"  ✅ テンプレート登録: id={template_id}, slug=estimate-v2")

        # ---- Step 3: セルマッピング登録 ----
        print(f"\n📋 Step 3: セルマッピング登録（{len(ESTIMATE_CELL_MAPPINGS)}件）...")
        for i, mapping_def in enumerate(ESTIMATE_CELL_MAPPINGS):
            mapping = CellMapping(
                template_id=template_id,
                cell_ref=mapping_def["cell_ref"],
                field_name=mapping_def["field_name"],
                data_type=mapping_def["data_type"],
                description=mapping_def["description"],
                sort_order=i,
            )
            db.add(mapping)
        await db.commit()
        print(f"  ✅ {len(ESTIMATE_CELL_MAPPINGS)}件のセルマッピング登録完了")

    # ---- Step 4: Excel生成 ----
    print("\n📋 Step 4: Excel生成...")
    storage = LocalStorage()
    excel_svc = ExcelService(storage)

    # テンプレート読込
    wb = await excel_svc.load_template("estimate_v2.xlsx")
    ws = wb.active
    print(f"  ✅ テンプレート読込: シート名={ws.title}")
    print(f"     結合セル数: {len(list(ws.merged_cells.ranges))}")

    # セルマッピング取得
    async with async_session_maker() as db:
        from sqlalchemy import select
        result = await db.execute(
            select(CellMapping).where(CellMapping.template_id == template_id)
            .order_by(CellMapping.sort_order)
        )
        mappings = list(result.scalars().all())

    # データ差込
    wb = await excel_svc.fill_cells(wb, mappings, TEST_INPUT_DATA)
    print(f"  ✅ データ差込完了: {len(mappings)}セル")

    # ファイル保存
    output_filename = f"見積書_テスト太郎_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    output_path = Path(settings.STORAGE_OUTPUTS_PATH) / output_filename
    os.makedirs(output_path.parent, exist_ok=True)
    wb.save(str(output_path))
    file_size = output_path.stat().st_size
    print(f"  ✅ ファイル保存: {output_path} ({file_size:,} bytes)")

    # ---- Step 5: 生成履歴登録 ----
    print("\n📋 Step 5: 生成履歴登録...")
    async with async_session_maker() as db:
        history = GenerationHistory(
            template_id=template_id,
            tenant_id=1,
            user_id=1,
            input_data=TEST_INPUT_DATA,
            output_path=str(output_path),
            file_size=file_size,
            status=GenerationStatus.COMPLETED,
        )
        db.add(history)
        await db.commit()
        print(f"  ✅ 生成履歴登録: id={history.id}, status=COMPLETED")

    # ---- Step 6: 出力検証 ----
    print("\n📋 Step 6: 出力ファイル検証...")
    wb_out = load_workbook(str(output_path), data_only=False)
    ws_out = wb_out.active
    errors = 0

    verify_cells = {
        "B5": "テスト太郎 様",
        "K10": 35178000,
        "N20": 0,
        "N22": 26520000,
        "N24": 5460000,
        "N27": 31980000,
        "N30": 3198000,
        "U69": 2340000,
        "U86": 1300000,
        "U91": 910000,
        "E51": 99.0,
        "I51": 30.0,
    }

    for cell_ref, expected in verify_cells.items():
        actual = ws_out[cell_ref].value
        # 結合セルの場合、直接読めないことがあるのでMergedCellも確認
        if actual is None:
            # マージ範囲の左上セルを探す
            for mr in ws_out.merged_cells.ranges:
                if cell_ref in mr:
                    actual = ws_out[mr.start_cell.coordinate].value
                    break

        if actual == expected:
            print(f"  ✅ {cell_ref}: {actual}")
        else:
            print(f"  ❌ {cell_ref}: expected={expected}, actual={actual}")
            errors += 1

    # ---- 結果サマリー ----
    print("\n" + "=" * 60)
    if errors == 0:
        print("  🎉 全テスト合格！ E2E テスト成功")
    else:
        print(f"  ⚠️  {errors}件のエラーあり")
    print("=" * 60)

    # DB統計
    async with async_session_maker() as db:
        from sqlalchemy import func, select
        t_count = (await db.execute(select(func.count()).select_from(ExcelTemplate))).scalar()
        m_count = (await db.execute(select(func.count()).select_from(CellMapping))).scalar()
        h_count = (await db.execute(select(func.count()).select_from(GenerationHistory))).scalar()
        print(f"\n  DB統計: テンプレート={t_count}, マッピング={m_count}, 履歴={h_count}")

    return errors == 0


if __name__ == "__main__":
    success = asyncio.run(run_e2e_test())
    sys.exit(0 if success else 1)
