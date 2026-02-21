#!/usr/bin/env python3
"""
データベース初期化 & テンプレート登録スクリプト

usage:
  cd backend
  python -m scripts.init_db          # SQLite ローカル初期化
  python -m scripts.init_db --seed   # テンプレート & セルマッピングも登録
"""

import asyncio
import argparse
import sys
from pathlib import Path

# プロジェクトルートに移動してimportできるようにする
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, text
from app.database import engine, async_session_maker, init_db
from app.models.template import ExcelTemplate, CellMapping, GenerationHistory


# ============================================================
# テンプレート定義
# ============================================================

ESTIMATE_TEMPLATE = {
    "tenant_id": 1,
    "name": "見積書テンプレート v2",
    "slug": "estimate-v2",
    "file_path": "storage/templates/【クロード用】見積書.xlsx",
    "description": "建築工事見積書（180セル結合対応）",
    "version": 1,
    "is_active": True,
}

CELL_MAPPINGS = [
    # 見積もりシート
    {"cell_ref": "B5",  "field_name": "customer_name",     "data_type": "string",  "description": "お客様名",          "sort_order": 1},
    {"cell_ref": "N5",  "field_name": "estimate_date",     "data_type": "date",    "description": "見積日",            "sort_order": 2},
    {"cell_ref": "K10", "field_name": "total_with_tax_2",  "data_type": "number",  "description": "税込合計（上部）",    "sort_order": 3},
    {"cell_ref": "N20", "field_name": "body_price",        "data_type": "number",  "description": "本体工事費",         "sort_order": 10},
    {"cell_ref": "N22", "field_name": "option_total",      "data_type": "number",  "description": "オプション工事費",    "sort_order": 11},
    {"cell_ref": "N24", "field_name": "futai_total",       "data_type": "number",  "description": "付帯工事費",         "sort_order": 12},
    {"cell_ref": "N27", "field_name": "contract_amount",   "data_type": "number",  "description": "請負金額（税抜）",    "sort_order": 13},
    {"cell_ref": "N30", "field_name": "tax",               "data_type": "number",  "description": "消費税",             "sort_order": 14},
    {"cell_ref": "N33", "field_name": "total_with_tax",    "data_type": "number",  "description": "税込合計",           "sort_order": 15},
    {"cell_ref": "X65", "field_name": "body_price_detail", "data_type": "number",  "description": "本体工事費（明細）",  "sort_order": 20},
    # オプション工事明細 (rows 69-78)
    {"cell_ref": "U69", "field_name": "opt_01_amount",     "data_type": "number",  "description": "オプション工事01",   "sort_order": 30},
    {"cell_ref": "U70", "field_name": "opt_02_amount",     "data_type": "number",  "description": "オプション工事02",   "sort_order": 31},
    {"cell_ref": "U71", "field_name": "opt_03_amount",     "data_type": "number",  "description": "オプション工事03",   "sort_order": 32},
    {"cell_ref": "U72", "field_name": "opt_04_amount",     "data_type": "number",  "description": "オプション工事04",   "sort_order": 33},
    {"cell_ref": "U73", "field_name": "opt_05_amount",     "data_type": "number",  "description": "オプション工事05",   "sort_order": 34},
    {"cell_ref": "U74", "field_name": "opt_06_amount",     "data_type": "number",  "description": "オプション工事06",   "sort_order": 35},
    {"cell_ref": "U75", "field_name": "opt_07_amount",     "data_type": "number",  "description": "オプション工事07",   "sort_order": 36},
    {"cell_ref": "U76", "field_name": "opt_08_amount",     "data_type": "number",  "description": "オプション工事08",   "sort_order": 37},
    {"cell_ref": "U77", "field_name": "opt_09_amount",     "data_type": "number",  "description": "オプション工事09",   "sort_order": 38},
    {"cell_ref": "U78", "field_name": "opt_10_amount",     "data_type": "number",  "description": "オプション工事10",   "sort_order": 39},
    {"cell_ref": "N82", "field_name": "option_subtotal",   "data_type": "number",  "description": "オプション小計",     "sort_order": 40},
    # 付帯工事明細 (rows 86-93)
    {"cell_ref": "U86", "field_name": "futai_01_amount",   "data_type": "number",  "description": "付帯工事",           "sort_order": 50},
    {"cell_ref": "U87", "field_name": "futai_02_amount",   "data_type": "number",  "description": "諸経費",             "sort_order": 51},
    {"cell_ref": "U88", "field_name": "futai_03_amount",   "data_type": "number",  "description": "エアコン",           "sort_order": 52},
    {"cell_ref": "U89", "field_name": "futai_04_amount",   "data_type": "number",  "description": "防水工事",           "sort_order": 53},
    {"cell_ref": "U90", "field_name": "futai_05_amount",   "data_type": "number",  "description": "太陽光",             "sort_order": 54},
    {"cell_ref": "U91", "field_name": "futai_06_amount",   "data_type": "number",  "description": "蓄電池",             "sort_order": 55},
    {"cell_ref": "U92", "field_name": "futai_07_amount",   "data_type": "number",  "description": "EV充電器",           "sort_order": 56},
    {"cell_ref": "U93", "field_name": "futai_08_amount",   "data_type": "number",  "description": "外構工事",           "sort_order": 57},
    {"cell_ref": "N96", "field_name": "futai_subtotal",    "data_type": "number",  "description": "付帯工事小計",       "sort_order": 58},
    # 床面積
    {"cell_ref": "E48", "field_name": "floor_1f_sqm",      "data_type": "number",  "description": "1F床面積(㎡)",       "sort_order": 60},
    {"cell_ref": "I48", "field_name": "floor_1f_tsubo",    "data_type": "number",  "description": "1F床面積(坪)",       "sort_order": 61},
    {"cell_ref": "E49", "field_name": "floor_2f_sqm",      "data_type": "number",  "description": "2F床面積(㎡)",       "sort_order": 62},
    {"cell_ref": "I49", "field_name": "floor_2f_tsubo",    "data_type": "number",  "description": "2F床面積(坪)",       "sort_order": 63},
    {"cell_ref": "E51", "field_name": "floor_total_sqm",   "data_type": "number",  "description": "延床面積(㎡)",       "sort_order": 64},
    {"cell_ref": "I51", "field_name": "floor_total_tsubo", "data_type": "number",  "description": "延床面積(坪)",       "sort_order": 65},
]


