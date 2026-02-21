/**
 * バックエンドAPI設定
 *
 * 帳票エンジン（FastAPI）のエンドポイント設定を管理します。
 */

/** バックエンドAPIのベースURL */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/** APIバージョンプレフィックス */
export const API_V1 = `${API_BASE_URL}/api/v1`;

/** エンドポイント定義 */
export const ENDPOINTS = {
  /** Excel生成: POST /api/v1/generate/{slug} */
  generate: (slug: string) => `${API_V1}/generate/${slug}`,
  /** テンプレート一覧: GET /api/v1/templates */
  templates: `${API_V1}/templates`,
  /** 署名付きダウンロード: GET /api/v1/download/{token} */
  download: (token: string) => `${API_V1}/download/${token}`,
  /** ヘルスチェック: GET /health */
  health: `${API_BASE_URL}/health`,
} as const;

/** バックエンドが利用可能かチェック（タイムアウト2秒） */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(ENDPOINTS.health, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
