/**
 * Excel帳票エンジン APIクライアント
 *
 * バックエンドの帳票エンジン（FastAPI + OpenPyXL）へのリクエストを管理します。
 * バックエンド未起動時はクライアントサイド（SheetJS）にフォールバックします。
 */

import { ENDPOINTS, isBackendAvailable } from "./config";

// ============================================================
// 型定義
// ============================================================

/** 見積書生成リクエスト */
export interface EstimateRequest {
  customer_name: string;
  body_price: number;
  option_total: number;
  futai_total: number;
  contract_amount: number;
  tax: number;
  total_with_tax: number;
  total_with_tax_2: number;
  body_price_detail: number;
  // オプション工事明細
  opt_01_amount: number;
  opt_02_amount: number;
  opt_03_amount: number;
  opt_04_amount: number;
  opt_05_amount: number;
  opt_06_amount: number;
  opt_07_amount: number;
  opt_08_amount: number;
  opt_09_amount: number;
  opt_10_amount: number;
  option_subtotal: number;
  // 付帯工事明細
  futai_01_amount: number;
  futai_02_amount: number;
  futai_03_amount: number;
  futai_04_amount: number;
  futai_05_amount: number;
  futai_06_amount: number;
  futai_07_amount: number;
  futai_08_amount: number;
  futai_subtotal: number;
  // 床面積
  floor_1f_sqm: number;
  floor_1f_tsubo: number;
  floor_2f_sqm: number;
  floor_2f_tsubo: number;
  floor_total_sqm: number;
  floor_total_tsubo: number;
}

/** 生成レスポンス */
export interface GenerateResponse {
  history_id: number;
  status: "completed" | "failed";
  file_size?: number;
  download_url?: string;
  error_message?: string;
}

// ============================================================
// バックエンドAPI呼び出し
// ============================================================

/**
 * バックエンドAPIで見積書Excelを生成
 *
 * @param slug テンプレートスラッグ（例: "estimate-v2"）
 * @param data セルマッピングデータ
 * @param tenantId テナントID
 * @returns 生成レスポンス（ダウンロードURL付き）
 */
export async function generateEstimateViaAPI(
  slug: string,
  data: EstimateRequest,
  tenantId: number = 1
): Promise<GenerateResponse> {
  const res = await fetch(ENDPOINTS.generate(slug), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-ID": String(tenantId),
    },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "API Error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * 署名付きURLからExcelファイルをダウンロード
 *
 * @param downloadUrl ダウンロードURL
 * @param filename 保存ファイル名
 */
export async function downloadFromSignedUrl(
  downloadUrl: string,
  filename: string
): Promise<void> {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// ハイブリッド生成（バックエンド優先 → クライアントフォールバック）
// ============================================================

/**
 * 予算データからEstimateRequestを構築
 *
 * DemoDashboardの budgetResult / extResult から
 * バックエンドAPI用のデータ形式に変換します。
 */
export function buildEstimateRequest(
  name: string,
  mainItems: { category: string; amount: number }[],
  futaiItems: { category: string; amount: number }[],
  tsubo: number,
  buildingType: string
): EstimateRequest {
  const optionTotal =
    mainItems.reduce((s, it) => s + Math.round(it.amount * 1.3), 0) * 10000;
  const futaiTotal =
    futaiItems.reduce((s, it) => s + Math.round(it.amount * 1.3), 0) * 10000;
  const bodyPrice = 0;
  const contractAmt = optionTotal + futaiTotal;
  const tax = Math.round(contractAmt * 0.1);
  const totalWithTax = contractAmt + tax;

  // オプション工事の順序マッピング（mainItemsの配列位置 → opt_NN_amount）
  const optAmounts = Array(10).fill(0);
  mainItems.forEach((it, i) => {
    if (i < 10) optAmounts[i] = Math.round(it.amount * 1.3) * 10000;
  });

  // 付帯工事のカテゴリマッピング
  const futaiMap: Record<string, number> = {
    付帯工事: 0,
    諸経費: 1,
    エアコン: 2,
    防水工事: 3,
    太陽光: 4,
    蓄電池: 5,
    EV充電器: 6,
    外構工事: 7,
  };
  const futaiAmounts = Array(8).fill(0);
  futaiItems.forEach((it) => {
    const idx = futaiMap[it.category];
    if (idx !== undefined)
      futaiAmounts[idx] = Math.round(it.amount * 1.3) * 10000;
  });

  // 床面積計算
  const t = tsubo || 30;
  const is1f = buildingType === "平屋";

  return {
    customer_name: name + " 様",
    body_price: bodyPrice,
    option_total: optionTotal,
    futai_total: futaiTotal,
    contract_amount: contractAmt,
    tax,
    total_with_tax: totalWithTax,
    total_with_tax_2: totalWithTax,
    body_price_detail: bodyPrice,
    opt_01_amount: optAmounts[0],
    opt_02_amount: optAmounts[1],
    opt_03_amount: optAmounts[2],
    opt_04_amount: optAmounts[3],
    opt_05_amount: optAmounts[4],
    opt_06_amount: optAmounts[5],
    opt_07_amount: optAmounts[6],
    opt_08_amount: optAmounts[7],
    opt_09_amount: optAmounts[8],
    opt_10_amount: optAmounts[9],
    option_subtotal: optionTotal,
    futai_01_amount: futaiAmounts[0],
    futai_02_amount: futaiAmounts[1],
    futai_03_amount: futaiAmounts[2],
    futai_04_amount: futaiAmounts[3],
    futai_05_amount: futaiAmounts[4],
    futai_06_amount: futaiAmounts[5],
    futai_07_amount: futaiAmounts[6],
    futai_08_amount: futaiAmounts[7],
    futai_subtotal: futaiTotal,
    floor_1f_sqm: is1f ? Math.round(t * 3.3) : Math.round(t * 3.3 * 0.55),
    floor_1f_tsubo: is1f
      ? Math.round(t * 10) / 10
      : Math.round(t * 0.55 * 10) / 10,
    floor_2f_sqm: is1f ? 0 : Math.round(t * 3.3 * 0.45),
    floor_2f_tsubo: is1f ? 0 : Math.round(t * 0.45 * 10) / 10,
    floor_total_sqm: Math.round(t * 3.3),
    floor_total_tsubo: t,
  };
}

/**
 * ハイブリッド見積書生成
 *
 * 1. バックエンドAPIが利用可能ならAPIで生成 → 署名付きURLでダウンロード
 * 2. バックエンド未起動時はクライアントサイド（SheetJS）で生成
 *
 * @returns "api" | "client" — どちらの方式で生成したか
 */
export async function generateEstimateHybrid(
  name: string,
  mainItems: { category: string; amount: number }[],
  futaiItems: { category: string; amount: number }[],
  tsubo: number,
  buildingType: string,
  clientSideFallback: () => Promise<void>
): Promise<"api" | "client"> {
  // バックエンド利用可能か確認
  const backendOk = await isBackendAvailable();

  if (backendOk) {
    try {
      const req = buildEstimateRequest(
        name,
        mainItems,
        futaiItems,
        tsubo,
        buildingType
      );
      const resp = await generateEstimateViaAPI("estimate-v2", req);
      if (resp.status === "completed" && resp.download_url) {
        const filename = `見積書_${name}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        await downloadFromSignedUrl(resp.download_url, filename);
        return "api";
      }
    } catch (err) {
      console.warn("バックエンドAPI失敗、クライアントサイドにフォールバック:", err);
    }
  }

  // クライアントサイドフォールバック
  await clientSideFallback();
  return "client";
}

export { isBackendAvailable };
