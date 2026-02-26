import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

// セルマッピング（36フィールド）
const CELL_MAPPINGS: Record<string, string> = {
  customer_name: "B5", estimate_date: "N5",
  total_with_tax_2: "K10",
  body_price: "N20", option_total: "N22", futai_total: "N24",
  contract_amount: "N27", tax: "N30", total_with_tax: "N33",
  body_price_detail: "X65",
  opt_01_amount: "U69", opt_02_amount: "U70", opt_03_amount: "U71",
  opt_04_amount: "U72", opt_05_amount: "U73", opt_06_amount: "U74",
  opt_07_amount: "U75", opt_08_amount: "U76", opt_09_amount: "U77",
  opt_10_amount: "U78", option_subtotal: "N82",
  futai_01_amount: "U86", futai_02_amount: "U87", futai_03_amount: "U88",
  futai_04_amount: "U89", futai_05_amount: "U90", futai_06_amount: "U91",
  futai_07_amount: "U92", futai_08_amount: "U93", futai_subtotal: "N96",
  floor_1f_sqm: "E48", floor_1f_tsubo: "I48",
  floor_2f_sqm: "E49", floor_2f_tsubo: "I49",
  floor_total_sqm: "E51", floor_total_tsubo: "I51",
};

// マージセルの左上セルを検出
function findMergeTopLeft(ws: ExcelJS.Worksheet, cellRef: string): string {
  // ExcelJS: worksheet.model.merges に結合セル範囲がある
  const merges: string[] = (ws.model as unknown as { merges?: string[] }).merges || [];
  for (const range of merges) {
    const [start, end] = range.split(":");
    // cellRef がこの範囲内にあるか簡易チェック
    const startCell = ws.getCell(start);
    const endCell = ws.getCell(end);
    const targetCell = ws.getCell(cellRef);
    if (
      targetCell.row >= startCell.row && targetCell.row <= endCell.row &&
      targetCell.col >= startCell.col && targetCell.col <= endCell.col
    ) {
      return start;
    }
  }
  return cellRef;
}

function safeWrite(ws: ExcelJS.Worksheet, cellRef: string, value: unknown): void {
  const topLeft = findMergeTopLeft(ws, cellRef);
  const cell = ws.getCell(topLeft);
  if (value !== null && value !== undefined) {
    cell.value = value as ExcelJS.CellValue;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // テンプレート読み込み
    // Vercel上では api/ ディレクトリのファイルを使用
    const templatePaths = [
      path.join(process.cwd(), "api", "estimate_v2.xlsx"),
      path.join(process.cwd(), "public", "estimate_v2.xlsx"),
      path.join(process.cwd(), "backend", "storage", "templates", "estimate_v2.xlsx"),
    ];

    let templatePath = "";
    for (const tp of templatePaths) {
      if (fs.existsSync(tp)) {
        templatePath = tp;
        break;
      }
    }

    if (!templatePath) {
      return NextResponse.json(
        { error: "テンプレートが見つかりません" },
        { status: 500 }
      );
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);
    const ws = wb.worksheets[0]; // 見積もりシート

    // セルマッピングに基づいてデータ埋め込み
    for (const [fieldName, cellRef] of Object.entries(CELL_MAPPINGS)) {
      const value = body[fieldName];
      if (value !== undefined && value !== null) {
        let writeValue: unknown = value;
        // 日付フィールド処理
        if (fieldName === "estimate_date" && typeof value === "string" && value) {
          writeValue = new Date(value);
        }
        safeWrite(ws, cellRef, writeValue);
      }
    }

    // バッファに書き出し
    const buffer = await wb.xlsx.writeBuffer();

    const safeName = (body.customer_name || "見積書").replace(/[/\\]/g, "_");
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `見積書_${safeName}_${date}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="estimate.xlsx"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (e) {
    console.error("Excel生成エラー:", e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
