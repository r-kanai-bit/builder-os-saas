import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel Serverless にテンプレートファイル・フォントをバンドル
  outputFileTracingIncludes: {
    "/api/generate-estimate": ["./api/estimate_v2.xlsx", "./public/estimate_v2.xlsx"],
    "/api/generate-estimate-pdf": ["./api/DroidSansFallbackFull.ttf", "./public/DroidSansFallbackFull.ttf"],
  },
  // PDFKit の .afm ファイルをバンドルではなくランタイムで読み込む
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
