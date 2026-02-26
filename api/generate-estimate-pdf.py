"""Vercel Serverless Function: 見積書PDF生成"""
from http.server import BaseHTTPRequestHandler
import json, os, io
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Any
from fpdf import FPDF

# フォントパス検索
_FONT_PATH: Optional[str] = None
for _p in [
    "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    # Vercel Lambda にはフォントがない場合がある → _has_jp = False で Helvetica フォールバック
]:
    if Path(_p).exists():
        _FONT_PATH = _p
        break


class _EstimatePDF(FPDF):
    def __init__(self, font_path: Optional[str] = None):
        super().__init__(orientation="P", unit="mm", format="A4")
        self._has_jp = False
        if font_path and Path(font_path).exists():
            self.add_font("DroidJP", "", font_path)
            self.add_font("DroidJP", "B", font_path)
            self._has_jp = True
        self.set_auto_page_break(auto=False)

    def _jp(self, size: int = 9, bold: bool = False):
        if self._has_jp:
            self.set_font("DroidJP", "B" if bold else "", size)
        else:
            self.set_font("Helvetica", "B" if bold else "", size)

    def _ascii(self, size: int = 9, bold: bool = False):
        self.set_font("Helvetica", "B" if bold else "", size)

    @staticmethod
    def _fmt(val: Any) -> str:
        if val is None or val == 0 or val == "":
            return ""
        return f"{int(val):,}"


