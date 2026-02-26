import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    app: "Builder OS 見積書API (Vercel)",
    version: "2.0.0",
  });
}
