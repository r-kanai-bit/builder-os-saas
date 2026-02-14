"use client";

import { useState } from "react";
import Link from "next/link";

const tools = [
  { id: "construction-ledger", name: "工事台帳", icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z", color: "#3b82f6" },
  { id: "estimate", name: "見積作成", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
  { id: "budget", name: "実行予算", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#f59e0b" },
  { id: "order", name: "発注管理", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", color: "#ef4444" },
  { id: "schedule", name: "工程管理", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", color: "#8b5cf6" },
  { id: "payment", name: "入金管理", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", color: "#06b6d4" },
  { id: "cost", name: "原価管理", icon: "M22 12h-4l-3 9L9 3l-3 9H2", color: "#ec4899" },
  { id: "daily-report", name: "日報管理", icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z", color: "#14b8a6" },
  { id: "photo", name: "写真管理", icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", color: "#f97316" },
  { id: "customer", name: "顧客管理", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", color: "#6366f1" },
  { id: "after-service", name: "アフター管理", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3", color: "#84cc16" },
  { id: "document", name: "書類管理", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", color: "#a855f7" },
  { id: "vendor", name: "業者管理", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", color: "#0ea5e9" },
  { id: "analytics", name: "経営分析", icon: "M18 20V10 M12 20V4 M6 20v-6", color: "#e11d48" },
];

const demoUser = {
  email: "demo@builder-os.jp",
  companyName: "株式会社デモ建設",
};

// ============ ツール画面コンポーネント ============

function ToolHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-text-main">{title}</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-sm font-bold text-white rounded-lg" style={{ backgroundColor: color }}>
          + 新規作成
        </button>
        <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-gray-50">
          エクスポート
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "進行中": "bg-blue-100 text-blue-700",
    "完了": "bg-green-100 text-green-700",
    "保留": "bg-yellow-100 text-yellow-700",
    "未着手": "bg-gray-100 text-gray-600",
    "承認済": "bg-green-100 text-green-700",
    "下書き": "bg-gray-100 text-gray-600",
    "送付済": "bg-blue-100 text-blue-700",
    "未入金": "bg-red-100 text-red-700",
    "入金済": "bg-green-100 text-green-700",
    "一部入金": "bg-yellow-100 text-yellow-700",
    "対応中": "bg-blue-100 text-blue-700",
    "対応済": "bg-green-100 text-green-700",
    "要対応": "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-bold text-text-sub whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConstructionLedger() {
  return (
    <>
      <ToolHeader title="工事台帳" color="#3b82f6" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "進行中", value: "12件", color: "#3b82f6" },
          { label: "今月完了", value: "3件", color: "#10b981" },
          { label: "受注総額", value: "¥285M", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <DataTable
        headers={["工事番号", "工事名", "発注者", "請負金額", "進捗", "状態"]}
        rows={[
          ["K-2026-001", "○○マンション新築工事", "○○不動産", "¥128,500,000", "65%", <StatusBadge key="s1" status="進行中" />],
          ["K-2026-002", "△△ビル改修工事", "△△商事", "¥45,000,000", "30%", <StatusBadge key="s2" status="進行中" />],
          ["K-2026-003", "□□住宅リフォーム", "□□様", "¥8,500,000", "75%", <StatusBadge key="s3" status="進行中" />],
          ["K-2026-004", "●●商業施設外構工事", "●●開発", "¥32,000,000", "90%", <StatusBadge key="s4" status="進行中" />],
          ["K-2025-012", "◎◎事務所ビル新築", "◎◎建設", "¥68,000,000", "100%", <StatusBadge key="s5" status="完了" />],
        ]}
      />
    </>
  );
}

function Estimate() {
  return (
    <>
      <ToolHeader title="見積作成" color="#10b981" />
      <DataTable
        headers={["見積番号", "件名", "提出先", "金額", "提出日", "状態"]}
        rows={[
          ["E-2026-045", "△△ビル空調更新工事", "△△商事", "¥12,800,000", "2026/02/10", <StatusBadge key="s1" status="送付済" />],
          ["E-2026-044", "○○邸外壁塗装工事", "○○様", "¥3,200,000", "2026/02/08", <StatusBadge key="s2" status="承認済" />],
          ["E-2026-043", "□□倉庫改修工事", "□□物流", "¥18,500,000", "2026/02/05", <StatusBadge key="s3" status="下書き" />],
          ["E-2026-042", "●●店舗内装工事", "●●フーズ", "¥7,600,000", "2026/02/01", <StatusBadge key="s4" status="承認済" />],
          ["E-2026-041", "◎◎マンション防水工事", "◎◎管理組合", "¥5,400,000", "2026/01/28", <StatusBadge key="s5" status="送付済" />],
        ]}
      />
    </>
  );
}

function Budget() {
  return (
    <>
      <ToolHeader title="実行予算" color="#f59e0b" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "予算総額", value: "¥285M" },
          { label: "実行額", value: "¥198M" },
          { label: "残予算", value: "¥87M" },
          { label: "予算消化率", value: "69.5%" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-xl font-black text-text-main">{s.value}</p>
          </div>
        ))}
      </div>
      <DataTable
        headers={["工事名", "請負額", "予算額", "実績額", "差額", "消化率"]}
        rows={[
          ["○○マンション新築", "¥128.5M", "¥98.5M", "¥72.3M", <span key="d1" className="text-green-600 font-bold">+¥26.2M</span>, "73.4%"],
          ["△△ビル改修", "¥45.0M", "¥36.0M", "¥12.8M", <span key="d2" className="text-green-600 font-bold">+¥23.2M</span>, "35.6%"],
          ["□□住宅リフォーム", "¥8.5M", "¥6.8M", "¥5.9M", <span key="d3" className="text-green-600 font-bold">+¥0.9M</span>, "86.8%"],
          ["●●商業施設外構", "¥32.0M", "¥25.6M", "¥24.1M", <span key="d4" className="text-green-600 font-bold">+¥1.5M</span>, "94.1%"],
        ]}
      />
    </>
  );
}

function OrderManagement() {
  return (
    <>
      <ToolHeader title="発注管理" color="#ef4444" />
      <DataTable
        headers={["発注番号", "発注先", "工事名", "金額", "発注日", "納期", "状態"]}
        rows={[
          ["PO-2026-089", "ABC建材", "○○マンション", "¥3,200,000", "02/12", "02/28", <StatusBadge key="s1" status="進行中" />],
          ["PO-2026-088", "○○電気工業", "△△ビル", "¥8,500,000", "02/10", "03/15", <StatusBadge key="s2" status="進行中" />],
          ["PO-2026-087", "□□塗装店", "□□住宅", "¥1,800,000", "02/08", "02/20", <StatusBadge key="s3" status="完了" />],
          ["PO-2026-086", "△△設備工業", "○○マンション", "¥12,000,000", "02/05", "03/31", <StatusBadge key="s4" status="進行中" />],
          ["PO-2026-085", "●●鉄工所", "●●商業施設", "¥4,500,000", "02/01", "02/15", <StatusBadge key="s5" status="完了" />],
        ]}
      />
    </>
  );
}

function Schedule() {
  return (
    <>
      <ToolHeader title="工程管理" color="#8b5cf6" />
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">2026年2月 工程表</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">← 前月</button>
            <button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">次月 →</button>
          </div>
        </div>
        {[
          { name: "○○マンション新築", start: 0, width: 100, color: "#3b82f6", tasks: ["基礎工事", "鉄骨建方", "外壁工事"] },
          { name: "△△ビル改修", start: 10, width: 70, color: "#10b981", tasks: ["解体工事", "内装工事", "設備工事"] },
          { name: "□□住宅リフォーム", start: 5, width: 60, color: "#f59e0b", tasks: ["水回り", "内装", "外壁塗装"] },
          { name: "●●商業施設外構", start: 0, width: 50, color: "#ef4444", tasks: ["舗装工事", "植栽工事", "照明工事"] },
        ].map((project, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <p className="text-sm font-medium text-text-main mb-2">{project.name}</p>
            {project.tasks.map((task, j) => (
              <div key={j} className="flex items-center gap-3 mb-1">
                <span className="text-xs text-text-sub w-24 truncate">{task}</span>
                <div className="flex-1 bg-gray-100 rounded h-6 relative">
                  <div
                    className="h-6 rounded text-xs text-white flex items-center px-2 font-medium"
                    style={{
                      backgroundColor: project.color,
                      marginLeft: `${project.start + j * 15}%`,
                      width: `${project.width - j * 20}%`,
                      opacity: 0.7 + j * 0.1,
                    }}
                  >
                    {task}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function PaymentManagement() {
  return (
    <>
      <ToolHeader title="入金管理" color="#06b6d4" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "入金済", value: "¥142.5M", color: "#10b981" },
          { label: "未入金", value: "¥28.3M", color: "#ef4444" },
          { label: "今月入金予定", value: "¥18.7M", color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <DataTable
        headers={["工事名", "請求額", "入金額", "残額", "入金予定日", "状態"]}
        rows={[
          ["○○マンション（2月分）", "¥12,800,000", "¥0", "¥12,800,000", "2026/02/28", <StatusBadge key="s1" status="未入金" />],
          ["△△ビル（1月分）", "¥8,500,000", "¥8,500,000", "¥0", "2026/01/31", <StatusBadge key="s2" status="入金済" />],
          ["□□住宅（最終金）", "¥2,800,000", "¥1,400,000", "¥1,400,000", "2026/02/15", <StatusBadge key="s3" status="一部入金" />],
          ["●●商業施設（3期）", "¥9,600,000", "¥9,600,000", "¥0", "2026/02/10", <StatusBadge key="s4" status="入金済" />],
        ]}
      />
    </>
  );
}

function CostManagement() {
  return (
    <>
      <ToolHeader title="原価管理" color="#ec4899" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "請負総額", value: "¥214M" },
          { label: "原価合計", value: "¥163M" },
          { label: "粗利", value: "¥51M" },
          { label: "粗利率", value: "23.8%" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-xl font-black text-text-main">{s.value}</p>
          </div>
        ))}
      </div>
      <DataTable
        headers={["工事名", "請負額", "材料費", "労務費", "外注費", "経費", "原価計", "粗利率"]}
        rows={[
          ["○○マンション", "¥128.5M", "¥32.1M", "¥28.4M", "¥25.6M", "¥12.2M", "¥98.3M", <span key="r1" className="font-bold text-green-600">23.5%</span>],
          ["△△ビル改修", "¥45.0M", "¥11.3M", "¥9.8M", "¥8.5M", "¥4.2M", "¥33.8M", <span key="r2" className="font-bold text-green-600">24.9%</span>],
          ["□□住宅", "¥8.5M", "¥2.1M", "¥1.9M", "¥1.5M", "¥0.8M", "¥6.3M", <span key="r3" className="font-bold text-yellow-600">25.9%</span>],
          ["●●商業施設", "¥32.0M", "¥8.0M", "¥7.2M", "¥5.8M", "¥3.2M", "¥24.2M", <span key="r4" className="font-bold text-green-600">24.4%</span>],
        ]}
      />
    </>
  );
}

function DailyReport() {
  return (
    <>
      <ToolHeader title="日報管理" color="#14b8a6" />
      <DataTable
        headers={["日付", "現場名", "報告者", "天候", "作業内容", "人数", "状態"]}
        rows={[
          ["02/14", "○○マンション", "山田 太郎", "晴れ", "鉄骨建方 3F〜4F", "12名", <StatusBadge key="s1" status="承認済" />],
          ["02/14", "△△ビル", "佐藤 次郎", "晴れ", "内装解体工事", "8名", <StatusBadge key="s2" status="承認済" />],
          ["02/14", "□□住宅", "鈴木 三郎", "晴れ", "外壁塗装（下塗り）", "4名", <StatusBadge key="s3" status="進行中" />],
          ["02/13", "○○マンション", "山田 太郎", "曇り", "鉄骨建方 2F〜3F", "12名", <StatusBadge key="s4" status="承認済" />],
          ["02/13", "●●商業施設", "田中 四郎", "曇り", "舗装工事（アスファルト）", "6名", <StatusBadge key="s5" status="承認済" />],
        ]}
      />
    </>
  );
}

function PhotoManagement() {
  return (
    <>
      <ToolHeader title="写真管理" color="#f97316" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "総写真数", value: "2,847枚" },
          { label: "今月追加", value: "312枚" },
          { label: "工事件数", value: "12件" },
          { label: "容量", value: "4.2GB" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-lg font-black text-text-main">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">最近の写真</h3>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CustomerManagement() {
  return (
    <>
      <ToolHeader title="顧客管理" color="#6366f1" />
      <DataTable
        headers={["顧客名", "担当者", "電話番号", "メール", "累計取引額", "工事件数"]}
        rows={[
          ["○○不動産株式会社", "中村 部長", "03-1234-5678", "nakamura@example.co.jp", "¥256,000,000", "8件"],
          ["△△商事株式会社", "高橋 課長", "03-2345-6789", "takahashi@example.co.jp", "¥128,000,000", "5件"],
          ["□□様（個人）", "□□ 様", "090-1234-5678", "customer@example.com", "¥8,500,000", "1件"],
          ["●●開発株式会社", "伊藤 次長", "03-3456-7890", "ito@example.co.jp", "¥85,000,000", "3件"],
          ["◎◎管理組合", "渡辺 理事長", "03-4567-8901", "watanabe@example.co.jp", "¥42,000,000", "2件"],
        ]}
      />
    </>
  );
}

function AfterService() {
  return (
    <>
      <ToolHeader title="アフター管理" color="#84cc16" />
      <DataTable
        headers={["受付番号", "物件名", "顧客名", "内容", "受付日", "対応期限", "状態"]}
        rows={[
          ["AF-2026-023", "○○邸", "○○様", "雨漏り（2F寝室天井）", "02/13", "02/20", <StatusBadge key="s1" status="対応中" />],
          ["AF-2026-022", "△△マンション301号", "△△様", "クロス剥がれ（リビング）", "02/10", "02/17", <StatusBadge key="s2" status="対応済" />],
          ["AF-2026-021", "□□事務所", "□□商事", "空調効き不良（3F）", "02/08", "02/15", <StatusBadge key="s3" status="要対応" />],
          ["AF-2026-020", "●●邸", "●●様", "建具調整（玄関ドア）", "02/05", "02/12", <StatusBadge key="s4" status="対応済" />],
        ]}
      />
    </>
  );
}

function DocumentManagement() {
  return (
    <>
      <ToolHeader title="書類管理" color="#a855f7" />
      <DataTable
        headers={["ファイル名", "カテゴリ", "工事名", "更新日", "サイズ", "共有"]}
        rows={[
          ["設計図面_rev3.pdf", "図面", "○○マンション", "02/14", "12.5MB", "5人"],
          ["見積書_最終版.xlsx", "見積", "△△ビル改修", "02/13", "2.1MB", "3人"],
          ["工事写真帳_2月.pdf", "写真帳", "□□住宅", "02/12", "45.8MB", "4人"],
          ["安全管理計画書.docx", "安全書類", "○○マンション", "02/10", "1.8MB", "8人"],
          ["施工計画書.pdf", "計画書", "●●商業施設", "02/08", "8.3MB", "6人"],
          ["議事録_定例会.docx", "議事録", "△△ビル改修", "02/07", "0.5MB", "10人"],
        ]}
      />
    </>
  );
}

function VendorManagement() {
  return (
    <>
      <ToolHeader title="業者管理" color="#0ea5e9" />
      <DataTable
        headers={["業者名", "業種", "担当者", "電話番号", "評価", "取引額"]}
        rows={[
          ["ABC建材株式会社", "建材", "松本 営業部長", "03-1111-2222", "⭐ 4.8", "¥45,200,000"],
          ["○○電気工業", "電気工事", "井上 社長", "03-2222-3333", "⭐ 4.5", "¥32,100,000"],
          ["□□塗装店", "塗装", "小林 代表", "090-3333-4444", "⭐ 4.7", "¥18,500,000"],
          ["△△設備工業", "設備工事", "加藤 部長", "03-4444-5555", "⭐ 4.3", "¥28,600,000"],
          ["●●鉄工所", "鉄骨", "斎藤 社長", "03-5555-6666", "⭐ 4.6", "¥52,300,000"],
        ]}
      />
    </>
  );
}

function Analytics() {
  return (
    <>
      <ToolHeader title="経営分析" color="#e11d48" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "年間売上", value: "¥680M", change: "+12.3%" },
          { label: "年間粗利", value: "¥158M", change: "+8.7%" },
          { label: "平均粗利率", value: "23.2%", change: "+1.5%" },
          { label: "受注残", value: "¥420M", change: "+15.2%" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-sub">{s.label}</p>
            <p className="text-xl font-black text-text-main">{s.value}</p>
            <p className="text-xs text-green-600 font-bold mt-1">{s.change} 前年比</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm mb-4">月次売上推移</h3>
          <div className="flex items-end gap-2 h-40">
            {[42, 55, 48, 62, 58, 70, 65, 78, 72, 85, 68, 80].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${v}%` }} />
                <span className="text-[9px] text-text-sub">{i + 1}月</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm mb-4">工種別売上構成</h3>
          <div className="space-y-3">
            {[
              { name: "新築工事", percent: 45, color: "#3b82f6" },
              { name: "改修工事", percent: 25, color: "#10b981" },
              { name: "リフォーム", percent: 15, color: "#f59e0b" },
              { name: "外構工事", percent: 10, color: "#8b5cf6" },
              { name: "その他", percent: 5, color: "#6b7280" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.name}</span>
                  <span className="font-bold">{item.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ============ ダッシュボードホーム ============

function DashboardHome({ onToolSelect }: { onToolSelect: (id: string) => void }) {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4 M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-blue-800">デモモードで閲覧中</p>
            <p className="text-sm text-blue-600">左サイドバーまたは下のツールをクリックして各機能を確認できます</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "進行中の工事", value: "12", change: "+2", color: "#3b82f6" },
          { label: "今月の売上", value: "¥15.2M", change: "+8.3%", color: "#10b981" },
          { label: "未回収金額", value: "¥2.1M", change: "-12%", color: "#f59e0b" },
          { label: "今月の粗利率", value: "23.5%", change: "+1.2%", color: "#8b5cf6" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 sm:p-5">
            <p className="text-xs text-text-sub mb-1">{card.label}</p>
            <p className="text-xl sm:text-2xl font-black text-text-main">{card.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: card.color }}>
              {card.change} 前月比
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold text-text-main mb-4">ツール クイックアクセス</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="bg-white border border-border rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-transparent transition-all text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: tool.color + "15" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tool.icon} />
                </svg>
              </div>
              <p className="text-xs font-medium text-text-sub group-hover:text-text-main transition-colors">{tool.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-main mb-4">最近の更新</h3>
          <div className="space-y-3">
            {[
              { action: "日報提出", detail: "○○マンション新築工事 - 山田太郎", time: "10分前" },
              { action: "見積承認", detail: "△△ビル改修工事 - ¥4,500,000", time: "1時間前" },
              { action: "工程更新", detail: "□□住宅リフォーム - 完了率 75%", time: "2時間前" },
              { action: "入金確認", detail: "●●商業施設 - ¥8,200,000", time: "本日" },
              { action: "写真追加", detail: "○○マンション - 基礎工事 12枚", time: "昨日" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">{item.action}</span>
                  <span className="text-sm text-text-main">{item.detail}</span>
                </div>
                <span className="text-xs text-text-sub whitespace-nowrap ml-2">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text-main mb-4">工事進捗サマリー</h3>
          <div className="space-y-4">
            {[
              { name: "○○マンション新築工事", progress: 65 },
              { name: "△△ビル改修工事", progress: 30 },
              { name: "□□住宅リフォーム", progress: 75 },
              { name: "●●商業施設外構工事", progress: 90 },
            ].map((project, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-main font-medium">{project.name}</span>
                  <span className="text-xs text-text-sub">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: project.progress >= 80 ? "#10b981" : project.progress >= 50 ? "#3b82f6" : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ============ メインコンポーネント ============

const toolComponents: Record<string, React.FC> = {
  "construction-ledger": ConstructionLedger,
  "estimate": Estimate,
  "budget": Budget,
  "order": OrderManagement,
  "schedule": Schedule,
  "payment": PaymentManagement,
  "cost": CostManagement,
  "daily-report": DailyReport,
  "photo": PhotoManagement,
  "customer": CustomerManagement,
  "after-service": AfterService,
  "document": DocumentManagement,
  "vendor": VendorManagement,
  "analytics": Analytics,
};

export default function DemoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolSelect = (id: string) => {
    setActiveTool(id);
    setSidebarOpen(false);
  };

  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolInfo = tools.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-dark transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Builder OS</span>
            </div>
            <p className="text-xs text-white/50 mt-2 truncate">{demoUser.companyName}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => { setActiveTool(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTool === null ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              ダッシュボード
            </button>

            <div className="pt-3 pb-2">
              <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">ツール</p>
            </div>

            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTool === tool.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: tool.color + "30" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tool.icon} />
                  </svg>
                </div>
                {tool.name}
              </button>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{demoUser.email}</p>
                <p className="text-[10px] text-white/50">デモモード</p>
              </div>
            </div>
            <Link href="/" className="block w-full text-xs text-white/50 hover:text-white/80 transition-colors text-left">
              トップページに戻る
            </Link>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-text-sub hover:text-text-main">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-text-main">
              {activeToolInfo ? activeToolInfo.name : "ダッシュボード"}
            </h1>
            {activeTool && (
              <button
                onClick={() => setActiveTool(null)}
                className="text-xs text-text-sub hover:text-primary ml-2"
              >
                ← ダッシュボードに戻る
              </button>
            )}
          </div>
          <Link href="/" className="text-xs text-text-sub hover:text-primary transition-colors">
            トップページ
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {ActiveComponent ? <ActiveComponent /> : <DashboardHome onToolSelect={handleToolSelect} />}
        </main>
      </div>
    </div>
  );
}
