"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ============ 型定義 ============

type FormFieldDef = { name: string; label: string; type: "text" | "number" | "date" | "select" | "textarea" | "file"; options?: string[]; placeholder?: string; required?: boolean };
type ToolDef = { id: string; name: string; icon: string; color: string };
type ToolProps = { onCreateNew?: () => void; onExport?: () => void };

// ============ ツール定義（日報削除・写真→広告に変更） ============

const tools: ToolDef[] = [
  { id: "construction-ledger", name: "工事台帳", icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z", color: "#3b82f6" },
  { id: "estimate", name: "見積作成", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
  { id: "budget", name: "実行予算", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#f59e0b" },
  { id: "order", name: "資材発注", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", color: "#ef4444" },
  { id: "schedule", name: "工程スケジュール", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", color: "#8b5cf6" },
  { id: "ad", name: "広告素材作成・効果測定", icon: "M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6", color: "#f97316" },
  { id: "payment", name: "入金管理", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", color: "#06b6d4" },
  { id: "cost", name: "原価管理", icon: "M22 12h-4l-3 9L9 3l-3 9H2", color: "#ec4899" },
  { id: "customer", name: "顧客管理", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", color: "#6366f1" },
  { id: "after-service", name: "アフター管理", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3", color: "#84cc16" },
  { id: "document", name: "書類管理", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", color: "#a855f7" },
  { id: "vendor", name: "業者管理", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", color: "#0ea5e9" },
  { id: "land-search", name: "土地探し", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0-3-3 3 3 0 0 0 3 3z", color: "#059669" },
  { id: "subsidy", name: "補助金・助成金", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#7c3aed" },
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
      { name: "handoverDate", label: "引渡し日", type: "date" },
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
  "land-search": {
    title: "土地探し 新規検索",
    fields: [
      { name: "area", label: "希望エリア", type: "text", placeholder: "例: 三重県津市", required: true },
      { name: "budget", label: "予算上限", type: "number", placeholder: "例: 30000000" },
      { name: "size", label: "希望面積（㎡）", type: "number", placeholder: "例: 200" },
      { name: "use", label: "用途", type: "select", options: ["住宅用地", "事業用地", "分譲用地", "その他"] },
      { name: "note", label: "備考・希望条件", type: "textarea", placeholder: "駅徒歩10分以内、南向きなど" },
    ],
  },
  subsidy: {
    title: "補助金・助成金 検索",
    fields: [
      { name: "prefecture", label: "都道府県", type: "text", placeholder: "例: 三重県", required: true },
      { name: "city", label: "市区町村", type: "text", placeholder: "例: 津市" },
      { name: "type", label: "工事種別", type: "select", options: ["新築", "リフォーム", "耐震改修", "省エネ改修", "バリアフリー", "その他"], required: true },
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

function ToolHeader({ title, color, onCreateNew, onExport }: { title: string; color: string; onCreateNew?: () => void; onExport?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-text-main">{title}</h2>
      <div className="flex gap-2">
        <button onClick={onCreateNew} className="px-4 py-2 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
          + 新規作成
        </button>
        <button onClick={onExport} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors">エクスポート</button>
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

function ConstructionLedger({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="工事台帳" color="#3b82f6" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "進行中", value: "12件", color: "#3b82f6" }, { label: "今月完了", value: "3件", color: "#10b981" }, { label: "受注総額", value: "¥285M", color: "#f59e0b" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事番号", "工事名", "発注者", "請負金額", "引渡し日", "進捗", "状態"]} rows={[
      ["K-2026-001", "○○マンション新築工事", "○○不動産", "¥128,500,000", "2026/06/30", "65%", <StatusBadge key="1" status="進行中" />],
      ["K-2026-002", "△△ビル改修工事", "△△商事", "¥45,000,000", "2026/09/15", "30%", <StatusBadge key="2" status="進行中" />],
      ["K-2026-003", "□□住宅リフォーム", "□□様", "¥8,500,000", "2026/03/20", "75%", <StatusBadge key="3" status="進行中" />],
      ["K-2026-004", "●●商業施設外構工事", "●●開発", "¥32,000,000", "2026/04/30", "90%", <StatusBadge key="4" status="進行中" />],
      ["K-2025-012", "◎◎事務所ビル新築", "◎◎建設", "¥68,000,000", "2025/12/20", "100%", <StatusBadge key="5" status="完了" />],
    ]} />
  </>);
}

function Estimate({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="見積作成" color="#10b981" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["見積番号", "件名", "提出先", "金額", "提出日", "状態"]} rows={[
      ["E-2026-045", "△△ビル空調更新工事", "△△商事", "¥12,800,000", "2026/02/10", <StatusBadge key="1" status="送付済" />],
      ["E-2026-044", "○○邸外壁塗装工事", "○○様", "¥3,200,000", "2026/02/08", <StatusBadge key="2" status="承認済" />],
      ["E-2026-043", "□□倉庫改修工事", "□□物流", "¥18,500,000", "2026/02/05", <StatusBadge key="3" status="下書き" />],
      ["E-2026-042", "●●店舗内装工事", "●●フーズ", "¥7,600,000", "2026/02/01", <StatusBadge key="4" status="承認済" />],
    ]} />
  </>);
}

function Budget({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={onCreateNew} onExport={onExport} />
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

function OrderManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="資材発注" color="#ef4444" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["発注番号", "発注先", "工事名", "金額", "発注日", "納期", "状態"]} rows={[
      ["PO-2026-089", "ABC建材", "○○マンション", "¥3,200,000", "02/12", "02/28", <StatusBadge key="1" status="進行中" />],
      ["PO-2026-088", "○○電気工業", "△△ビル", "¥8,500,000", "02/10", "03/15", <StatusBadge key="2" status="進行中" />],
      ["PO-2026-087", "□□塗装店", "□□住宅", "¥1,800,000", "02/08", "02/20", <StatusBadge key="3" status="完了" />],
      ["PO-2026-086", "△△設備工業", "○○マンション", "¥12,000,000", "02/05", "03/31", <StatusBadge key="4" status="進行中" />],
    ]} />
  </>);
}

function Schedule({ onCreateNew, onExport }: ToolProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [duration, setDuration] = useState("");
  const [generated, setGenerated] = useState<{ name: string; area: string; phases: { name: string; start: number; end: number; color: string }[] } | null>(null);

  const handleGenerate = () => {
    const months = parseInt(duration) || 6;
    const name = siteName || "新規工事";
    const phases: { name: string; start: number; end: number; color: string }[] = [];
    let current = 0;
    const tpl = [
      { name: "仮設工事", ratio: 0.05, color: "#6b7280" },
      { name: "基礎工事", ratio: 0.15, color: "#3b82f6" },
      { name: "躯体工事", ratio: 0.25, color: "#ef4444" },
      { name: "屋根・防水工事", ratio: 0.08, color: "#8b5cf6" },
      { name: "外壁工事", ratio: 0.12, color: "#f59e0b" },
      { name: "内装工事", ratio: 0.15, color: "#10b981" },
      { name: "設備工事", ratio: 0.10, color: "#06b6d4" },
      { name: "外構工事", ratio: 0.05, color: "#84cc16" },
      { name: "検査・引渡し", ratio: 0.05, color: "#e11d48" },
    ];
    for (const t of tpl) {
      const dur = Math.max(1, Math.round(months * t.ratio));
      phases.push({ name: t.name, start: current, end: current + dur, color: t.color });
      current += dur;
    }
    setGenerated({ name, area: floorArea, phases });
    setShowCreate(false);
    setSiteName(""); setFloorArea(""); setDuration("");
  };

  return (
    <>
      <ToolHeader title="工程スケジュール" color="#8b5cf6" onCreateNew={() => setShowCreate(true)} onExport={onExport} />

      {showCreate ? (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-bold text-text-main mb-6">工程スケジュール 新規作成</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">現場名 <span className="text-red-500">*</span></label>
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="例: ○○邸新築工事" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">延床面積</label>
              <input type="text" value={floorArea} onChange={e => setFloorArea(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="例: 120㎡" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">想定工期（ヶ月） <span className="text-red-500">*</span></label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="例: 6" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">図面アップロード</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-colors cursor-pointer">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p className="text-sm font-medium text-text-main mb-1">クリックまたはドラッグ&ドロップ</p>
              <p className="text-xs text-text-sub">対応形式: PDF / JWW / DXF / archiトレンド (.atr) / その他CADデータ</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
            <button onClick={handleGenerate} disabled={!siteName || !duration} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${siteName && duration ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-300 cursor-not-allowed"}`}>工程スケジュールを自動作成</button>
          </div>
        </div>
      ) : generated ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span className="text-sm font-bold text-green-700">「{generated.name}」の工程スケジュールを自動作成しました{generated.area && `（延床 ${generated.area}）`}</span>
            </div>
            <button onClick={() => setGenerated(null)} className="text-xs text-text-sub hover:text-text-main">既存工程に戻る</button>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-5">{generated.name} 工程スケジュール</h3>
            <div className="space-y-2">
              {generated.phases.map((phase, i) => {
                const totalMonths = generated.phases[generated.phases.length - 1].end;
                const leftPct = (phase.start / totalMonths) * 100;
                const widthPct = Math.max(5, ((phase.end - phase.start) / totalMonths) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-text-sub w-28 truncate shrink-0">{phase.name}</span>
                    <div className="flex-1 bg-gray-100 rounded h-7 relative">
                      <div className="h-7 rounded text-[10px] text-white flex items-center px-2 font-medium absolute" style={{ backgroundColor: phase.color, left: `${leftPct}%`, width: `${widthPct}%` }}>{phase.name}</div>
                    </div>
                    <span className="text-[10px] text-text-sub w-12 shrink-0 text-right">{phase.end - phase.start}ヶ月</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </>
  );
}

function PaymentManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="入金管理" color="#06b6d4" onCreateNew={onCreateNew} onExport={onExport} />
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

function CostManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="原価管理" color="#ec4899" onCreateNew={onCreateNew} onExport={onExport} />
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

function AdManagement({ onCreateNew, onExport }: ToolProps) {
  const [view, setView] = useState<"main"|"creative"|"measurement"|"research">("main");
  const [creativeStep, setCreativeStep] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [metaConnected, setMetaConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [measurementActive, setMeasurementActive] = useState(false);

  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const backToMain = () => { setView("main"); setCreativeStep(0); };

  if (view === "main") {
    return (
      <>
        <div className="mb-6"><h2 className="text-lg font-bold text-text-main">広告素材作成・効果測定</h2></div>
        <div className="grid grid-cols-3 gap-6">
          <button onClick={() => setView("creative")} className="bg-white rounded-2xl border-2 border-border hover:border-orange-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">素材生成</h3>
            <p className="text-sm text-text-sub leading-relaxed">Meta・Google対応の<br/>広告素材とテキストを自動生成</p>
          </button>
          <button onClick={() => setView("measurement")} className="bg-white rounded-2xl border-2 border-border hover:border-blue-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">効果測定</h3>
            <p className="text-sm text-text-sub leading-relaxed">API連携で自動効果測定<br/>アラート・メール通知連動</p>
          </button>
          <button onClick={() => setView("research")} className="bg-white rounded-2xl border-2 border-border hover:border-purple-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">競合リサーチ</h3>
            <p className="text-sm text-text-sub leading-relaxed">競合他社の広告・施策を<br/>自動分析・レポート</p>
          </button>
        </div>
      </>
    );
  }

  if (view === "creative") {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">← 戻る</button>
          <h2 className="text-lg font-bold text-text-main">素材生成</h2>
        </div>
        <div className="flex items-center gap-2 mb-8">
          {["媒体選択", "素材アップロード", "生成結果"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= creativeStep ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-sm ${i <= creativeStep ? "text-text-main font-medium" : "text-text-sub"}`}>{s}</span>
              {i < 2 && <div className={`w-12 h-0.5 ${i < creativeStep ? "bg-orange-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        {creativeStep === 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">配信する媒体を選択してください</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => togglePlatform("meta")} className={`p-6 rounded-xl border-2 text-left transition-all ${selectedPlatforms.includes("meta") ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">f</div>
                  <span className="font-bold text-text-main">Meta</span>
                  {selectedPlatforms.includes("meta") && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                </div>
                <p className="text-xs text-text-sub">Facebook・Instagram広告</p>
              </button>
              <button onClick={() => togglePlatform("google")} className={`p-6 rounded-xl border-2 text-left transition-all ${selectedPlatforms.includes("google") ? "border-red-500 bg-red-50" : "border-border hover:border-red-300"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center text-lg font-bold" style={{ color: "#4285f4" }}>G</div>
                  <span className="font-bold text-text-main">Google</span>
                  {selectedPlatforms.includes("google") && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#ef4444"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                </div>
                <p className="text-xs text-text-sub">Google広告・ディスプレイ</p>
              </button>
            </div>
            <button onClick={() => selectedPlatforms.length > 0 && setCreativeStep(1)} disabled={selectedPlatforms.length === 0} className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${selectedPlatforms.length > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}>次へ</button>
          </div>
        )}
        {creativeStep === 1 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">広告に使用する素材をアップロード</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-6 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p className="text-sm font-medium text-text-main mb-1">クリックまたはドラッグ&ドロップ</p>
              <p className="text-xs text-text-sub">JPG, PNG, MP4, MOV（最大100MB）</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-text-sub mb-2">選択された媒体:</p>
              <div className="flex gap-2">{selectedPlatforms.map(p => <span key={p} className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-border">{p === "meta" ? "Meta (Facebook/Instagram)" : "Google広告"}</span>)}</div>
            </div>
            <button onClick={() => setCreativeStep(2)} className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">素材を生成する</button>
          </div>
        )}
        {creativeStep === 2 && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span className="text-sm font-bold text-green-700">素材の生成が完了しました</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-border p-5">
                <h4 className="text-sm font-bold mb-3">生成された広告素材</h4>
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-50 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" className="mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg><p className="text-xs text-text-sub">プレビュー</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold">推奨テキスト（3パターン）</h4>
                {[
                  { label: "パターンA", title: "理想の住まいを、確かな技術で。", desc: "創業以来の実績と信頼。無料相談受付中。まずはお気軽にお問い合わせください。" },
                  { label: "パターンB", title: "新築・リフォーム、まずは無料相談から。", desc: "地域No.1の施工実績。お客様満足度98%。今なら見積もり無料キャンペーン実施中。" },
                  { label: "パターンC", title: "あなたの「こうしたい」を形にします。", desc: "経験豊富な職人が丁寧に施工。アフターサポートも万全。お気軽にご相談ください。" },
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border border-border p-4">
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mb-2 inline-block">{t.label}</span>
                    <p className="text-sm font-bold text-text-main mb-1">{t.title}</p>
                    <p className="text-xs text-text-sub">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCreativeStep(0); setSelectedPlatforms([]); }} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">もう一度作成</button>
              <button onClick={backToMain} className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">完了</button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (view === "measurement") {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">← 戻る</button>
          <h2 className="text-lg font-bold text-text-main">効果測定</h2>
        </div>
        {!measurementActive ? (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">初期設定 - アカウント連携</h3>
            <p className="text-xs text-text-sub mb-6">API連携により、各プラットフォームのデータを自動取得します。</p>
            <div className="space-y-4 mb-6">
              <div className={`p-5 rounded-xl border-2 transition-all ${metaConnected ? "border-green-400 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">f</div>
                    <div><p className="font-bold text-text-main">Metaビジネスアカウント連携</p><p className="text-xs text-text-sub">Facebook・Instagram広告データを自動取得</p></div>
                  </div>
                  {metaConnected ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">連携済み ✓</span>
                  ) : (
                    <button onClick={() => setMetaConnected(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors">API連携する</button>
                  )}
                </div>
              </div>
              <div className={`p-5 rounded-xl border-2 transition-all ${googleConnected ? "border-green-400 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center font-bold" style={{ color: "#4285f4" }}>G</div>
                    <div><p className="font-bold text-text-main">Googleビジネスアカウント連携</p><p className="text-xs text-text-sub">Google広告・アナリティクスデータを自動取得</p></div>
                  </div>
                  {googleConnected ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">連携済み ✓</span>
                  ) : (
                    <button onClick={() => setGoogleConnected(true)} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg font-bold hover:bg-red-600 transition-colors">API連携する</button>
                  )}
                </div>
              </div>
            </div>
            {metaConnected && googleConnected && (
              <button onClick={() => setMeasurementActive(true)} className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">効果測定を開始する</button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[{ label: "総インプレッション", value: "245,200", change: "+12.3%" }, { label: "クリック数", value: "6,840", change: "+8.7%" }, { label: "反響数", value: "127件", change: "+15.2%" }, { label: "CPA", value: "¥6,693", change: "-5.1%" }].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p><p className="text-xs text-green-600 font-bold mt-1">{s.change}</p></div>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-red-700">素材変更が必要です</p><p className="text-xs text-red-600">「春の新築キャンペーン」のCTRが0.8%を下回りました。素材の差し替えを推奨します。</p></div>
                <button className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-bold shrink-0">素材を変更</button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-blue-700">資料請求がありました</p><p className="text-xs text-blue-600">Instagram広告経由で新規の資料請求が3件ありました（本日 14:32）</p></div>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold shrink-0">詳細を見る</button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-yellow-700">メール通知連動中</p><p className="text-xs text-yellow-600">Google広告の通知メール（budget@builder-os.jp）と連動中。未読通知: 2件</p></div>
                <button className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg font-bold shrink-0">確認する</button>
              </div>
            </div>
            <DataTable headers={["キャンペーン", "媒体", "IMP", "クリック", "反響", "CPA", "状態"]} rows={[
              ["春の新築キャンペーン", "Meta", "45,200", "1,850", "42件", "¥5,202", <StatusBadge key="1" status="要対応" />],
              ["Instagram モデルハウス", "Meta", "128,000", "3,200", "38件", "¥4,868", <StatusBadge key="2" status="配信中" />],
              ["リスティング広告", "Google", "72,000", "1,790", "47件", "¥5,106", <StatusBadge key="3" status="配信中" />],
            ]} />
          </div>
        )}
      </>
    );
  }

  if (view === "research") {
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">← 戻る</button>
          <h2 className="text-lg font-bold text-text-main">競合リサーチ</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: "追跡中の競合", value: "5社", color: "#8b5cf6" }, { label: "検出された広告", value: "23件", color: "#3b82f6" }, { label: "市場シェア推定", value: "12.3%", color: "#10b981" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
          ))}
        </div>
        <DataTable headers={["競合他社", "エリア", "検出広告数", "推定月額", "主要媒体", "直近の動き"]} rows={[
          ["○○ホーム", "津市・松阪市", "8件", "¥350K", "Meta/Google", <StatusBadge key="1" status="配信中" />],
          ["△△建設", "四日市市", "5件", "¥200K", "Google", <StatusBadge key="2" status="配信中" />],
          ["□□ハウス", "伊勢市", "6件", "¥280K", "Meta", <StatusBadge key="3" status="配信中" />],
          ["●●工務店", "鈴鹿市", "3件", "¥150K", "チラシ/DM", <StatusBadge key="4" status="配信中" />],
          ["◎◎リフォーム", "津市", "1件", "¥80K", "Google", <StatusBadge key="5" status="終了" />],
        ]} />
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-4">競合キーワード重複分析</h3>
            <div className="space-y-3">
              {[{ kw: "三重県 新築", us: true, comp: 3 }, { kw: "津市 リフォーム", us: true, comp: 2 }, { kw: "松阪 注文住宅", us: false, comp: 4 }, { kw: "三重 工務店", us: true, comp: 5 }, { kw: "伊勢 リノベーション", us: false, comp: 2 }].map((k, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-text-main">{k.kw}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${k.us ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{k.us ? "出稿中" : "未出稿"}</span>
                    <span className="text-xs text-text-sub">競合 {k.comp}社</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-4">競合の最新広告クリエイティブ</h3>
            <div className="space-y-3">
              {[{ comp: "○○ホーム", text: "春の新生活応援フェア開催中！モデルハウス見学予約受付中", media: "Instagram", date: "2/13" }, { comp: "△△建設", text: "耐震等級3の安心住宅。無料耐震診断実施中", media: "Google検索", date: "2/12" }, { comp: "□□ハウス", text: "リフォーム相談会 2/15-16開催。来場予約で商品券進呈", media: "Facebook", date: "2/10" }].map((ad, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-purple-600">{ad.comp}</span><span className="text-[10px] text-text-sub">{ad.date}</span></div>
                  <p className="text-xs text-text-main mb-1">{ad.text}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">{ad.media}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

function CustomerManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="顧客管理" color="#6366f1" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["顧客名", "担当者", "電話番号", "メール", "累計取引額", "工事件数"]} rows={[
      ["○○不動産株式会社", "中村 部長", "03-1234-5678", "nakamura@example.co.jp", "¥256,000,000", "8件"],
      ["△△商事株式会社", "高橋 課長", "03-2345-6789", "takahashi@example.co.jp", "¥128,000,000", "5件"],
      ["□□様（個人）", "□□ 様", "090-1234-5678", "customer@example.com", "¥8,500,000", "1件"],
      ["●●開発株式会社", "伊藤 次長", "03-3456-7890", "ito@example.co.jp", "¥85,000,000", "3件"],
    ]} />
  </>);
}

function AfterService({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="アフター管理" color="#84cc16" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["受付番号", "物件名", "顧客名", "内容", "受付日", "対応期限", "状態"]} rows={[
      ["AF-2026-023", "○○邸", "○○様", "雨漏り（2F寝室天井）", "02/13", "02/20", <StatusBadge key="1" status="対応中" />],
      ["AF-2026-022", "△△マンション301号", "△△様", "クロス剥がれ（リビング）", "02/10", "02/17", <StatusBadge key="2" status="対応済" />],
      ["AF-2026-021", "□□事務所", "□□商事", "空調効き不良（3F）", "02/08", "02/15", <StatusBadge key="3" status="要対応" />],
    ]} />
  </>);
}

function DocumentManagement({ onCreateNew, onExport }: ToolProps) {
  const [dlToast, setDlToast] = useState(false);
  const [dlName, setDlName] = useState("");

  const handleTemplateDownload = (name: string) => {
    setDlName(name);
    setDlToast(true);
    setTimeout(() => setDlToast(false), 3000);
  };

  return (<>
    <ToolHeader title="書類管理" color="#a855f7" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-white rounded-xl border border-border p-5 mb-6">
      <h3 className="text-sm font-bold text-text-main mb-4">書類雛形ダウンロード</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { name: "工事請負契約書", icon: "📄" },
          { name: "見積書テンプレート", icon: "📋" },
          { name: "注文書", icon: "📝" },
          { name: "請求書テンプレート", icon: "💰" },
          { name: "安全管理計画書", icon: "🔒" },
          { name: "作業日報", icon: "📅" },
          { name: "施工体制台帳", icon: "🏗" },
          { name: "竣工届", icon: "✅" },
        ].map((t, i) => (
          <button key={i} onClick={() => handleTemplateDownload(t.name)} className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left">
            <span className="text-lg">{t.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-main truncate">{t.name}</p>
              <p className="text-[10px] text-text-sub">.xlsx</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        ))}
      </div>
    </div>
    {dlToast && (
      <div className="fixed bottom-6 right-6 z-[60] bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        「{dlName}」をダウンロードしました
      </div>
    )}
    <DataTable headers={["ファイル名", "カテゴリ", "工事名", "更新日", "サイズ", "共有"]} rows={[
      ["設計図面_rev3.pdf", "図面", "○○マンション", "02/14", "12.5MB", "5人"],
      ["見積書_最終版.xlsx", "見積", "△△ビル改修", "02/13", "2.1MB", "3人"],
      ["工事写真帳_2月.pdf", "写真帳", "□□住宅", "02/12", "45.8MB", "4人"],
      ["安全管理計画書.docx", "安全書類", "○○マンション", "02/10", "1.8MB", "8人"],
    ]} />
  </>);
}

function VendorManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="業者管理" color="#0ea5e9" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["業者名", "業種", "担当者", "電話番号", "評価", "取引額"]} rows={[
      ["ABC建材株式会社", "建材", "松本 営業部長", "03-1111-2222", "4.8", "¥45,200,000"],
      ["○○電気工業", "電気工事", "井上 社長", "03-2222-3333", "4.5", "¥32,100,000"],
      ["□□塗装店", "塗装", "小林 代表", "090-3333-4444", "4.7", "¥18,500,000"],
      ["△△設備工業", "設備工事", "加藤 部長", "03-4444-5555", "4.3", "¥28,600,000"],
    ]} />
  </>);
}

function LandSearch({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="土地探し" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><p className="text-sm font-bold text-green-800">SUUMO連動 土地情報検索</p><p className="text-xs text-green-600">SUUMOの最新土地情報をリアルタイムで取得・表示します</p></div>
    </div>
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "検索中エリア", value: "3件", color: "#059669" }, { label: "新着物件（24h）", value: "12件", color: "#3b82f6" }, { label: "お気に入り", value: "5件", color: "#f59e0b" }, { label: "平均坪単価", value: "¥18.5万", color: "#8b5cf6" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["物件名", "所在地", "面積", "価格", "坪単価", "用途地域", "状態"]} rows={[
      ["津市久居 分譲地A", "三重県津市久居○○町", "198.5㎡", "¥12,800,000", "¥21.3万/坪", "第一種住居", <StatusBadge key="1" status="配信中" />],
      ["松阪市 住宅用地", "三重県松阪市○○1丁目", "165.2㎡", "¥9,500,000", "¥19.0万/坪", "第一種低層", <StatusBadge key="2" status="配信中" />],
      ["津市河芸 土地", "三重県津市河芸町○○", "220.0㎡", "¥8,800,000", "¥13.2万/坪", "第一種住居", <StatusBadge key="3" status="配信中" />],
      ["鈴鹿市 分譲地", "三重県鈴鹿市○○町", "180.3㎡", "¥11,200,000", "¥20.5万/坪", "第二種住居", <StatusBadge key="4" status="準備中" />],
      ["伊勢市 住宅用地", "三重県伊勢市○○2丁目", "250.0㎡", "¥15,000,000", "¥19.8万/坪", "第一種低層", <StatusBadge key="5" status="配信中" />],
    ]} />
  </>);
}

function SubsidyManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="補助金・助成金" color="#7c3aed" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div><p className="text-sm font-bold text-purple-800">全国対応 補助金・助成金検索</p><p className="text-xs text-purple-600">国・都道府県・市区町村の最新補助金情報を自動取得</p></div>
    </div>
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "利用可能な制度", value: "28件", color: "#7c3aed" }, { label: "申請中", value: "3件", color: "#3b82f6" }, { label: "受給済み", value: "¥4.2M", color: "#10b981" }, { label: "申請期限間近", value: "5件", color: "#ef4444" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["制度名", "対象", "補助額", "申請期限", "管轄", "状態"]} rows={[
      ["子育てエコホーム支援事業", "新築", "最大100万円", "2026/03/31", "国土交通省", <StatusBadge key="1" status="配信中" />],
      ["先進的窓リノベ事業", "リフォーム", "最大200万円", "2026/03/31", "環境省", <StatusBadge key="2" status="配信中" />],
      ["給湯省エネ事業", "省エネ改修", "最大20万円/台", "2026/03/31", "経済産業省", <StatusBadge key="3" status="配信中" />],
      ["三重県木造住宅耐震補強事業", "耐震改修", "最大100万円", "2026/12/28", "三重県", <StatusBadge key="4" status="配信中" />],
      ["津市住宅リフォーム助成", "リフォーム", "最大20万円", "2026/09/30", "津市", <StatusBadge key="5" status="配信中" />],
      ["三重県ZEH導入補助金", "新築", "最大55万円", "2026/06/30", "三重県", <StatusBadge key="6" status="準備中" />],
    ]} />
  </>);
}

function Analytics({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="経営分析" color="#e11d48" onCreateNew={onCreateNew} onExport={onExport} />
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
  "land-search": LandSearch,
  subsidy: SubsidyManagement,
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

  const handleExport = () => {
    setToastMsg("CSVエクスポートを開始しました");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const toggleGroup = (group: string) => setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);

  const estimateChildren = ["budget", "schedule", "order", "cost"];
  const managementChildren = ["document", "customer", "after-service", "vendor"];
  const estimateGroupOpen = expandedGroups.includes("estimate");
  const managementGroupOpen = expandedGroups.includes("management");

  useEffect(() => {
    if (activeTool === "estimate" || estimateChildren.includes(activeTool || "")) {
      if (!expandedGroups.includes("estimate")) {
        setExpandedGroups(prev => prev.includes("estimate") ? prev : [...prev, "estimate"]);
      }
    }
    if (managementChildren.includes(activeTool || "")) {
      if (!expandedGroups.includes("management")) {
        setExpandedGroups(prev => prev.includes("management") ? prev : [...prev, "management"]);
      }
    }
  }, [activeTool]);

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
            {renderSidebarTool("land-search")}
            {renderSidebarTool("subsidy")}
            <div>
              <button onClick={() => toggleGroup("estimate")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTool === "estimate" || estimateChildren.includes(activeTool || "") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#10b98130" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tools.find(t => t.id === "estimate")!.icon} /></svg>
                </div>
                <span className="flex-1 truncate text-left">見積作成</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${estimateGroupOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {estimateGroupOpen && renderGroupChildren(estimateChildren)}
            </div>
            {renderSidebarTool("ad")}
            {renderSidebarTool("payment")}
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
          {ActiveComponent ? <ActiveComponent onCreateNew={openCreateModal} onExport={handleExport} /> : <DashboardHome onToolSelect={handleToolSelect} />}
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