async def create_tables():
    """テーブル作成"""
    from app.models.template import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ テーブル作成完了")


async def seed_data():
    """テンプレート & セルマッピング登録"""
    async with async_session_maker() as session:
        # 既存テンプレート確認
        result = await session.execute(
            select(ExcelTemplate).where(ExcelTemplate.slug == ESTIMATE_TEMPLATE["slug"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"ℹ️  テンプレート '{existing.slug}' は既に登録済み (id={existing.id})")
            template_id = existing.id
        else:
            template = ExcelTemplate(**ESTIMATE_TEMPLATE)
            session.add(template)
            await session.flush()
            template_id = template.id
            print(f"✅ テンプレート登録: {template.name} (id={template_id})")

        # セルマッピング登録
        result = await session.execute(
            select(CellMapping).where(CellMapping.template_id == template_id)
        )
        existing_mappings = result.scalars().all()

        if existing_mappings:
            print(f"ℹ️  セルマッピング {len(existing_mappings)}件 は既に登録済み")
        else:
            for m in CELL_MAPPINGS:
                mapping = CellMapping(template_id=template_id, **m)
                session.add(mapping)
            print(f"✅ セルマッピング登録: {len(CELL_MAPPINGS)}件")

        await session.commit()

    # 統計
    async with async_session_maker() as session:
        t_count = (await session.execute(select(ExcelTemplate))).scalars().all()
        m_count = (await session.execute(select(CellMapping))).scalars().all()
        print(f"\n📊 DB統計: テンプレート={len(t_count)}, マッピング={len(m_count)}")


async def main(seed: bool = False):
    print("=" * 50)
    print("Excel帳票エンジン - DB初期化")
    print("=" * 50)

    await init_db()
    await create_tables()

    if seed:
        await seed_data()

    print("\n🎉 初期化完了!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DB初期化スクリプト")
    parser.add_argument("--seed", action="store_true", help="テンプレート & マッピングを登録")
    args = parser.parse_args()

    asyncio.run(main(seed=args.seed))
