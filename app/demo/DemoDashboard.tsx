"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ============ 型定義 ============

type FormFieldDef = { name: string; label: string; type: "text" | "number" | "date" | "select" | "textarea" | "file"; options?: string[]; placeholder?: string; required?: boolean };
type ToolDef = { id: string; name: string; icon: string; color: string };
type ToolProps = { onCreateNew?: () => void };

// ============ ツール定義（日報削除・写真→広告に変更） ============

const tools: ToolDef[] = [
  { id: "construction-ledger", name: "工事台帳", icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z", color: "#3b82f6" },
  { id: "estimate", name: "見積作成", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
  { id: "budget", name: "実行予算", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#f59e0b" },
  { id: "order", name: "資材発注", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", color: "#ef4444" },
  { id: "schedule", name: "工程スケジュール", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", color: "#8b5cf6" },
  { id: "payment", name: "入金管理", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", color: "#06b6d4" },
  { id: "cost", name: "原価管理", icon: "M22 12h-4l-3 9L9 3l-3 9H2", color: "#ec4899" },
  { id: "ad", name: "広告素材作成・広告効果測定", icon: "M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6", color: "#f97316" },
  { id: "customer", name: "顧客管理", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", color: "#6366f1" },
  { id: "after-service", name: "アフター管理", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3", color: "#84cc16" },
  { id: "document", name: "書類管理", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", color: "#a855f7" },
  { id: "vendor", name: "業者管理", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", color: "#0ea5e9" },
  { id: "analytics", name: "経営分析", icon: "M18 20V10 M12 20V4 M6 20v-6", color: "#e11d48" },
];

const demoUser = { email: "demo@builder-os.jp", companyName: "株式会社デモ建設" };

const projectOptions = ["○○マンション新築工事", "△△ビル改修工事", "□□住宅リフォーム", "●●商業施設外構工事"];

// ============ フォーム定義（全13ツール） ============

const formDefs: Record<string, { title: string; fields: FormFieldDef[] }> = {
  "construction-ledger": {
    title: "工事台帳 新規登録",
    fields: [
      { name: "name", label: "工事名", type: "text", placeholder: "例: ○○邸新築工事", required: true },
      { name: "client", label: "発注者", type: "text", placeholder: "例: ○○不動産株式会社", required: true },
      { name: "amount", label: "請負金額（税抜）", type: "number", placeholder: "例: 50000000" },
      { name: "start", label: "工事開始日", type: "date", required: true },
      { name: "end", label: "工事完了予定日", type: "date" },
      { name: "manager", label: "現場責任者", type: "text", placeholder: "例: 山田 太郎" },
      { name: "type", label: "工事種別", type: "select", options: ["新築", "改修", "リフォーム", "外構", "その他"] },
      { name: "note", label: "備考", type: "textarea", placeholder: "特記事項があれば入力" },
    ],
  },
  estimate: {
    title: "見積書 新規作成",
    fields: [
      { name: "subject", label: "件名", type: "text", placeholder: "例: ○○ビル空調更新工事", required: true },
      { name: "client", label: "提出先", type: "text", placeholder: "例: ○○商事株式会社", required: true },
      { name: "amount", label: "見積金額（税抜）", type: "number", placeholder: "例: 12000000" },
      { name: "deadline", label: "提出期限", type: "date" },
      { name: "validity", label: "有効期限", type: "select", options: ["30日間", "60日間", "90日間"] },
      { name: "note", label: "備考・条件", type: "textarea", placeholder: "見積条件・除外事項など" },
    ],
  },
  budget: {
    title: "実行予算 新規登録",
    fields: [
      { name: "project", label: "対象工事", type: "select", options: projectOptions, required: true },
      { name: "material", label: "材料費", type: "number", placeholder: "例: 30000000" },
      { name: "labor", label: "労務費", type: "number", placeholder: "例: 25000000" },
      { name: "outsource", label: "外注費", type: "number", placeholder: "例: 20000000" },
      { name: "expense", label: "経費", type: "number", placeholder: "例: 10000000" },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  order: {
    title: "発注書 新規作成",
    fields: [
      { name: "vendor", label: "発注先", type: "text", placeholder: "例: ABC建材株式会社", required: true },
      { name: "project", label: "工事名", type: "select", options: projectOptions, required: true },
      { name: "item", label: "発注内容", type: "text", placeholder: "例: 鉄骨材料一式", required: true },
      { name: "amount", label: "発注金額（税抜）", type: "number", placeholder: "例: 5000000" },
      { name: "orderDate", label: "発注日", type: "date", required: true },
      { name: "deliveryDate", label: "納期", type: "date", required: true },
      { name: "note", label: "発注条件・備考", type: "textarea" },
    ],
  },
  schedule: {
    title: "工程 新規登録",
    fields: [
      { name: "project", label: "対象工事", type: "select", options: projectOptions, required: true },
      { name: "task", label: "作業工程名", type: "text", placeholder: "例: 基礎配筋工事", required: true },
      { name: "start", label: "開始日", type: "date", required: true },
      { name: "end", label: "終了日", type: "date", required: true },
      { name: "assignee", label: "担当者", type: "text", placeholder: "例: 山田 太郎" },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  payment: {
    title: "入金 新規登録",
    fields: [
      { name: "project", label: "工事名", type: "select", options: projectOptions, required: true },
      { name: "invoiceAmount", label: "請求金額", type: "number", placeholder: "例: 12800000", required: true },
      { name: "paymentAmount", label: "入金金額", type: "number", placeholder: "例: 12800000" },
      { name: "dueDate", label: "入金予定日", type: "date", required: true },
      { name: "method", label: "入金方法", type: "select", options: ["銀行振込", "手形", "小切手", "現金", "その他"] },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  cost: {
    title: "原価 新規登録",
    fields: [
      { name: "project", label: "工事名", type: "select", options: projectOptions, required: true },
      { name: "category", label: "費目", type: "select", options: ["材料費", "労務費", "外注費", "経費"], required: true },
      { name: "item", label: "内容", type: "text", placeholder: "例: コンクリート打設", required: true },
      { name: "amount", label: "金額", type: "number", placeholder: "例: 3500000", required: true },
      { name: "date", label: "計上日", type: "date", required: true },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  ad: {
    title: "広告 新規作成",
    fields: [
      { name: "type", label: "広告種別", type: "select", options: ["リスティング広告", "SNS広告（Instagram）", "SNS広告（Facebook）", "チラシ・DM", "看板・サイン", "動画広告", "その他"], required: true },
      { name: "name", label: "キャンペーン名", type: "text", placeholder: "例: 春の新築キャンペーン2026", required: true },
      { name: "budget", label: "予算（円）", type: "number", placeholder: "例: 500000", required: true },
      { name: "start", label: "配信開始日", type: "date", required: true },
      { name: "end", label: "配信終了日", type: "date" },
      { name: "target", label: "ターゲットエリア", type: "text", placeholder: "例: 三重県津市・松阪市" },
      { name: "creative", label: "広告素材", type: "file" },
      { name: "note", label: "メモ", type: "textarea", placeholder: "訴求ポイント・備考" },
    ],
  },
  customer: {
    title: "顧客 新規登録",
    fields: [
      { name: "company", label: "会社名 / 氏名", type: "text", placeholder: "例: ○○不動産株式会社", required: true },
      { name: "contact", label: "担当者名", type: "text", placeholder: "例: 中村 太郎", required: true },
      { name: "phone", label: "電話番号", type: "text", placeholder: "例: 03-1234-5678" },
      { name: "email", label: "メールアドレス", type: "text", placeholder: "例: nakamura@example.co.jp" },
      { name: "address", label: "住所", type: "text", placeholder: "例: 東京都千代田区○○1-2-3" },
      { name: "type", label: "顧客種別", type: "select", options: ["法人", "個人", "管理組合", "官公庁"] },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  "after-service": {
    title: "アフター案件 新規登録",
    fields: [
      { name: "property", label: "物件名", type: "text", placeholder: "例: ○○邸", required: true },
      { name: "customer", label: "顧客名", type: "text", placeholder: "例: ○○様", required: true },
      { name: "content", label: "不具合内容", type: "textarea", placeholder: "例: 雨漏り（2F寝室天井から）", required: true },
      { name: "priority", label: "優先度", type: "select", options: ["緊急", "高", "中", "低"], required: true },
      { name: "dueDate", label: "対応期限", type: "date", required: true },
      { name: "assignee", label: "対応担当者", type: "text", placeholder: "例: 佐藤 次郎" },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  document: {
    title: "書類 アップロード",
    fields: [
      { name: "project", label: "工事名", type: "select", options: projectOptions, required: true },
      { name: "category", label: "カテゴリ", type: "select", options: ["図面", "見積", "計画書", "安全書類", "議事録", "契約書", "写真帳", "その他"], required: true },
      { name: "file", label: "ファイル", type: "file", required: true },
      { name: "note", label: "備考・説明", type: "textarea" },
    ],
  },
  vendor: {
    title: "業者 新規登録",
    fields: [
      { name: "company", label: "業者名", type: "text", placeholder: "例: ○○建材株式会社", required: true },
      { name: "type", label: "業種", type: "select", options: ["建材", "電気工事", "設備工事", "塗装", "鉄骨", "左官", "防水", "内装", "解体", "その他"], required: true },
      { name: "contact", label: "担当者名", type: "text", placeholder: "例: 松本 営業部長" },
      { name: "phone", label: "電話番号", type: "text", placeholder: "例: 03-1111-2222" },
      { name: "email", label: "メールアドレス", type: "text", placeholder: "例: matsumoto@example.co.jp" },
      { name: "note", label: "備考", type: "textarea" },
    ],
  },
  analytics: {
    title: "レポート生成",
    fields: [
      { name: "type", label: "レポート種別", type: "select", options: ["月次経営レポート", "粗利分析", "工事別収支", "業者別支払実績", "顧客別売上"], required: true },
      { name: "period", label: "対象期間", type: "select", options: ["今月", "先月", "今四半期", "前四半期", "今年度", "前年度"], required: true },
      { name: "format", label: "出力形式", type: "select", options: ["PDF", "Excel", "画面表示"] },
    ],
  },
};

// ============ 共通UIコンポーネント ============

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-text-main">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
      {message}
    </div>
  );
}

function CreateForm({ fields, onSubmit, color }: { fields: FormFieldDef[]; onSubmit: () => void; color: string }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-bold text-text-main mb-1.5">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" rows={3} placeholder={f.placeholder} required={f.required} />
          ) : f.type === "select" ? (
            <select className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" required={f.required}>
              <option value="">選択してください</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "file" ? (
            <div className="w-full px-4 py-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p className="text-xs text-text-sub">クリックしてファイルを選択</p>
            </div>
          ) : (
            <input type={f.type} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder={f.placeholder} required={f.required} />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button type="submit" className="flex-1 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
          保存する
        </button>
      </div>
    </form>
  );
}

function ToolHeader({ title, color, onCreateNew }: { title: string; color: string; onCreateNew?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-text-main">{title}</h2>
      <div className="flex gap-2">
        <button onClick={onCreateNew} className="px-4 py-2 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
          + 新規作成
        </button>
        <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-gray-50">エクスポート</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { "進行中": "bg-blue-100 text-blue-700", "完了": "bg-green-100 text-green-700", "承認済": "bg-green-100 text-green-700", "下書き": "bg-gray-100 text-gray-600", "送付済": "bg-blue-100 text-blue-700", "未入金": "bg-red-100 text-red-700", "入金済": "bg-green-100 text-green-700", "一部入金": "bg-yellow-100 text-yellow-700", "対応中": "bg-blue-100 text-blue-700", "対応済": "bg-green-100 text-green-700", "要対応": "bg-red-100 text-red-700", "配信中": "bg-blue-100 text-blue-700", "準備中": "bg-yellow-100 text-yellow-700", "終了": "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">{headers.map((h, i) => <th key={i} className="text-left px-4 py-3 text-xs font-bold text-text-sub whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer">{row.map((cell, j) => <td key={j} className="px-4 py-3 whitespace-nowrap">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

// ============ ツール画面 ============

function ConstructionLedger({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="工事台帳" color="#3b82f6" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "進行中", value: "12件", color: "#3b82f6" }, { label: "今月完了", value: "3件", color: "#10b981" }, { label: "受注総額", value: "¥285M", color: "#f59e0b" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事番号", "工事名", "発注者", "請負金額", "進捗", "状態"]} rows={[
      ["K-2026-001", "○○マンション新築工事", "○○不動産", "¥128,500,000", "65%", <StatusBadge key="1" status="進行中" />],
      ["K-2026-002", "△△ビル改修工事", "△△商事", "¥45,000,000", "30%", <StatusBadge key="2" status="進行中" />],
      ["K-2026-003", "□□住宅リフォーム", "□□様", "¥8,500,000", "75%", <StatusBadge key="3" status="進行中" />],
      ["K-2026-004", "●●商業施設外構工事", "●●開発", "¥32,000,000", "90%", <StatusBadge key="4" status="進行中" />],
      ["K-2025-012", "◎◎事務所ビル新築", "◎◎建設", "¥68,000,000", "100%", <StatusBadge key="5" status="完了" />],
    ]} />
  </>);
}

function Estimate({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="見積作成" color="#10b981" onCreateNew={onCreateNew} />
    <DataTable headers={["見積番号", "件名", "提出先", "金額", "提出日", "状態"]} rows={[
      ["E-2026-045", "△△ビル空調更新工事", "△△商事", "¥12,800,000", "2026/02/10", <StatusBadge key="1" status="送付済" />],
      ["E-2026-044", "○○邸外壁塗装工事", "○○様", "¥3,200,000", "2026/02/08", <StatusBadge key="2" status="承認済" />],
      ["E-2026-043", "□□倉庫改修工事", "□□物流", "¥18,500,000", "2026/02/05", <StatusBadge key="3" status="下書き" />],
      ["E-2026-042", "●●店舗内装工事", "●●フーズ", "¥7,600,000", "2026/02/01", <StatusBadge key="4" status="承認済" />],
    ]} />
  </>);
}

function Budget({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "予算総額", value: "¥285M" }, { label: "実行額", value: "¥198M" }, { label: "残予算", value: "¥87M" }, { label: "予算消化率", value: "69.5%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事名", "請負額", "予算額", "実績額", "差額", "消化率"]} rows={[
      ["○○マンション新築", "¥128.5M", "¥98.5M", "¥72.3M", <span key="1" className="text-green-600 font-bold">+¥26.2M</span>, "73.4%"],
      ["△△ビル改修", "¥45.0M", "¥36.0M", "¥12.8M", <span key="2" className="text-green-600 font-bold">+¥23.2M</span>, "35.6%"],
      ["□□住宅リフォーム", "¥8.5M", "¥6.8M", "¥5.9M", <span key="3" className="text-green-600 font-bold">+¥0.9M</span>, "86.8%"],
      ["●●商業施設外構", "¥32.0M", "¥25.6M", "¥24.1M", <span key="4" className="text-green-600 font-bold">+¥1.5M</span>, "94.1%"],
    ]} />
  </>);
}

function OrderManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="資材発注" color="#ef4444" onCreateNew={onCreateNew} />
    <DataTable headers={["発注番号", "発注先", "工事名", "金額", "発注日", "納期", "状態"]} rows={[
      ["PO-2026-089", "ABC建材", "○○マンション", "¥3,200,000", "02/12", "02/28", <StatusBadge key="1" status="進行中" />],
      ["PO-2026-088", "○○電気工業", "△△ビル", "¥8,500,000", "02/10", "03/15", <StatusBadge key="2" status="進行中" />],
      ["PO-2026-087", "□□塗装店", "□□住宅", "¥1,800,000", "02/08", "02/20", <StatusBadge key="3" status="完了" />],
      ["PO-2026-086", "△△設備工業", "○○マンション", "¥12,000,000", "02/05", "03/31", <StatusBadge key="4" status="進行中" />],
    ]} />
  </>);
}

function Schedule({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="工程スケジュール" color="#8b5cf6" onCreateNew={onCreateNew} />
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">2026年2月 工程表</h3>
        <div className="flex gap-2"><button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">← 前月</button><button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">次月 →</button></div>
      </div>
      {[{ name: "○○マンション新築", start: 0, width: 100, color: "#3b82f6", tasks: ["基礎工事", "鉄骨建方", "外壁工事"] }, { name: "△△ビル改修", start: 10, width: 70, color: "#10b981", tasks: ["解体工事", "内装工事", "設備工事"] }, { name: "□□住宅リフォーム", start: 5, width: 60, color: "#f59e0b", tasks: ["水回り", "内装", "外壁塗装"] }, { name: "●●商業施設外構", start: 0, width: 50, color: "#ef4444", tasks: ["舗装工事", "植栽工事", "照明工事"] }].map((p, i) => (
        <div key={i} className="mb-4 last:mb-0">
          <p className="text-sm font-medium text-text-main mb-2">{p.name}</p>
          {p.tasks.map((task, j) => (
            <div key={j} className="flex items-center gap-3 mb-1"><span className="text-xs text-text-sub w-24 truncate">{task}</span>
              <div className="flex-1 bg-gray-100 rounded h-6 relative"><div className="h-6 rounded text-xs text-white flex items-center px-2 font-medium" style={{ backgroundColor: p.color, marginLeft: `${p.start + j * 15}%`, width: `${p.width - j * 20}%`, opacity: 0.7 + j * 0.1 }}>{task}</div></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </>);
}

function PaymentManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="入金管理" color="#06b6d4" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "入金済", value: "¥142.5M", color: "#10b981" }, { label: "未入金", value: "¥28.3M", color: "#ef4444" }, { label: "今月入金予定", value: "¥18.7M", color: "#3b82f6" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事名", "請求額", "入金額", "残額", "入金予定日", "状態"]} rows={[
      ["○○マンション（2月分）", "¥12,800,000", "¥0", "¥12,800,000", "2026/02/28", <StatusBadge key="1" status="未入金" />],
      ["△△ビル（1月分）", "¥8,500,000", "¥8,500,000", "¥0", "2026/01/31", <StatusBadge key="2" status="入金済" />],
      ["□□住宅（最終金）", "¥2,800,000", "¥1,400,000", "¥1,400,000", "2026/02/15", <StatusBadge key="3" status="一部入金" />],
    ]} />
  </>);
}

function CostManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="原価管理" color="#ec4899" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "請負総額", value: "¥214M" }, { label: "原価合計", value: "¥163M" }, { label: "粗利", value: "¥51M" }, { label: "粗利率", value: "23.8%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事名", "請負額", "材料費", "労務費", "外注費", "経費", "原価計", "粗利率"]} rows={[
      ["○○マンション", "¥128.5M", "¥32.1M", "¥28.4M", "¥25.6M", "¥12.2M", "¥98.3M", <span key="1" className="font-bold text-green-600">23.5%</span>],
      ["△△ビル改修", "¥45.0M", "¥11.3M", "¥9.8M", "¥8.5M", "¥4.2M", "¥33.8M", <span key="2" className="font-bold text-green-600">24.9%</span>],
      ["□□住宅", "¥8.5M", "¥2.1M", "¥1.9M", "¥1.5M", "¥0.8M", "¥6.3M", <span key="3" className="font-bold text-yellow-600">25.9%</span>],
    ]} />
  </>);
}

function AdManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="広告素材作成・広告効果測定" color="#f97316" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "配信中キャンペーン", value: "4件", color: "#f97316" }, { label: "今月広告費", value: "¥850K", color: "#3b82f6" }, { label: "反響数（今月）", value: "127件", color: "#10b981" }, { label: "CPA（獲得単価）", value: "¥6,693", color: "#8b5cf6" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["キャンペーン名", "種別", "予算", "消化額", "IMP", "クリック", "反響", "CPA", "状態"]} rows={[
      ["春の新築キャンペーン", "リスティング", "¥300,000", "¥218,500", "45,200", "1,850", "42件", "¥5,202", <StatusBadge key="1" status="配信中" />],
      ["Instagram モデルハウス", "SNS広告", "¥200,000", "¥185,000", "128,000", "3,200", "38件", "¥4,868", <StatusBadge key="2" status="配信中" />],
      ["リフォーム相談会チラシ", "チラシ・DM", "¥150,000", "¥150,000", "-", "-", "28件", "¥5,357", <StatusBadge key="3" status="配信中" />],
      ["YouTube 施工事例", "動画広告", "¥200,000", "¥95,000", "32,000", "890", "19件", "¥5,000", <StatusBadge key="4" status="配信中" />],
      ["冬の断熱リフォーム", "リスティング", "¥250,000", "¥250,000", "38,000", "1,520", "35件", "¥7,143", <StatusBadge key="5" status="終了" />],
    ]} />
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">チャネル別反響数</h3>
        <div className="space-y-3">
          {[{ name: "リスティング広告", value: 77, max: 127, color: "#3b82f6" }, { name: "SNS広告", value: 38, max: 127, color: "#ec4899" }, { name: "チラシ・DM", value: 28, max: 127, color: "#f59e0b" }, { name: "動画広告", value: 19, max: 127, color: "#ef4444" }].map((ch, i) => (
            <div key={i}><div className="flex justify-between text-sm mb-1"><span>{ch.name}</span><span className="font-bold">{ch.value}件</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${(ch.value / ch.max) * 100}%`, backgroundColor: ch.color }} /></div></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">月次反響推移</h3>
        <div className="flex items-end gap-2 h-40">
          {[52, 68, 75, 62, 88, 95, 82, 105, 98, 115, 108, 127].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-orange-500 rounded-t" style={{ height: `${(v / 127) * 100}%` }} />
              <span className="text-[9px] text-text-sub">{i + 1}月</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
}

function CustomerManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="顧客管理" color="#6366f1" onCreateNew={onCreateNew} />
    <DataTable headers={["顧客名", "担当者", "電話番号", "メール", "累計取引額", "工事件数"]} rows={[
      ["○○不動産株式会社", "中村 部長", "03-1234-5678", "nakamura@example.co.jp", "¥256,000,000", "8件"],
      ["△△商事株式会社", "高橋 課長", "03-2345-6789", "takahashi@example.co.jp", "¥128,000,000", "5件"],
      ["□□様（個人）", "□□ 様", "090-1234-5678", "customer@example.com", "¥8,500,000", "1件"],
      ["●●開発株式会社", "伊藤 次長", "03-3456-7890", "ito@example.co.jp", "¥85,000,000", "3件"],
    ]} />
  </>);
}

function AfterService({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="アフター管理" color="#84cc16" onCreateNew={onCreateNew} />
    <DataTable headers={["受付番号", "物件名", "顧客名", "内容", "受付日", "対応期限", "状態"]} rows={[
      ["AF-2026-023", "○○邸", "○○様", "雨漏り（2F寝室天井）", "02/13", "02/20", <StatusBadge key="1" status="対応中" />],
      ["AF-2026-022", "△△マンション301号", "△△様", "クロス剥がれ（リビング）", "02/10", "02/17", <StatusBadge key="2" status="対応済" />],
      ["AF-2026-021", "□□事務所", "□□商事", "空調効き不良（3F）", "02/08", "02/15", <StatusBadge key="3" status="要対応" />],
    ]} />
  </>);
}

function DocumentManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="書類管理" color="#a855f7" onCreateNew={onCreateNew} />
    <DataTable headers={["ファイル名", "カテゴリ", "工事名", "更新日", "サイズ", "共有"]} rows={[
      ["設計図面_rev3.pdf", "図面", "○○マンション", "02/14", "12.5MB", "5人"],
      ["見積書_最終版.xlsx", "見積", "△△ビル改修", "02/13", "2.1MB", "3人"],
      ["工事写真帳_2月.pdf", "写真帳", "□□住宅", "02/12", "45.8MB", "4人"],
      ["安全管理計画書.docx", "安全書類", "○○マンション", "02/10", "1.8MB", "8人"],
    ]} />
  </>);
}

function VendorManagement({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="業者管理" color="#0ea5e9" onCreateNew={onCreateNew} />
    <DataTable headers={["業者名", "業種", "担当者", "電話番号", "評価", "取引額"]} rows={[
      ["ABC建材株式会社", "建材", "松本 営業部長", "03-1111-2222", "4.8", "¥45,200,000"],
      ["○○電気工業", "電気工事", "井上 社長", "03-2222-3333", "4.5", "¥32,100,000"],
      ["□□塗装店", "塗装", "小林 代表", "090-3333-4444", "4.7", "¥18,500,000"],
      ["△△設備工業", "設備工事", "加藤 部長", "03-4444-5555", "4.3", "¥28,600,000"],
    ]} />
  </>);
}

function Analytics({ onCreateNew }: ToolProps) {
  return (<>
    <ToolHeader title="経営分析" color="#e11d48" onCreateNew={onCreateNew} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "年間売上", value: "¥680M", change: "+12.3%" }, { label: "年間粗利", value: "¥158M", change: "+8.7%" }, { label: "平均粗利率", value: "23.2%", change: "+1.5%" }, { label: "受注残", value: "¥420M", change: "+15.2%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p><p className="text-xs text-green-600 font-bold mt-1">{s.change} 前年比</p></div>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">月次売上推移</h3>
        <div className="flex items-end gap-2 h-40">
          {[42, 55, 48, 62, 58, 70, 65, 78, 72, 85, 68, 80].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-blue-500 rounded-t" style={{ height: `${v}%` }} /><span className="text-[9px] text-text-sub">{i + 1}月</span></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">工種別売上構成</h3>
        <div className="space-y-3">
          {[{ name: "新築工事", percent: 45, color: "#3b82f6" }, { name: "改修工事", percent: 25, color: "#10b981" }, { name: "リフォーム", percent: 15, color: "#f59e0b" }, { name: "外構工事", percent: 10, color: "#8b5cf6" }, { name: "その他", percent: 5, color: "#6b7280" }].map((item, i) => (
            <div key={i}><div className="flex justify-between text-sm mb-1"><span>{item.name}</span><span className="font-bold">{item.percent}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} /></div></div>
          ))}
        </div>
      </div>
    </div>
  </>);
}

// ============ ダッシュボードホーム ============

function DashboardHome({ onToolSelect }: { onToolSelect: (id: string) => void }) {
  return (<>
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4 M12 8h.01" /></svg>
        </div>
        <div><p className="font-bold text-blue-800">デモモードで閲覧中</p><p className="text-sm text-blue-600">左サイドバーまたは下のツールをクリックして各機能を確認できます</p></div>
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[{ label: "進行中の工事", value: "12", change: "+2", color: "#3b82f6" }, { label: "今月の売上", value: "¥15.2M", change: "+8.3%", color: "#10b981" }, { label: "未回収金額", value: "¥2.1M", change: "-12%", color: "#f59e0b" }, { label: "今月の粗利率", value: "23.5%", change: "+1.2%", color: "#8b5cf6" }].map((card, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4 sm:p-5"><p className="text-xs text-text-sub mb-1">{card.label}</p><p className="text-xl sm:text-2xl font-black text-text-main">{card.value}</p><p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.change} 前月比</p></div>
      ))}
    </div>
    <div className="mb-6">
      <h2 className="text-sm font-bold text-text-main mb-4">ツール クイックアクセス</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
        {tools.map((tool) => (
          <button key={tool.id} onClick={() => onToolSelect(tool.id)} className="bg-white border border-border rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-transparent transition-all text-center group">
            <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: tool.color + "15" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tool.icon} /></svg>
            </div>
            <p className="text-xs font-medium text-text-sub group-hover:text-text-main transition-colors leading-tight">{tool.name}</p>
          </button>
        ))}
      </div>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">最近の更新</h3>
        <div className="space-y-3">
          {[{ action: "見積承認", detail: "△△ビル改修工事 - ¥4,500,000", time: "1時間前" }, { action: "工程更新", detail: "□□住宅リフォーム - 完了率 75%", time: "2時間前" }, { action: "入金確認", detail: "●●商業施設 - ¥8,200,000", time: "本日" }, { action: "広告反響", detail: "Instagram広告 - 問合せ3件", time: "本日" }, { action: "発注完了", detail: "ABC建材 - 鉄骨材料一式", time: "昨日" }].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">{item.action}</span><span className="text-sm text-text-main">{item.detail}</span></div>
              <span className="text-xs text-text-sub whitespace-nowrap ml-2">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">工事進捗サマリー</h3>
        <div className="space-y-4">
          {[{ name: "○○マンション新築工事", progress: 65 }, { name: "△△ビル改修工事", progress: 30 }, { name: "□□住宅リフォーム", progress: 75 }, { name: "●●商業施設外構工事", progress: 90 }].map((project, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5"><span className="text-sm text-text-main font-medium">{project.name}</span><span className="text-xs text-text-sub">{project.progress}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.progress >= 80 ? "#10b981" : project.progress >= 50 ? "#3b82f6" : "#f59e0b" }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>);
}

// ============ メインコンポーネント ============

const toolComponents: Record<string, React.FC<ToolProps>> = {
  "construction-ledger": ConstructionLedger,
  estimate: Estimate,
  budget: Budget,
  order: OrderManagement,
  schedule: Schedule,
  payment: PaymentManagement,
  cost: CostManagement,
  ad: AdManagement,
  customer: CustomerManagement,
  "after-service": AfterService,
  document: DocumentManagement,
  vendor: VendorManagement,
  analytics: Analytics,
};

export default function DemoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleToolSelect = (id: string) => { setActiveTool(id); setSidebarOpen(false); };

  const openCreateModal = () => setModalOpen(true);

  const handleFormSubmit = () => {
    setModalOpen(false);
    setToastMsg("保存しました");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = (group: string) => setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);

  const estimateChildren = ["budget", "schedule", "order", "cost"];
  const managementChildren = ["document", "customer", "after-service", "vendor"];
  const estimateGroupOpen = expandedGroups.includes("estimate") || activeTool === "estimate" || estimateChildren.includes(activeTool || "");
  const managementGroupOpen = expandedGroups.includes("management") || managementChildren.includes(activeTool || "");

  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolInfo = tools.find((t) => t.id === activeTool);
  const activeFormDef = activeTool ? formDefs[activeTool] : null;
  const activeColor = activeToolInfo?.color || "#3b82f6";

  const renderSidebarTool = (id: string) => {
    const tool = tools.find(t => t.id === id)!;
    return (
      <button key={tool.id} onClick={() => handleToolSelect(tool.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTool === tool.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: tool.color + "30" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tool.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tool.icon} /></svg>
        </div>
        <span className="truncate">{tool.name}</span>
      </button>
    );
  };

  const renderGroupChildren = (childIds: string[]) => (
    <div className="ml-7 mt-1 space-y-0.5 border-l border-white/10 pl-2">
      {childIds.map(id => { const t = tools.find(x => x.id === id)!; return (
        <button key={id} onClick={() => handleToolSelect(id)} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeTool === id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
          <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: t.color + "30" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
          </div>
          <span className="truncate">{t.name}</span>
        </button>
      ); })}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-dark transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg>
              </div>
              <span className="text-lg font-bold text-white">Builder OS</span>
            </div>
            <p className="text-xs text-white/50 mt-2 truncate">{demoUser.companyName}</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <button onClick={() => { setActiveTool(null); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTool === null ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              ダッシュボード
            </button>
            <div className="pt-3 pb-2"><p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">ツール</p></div>
            {renderSidebarTool("construction-ledger")}
            <div>
              <button onClick={() => { handleToolSelect("estimate"); toggleGroup("estimate"); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTool === "estimate" || estimateChildren.includes(activeTool || "") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#10b98130" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tools.find(t => t.id === "estimate")!.icon} /></svg>
                </div>
                <span className="flex-1 truncate text-left">見積作成</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${estimateGroupOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {estimateGroupOpen && renderGroupChildren(estimateChildren)}
            </div>
            {renderSidebarTool("payment")}
            {renderSidebarTool("ad")}
            <div>
              <button onClick={() => toggleGroup("management")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${managementChildren.includes(activeTool || "") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#6366f130" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" /></svg>
                </div>
                <span className="flex-1 truncate text-left">管理</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${managementGroupOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {managementGroupOpen && renderGroupChildren(managementChildren)}
            </div>
            {renderSidebarTool("analytics")}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="flex-1 min-w-0"><p className="text-xs text-white truncate">{demoUser.email}</p><p className="text-[10px] text-white/50">デモモード</p></div>
            </div>
            <Link href="/" className="block w-full text-xs text-white/50 hover:text-white/80 transition-colors text-left">トップページに戻る</Link>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-text-sub hover:text-text-main">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <h1 className="text-lg font-bold text-text-main">{activeToolInfo ? activeToolInfo.name : "ダッシュボード"}</h1>
            {activeTool && <button onClick={() => setActiveTool(null)} className="text-xs text-text-sub hover:text-primary ml-2">← ダッシュボードに戻る</button>}
          </div>
          <Link href="/" className="text-xs text-text-sub hover:text-primary transition-colors">トップページ</Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {ActiveComponent ? <ActiveComponent onCreateNew={openCreateModal} /> : <DashboardHome onToolSelect={handleToolSelect} />}
        </main>
      </div>

      {activeFormDef && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={activeFormDef.title}>
          <CreateForm fields={activeFormDef.fields} onSubmit={handleFormSubmit} color={activeColor} />
        </Modal>
      )}

      <Toast message={toastMsg} show={showToast} />
    </div>
  );
}
