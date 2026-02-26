import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

// フォント検索
function findFont(): string | null {
  const candidates = [
    path.join(process.cwd(), "api", "DroidSansFallbackFull.ttf"),
    path.join(process.cwd(), "public", "DroidSansFallbackFull.ttf"),
    "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function fmt(val: unknown): string {
  if (val === null || val === undefined || val === 0 || val === "") return "";
  return Number(val).toLocaleString("ja-JP");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fontPath = findFont();

    const customer = body.customer_name || "";
    const todayStr = body.estimate_date || new Date().toISOString().slice(0, 10);
    let expiry = "";
    try {
      const dt = new Date(todayStr);
      dt.setDate(dt.getDate() + 30);
      expiry = dt.toISOString().slice(0, 10);
    } catch { /* ignore */ }

    // オプション工事
    const optLabels = ["仮設工事", "基礎工事", "躯体工事", "屋根・板金工事", "外壁工事", "建具工事", "内装工事", "電気設備工事", "給排水衛生設備", "空調換気設備"];
    const optItems = optLabels.map((lbl, i) => ({ label: lbl, amount: body[`opt_${String(i + 1).padStart(2, "0")}_amount`] || 0 }));

    // 付帯工事
    const futLabels = ["付帯工事", "諸経費", "エアコン工事", "防水工事", "太陽光", "蓄電池", "EV充電器", "外構工事"];
    const futItems = futLabels.map((lbl, i) => ({ label: lbl, amount: body[`futai_${String(i + 1).padStart(2, "0")}_amount`] || 0 }));

    // 金額集計
    const bodyPrice = body.body_price_detail || body.body_price || 0;
    let optTotal = optItems.reduce((s, it) => s + (it.amount || 0), 0);
    let futTotal = futItems.reduce((s, it) => s + (it.amount || 0), 0);
    let contract = bodyPrice + optTotal + futTotal;
    let tax = Math.round(contract * 0.1);
    let total = contract + tax;
    if (body.contract_amount) contract = body.contract_amount;
    if (body.tax) tax = body.tax;
    if (body.total_with_tax) total = body.total_with_tax;
    if (body.option_subtotal) optTotal = body.option_subtotal;
    if (body.futai_subtotal) futTotal = body.futai_subtotal;

    // PDF生成
    const doc = new PDFDocument({ size: "A4", margin: 20, autoFirstPage: false });

    // フォント登録
    if (fontPath) {
      doc.registerFont("JP", fontPath);
    }
    const jpFont = fontPath ? "JP" : "Helvetica";

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const pdfDone = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // ===== ページ1: 見積書サマリー =====
    doc.addPage();

    // ヘッダー右上
    doc.font(jpFont).fontSize(7);
    doc.text("見積番号", 400, 30, { width: 60, align: "right" });
    doc.font("Helvetica").fontSize(8);
    doc.text("No.0001", 460, 30, { width: 100, align: "right" });
    doc.font(jpFont).fontSize(7);
    doc.text("作成日", 400, 45, { width: 60, align: "right" });
    doc.font("Helvetica").fontSize(8);
    doc.text(todayStr, 460, 45, { width: 100, align: "right" });
    doc.font(jpFont).fontSize(7);
    doc.text("有効期限", 400, 60, { width: 60, align: "right" });
    doc.font("Helvetica").fontSize(8);
    doc.text(expiry, 460, 60, { width: 100, align: "right" });

    // タイトル
    doc.font(jpFont).fontSize(20);
    doc.text("御  見  積  書", 50, 90, { width: 500, align: "center" });

    // お客様名
    doc.font(jpFont).fontSize(14);
    doc.text(customer, 50, 140, { continued: true });
    doc.fontSize(10).text("  様");
    doc.moveTo(50, 165).lineTo(300, 165).stroke();

    // 見積金額ボックス
    doc.save();
    doc.rect(50, 180, 500, 50).fillAndStroke("#f5f5f5", "#555");
    doc.restore();
    doc.font(jpFont).fontSize(10).fillColor("black");
    doc.text("建物基本本体価格", 60, 195);
    doc.font("Helvetica").fontSize(22);
    doc.text(fmt(total), 200, 190, { width: 300, align: "right" });
    doc.font(jpFont).fontSize(10);
    doc.text("円（税込）", 505, 210);

    // 内訳
    let y = 250;
    doc.font(jpFont).fontSize(11);
    doc.text("内訳", 60, y);
    y += 20;

    for (const [label, val] of [
      ["建物基本本体価格", bodyPrice],
      ["オプション工事価格", optTotal],
      ["付帯工事価格", futTotal],
    ] as [string, number][]) {
      doc.font(jpFont).fontSize(9);
      doc.text(label, 70, y, { width: 150 });
      doc.font("Helvetica").fontSize(9);
      doc.text(fmt(val), 250, y, { width: 180, align: "right" });
      doc.font(jpFont).fontSize(9);
      doc.text("円", 440, y);
      y += 18;
    }

    doc.moveTo(70, y).lineTo(480, y).stroke();
    y += 8;

    for (const [label, val] of [["小計", contract], ["消費税", tax]] as [string, number][]) {
      doc.font(jpFont).fontSize(9);
      doc.text(label, 70, y, { width: 150 });
      doc.font("Helvetica").fontSize(9);
      doc.text(fmt(val), 250, y, { width: 180, align: "right" });
      doc.font(jpFont).fontSize(9);
      doc.text("円", 440, y);
      y += 18;
    }

    // 二重線
    doc.lineWidth(1.5).moveTo(70, y).lineTo(480, y).stroke();
    doc.lineWidth(0.5).moveTo(70, y + 2).lineTo(480, y + 2).stroke();
    y += 10;

    // 請負金額
    doc.font(jpFont).fontSize(12);
    doc.text("請負金額", 70, y, { width: 150 });
    doc.font("Helvetica").fontSize(12);
    doc.text(fmt(total), 250, y, { width: 180, align: "right" });
    doc.font(jpFont).fontSize(12);
    doc.text("円", 440, y);
    y += 30;

    // 床面積テーブル
    if (body.floor_1f_sqm !== undefined) {
      doc.font(jpFont).fontSize(10);
      doc.text("物件概要 / 床面積", 60, y);
      y += 18;

      const colX = [70, 130, 210];
      const colW = [60, 80, 80];
      // ヘッダー
      doc.save().rect(colX[0], y, colW[0], 16).rect(colX[1], y, colW[1], 16).rect(colX[2], y, colW[2], 16).fillAndStroke("#dce1eb", "black").restore();
      doc.font(jpFont).fontSize(8).fillColor("black");
      doc.text("", colX[0], y + 4, { width: colW[0], align: "center" });
      doc.text("㎡", colX[1], y + 4, { width: colW[1], align: "center" });
      doc.text("坪", colX[2], y + 4, { width: colW[2], align: "center" });
      y += 16;

      for (const [label, sqm, tsubo] of [
        ["1F", body.floor_1f_sqm, body.floor_1f_tsubo],
        ["2F", body.floor_2f_sqm, body.floor_2f_tsubo],
        ["合計", body.floor_total_sqm, body.floor_total_tsubo],
      ] as [string, number, number][]) {
        doc.rect(colX[0], y, colW[0], 16).rect(colX[1], y, colW[1], 16).rect(colX[2], y, colW[2], 16).stroke();
        doc.font(jpFont).fontSize(8);
        doc.text(label, colX[0], y + 4, { width: colW[0], align: "center" });
        doc.font("Helvetica").fontSize(8);
        doc.text(sqm ? String(sqm) : "", colX[1], y + 4, { width: colW[1], align: "right" });
        doc.text(tsubo ? String(tsubo) : "", colX[2], y + 4, { width: colW[2], align: "right" });
        y += 16;
      }
    }

    // ===== ページ2: 工事明細 =====
    doc.addPage();
    y = 30;

    function detailTable(title: string, items: { label: string; amount: number }[]): void {
      const active = items.filter(it => it.amount && it.amount > 0);
      if (active.length === 0) return;

      doc.font(jpFont).fontSize(10);
      doc.text(title, 60, y);
      y += 16;

      // ヘッダー
      doc.save().rect(60, y, 180, 16).rect(240, y, 130, 16).fillAndStroke("#c8d2e6", "black").restore();
      doc.font(jpFont).fontSize(7).fillColor("black");
      doc.text("工事内容", 60, y + 4, { width: 180, align: "center" });
      doc.text("金額", 240, y + 4, { width: 130, align: "center" });
      y += 16;

      let subtotal = 0;
      for (const item of active) {
        doc.rect(60, y, 180, 18).rect(240, y, 130, 18).stroke();
        doc.font(jpFont).fontSize(8);
        doc.text(item.label, 65, y + 5, { width: 170 });
        doc.font("Helvetica").fontSize(8);
        doc.text(fmt(item.amount), 245, y + 5, { width: 120, align: "right" });
        subtotal += item.amount;
        y += 18;
      }

      // 小計行
      doc.save().rect(60, y, 180, 18).rect(240, y, 130, 18).fillAndStroke("#f0f0f0", "black").restore();
      doc.font(jpFont).fontSize(8).fillColor("black");
      doc.text(`${title}  小計`, 65, y + 5, { width: 170, align: "right" });
      doc.font("Helvetica").fontSize(8);
      doc.text(fmt(subtotal), 245, y + 5, { width: 120, align: "right" });
      y += 28;
    }

    detailTable("オプション工事", optItems);
    detailTable("付帯工事", futItems);

    doc.end();

    const pdfBuffer = await pdfDone;

    const safeName = (body.customer_name || "見積書").replace(/[/\\]/g, "_");
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `見積書_${safeName}_${date}.pdf`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="estimate.pdf"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (e) {
    console.error("PDF生成エラー:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