def _build_estimate_pdf(data: dict) -> bytes:
    pdf = _EstimatePDF(font_path=_FONT_PATH)

    customer = data.get("customer_name", "")
    today_str = data.get("estimate_date", datetime.now().strftime("%Y-%m-%d"))
    expiry = ""
    try:
        dt = datetime.fromisoformat(today_str)
        expiry = (dt + timedelta(days=30)).strftime("%Y-%m-%d")
    except Exception:
        expiry = ""

    # オプション工事明細
    opt_labels = [
        "仮設工事", "基礎工事", "躯体工事", "屋根・板金工事", "外壁工事",
        "建具工事", "内装工事", "電気設備工事", "給排水衛生設備", "空調換気設備",
    ]
    opt_keys = [f"opt_{i:02d}_amount" for i in range(1, 11)]
    opt_items = [(lbl, data.get(k)) for lbl, k in zip(opt_labels, opt_keys)]

    # 付帯工事明細
    fut_labels = [
        "付帯工事", "諸経費", "エアコン工事", "防水工事",
        "太陽光", "蓄電池", "EV充電器", "外構工事",
    ]
    fut_keys = [f"futai_{i:02d}_amount" for i in range(1, 9)]
    fut_items = [(lbl, data.get(k)) for lbl, k in zip(fut_labels, fut_keys)]

    # 金額集計
    body_price = data.get("body_price_detail") or data.get("body_price") or 0
    opt_total = sum(v or 0 for _, v in opt_items)
    fut_total = sum(v or 0 for _, v in fut_items)
    contract = (body_price or 0) + opt_total + fut_total
    tax = int(contract * 0.1)
    total = contract + tax

    if data.get("contract_amount"):
        contract = data["contract_amount"]
    if data.get("tax"):
        tax = data["tax"]
    if data.get("total_with_tax"):
        total = data["total_with_tax"]
    if data.get("option_subtotal"):
        opt_total = data["option_subtotal"]
    if data.get("futai_subtotal"):
        fut_total = data["futai_subtotal"]

    # ===== ページ1: 見積書サマリー =====
    pdf.add_page()

    pdf._jp(7)
    pdf.set_xy(120, 10); pdf.cell(20, 5, "見積番号", align="R")
    pdf._ascii(8)
    pdf.set_xy(140, 10); pdf.cell(50, 5, "No.0001", align="R")
    pdf._jp(7)
    pdf.set_xy(120, 15); pdf.cell(20, 5, "作成日", align="R")
    pdf._ascii(8)
    pdf.set_xy(140, 15); pdf.cell(50, 5, today_str, align="R")
    pdf._jp(7)
    pdf.set_xy(120, 20); pdf.cell(20, 5, "有効期限", align="R")
    pdf._ascii(8)
    pdf.set_xy(140, 20); pdf.cell(50, 5, expiry, align="R")

    pdf._jp(18, bold=True)
    pdf.set_xy(15, 30); pdf.cell(170, 12, "御  見  積  書", align="C")

    pdf._jp(14)
    pdf.set_xy(20, 48); pdf.cell(80, 10, customer, align="L")
    pdf._jp(10)
    pdf.cell(10, 10, "様", align="L")
    pdf.line(20, 58, 110, 58)

    pdf.set_fill_color(245, 245, 245)
    pdf.set_draw_color(80)
    pdf.set_line_width(0.4)
    pdf.rect(20, 64, 170, 18, "FD")
    pdf.set_line_width(0.2)
    pdf._jp(10)
    pdf.set_xy(25, 67); pdf.cell(40, 5, "建物基本本体価格", align="L")
    pdf._ascii(20, bold=True)
    pdf.set_xy(70, 65); pdf.cell(90, 16, pdf._fmt(total), align="R")
    pdf._jp(10)
    pdf.set_xy(162, 74); pdf.cell(20, 5, "円（税込）", align="L")

    y = 90
    pdf._jp(10, bold=True)
    pdf.set_xy(25, y); pdf.cell(40, 7, "内訳", align="L")
    y += 10

    for label, val in [
        ("建物基本本体価格", body_price),
        ("オプション工事価格", opt_total),
        ("付帯工事価格", fut_total),
    ]:
        pdf._jp(9)
        pdf.set_xy(30, y); pdf.cell(60, 7, label, align="L")
        pdf._ascii(9)
        pdf.set_xy(100, y); pdf.cell(60, 7, pdf._fmt(val), align="R")
        pdf._jp(9)
        pdf.set_xy(162, y); pdf.cell(10, 7, "円", align="L")
        y += 8

    pdf.set_draw_color(0)
    pdf.line(30, y, 175, y)
    y += 4

    for label, val, bold in [
        ("小計", contract, False),
        ("消費税", tax, False),
    ]:
        pdf._jp(9, bold=bold)
        pdf.set_xy(30, y); pdf.cell(60, 7, label, align="L")
        pdf._ascii(9, bold=bold)
        pdf.set_xy(100, y); pdf.cell(60, 7, pdf._fmt(val), align="R")
        pdf._jp(9)
        pdf.set_xy(162, y); pdf.cell(10, 7, "円", align="L")
        y += 8

    pdf.set_line_width(0.5)
    pdf.line(30, y, 175, y)
    pdf.set_line_width(0.2)
    pdf.line(30, y + 1, 175, y + 1)
    y += 5

    pdf._jp(11, bold=True)
    pdf.set_xy(30, y); pdf.cell(60, 8, "請負金額", align="L")
    pdf._ascii(11, bold=True)
    pdf.set_xy(100, y); pdf.cell(60, 8, pdf._fmt(total), align="R")
    pdf._jp(11)
    pdf.set_xy(162, y); pdf.cell(10, 8, "円", align="L")
    y += 15

    # 床面積テーブル
    f1s = data.get("floor_1f_sqm")
    if f1s is not None:
        pdf._jp(9, bold=True)
        pdf.set_xy(25, y); pdf.cell(60, 7, "物件概要 / 床面積", align="L")
        y += 9
        pdf.set_fill_color(220, 225, 235)
        x0 = 30
        for label, w in [("", 20), ("㎡", 30), ("坪", 30)]:
            pdf._jp(8)
            pdf.set_xy(x0, y)
            pdf.cell(w, 6, label, border=1, align="C", fill=True)
            x0 += w
        y += 6

        for label, sqm, tsubo in [
            ("1F", data.get("floor_1f_sqm"), data.get("floor_1f_tsubo")),
            ("2F", data.get("floor_2f_sqm"), data.get("floor_2f_tsubo")),
            ("合計", data.get("floor_total_sqm"), data.get("floor_total_tsubo")),
        ]:
            x0 = 30
            pdf._jp(8)
            pdf.set_xy(x0, y); pdf.cell(20, 6, label, border=1, align="C")
            pdf._ascii(8)
            pdf.set_xy(x0 + 20, y); pdf.cell(30, 6, str(sqm) if sqm else "", border=1, align="R")
            pdf.set_xy(x0 + 50, y); pdf.cell(30, 6, str(tsubo) if tsubo else "", border=1, align="R")
            y += 6

    # ===== ページ2: 工事明細 =====
    pdf.add_page()
    y = 15

    def _detail_table(y_pos: int, title: str, items: list) -> int:
        pdf._jp(9, bold=True)
        pdf.set_xy(25, y_pos); pdf.cell(40, 7, title, align="L")
        y_pos += 8

        pdf.set_fill_color(200, 210, 230)
        pdf._jp(7)
        pdf.set_xy(25, y_pos); pdf.cell(65, 6, "工事内容", border=1, align="C", fill=True)
        pdf.set_xy(90, y_pos); pdf.cell(45, 6, "金額", border=1, align="C", fill=True)
        y_pos += 6

        subtotal = 0
        for name, amount in items:
            if amount is None or amount == 0:
                continue
            pdf._jp(8)
            pdf.set_xy(25, y_pos); pdf.cell(65, 7, name, border=1, align="L")
            pdf._ascii(8)
            pdf.set_xy(90, y_pos); pdf.cell(45, 7, pdf._fmt(amount), border=1, align="R")
            subtotal += amount
            y_pos += 7

        pdf.set_fill_color(240, 240, 240)
        pdf._jp(8, bold=True)
        pdf.set_xy(25, y_pos); pdf.cell(65, 7, f"{title}  小計", border=1, align="R", fill=True)
        pdf._ascii(8, bold=True)
        pdf.set_xy(90, y_pos); pdf.cell(45, 7, pdf._fmt(subtotal), border=1, align="R", fill=True)
        return y_pos + 12

    active_opts = [(n, a) for n, a in opt_items if a and a > 0]
    if active_opts:
        y = _detail_table(y, "オプション工事", active_opts)

    active_futs = [(n, a) for n, a in fut_items if a and a > 0]
    if active_futs:
        y = _detail_table(y, "付帯工事", active_futs)

    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length)) if content_length else {}

        try:
            pdf_bytes = _build_estimate_pdf(body)
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        safe_name = (body.get("customer_name") or "見積書").replace("/", "_").replace("\\", "_")
        filename = f"見積書_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"

        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(pdf_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(pdf_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
