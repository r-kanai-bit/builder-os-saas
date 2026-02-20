"use client";

import React, { useState, useEffect, useRef } from "react";
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
      { name: "target", label: "ターゲットエリア", type: "text", placeholder: "例: 東京都世田谷区・目黒区" },
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
      { name: "area", label: "希望エリア", type: "text", placeholder: "例: 東京都世田谷区", required: true },
      { name: "budget", label: "予算上限", type: "number", placeholder: "例: 30000000" },
      { name: "size", label: "希望面積（㎡）", type: "number", placeholder: "例: 200" },
      { name: "use", label: "用途", type: "select", options: ["住宅用地", "事業用地", "分譲用地", "その他"] },
      { name: "note", label: "備考・希望条件", type: "textarea", placeholder: "駅徒歩10分以内、南向きなど" },
    ],
  },
  subsidy: {
    title: "補助金・助成金 検索",
    fields: [
      { name: "prefecture", label: "都道府県", type: "text", placeholder: "例: 東京都", required: true },
      { name: "city", label: "市区町村", type: "text", placeholder: "例: 世田谷区" },
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
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([
    { id: "K-2026-001", name: "○○マンション新築工事", client: "○○不動産", amount: "¥128,500,000", deadline: "2026/06/30", progress: 65, status: "進行中" as const },
    { id: "K-2026-002", name: "△△ビル改修工事", client: "△△商事", amount: "¥45,000,000", deadline: "2026/09/15", progress: 30, status: "進行中" as const },
    { id: "K-2026-003", name: "□□住宅リフォーム", client: "□□様", amount: "¥8,500,000", deadline: "2026/03/20", progress: 75, status: "進行中" as const },
    { id: "K-2026-004", name: "●●商業施設外構工事", client: "●●開発", amount: "¥32,000,000", deadline: "2026/04/30", progress: 90, status: "進行中" as const },
    { id: "K-2025-012", name: "◎◎事務所ビル新築", client: "◎◎建設", amount: "¥68,000,000", deadline: "2025/12/20", progress: 100, status: "完了" as const },
  ]);
  const [formData, setFormData] = useState({ name: "", client: "", amount: "", deadline: "", startDate: "", type: "新築", memo: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!formData.name || !formData.client) return;
    const newId = `K-2026-${String(entries.length + 1).padStart(3, "0")}`;
    const amountNum = parseInt(formData.amount.replace(/[^0-9]/g, "")) || 0;
    const formatted = amountNum > 0 ? `¥${amountNum.toLocaleString()}` : "未定";
    setEntries(prev => [{ id: newId, name: formData.name, client: formData.client, amount: formatted, deadline: formData.deadline || "未定", progress: 0, status: "進行中" as const }, ...prev]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setFormData({ name: "", client: "", amount: "", deadline: "", startDate: "", type: "新築", memo: "" }); }, 1200);
  };

  const inProgress = entries.filter(e => e.status === "進行中").length;
  const completed = entries.filter(e => e.status === "完了").length;

  if (showForm) {
    return (<>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowForm(false)} className="text-sm text-text-sub hover:text-primary">← 一覧に戻る</button>
        <h2 className="text-lg font-bold text-text-main">工事台帳 ー 新規登録</h2>
      </div>
      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="text-sm font-bold text-emerald-700">保存しました！一覧に反映されます。</p>
        </div>
      )}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">工事名 <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="例: ○○邸新築工事" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">発注者 <span className="text-red-500">*</span></label>
            <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="例: ○○不動産株式会社" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">工事種別</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white">
              {["新築", "改修", "リフォーム", "外構", "解体", "設備", "その他"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">請負金額</label>
            <input type="text" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="例: 50000000" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">着工日</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">引渡し予定日</label>
            <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-text-main mb-1.5">備考</label>
          <textarea value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" placeholder="特記事項があれば入力してください" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
          <button onClick={handleSave} disabled={!formData.name || !formData.client} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${formData.name && formData.client ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}>保存する</button>
        </div>
      </div>
    </>);
  }

  return (<>
    <ToolHeader title="工事台帳" color="#3b82f6" onCreateNew={() => setShowForm(true)} onExport={onExport} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "進行中", value: inProgress + "件", color: "#3b82f6" }, { label: "完了", value: completed + "件", color: "#10b981" }, { label: "受注総額", value: "¥2億8,500万", color: "#f59e0b" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事番号", "工事名", "発注者", "請負金額", "引渡し日", "進捗", "状態"]} rows={entries.map((e, i) => [
      e.id, e.name, e.client, e.amount, e.deadline,
      <div key={`p-${i}`} className="w-16"><div className="flex items-center gap-1"><div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${e.progress}%`, backgroundColor: e.progress >= 90 ? "#10b981" : e.progress >= 50 ? "#3b82f6" : "#f59e0b" }} /></div><span className="text-[10px] text-text-sub">{e.progress}%</span></div></div>,
      <StatusBadge key={`s-${i}`} status={e.status} />,
    ])} />
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
  const [view, setView] = useState<"list"|"create"|"result">("list");
  const [blueprintFile, setBlueprintFile] = useState("");
  const [tsubo, setTsubo] = useState("");
  const [buildingType, setBuildingType] = useState("2階建");
  const [buildingOrder, setBuildingOrder] = useState("注文");
  const [futaiCost, setFutaiCost] = useState("");
  const [shokeihi, setShokeihi] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [budgetResult, setBudgetResult] = useState<{ name: string; tsubo: string; type: string; orderType: string; items: { category: string; detail: string; amount: number; note: string }[]; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const buildingTypes = ["平屋", "2階建", "3階建", "アパート", "店舗"];
  const orderTypes = ["注文", "規格", "セミオーダー"];

  const analyzeSteps = ["図面データを読み込み中...", "間取り・構造を解析中...", "建物仕様を特定中...", "資材単価をマッチング中...", "工事費を積算中...", "実行予算書を生成中..."];

  const generateBudget = () => {
    if (!blueprintFile) return;
    if (!tsubo) { alert("建物の坪数を入力してください（必須）"); return; }
    if (!futaiCost) { alert("付帯工事の金額を入力してください（必須）"); return; }
    if (!shokeihi) { alert("諸経費の金額を入力してください（必須）"); return; }
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      if (step >= analyzeSteps.length) {
        clearInterval(iv);
        const t = parseFloat(tsubo) || 30;
        // 建物種別ごとの坪単価（万円）
        const unitCosts: Record<string, number> = { "平屋": 75, "2階建": 68, "3階建": 72, "アパート": 58, "店舗": 82 };
        const unit = unitCosts[buildingType] || 68;
        const base = t * unit;
        // 注文/規格/セミオーダーで坪単価を微調整
        const orderAdj: Record<string, number> = { "注文": 1.0, "規格": 0.85, "セミオーダー": 0.92 };
        const adj = orderAdj[buildingOrder] || 1.0;
        const adjBase = base * adj;
        const items: { category: string; detail: string; amount: number; note: string }[] = [
          { category: "仮設工事", detail: "足場・仮囲い・養生・仮設電気水道", amount: Math.round(adjBase * 0.05), note: "足場面積から算出" },
          { category: "基礎工事", detail: "根切り・砕石・捨コン・配筋・型枠・コンクリート打設", amount: Math.round(adjBase * 0.12), note: buildingType === "3階建" ? "杭基礎含む" : "ベタ基礎" },
          { category: "躯体工事", detail: buildingType === "店舗" ? "鉄骨造・デッキプレート" : "木造軸組・プレカット材", amount: Math.round(adjBase * 0.18), note: "図面より柱・梁数量算出" },
          { category: "屋根・板金工事", detail: buildingType === "アパート" ? "ガルバリウム鋼板葺き" : "瓦葺き・板金役物", amount: Math.round(adjBase * 0.06), note: "屋根面積: " + Math.round(t * 3.3 * (buildingType === "平屋" ? 1.2 : 0.6)) + "㎡" },
          { category: "外壁工事", detail: "窯業系サイディング16mm・通気工法", amount: Math.round(adjBase * 0.08), note: "外壁面積より算出" },
          { category: "防水工事", detail: buildingType === "アパート" ? "シート防水・FRP防水" : "FRP防水（バルコニー）", amount: Math.round(adjBase * 0.03), note: "" },
          { category: "建具工事", detail: "アルミ樹脂複合サッシ・玄関ドア・室内建具", amount: Math.round(adjBase * 0.08), note: "Low-E複層ガラス仕様" },
          { category: "内装工事", detail: "石膏ボード・クロス・フローリング・タイル", amount: Math.round(adjBase * 0.10), note: "延床" + Math.round(t * 3.3) + "㎡" },
          { category: "電気設備工事", detail: "分電盤・配線・照明・コンセント・LAN", amount: Math.round(adjBase * 0.08), note: buildingType === "店舗" ? "動力電源含む" : "太陽光対応PB" },
          { category: "給排水衛生設備", detail: "給水管・排水管・衛生器具・給湯器", amount: Math.round(adjBase * 0.08), note: buildingType === "アパート" ? (Math.round(t / 8) + "戸分") : "" },
          { category: "空調換気設備", detail: buildingType === "店舗" ? "業務用エアコン・換気設備" : "ルームエアコン・24h換気", amount: Math.round(adjBase * 0.05), note: "" },
          { category: "外構工事", detail: "駐車場・アプローチ・フェンス・植栽", amount: Math.round(adjBase * 0.05), note: "" },
        ];
        // 付帯工事（手入力）を加算
        const futaiVal = parseFloat(futaiCost) || 0;
        if (futaiVal > 0) {
          items.push({ category: "付帯工事", detail: "手入力による付帯工事費", amount: futaiVal, note: "手入力" });
        }
        // 諸経費（手入力・必須）を加算
        const shokeihiVal = parseFloat(shokeihi) || 0;
        items.push({ category: "諸経費", detail: "現場管理費・一般管理費・産廃処理", amount: shokeihiVal, note: "手入力" });
        const total = items.reduce((sum, it) => sum + it.amount, 0);
        setBudgetResult({ name: projectName || "新規工事", tsubo, type: buildingType, orderType: buildingOrder, items, total });
        setIsAnalyzing(false);
        setView("result");
      }
    }, 600);
  };

  if (view === "result" && budgetResult) {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <p className="text-sm font-bold text-green-800">AI図面解析完了 —「{budgetResult.name}」の実行予算書を作成しました</p>
            <p className="text-xs text-green-600">{budgetResult.type}（{budgetResult.orderType}）｜ {budgetResult.tsubo}坪（{Math.round(parseFloat(budgetResult.tsubo) * 3.3)}㎡）｜ 図面: {blueprintFile}</p>
          </div>
        </div>
        <button onClick={() => { setView("create"); setBudgetResult(null); }} className="text-xs text-amber-600 hover:text-amber-800 font-bold">再作成</button>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">実行予算 合計</p><p className="text-xl font-black text-amber-600">¥{(budgetResult.total).toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">粗利率</p><p className="text-xl font-black text-green-600">30%</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">粗利額</p><p className="text-xl font-black text-green-600">¥{Math.round(budgetResult.total * 0.3).toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">坪単価</p><p className="text-xl font-black text-text-main">¥{Math.round(budgetResult.total / parseFloat(budgetResult.tsubo)).toLocaleString()}万/坪</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">㎡単価</p><p className="text-xl font-black text-text-main">¥{Math.round(budgetResult.total / (parseFloat(budgetResult.tsubo) * 3.3) * 10000).toLocaleString()}/㎡</p></div>
      </div>
      <DataTable headers={["工種", "工事内容", "金額（万円）", "備考"]} rows={budgetResult.items.map((it, i) => [
        it.category,
        <span key={`d${i}`} className="text-xs">{it.detail}</span>,
        <span key={`a${i}`} className="font-bold">¥{it.amount.toLocaleString()}</span>,
        <span key={`n${i}`} className="text-xs text-text-sub">{it.note}</span>,
      ]).concat([
        [
          <span key="tt" className="font-black text-amber-600">実行予算 合計</span>,
          "",
          <span key="ta" className="font-black text-amber-600 text-base">¥{budgetResult.total.toLocaleString()}万</span>,
          "",
        ],
        [
          <span key="gt" className="font-black text-green-600">粗利（30%）</span>,
          "",
          <span key="ga" className="font-black text-green-600 text-base">¥{Math.round(budgetResult.total * 0.3).toLocaleString()}万</span>,
          "",
        ],
        [
          <span key="ct" className="font-black text-blue-600">請負金額（税抜）</span>,
          <span key="cd" className="text-xs text-text-sub">実行予算 + 粗利</span>,
          <span key="ca" className="font-black text-blue-600 text-lg">¥{Math.round(budgetResult.total * 1.3).toLocaleString()}万</span>,
          <span key="cn" className="text-xs text-text-sub">税込 ¥{Math.round(budgetResult.total * 1.3 * 1.1).toLocaleString()}万</span>,
        ],
      ])} />
    </>);
  }

  if (view === "create") {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      {isAnalyzing ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-base font-bold text-text-main mb-2">AI が図面を解析中...</p>
          <div className="max-w-md mx-auto space-y-2 mt-4">
            {analyzeSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < analyzeStep ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : i === analyzeStep ? (
                  <div className="w-[18px] h-[18px] border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
                )}
                <span className={`text-sm ${i < analyzeStep ? "text-green-700 font-medium" : i === analyzeStep ? "text-amber-700 font-bold" : "text-text-sub"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-bold text-text-main mb-2">実行予算 新規作成</h3>
          <p className="text-xs text-text-sub mb-6">図面をアップロードし、建物情報を入力すると、AIが図面を解読して実行予算を自動作成します。</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">図面アップロード <span className="text-red-500">*</span></label>
            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.jww,.dxf,.dwg" onChange={e => { if (e.target.files?.[0]) setBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-amber-400","bg-amber-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-amber-400","bg-amber-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-amber-400","bg-amber-50"); if (e.dataTransfer.files?.[0]) setBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-amber-300 hover:bg-amber-50/30 transition-colors cursor-pointer">
              {blueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-amber-700">{blueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-sm font-medium text-text-main mb-1">図面をアップロード（クリックまたはドラッグ&ドロップ）</p>
                  <p className="text-xs text-text-sub">対応形式: PDF / JPG / PNG / JWW / DXF / DWG</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">工事名</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" placeholder="例: ○○邸新築工事" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">建物の坪数 <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={tsubo} onChange={e => setTsubo(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 pr-10" placeholder="例: 35" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">坪</span>
              </div>
              {tsubo && <p className="text-[10px] text-text-sub mt-1">= {Math.round(parseFloat(tsubo) * 3.3)}㎡</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">構造種別 <span className="text-red-500">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {buildingTypes.map(bt => (
                  <button key={bt} onClick={() => setBuildingType(bt)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${buildingType === bt ? "bg-amber-500 text-white border-amber-500" : "bg-white text-text-main border-border hover:border-amber-300 hover:bg-amber-50"}`}>{bt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">建物種別 <span className="text-red-500">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {orderTypes.map(ot => (
                  <button key={ot} onClick={() => setBuildingOrder(ot)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${buildingOrder === ot ? "bg-blue-500 text-white border-blue-500" : "bg-white text-text-main border-border hover:border-blue-300 hover:bg-blue-50"}`}>{ot}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">付帯工事（万円） <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={futaiCost} onChange={e => setFutaiCost(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 pr-12" placeholder="例: 150" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
              </div>
              <p className="text-[10px] text-text-sub mt-1">外構・地盤改良・水道引込等（手入力 → 自動加算）</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">諸経費（万円） <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={shokeihi} onChange={e => setShokeihi(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 pr-12" placeholder="例: 100" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
              </div>
              <p className="text-[10px] text-text-sub mt-1">現場管理費・一般管理費等（手入力 → 自動加算）</p>
            </div>
          </div>

          {(!blueprintFile || !tsubo) && (blueprintFile || tsubo) && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-bold">
                {!blueprintFile && "⚠ 図面をアップロードしてください"}
                {blueprintFile && !tsubo && "⚠ 建物の坪数を入力してください（必須）"}
                {blueprintFile && tsubo && !futaiCost && "⚠ 付帯工事の金額を入力してください（必須）"}
                {blueprintFile && tsubo && futaiCost && !shokeihi && "⚠ 諸経費の金額を入力してください（必須）"}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setView("list")} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
            <button onClick={generateBudget} disabled={!blueprintFile} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${blueprintFile ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-300 cursor-not-allowed"}`}>
              AI図面解析 → 実行予算を自動作成
            </button>
          </div>
        </div>
      )}
    </>);
  }

  return (<>
    <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("create")} onExport={onExport} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "予算総額", value: "¥2億8,500万" }, { label: "実行額", value: "¥1億9,800万" }, { label: "残予算", value: "¥8,700万" }, { label: "予算消化率", value: "69.5%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事名", "請負額", "予算額", "実績額", "差額", "消化率"]} rows={[
      ["○○マンション新築", "¥1億2,850万", "¥9,850万", "¥7,230万", <span key="1" className="text-green-600 font-bold">+¥2,620万</span>, "73.4%"],
      ["△△ビル改修", "¥4,500万", "¥3,600万", "¥1,280万", <span key="2" className="text-green-600 font-bold">+¥2,320万</span>, "35.6%"],
      ["□□住宅リフォーム", "¥850万", "¥680万", "¥590万", <span key="3" className="text-green-600 font-bold">+¥90万</span>, "86.8%"],
      ["●●商業施設外構", "¥3,200万", "¥2,560万", "¥2,410万", <span key="4" className="text-green-600 font-bold">+¥150万</span>, "94.1%"],
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
  const [blueprintFile, setBlueprintFile] = useState<string>("");
  const blueprintRef = useRef<HTMLInputElement>(null);

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
            <input type="file" ref={blueprintRef} className="hidden" accept=".pdf,.jww,.dxf,.atr,.dwg" onChange={e => { if (e.target.files?.[0]) setBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => blueprintRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-purple-400","bg-purple-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); if (e.dataTransfer.files?.[0]) setBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-colors cursor-pointer">
              {blueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-purple-700">{blueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <p className="text-sm font-medium text-text-main mb-1">クリックまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-text-sub">対応形式: PDF / JWW / DXF / archiトレンド (.atr) / その他CADデータ</p>
                </>
              )}
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
      {[{ label: "入金済", value: "¥1億4,250万", color: "#10b981" }, { label: "未入金", value: "¥2,830万", color: "#ef4444" }, { label: "今月入金予定", value: "¥1,870万", color: "#3b82f6" }].map((s, i) => (
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
      {[{ label: "請負総額", value: "¥2億1,400万" }, { label: "原価合計", value: "¥1億6,300万" }, { label: "粗利", value: "¥5,100万" }, { label: "粗利率", value: "23.8%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["工事名", "請負額", "材料費", "労務費", "外注費", "経費", "原価計", "粗利率"]} rows={[
      ["○○マンション", "¥1億2,850万", "¥3,210万", "¥2,840万", "¥2,560万", "¥1,220万", "¥9,830万", <span key="1" className="font-bold text-green-600">23.5%</span>],
      ["△△ビル改修", "¥4,500万", "¥1,130万", "¥980万", "¥850万", "¥420万", "¥3,380万", <span key="2" className="font-bold text-green-600">24.9%</span>],
      ["□□住宅", "¥850万", "¥210万", "¥190万", "¥150万", "¥80万", "¥630万", <span key="3" className="font-bold text-yellow-600">25.9%</span>],
    ]} />
  </>);
}

function AdManagement({ onCreateNew, onExport }: ToolProps) {
  const [view, setView] = useState<"main"|"creative"|"measurement"|"research">("main");
  const [creativeStep, setCreativeStep] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [optimizeMode, setOptimizeMode] = useState<"housing"|"realestate">("housing");
  const [previewFormat, setPreviewFormat] = useState<"1:1"|"9:16"|"4:5"|"16:9">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [metaConnected, setMetaConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [measurementActive, setMeasurementActive] = useState(false);
  const [adFile, setAdFile] = useState<string>("");
  const adFileRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (p: string) => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const backToMain = () => { setView("main"); setCreativeStep(0); setAdFile(""); };

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
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-bold text-text-main mb-1">AI クリエイティブディレクター分析中...</p>
              <p className="text-xs text-text-sub">① 画像分析 → ② 戦略ポジショニング → ③ 広告バリエーション生成 → ④ プラットフォーム最適化 → ⑤ パフォーマンス予測</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">← 戻る</button>
          <h2 className="text-lg font-bold text-text-main">住宅・不動産 AIクリエイティブディレクター</h2>
        </div>
        <div className="flex items-center gap-2 mb-8">
          {["媒体選択", "素材アップロード", "AI分析・生成結果"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= creativeStep ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-sm ${i <= creativeStep ? "text-text-main font-medium" : "text-text-sub"}`}>{s}</span>
              {i < 2 && <div className={`w-12 h-0.5 ${i < creativeStep ? "bg-orange-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        {creativeStep === 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">配信する媒体とモードを選択してください</h3>
            <div className="mb-8">
              <p className="text-xs font-bold text-text-sub mb-3">媒体選択:</p>
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
            </div>
            <div className="mb-8">
              <p className="text-xs font-bold text-text-sub mb-3">最適化モード:</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setOptimizeMode("housing")} className={`p-6 rounded-xl border-2 text-left transition-all ${optimizeMode === "housing" ? "border-green-500 bg-green-50" : "border-border hover:border-green-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏠</span>
                    <span className="font-bold text-text-main">住宅特化</span>
                    {optimizeMode === "housing" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#16a34a"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">注文住宅・建売向け最適化</p>
                </button>
                <button onClick={() => setOptimizeMode("realestate")} className={`p-6 rounded-xl border-2 text-left transition-all ${optimizeMode === "realestate" ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏢</span>
                    <span className="font-bold text-text-main">不動産特化</span>
                    {optimizeMode === "realestate" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">販売・仲介物件向け最適化</p>
                </button>
              </div>
            </div>
            <button onClick={() => selectedPlatforms.length > 0 && setCreativeStep(1)} disabled={selectedPlatforms.length === 0} className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${selectedPlatforms.length > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}>次へ</button>
          </div>
        )}
        {creativeStep === 1 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">広告に使用する素材をアップロード</h3>
            <input type="file" ref={adFileRef} className="hidden" accept="image/*,video/mp4,video/quicktime" onChange={e => { if (e.target.files?.[0]) setAdFile(e.target.files[0].name); }} />
            <div onClick={() => adFileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-orange-400","bg-orange-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-orange-400","bg-orange-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-orange-400","bg-orange-50"); if (e.dataTransfer.files?.[0]) setAdFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-6 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer">
              {adFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  <div className="text-left">
                    <p className="text-sm font-bold text-orange-700">{adFile}</p>
                    <p className="text-xs text-text-sub">アップロード完了</p>
                  </div>
                  <button onClick={ev => { ev.stopPropagation(); setAdFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2 px-2 py-1 border border-red-200 rounded">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <p className="text-sm font-medium text-text-main mb-1">クリックまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-text-sub">JPG, PNG, MP4, MOV（最大100MB）</p>
                </>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-text-sub mb-3">選択内容:</p>
              <div className="space-y-2">
                <div className="flex gap-2">{selectedPlatforms.map(p => <span key={p} className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-border">{p === "meta" ? "Meta (Facebook/Instagram)" : "Google広告"}</span>)}</div>
                <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium border border-border">{optimizeMode === "housing" ? "🏠 住宅特化モード" : "🏢 不動産特化モード"}</span>
              </div>
            </div>
            <button onClick={() => { if (adFile) { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); setCreativeStep(2); }, 2000); } }} disabled={!adFile} className={`w-full py-3 rounded-lg font-bold transition-colors ${adFile ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>素材を生成する</button>
          </div>
        )}
        {creativeStep === 2 && (
          <div className="space-y-6">
            {/* STEP 1: IMAGE ANALYSIS */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">①</div>
                <h4 className="text-sm font-bold text-text-main">画像分析</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">物件タイプ</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "注文住宅" : "投資用物件"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">価格帯ポジション</span>
                    <span className="text-sm font-bold text-text-main">プレミアム</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">感情トーン</span>
                    <span className="text-sm font-bold text-text-main">上質で落ち着きのある</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">デザインレベル</span>
                    <span className="text-sm font-bold text-text-main">アーキテクトレベル</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ターゲット層</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "初回購入者" : "投資家向け"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-sub">想定価格帯</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "¥3,500万〜¥5,500万" : "¥8,000万〜¥1.2億"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">市場ポジション</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "高感度デザイン住宅" : "都心プレミアム物件"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: STRATEGIC POSITIONING */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">②</div>
                <h4 className="text-sm font-bold text-text-main">戦略的ポジショニング</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-text-sub">訴求軸</span>
                  <p className="text-sm text-text-main mt-1">{optimizeMode === "housing" ? "デザイン × ライフスタイル" : "資産価値 × 安全性"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">心理トリガー</span>
                  <p className="text-sm text-text-main mt-1">{optimizeMode === "housing" ? "憧れ × 安心感" : "合理的判断 × 将来価値"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">トーン設定</span>
                  <p className="text-sm text-text-main mt-1">インテリジェントで落ち着いた印象</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">避けるべき表現</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["誇大表現", "「最安値」", "押し売り", "非現実的な約束"].map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-red-50 border border-red-200 text-red-600 rounded">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: 3 HIGH-END AD VARIATIONS */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">③</div>
                <h4 className="text-sm font-bold text-text-main">広告バリエーション（3パターン）</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(optimizeMode === "housing" ? [
                  { label: "パターンA", headline: "暮らしを、設計する。", headlineChars: 9, subcopy: "あなたの理想を確かな技術で形に", subcopyChars: 18, cta: "無料相談を予約する", target: "30〜40代 初回住宅購入者", trigger: "憧れ × 安心感", best: true },
                  { label: "パターンB", headline: "静寂と光のある家。", headlineChars: 9, subcopy: "建築家と創る、特別な日常空間", subcopyChars: 16, cta: "モデルハウスを見学する", target: "30〜50代 デザイン志向層", trigger: "希少性 × ライフスタイル", best: false },
                  { label: "パターンC", headline: "資産になる、住まい。", headlineChars: 9, subcopy: "将来の価値を見据えた住宅設計", subcopyChars: 16, cta: "資料を請求する", target: "35〜50代 資産形成意識層", trigger: "合理的判断 × 将来価値", best: false },
                ] : [
                  { label: "パターンA", headline: "利回り、都心で確保。", headlineChars: 9, subcopy: "資産価値が落ちない立地戦略", subcopyChars: 16, cta: "収支シミュレーション", target: "35〜55代 不動産投資家", trigger: "合理的判断 × 安全性", best: true },
                  { label: "パターンB", headline: "堅実な資産運用を。", headlineChars: 9, subcopy: "長期安定収入を生む物件選び", subcopyChars: 16, cta: "物件資料を請求する", target: "40〜60代 安定志向投資家", trigger: "安全性 × 将来価値", best: false },
                  { label: "パターンC", headline: "資産形成は、不動産で。", headlineChars: 10, subcopy: "プロが厳選した投資物件をご提案", subcopyChars: 18, cta: "無料相談を予約する", target: "30〜45代 資産形成初心者", trigger: "合理的判断 × 安心感", best: false },
                ]).map((pattern, i) => (
                  <div key={i} className={`rounded-lg border-2 p-4 ${pattern.best ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-border"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: pattern.best ? "#fed7aa" : "#f3f4f6", color: pattern.best ? "#92400e" : "#6b7280" }}>{pattern.label}</span>
                        {pattern.best && <span className="text-orange-600 font-bold text-sm">⭐ 推奨</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-text-main">{pattern.headline}</p>
                          <span className="text-[10px] text-text-sub bg-white px-2 py-0.5 rounded border border-border">{pattern.headlineChars}字</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-text-main">{pattern.subcopy}</p>
                          <span className="text-[10px] text-text-sub bg-white px-2 py-0.5 rounded border border-border">{pattern.subcopyChars}字</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded font-medium hover:bg-orange-600 transition-colors">{pattern.cta}</button>
                        <span className="text-[10px] px-2 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded">{pattern.target}</span>
                        <span className="text-[10px] px-2 py-1 bg-purple-50 border border-purple-200 text-purple-600 rounded">{pattern.trigger}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GENERATED AD CREATIVE PREVIEW */}
            <div className="bg-white rounded-xl border-2 border-orange-300 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">生成された広告素材プレビュー</h4>
                  <p className="text-[10px] text-text-sub">各プラットフォーム向けに最適化されたクリエイティブ</p>
                </div>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">✓ 生成完了</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Instagram Feed 1:1 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Instagram Feed（1:1）</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                    {/* IG Header */}
                    <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
                      <span className="text-[9px] font-bold text-gray-900">builder_os_demo</span>
                      <span className="text-[9px] text-blue-500 ml-1">フォロー中</span>
                      <span className="text-[9px] text-gray-400 ml-auto">広告</span>
                    </div>
                    {/* Ad Image 1:1 */}
                    <div className="aspect-square relative" style={{ background: "linear-gradient(180deg, #2d6cb5 0%, #5a9fd4 20%, #f5f0e8 20%, #ebe5db 55%, #5a8c3c 55%, #3d6628 100%)" }}>
                      {/* Sky */}
                      <div className="absolute top-0 left-0 right-0 h-[20%]" style={{ background: "linear-gradient(180deg, #1a5490 0%, #4a8cc8 80%, #88c4e8 100%)" }}>
                        <div className="absolute top-[30%] left-[20%] w-[20%] h-[30%] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)" }} />
                      </div>
                      {/* Building */}
                      <div className="absolute top-[18%] left-[12%] right-[12%] h-[38%]" style={{ background: "linear-gradient(180deg, #f8f4ee 0%, #ede7dc 50%, #e2dbd0 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
                        <div className="absolute top-[15%] left-[8%] w-[25%] h-[48%] border border-gray-300/50" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 50%, #b8ddf0 100%)" }} />
                        <div className="absolute top-[15%] right-[8%] w-[25%] h-[48%] border border-gray-300/50" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 50%, #b8ddf0 100%)" }} />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[16%] h-[52%]" style={{ background: "linear-gradient(180deg, #7a5c3e 0%, #6b4d32 100%)" }} />
                      </div>
                      <div className="absolute top-[10%] left-[8%] right-[8%] h-[10%]" style={{ background: "linear-gradient(180deg, #3d3028 0%, #574538 100%)", clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)" }} />
                      {/* Ground */}
                      <div className="absolute bottom-0 left-0 right-0 h-[32%]" style={{ background: "linear-gradient(180deg, #5a8c3c 0%, #3d6628 100%)" }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[16%] h-full" style={{ background: "linear-gradient(180deg, #d4cfc5 0%, #c0b8ac 100%)" }} />
                      </div>
                      {/* Text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)" }}>
                        <p className="text-white font-bold text-xs leading-tight">{optimizeMode === "housing" ? "暮らしを、設計する。" : "利回り、都心で確保。"}</p>
                        <p className="text-white/80 text-[8px] mt-0.5">{optimizeMode === "housing" ? "あなたの理想を確かな技術で形に" : "資産価値が落ちない立地戦略"}</p>
                      </div>
                    </div>
                    {/* IG Actions */}
                    <div className="bg-white px-3 py-2 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </div>
                      <p className="text-[8px] text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">builder_os_demo</span> {optimizeMode === "housing" ? "建築家と創る、あなただけの住まい。無料相談受付中。" : "プロが厳選した都心投資物件。収支シミュレーション無料。"}</p>
                      <button className="w-full mt-1.5 py-1 bg-blue-500 text-white text-[8px] font-bold rounded">{optimizeMode === "housing" ? "無料相談を予約する" : "収支シミュレーション"}</button>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1080 × 1080px</p>
                </div>

                {/* Instagram Stories 9:16 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Instagram Stories（9:16）</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg" style={{ aspectRatio: "9/16", maxHeight: "380px" }}>
                    <div className="w-full h-full relative" style={{ background: "linear-gradient(180deg, #1a3a5c 0%, #2d6cb5 15%, #f0ece4 15%, #e8e2d8 50%, #4a7c3c 50%, #2d5818 100%)" }}>
                      {/* Stories UI - top */}
                      <div className="absolute top-0 left-0 right-0 z-10 p-2">
                        <div className="w-full h-0.5 bg-white/30 rounded-full mb-2"><div className="w-1/3 h-full bg-white rounded-full" /></div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 border border-white" />
                          <span className="text-[8px] font-bold text-white">builder_os_demo</span>
                          <span className="text-[8px] text-white/60">広告</span>
                        </div>
                      </div>
                      {/* Building */}
                      <div className="absolute top-[13%] left-[8%] right-[8%] h-[40%]" style={{ background: "linear-gradient(180deg, #f8f4ee 0%, #ede7dc 50%, #e2dbd0 100%)", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
                        <div className="absolute top-[12%] left-[6%] w-[28%] h-[50%]" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 50%, #b8ddf0 100%)" }} />
                        <div className="absolute top-[12%] left-[38%] w-[28%] h-[50%]" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 50%, #b8ddf0 100%)" }} />
                        <div className="absolute top-[12%] right-[6%] w-[22%] h-[70%]" style={{ background: "linear-gradient(180deg, #7a5c3e 0%, #6b4d32 100%)" }} />
                      </div>
                      <div className="absolute top-[6%] left-[4%] right-[4%] h-[9%]" style={{ background: "linear-gradient(180deg, #3d3028 0%, #574538 100%)", clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)" }} />
                      {/* Bottom gradient + text */}
                      <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 60%)" }}>
                        <div className="absolute bottom-12 left-4 right-4">
                          <p className="text-white font-black text-sm leading-tight mb-1">{optimizeMode === "housing" ? "暮らしを、\n設計する。" : "利回り、\n都心で確保。"}</p>
                          <p className="text-white/70 text-[8px] mb-2">{optimizeMode === "housing" ? "建築家と創る、あなただけの住まい" : "資産価値が落ちない立地戦略"}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] bg-white/20 text-white px-1.5 py-0.5 rounded">{optimizeMode === "housing" ? "注文住宅" : "投資物件"}</span>
                            <span className="text-[7px] bg-white/20 text-white px-1.5 py-0.5 rounded">{optimizeMode === "housing" ? "無料相談" : "利回り保証"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Swipe up CTA */}
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <div className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1">
                          <span className="text-[7px] font-bold text-gray-900">{optimizeMode === "housing" ? "無料相談を予約" : "シミュレーション"}</span>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1080 × 1920px</p>
                </div>

                {/* Google Display 16:9 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Google Display（16:9）</p>
                  <div className="space-y-3">
                    {/* Google Display Banner */}
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg aspect-video relative" style={{ background: "linear-gradient(135deg, #2d6cb5 0%, #5a9fd4 30%, #f5f0e8 30%, #ede7dc 65%, #5a8c3c 65%, #3d6628 100%)" }}>
                      <div className="absolute inset-0">
                        {/* Building simplified */}
                        <div className="absolute top-[15%] left-[5%] w-[45%] h-[55%]" style={{ background: "linear-gradient(180deg, #f8f4ee 0%, #e2dbd0 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                          <div className="absolute top-[15%] left-[8%] w-[35%] h-[40%]" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 100%)" }} />
                          <div className="absolute top-[15%] right-[8%] w-[35%] h-[40%]" style={{ background: "linear-gradient(135deg, #7ec8e3 0%, #4a9dc8 100%)" }} />
                        </div>
                        <div className="absolute top-[7%] left-[2%] w-[51%] h-[10%]" style={{ background: "#3d3028", clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)" }} />
                        {/* Right side - text panel */}
                        <div className="absolute top-0 right-0 w-[48%] h-full" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)" }}>
                          <div className="flex flex-col justify-center h-full p-3">
                            <p className="text-white font-black text-[10px] leading-tight mb-1">{optimizeMode === "housing" ? "暮らしを、設計する。" : "利回り、都心で確保。"}</p>
                            <p className="text-white/60 text-[7px] mb-2">{optimizeMode === "housing" ? "あなたの理想を確かな技術で形に" : "資産価値が落ちない立地戦略"}</p>
                            <button className="self-start text-[7px] bg-orange-500 text-white px-2 py-0.5 rounded font-bold">{optimizeMode === "housing" ? "無料相談" : "詳しく見る"}</button>
                          </div>
                        </div>
                        {/* Google Ad badge */}
                        <div className="absolute top-1 left-1 bg-yellow-400 text-[6px] font-bold text-gray-800 px-1 rounded">Ad</div>
                      </div>
                    </div>
                    {/* Google Search Ad */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow">
                      <p className="text-[9px] text-gray-500 mb-1">Google 検索広告プレビュー</p>
                      <div className="border border-gray-100 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[7px] bg-gray-900 text-white px-1 rounded font-bold">Ad</span>
                          <span className="text-[8px] text-emerald-700">www.builder-os-demo.jp</span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-700 mb-0.5">{optimizeMode === "housing" ? "暮らしを、設計する。｜建築家と創る住まい" : "利回り、都心で確保。｜プロが厳選する投資物件"}</p>
                        <p className="text-[8px] text-gray-600 leading-relaxed">{optimizeMode === "housing" ? "あなたの理想を確かな技術で形に。建築家との相談は無料。今なら無料相談キャンペーン開催中。" : "資産価値が落ちない立地戦略。長期安定収入を実現。収支シミュレーション付き。今すぐ相談。"}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1200 × 628px / テキスト広告</p>
                </div>
              </div>
              {/* Download/export bar */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] text-text-sub">
                  <span>📐 4フォーマット自動生成</span>
                  <span>🎨 高解像度出力対応</span>
                  <span>📱 レスポンシブ最適化済み</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-[10px] px-3 py-1.5 border border-border rounded font-medium hover:bg-gray-50 transition-colors">一括ダウンロード</button>
                  <button className="text-[10px] px-3 py-1.5 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors">入稿データ書き出し</button>
                </div>
              </div>
            </div>

            {/* STEP 4: PLATFORM OPTIMIZATION */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600">④</div>
                <h4 className="text-sm font-bold text-text-main">プラットフォーム最適化</h4>
              </div>
              <div className="space-y-6">
                {/* Meta Format */}
                {selectedPlatforms.includes("meta") && (
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">f</div>
                      <p className="text-sm font-bold text-text-main">Meta（Facebook/Instagram）</p>
                    </div>
                    <div className="space-y-2 text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded border border-gray-700">
                      <div><span className="text-purple-400">primary_text:</span> <span className="text-green-300">{optimizeMode === "housing" ? "暮らしを、設計する。あなたの理想を確かな技術で形に。建築家と創る高感度デザイン住宅。無料相談をご予約ください。" : "利回り、都心で確保。資産価値が落ちない立地戦略。長期安定収入を生む投資物件をご提案。収支シミュレーション実施中。"}</span></div>
                      <div><span className="text-purple-400">headline:</span> <span className="text-green-300">{optimizeMode === "housing" ? "暮らしを、設計する。" : "利回り、都心で確保。"}</span> <span className="text-yellow-300 text-[9px]">({optimizeMode === "housing" ? "9" : "9"}字)</span></div>
                      <div><span className="text-purple-400">description:</span> <span className="text-green-300">{optimizeMode === "housing" ? "あなたの理想を確かな技術で形に。建築家と創る住まい。" : "資産価値が落ちない立地戦略。長期安定収入を実現。"}</span> <span className="text-yellow-300 text-[9px]">(≤90字)</span></div>
                      <div><span className="text-purple-400">CTA:</span> <span className="text-green-300">{optimizeMode === "housing" ? "無料相談する" : "シミュレーション"}</span></div>
                    </div>
                  </div>
                )}

                {/* Google Format */}
                {selectedPlatforms.includes("google") && (
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-white border border-red-300 rounded flex items-center justify-center font-bold text-[10px]" style={{ color: "#4285f4" }}>G</div>
                      <p className="text-sm font-bold text-text-main">Google検索広告</p>
                    </div>
                    <div className="space-y-2 text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded border border-gray-700">
                      <div><span className="text-purple-400">headlines:</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "暮らしを、設計する。" : "利回り、都心で確保。"}</span> <span className="text-yellow-300">(9字)</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "建築家と創る住まい" : "資産価値が落ちない立地"}</span> <span className="text-yellow-300">(10字)</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "理想の人生を形に実現" : "プロが厳選する投資物件"}</span> <span className="text-yellow-300">(11字)</span></div>
                      <div className="mt-2"><span className="text-purple-400">descriptions:</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "あなたの理想を確かな技術で形に。建築家との相談は無料。" : "資産価値が落ちない立地戦略。長期安定収入を実現。今すぐ相談。"}</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "今なら無料相談キャンペーン開催中。個別対応で夢のお家を実現。" : "プロが厳選した投資物件。収支シミュレーション付き。資料請求今すぐ。"}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 5: PERFORMANCE PREDICTION */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-600">⑤</div>
                <h4 className="text-sm font-bold text-text-main">パフォーマンス予測</h4>
              </div>
              <div className="space-y-4">
                {/* CTR Prediction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-main">期待CTR</span>
                    <span className="text-sm font-bold text-emerald-600">{optimizeMode === "housing" ? "1.8%〜2.5%" : "1.5%〜2.2%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: optimizeMode === "housing" ? "75%" : "65%" }}></div>
                  </div>
                </div>

                {/* CVR Prediction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-main">期待CVR</span>
                    <span className="text-sm font-bold text-blue-600">{optimizeMode === "housing" ? "3.2%〜4.8%" : "2.5%〜3.8%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: optimizeMode === "housing" ? "80%" : "70%" }}></div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-bold text-text-sub mb-1">予測理由</p>
                  <p className="text-xs text-text-main leading-relaxed">
                    {optimizeMode === "housing" ? "高価格帯商材のため長い検討期間が必要。信頼構築 > 興奮で、理性的な訴求が効果的。デザインと安心感の組み合わせが心理的な障壁を低下させます。" : "投資判断は合理的・分析的。将来価値と安全性の両立が評価される。冷静で分析的なトーンが購買意欲につながります。"}
                  </p>
                </div>

                {/* Key Success Factors */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-sub">成功要因</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(optimizeMode === "housing" ? [
                      "信頼感を最優先",
                      "ビジュアル品質の高さ",
                      "来場予約への誘導",
                      "段階的な関係構築",
                    ] : [
                      "利回りの明確性",
                      "立地の安全性",
                      "長期価値の説明",
                      "シミュレーション提供",
                    ]).map((factor, i) => (
                      <div key={i} className="text-[10px] px-2 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 rounded font-medium flex items-center gap-1">
                        <span>→</span> {factor}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Rules */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs font-bold text-text-sub mb-2">重要ルール</p>
                  <div className="space-y-1">
                    {(optimizeMode === "housing" ? [
                      "来場予約を最終目標に設定",
                      "ファイナンシャル不安を和らげるトーン",
                      "信頼 > 興奮",
                      "合理性 > 過剰演出",
                    ] : [
                      "利回りを強調",
                      "長期資産安全性",
                      "冷静で分析的なトーン",
                      "将来価値を重視",
                    ]).map((rule, i) => (
                      <div key={i} className="text-[10px] text-text-main flex items-center gap-2">
                        <span className="text-orange-500 font-bold">✓</span> {rule}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={() => { setCreativeStep(0); setSelectedPlatforms([]); setAdFile(""); }} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">もう一度作成</button>
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
          ["○○ホーム", "世田谷区・目黒区", "8件", "¥35万", "Meta/Google", <StatusBadge key="1" status="配信中" />],
          ["△△建設", "杉並区・中野区", "5件", "¥20万", "Google", <StatusBadge key="2" status="配信中" />],
          ["□□ハウス", "練馬区", "6件", "¥28万", "Meta", <StatusBadge key="3" status="配信中" />],
          ["●●工務店", "板橋区・北区", "3件", "¥15万", "チラシ/DM", <StatusBadge key="4" status="配信中" />],
          ["◎◎リフォーム", "品川区", "1件", "¥8万", "Google", <StatusBadge key="5" status="終了" />],
        ]} />
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-4">競合キーワード重複分析</h3>
            <div className="space-y-3">
              {[{ kw: "東京都 新築", us: true, comp: 3 }, { kw: "世田谷区 リフォーム", us: true, comp: 2 }, { kw: "目黒 注文住宅", us: false, comp: 4 }, { kw: "東京 工務店", us: true, comp: 5 }, { kw: "杉並 リノベーション", us: false, comp: 2 }].map((k, i) => (
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
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchAreaM2, setSearchAreaM2] = useState("");
  const [searchAreaTsubo, setSearchAreaTsubo] = useState("");
  const [areaError, setAreaError] = useState("");
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [sf, setSf] = useState({ budget: "5,000", pref: "東京都", city: "", station: "", line: "", walk: "20", school: "", kenjo: "条件付き含む", tsuboMin: "30", tsuboMax: "70", nochi: "含む", chosei: "含む", buildTsubo: "30", buildType: "2階建て", buildBudget: "2,500", rate: "0.6", years: "35", down: "0" });
  const uf = (key: string, val: string) => setSf(prev => ({ ...prev, [key]: val }));

  const m2ToTsubo = (m2: number) => Math.round(m2 / 3.30579 * 10) / 10;
  const tsuboToM2 = (tsubo: number) => Math.round(tsubo * 3.30579 * 10) / 10;

  const handleM2Change = (val: string) => {
    setSearchAreaM2(val);
    setAreaError("");
    if (val && !isNaN(Number(val))) setSearchAreaTsubo(String(m2ToTsubo(Number(val))));
    else if (!val) setSearchAreaTsubo("");
  };

  const handleTsuboChange = (val: string) => {
    setSearchAreaTsubo(val);
    setAreaError("");
    if (val && !isNaN(Number(val))) setSearchAreaM2(String(tsuboToM2(Number(val))));
    else if (!val) setSearchAreaM2("");
  };

  // SUUMO prefecture code (JIS) & area code mapping
  const prefCodeMap: Record<string, { ta: string; ar: string }> = {
    "北海道": { ta: "01", ar: "010" }, "青森県": { ta: "02", ar: "020" }, "岩手県": { ta: "03", ar: "020" }, "宮城県": { ta: "04", ar: "020" }, "秋田県": { ta: "05", ar: "020" }, "山形県": { ta: "06", ar: "020" }, "福島県": { ta: "07", ar: "020" },
    "茨城県": { ta: "08", ar: "030" }, "栃木県": { ta: "09", ar: "030" }, "群馬県": { ta: "10", ar: "030" }, "埼玉県": { ta: "11", ar: "030" }, "千葉県": { ta: "12", ar: "030" }, "東京都": { ta: "13", ar: "030" }, "神奈川県": { ta: "14", ar: "030" },
    "新潟県": { ta: "15", ar: "040" }, "富山県": { ta: "16", ar: "040" }, "石川県": { ta: "17", ar: "040" }, "福井県": { ta: "18", ar: "040" },
    "山梨県": { ta: "19", ar: "040" }, "長野県": { ta: "20", ar: "040" }, "岐阜県": { ta: "21", ar: "050" }, "静岡県": { ta: "22", ar: "050" }, "愛知県": { ta: "23", ar: "050" }, "三重県": { ta: "24", ar: "050" },
    "滋賀県": { ta: "25", ar: "060" }, "京都府": { ta: "26", ar: "060" }, "大阪府": { ta: "27", ar: "060" }, "兵庫県": { ta: "28", ar: "060" }, "奈良県": { ta: "29", ar: "060" }, "和歌山県": { ta: "30", ar: "060" },
    "鳥取県": { ta: "31", ar: "070" }, "島根県": { ta: "32", ar: "070" }, "岡山県": { ta: "33", ar: "070" }, "広島県": { ta: "34", ar: "070" }, "山口県": { ta: "35", ar: "070" },
    "徳島県": { ta: "36", ar: "080" }, "香川県": { ta: "37", ar: "080" }, "愛媛県": { ta: "38", ar: "080" }, "高知県": { ta: "39", ar: "080" },
    "福岡県": { ta: "40", ar: "090" }, "佐賀県": { ta: "41", ar: "090" }, "長崎県": { ta: "42", ar: "090" }, "熊本県": { ta: "43", ar: "090" }, "大分県": { ta: "44", ar: "090" }, "宮崎県": { ta: "45", ar: "090" }, "鹿児島県": { ta: "46", ar: "090" }, "沖縄県": { ta: "47", ar: "090" },
  };

  const prefSlugMap: Record<string, string> = {
    "北海道": "hokkaido", "青森県": "aomori", "岩手県": "iwate", "宮城県": "miyagi", "秋田県": "akita",
    "山形県": "yamagata", "福島県": "fukushima", "茨城県": "ibaraki", "栃木県": "tochigi", "群馬県": "gunma",
    "埼玉県": "saitama", "千葉県": "chiba", "東京都": "tokyo", "神奈川県": "kanagawa",
    "新潟県": "niigata", "富山県": "toyama", "石川県": "ishikawa", "福井県": "fukui",
    "山梨県": "yamanashi", "長野県": "nagano", "岐阜県": "gifu", "静岡県": "shizuoka", "愛知県": "aichi", "三重県": "mie",
    "滋賀県": "shiga", "京都府": "kyoto", "大阪府": "osaka", "兵庫県": "hyogo", "奈良県": "nara", "和歌山県": "wakayama",
    "鳥取県": "tottori", "島根県": "shimane", "岡山県": "okayama", "広島県": "hiroshima", "山口県": "yamaguchi",
    "徳島県": "tokushima", "香川県": "kagawa", "愛媛県": "ehime", "高知県": "kochi",
    "福岡県": "fukuoka", "佐賀県": "saga", "長崎県": "nagasaki", "熊本県": "kumamoto", "大分県": "oita", "宮崎県": "miyazaki", "鹿児島県": "kagoshima", "沖縄県": "okinawa",
  };

  const openSuumo = () => {
    const slug = prefSlugMap[sf.pref] || "tokyo";
    // 都道府県の市区町村選択ページ（物件数も表示される確実なURL）
    window.open(`https://suumo.jp/tochi/${slug}/city/`, "_blank");
  };

  const handleSearch = () => {
    if (!searchAreaM2 && !searchAreaTsubo) {
      setAreaError("㎡ または 坪数 のどちらかを入力してください（必須）");
      return;
    }
    setAreaError("");
    setIsSearching(true);
    setSearchStep(1);
    [600, 1200, 1800, 2300, 2700].forEach((ms, i) => {
      setTimeout(() => setSearchStep(i + 2), ms);
    });
    setTimeout(() => {
      setIsSearching(false);
      setSearchStep(0);
      setHasSearched(true);
      setShowSearchForm(false);
      setSelectedProperty(null);
    }, 3200);
  };

  const properties = [
    { rank: 1, score: 92, name: "杉並区 成田東 土地", address: "東京都杉並区成田東3丁目", size: 150.0, sizeTsubo: 45.4, price: 48500000, tsuboPrice: 106.8, avgTsubo: 118.0, discount: "+10.5%", discountLabel: "割安", zoning: "第一種住居", coverage: 60, far: 200, maxFloor: 90.8, fitLabel: "◎ 余裕あり", hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "A", demolition: 0, grading: 0, totalCost: 59695000, loanAmount: 59695000, monthlyPayment: 153000, status: "受付中", station: "南阿佐ケ谷駅 徒歩12分", source: "SUUMO" as const, propertyNo: "S-20260218-001", scoreDetail: { cheap: 14, fit: 14, loan: 13, demolition: 10, grading: 14, hazard: 14, asset: 13 } },
    { rank: 2, score: 88, name: "練馬区 豊玉北 分譲地", address: "東京都練馬区豊玉北4丁目", size: 135.3, sizeTsubo: 40.9, price: 38000000, tsuboPrice: 92.8, avgTsubo: 98.0, discount: "+5.3%", discountLabel: "相場", zoning: "第二種住居", coverage: 60, far: 200, maxFloor: 81.8, fitLabel: "◎ 余裕あり", hazardFlood: "中", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "B", demolition: 0, grading: 500000, totalCost: 49735000, loanAmount: 49735000, monthlyPayment: 127000, status: "受付中", station: "練馬駅 徒歩15分", source: "REINS" as const, propertyNo: "R-20260218-024", scoreDetail: { cheap: 11, fit: 14, loan: 14, demolition: 10, grading: 12, hazard: 11, asset: 13 } },
    { rank: 3, score: 82, name: "世田谷区 桜丘 土地", address: "東京都世田谷区桜丘2丁目", size: 128.5, sizeTsubo: 38.9, price: 58000000, tsuboPrice: 149.0, avgTsubo: 155.0, discount: "+3.9%", discountLabel: "相場", zoning: "第一種住居", coverage: 50, far: 100, maxFloor: 38.9, fitLabel: "△ やや不足", hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "A", demolition: 0, grading: 0, totalCost: 70610000, loanAmount: 70610000, monthlyPayment: 181000, status: "受付中", station: "千歳船橋駅 徒歩10分", source: "SUUMO" as const, propertyNo: "S-20260218-003", scoreDetail: { cheap: 10, fit: 8, loan: 10, demolition: 10, grading: 15, hazard: 14, asset: 11 } },
    { rank: 4, score: 79, name: "板橋区 成増 土地", address: "東京都板橋区成増1丁目", size: 142.0, sizeTsubo: 42.9, price: 42000000, tsuboPrice: 97.9, avgTsubo: 105.0, discount: "+6.8%", discountLabel: "割安", zoning: "第一種住居", coverage: 60, far: 200, maxFloor: 85.8, fitLabel: "◎ 余裕あり", hazardFlood: "中", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "中", hazardScore: "B", demolition: 0, grading: 300000, totalCost: 53870000, loanAmount: 53870000, monthlyPayment: 138000, status: "受付中", station: "成増駅 徒歩9分", source: "REINS" as const, propertyNo: "R-20260218-037", scoreDetail: { cheap: 12, fit: 14, loan: 13, demolition: 10, grading: 13, hazard: 10, asset: 7 } },
    { rank: 5, score: 75, name: "目黒区 中根 住宅用地", address: "東京都目黒区中根1丁目", size: 105.2, sizeTsubo: 31.8, price: 72000000, tsuboPrice: 226.0, avgTsubo: 235.0, discount: "+3.8%", discountLabel: "相場", zoning: "第一種低層", coverage: 40, far: 80, maxFloor: 25.5, fitLabel: "✕ 不可", hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "中", hazardScore: "B", demolition: 0, grading: 0, totalCost: 85640000, loanAmount: 85640000, monthlyPayment: 219000, status: "受付中", station: "都立大学駅 徒歩8分", source: "SUUMO" as const, propertyNo: "S-20260218-005", scoreDetail: { cheap: 10, fit: 4, loan: 8, demolition: 10, grading: 15, hazard: 12, asset: 12 } },
    { rank: 6, score: 72, name: "中野区 鷺宮 土地", address: "東京都中野区鷺宮3丁目", size: 112.5, sizeTsubo: 34.0, price: 52000000, tsuboPrice: 152.9, avgTsubo: 160.0, discount: "+4.4%", discountLabel: "相場", zoning: "第一種低層", coverage: 50, far: 100, maxFloor: 34.0, fitLabel: "◎ 余裕あり", hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "A", demolition: 0, grading: 0, totalCost: 65350000, loanAmount: 65350000, monthlyPayment: 167000, status: "受付中", station: "鷺ノ宮駅 徒歩7分", source: "REINS" as const, propertyNo: "R-20260218-052", scoreDetail: { cheap: 9, fit: 12, loan: 9, demolition: 10, grading: 15, hazard: 14, asset: 3 } },
    { rank: 7, score: 68, name: "品川区 大井 住宅用地", address: "東京都品川区大井2丁目", size: 98.0, sizeTsubo: 29.6, price: 85000000, tsuboPrice: 286.0, avgTsubo: 278.0, discount: "-2.9%", discountLabel: "割高", zoning: "第一種低層", coverage: 50, far: 100, maxFloor: 29.6, fitLabel: "✕ 不可", hazardFlood: "中", hazardSlide: "なし", hazardTsunami: "低", hazardLiquefaction: "中", hazardScore: "C", demolition: 0, grading: 800000, totalCost: 101980000, loanAmount: 101980000, monthlyPayment: 261000, status: "受付中", station: "大井町駅 徒歩14分", source: "SUUMO" as const, propertyNo: "S-20260218-007", scoreDetail: { cheap: 6, fit: 4, loan: 6, demolition: 10, grading: 12, hazard: 10, asset: 12 } },
    { rank: 8, score: 64, name: "足立区 千住 土地", address: "東京都足立区千住旭町", size: 165.0, sizeTsubo: 49.9, price: 35000000, tsuboPrice: 70.1, avgTsubo: 75.0, discount: "+6.5%", discountLabel: "割安", zoning: "第二種住居", coverage: 60, far: 300, maxFloor: 99.8, fitLabel: "◎ 余裕あり", hazardFlood: "高", hazardSlide: "なし", hazardTsunami: "低", hazardLiquefaction: "高", hazardScore: "D", demolition: 0, grading: 200000, totalCost: 47320000, loanAmount: 47320000, monthlyPayment: 121000, status: "受付中", station: "北千住駅 徒歩18分", source: "REINS" as const, propertyNo: "R-20260218-068", scoreDetail: { cheap: 13, fit: 14, loan: 14, demolition: 10, grading: 13, hazard: 3, asset: 7 } },
  ];

  const scoreColors = (s: number) => s >= 85 ? "#059669" : s >= 70 ? "#2563eb" : s >= 50 ? "#d97706" : "#dc2626";
  const hazardColor = (v: string) => v === "なし" || v === "低" ? "#059669" : v === "中" ? "#d97706" : "#dc2626";

  const detail = selectedProperty !== null ? properties.find(p => p.rank === selectedProperty) : null;

  // If viewing a property detail
  if (detail) {
    return (<>
      <ToolHeader title="土地探し" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
      <button onClick={() => setSelectedProperty(null)} className="text-sm text-green-600 hover:text-green-800 mb-4 font-bold">← 検索結果一覧に戻る</button>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: detail.source === "SUUMO" ? "#f97316" : "#2563eb" }}>{detail.source}</span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: scoreColors(detail.score) }}>#{detail.rank}</span>
              <h3 className="text-base font-bold text-text-main">{detail.name}</h3>
            </div>
            <p className="text-xs text-text-sub">{detail.address} ｜ {detail.station} ｜ 物件No: {detail.propertyNo}</p>
          </div>
          <div className="text-center"><div className="text-3xl font-black" style={{ color: scoreColors(detail.score) }}>{detail.score}</div><p className="text-[10px] text-text-sub">/ 100点</p></div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-5">
          {[{ label: "割安度", val: detail.scoreDetail.cheap, max: 15 }, { label: "建物適合", val: detail.scoreDetail.fit, max: 15 }, { label: "ローン", val: detail.scoreDetail.loan, max: 15 }, { label: "解体", val: detail.scoreDetail.demolition, max: 10 }, { label: "造成", val: detail.scoreDetail.grading, max: 15 }, { label: "ハザード", val: detail.scoreDetail.hazard, max: 15 }, { label: "資産性", val: detail.scoreDetail.asset, max: 15 }].map((sc, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-lg p-2"><p className="text-[9px] text-text-sub">{sc.label}</p><p className="text-sm font-black" style={{ color: scoreColors(sc.val / sc.max * 100) }}>{sc.val}<span className="text-[9px] text-text-sub font-normal">/{sc.max}</span></p></div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-green-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">土地価格</p><p className="text-lg font-black text-green-700">¥{(detail.price / 10000).toLocaleString()}万</p></div>
          <div className="bg-blue-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">面積</p><p className="text-lg font-black text-blue-700">{detail.size}㎡ ({detail.sizeTsubo}坪)</p></div>
          <div className="bg-purple-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">坪単価</p><p className="text-lg font-black text-purple-700">¥{detail.tsuboPrice}万</p><p className="text-[10px] font-bold" style={{ color: detail.discountLabel === "割安" ? "#059669" : detail.discountLabel === "割高" ? "#dc2626" : "#6b7280" }}>{detail.discount} {detail.discountLabel}</p></div>
          <div className="bg-orange-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">建物適合</p><p className="text-lg font-black" style={{ color: detail.fitLabel.startsWith("◎") ? "#059669" : detail.fitLabel.startsWith("△") ? "#d97706" : "#dc2626" }}>{detail.fitLabel}</p><p className="text-[10px] text-text-sub">最大延床: {detail.maxFloor}坪</p></div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">ハザード評価 <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: detail.hazardScore === "A" ? "#d1fae5" : detail.hazardScore === "B" ? "#fef3c7" : "#fee2e2", color: detail.hazardScore === "A" ? "#059669" : detail.hazardScore === "B" ? "#d97706" : "#dc2626" }}>総合 {detail.hazardScore}</span></h4>
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "洪水", val: detail.hazardFlood }, { label: "土砂災害", val: detail.hazardSlide }, { label: "津波", val: detail.hazardTsunami }, { label: "液状化", val: detail.hazardLiquefaction }].map((h, i) => (
              <div key={i} className="text-center rounded-lg p-2 border border-border"><p className="text-[10px] text-text-sub">{h.label}</p><p className="text-sm font-bold" style={{ color: hazardColor(h.val) }}>{h.val}</p></div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">総事業費内訳</h4>
          <div className="space-y-2">
            {[{ label: "土地価格", val: detail.price }, { label: "建物価格（30坪想定）", val: 25000000 }, { label: "解体費", val: detail.demolition }, { label: "造成費", val: detail.grading }, { label: "外構費", val: 1500000 }, { label: "諸費用（7%）", val: Math.round((detail.price + 25000000 + detail.demolition + detail.grading + 1500000) * 0.07) }].map((c, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-text-sub">{c.label}</span><span className="font-bold text-text-main">¥{c.val.toLocaleString()}</span></div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2"><span className="text-green-700">総事業費合計</span><span className="text-green-700 text-base">¥{detail.totalCost.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-2">住宅ローンシミュレーション（元利均等）</h4>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[10px] text-text-sub">借入額</p><p className="text-sm font-bold text-blue-700">¥{detail.loanAmount.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">金利 0.6% / 35年</p><p className="text-sm font-bold text-blue-700">月額 ¥{detail.monthlyPayment.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">総返済額</p><p className="text-sm font-bold text-blue-700">¥{(detail.monthlyPayment * 420).toLocaleString()}</p></div>
          </div>
        </div>
        <button className="w-full py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ backgroundColor: detail.source === "SUUMO" ? "#f97316" : "#2563eb" }}>{detail.source === "SUUMO" ? "SUUMOで詳細を見る →" : "レインズ物件確認 →"}</button>
      </div>
    </>);
  }

  // Main view: search form + results
  return (<>
    <ToolHeader title="土地探し" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><p className="text-sm font-bold text-green-800">SUUMO × レインズ 全国土地検索エンジン</p><p className="text-xs text-green-600">SUUMO + レインズ同時検索 × 自動査定 × ハザード評価 × 総事業費算出</p></div>
    </div>

    {/* Search Form - collapsible after search */}
    <div className="bg-white border border-border rounded-xl mb-6 overflow-hidden">
      <button onClick={() => setShowSearchForm(!showSearchForm)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">🔍 検索条件{hasSearched && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">検索済み</span>}</h3>
        <span className="text-text-sub text-lg">{showSearchForm ? "▲" : "▼"}</span>
      </button>
      {showSearchForm && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">予算上限（万円）</label><input type="text" value={sf.budget} onChange={e => uf("budget", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">都道府県</label><input type="text" value={sf.pref} onChange={e => uf("pref", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">市区町村</label><input type="text" value={sf.city} onChange={e => uf("city", e.target.value)} placeholder="例: 世田谷区" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">最寄駅</label><input type="text" value={sf.station} onChange={e => uf("station", e.target.value)} placeholder="例: 荻窪" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">沿線</label><input type="text" value={sf.line} onChange={e => uf("line", e.target.value)} placeholder="例: 中央線" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">徒歩（分以内）</label><input type="text" value={sf.walk} onChange={e => uf("walk", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">建築条件</label><select value={sf.kenjo} onChange={e => uf("kenjo", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>条件付き含む</option><option>条件なしのみ</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">学区指定</label><input type="text" value={sf.school} onChange={e => uf("school", e.target.value)} placeholder="任意" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-green-800">希望面積（どちらか必須）</span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">必須</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-text-sub block mb-1">希望面積（㎡）</label>
                <input type="text" value={searchAreaM2} onChange={(e) => handleM2Change(e.target.value)} placeholder="例: 100" className={`w-full px-3 py-2 border rounded-lg text-sm ${areaError ? "border-red-400 bg-red-50" : "border-border"}`} />
              </div>
              <div>
                <label className="text-[10px] text-text-sub block mb-1">希望面積（坪数）</label>
                <input type="text" value={searchAreaTsubo} onChange={(e) => handleTsuboChange(e.target.value)} placeholder="例: 30" className={`w-full px-3 py-2 border rounded-lg text-sm ${areaError ? "border-red-400 bg-red-50" : "border-border"}`} />
              </div>
              <div className="col-span-2 flex items-end"><p className="text-[10px] text-green-700">※ どちらか一方を入力すると自動換算されます（1坪 ≒ 3.306㎡）</p></div>
            </div>
            {areaError && <p className="text-xs text-red-500 mt-2 font-bold">{areaError}</p>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">土地面積（坪）下限</label><input type="text" value={sf.tsuboMin} onChange={e => uf("tsuboMin", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">土地面積（坪）上限</label><input type="text" value={sf.tsuboMax} onChange={e => uf("tsuboMax", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">農地含む</label><select value={sf.nochi} onChange={e => uf("nochi", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>含む</option><option>含まない</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">調整区域含む</label><select value={sf.chosei} onChange={e => uf("chosei", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>含む</option><option>含まない</option></select></div>
          </div>

          <h4 className="text-xs font-bold text-text-main mt-5 mb-3 border-t border-border pt-4">建物プラン・資金計画</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="text-[10px] text-text-sub block mb-1">希望建物坪数</label><input type="text" value={sf.buildTsubo} onChange={e => uf("buildTsubo", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">建物タイプ</label><select value={sf.buildType} onChange={e => uf("buildType", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>2階建て</option><option>3階建て</option><option>平屋</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">建物予算（万円）</label><input type="text" value={sf.buildBudget} onChange={e => uf("buildBudget", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">ローン金利（%）</label><input type="text" value={sf.rate} onChange={e => uf("rate", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div><label className="text-[10px] text-text-sub block mb-1">借入年数</label><input type="text" value={sf.years} onChange={e => uf("years", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">頭金（万円）</label><input type="text" value={sf.down} onChange={e => uf("down", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSearch} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-base shadow-lg">🔍 検索（AI事業性分析）</button>
            <button onClick={openSuumo} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors text-base shadow-lg">🏠 SUUMOで{sf.pref}の土地を探す →</button>
          </div>
          <p className="text-center text-[10px] text-text-sub mt-2">SUUMOの{sf.pref}土地一覧ページが新しいタブで開きます ｜ AI分析はダッシュボード内に表示されます</p>
        </div>
      )}
    </div>

    {/* Loading overlay */}
    {isSearching && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-5" />
          <h3 className="text-lg font-bold text-text-main mb-4 text-center">SUUMO × レインズ 同時検索中...</h3>
          <div className="space-y-3">
            {["SUUMO データベース接続", "レインズ 不動産流通標準情報システム接続", "条件マッチング実行（852件スキャン）", "ハザードマップ照合", "事業性スコア算出", "AI最適ランキング生成"].map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{searchStep > i + 1 ? "✅" : searchStep === i + 1 ? "⏳" : "⭕"}</span>
                <span className={`text-sm ${searchStep > i + 1 ? "text-green-700 font-bold" : searchStep === i + 1 ? "text-text-main font-bold animate-pulse" : "text-text-sub"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* SEARCH RESULTS - only shown after search */}
    {hasSearched && (
      <>
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏠</span>
            <div>
              <h3 className="text-lg font-bold text-orange-800">SUUMOの検索結果は新しいタブで表示中</h3>
              <p className="text-xs text-orange-700">SUUMOタブで本物の物件情報をご確認ください ｜ 以下はAIによる事業性分析サンプルです</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={openSuumo} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">🏠 SUUMOで{sf.pref}の土地を探す →</button>
          </div>
        </div>

        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="text-lg font-bold text-green-800">AI事業性分析（参考データ）— {properties.length}件</h3>
              <p className="text-xs text-green-700">希望面積: {searchAreaTsubo}坪（{searchAreaM2}㎡） ｜ {sf.pref} ｜ スコア順に表示</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "検索ヒット数", value: `${properties.length}件`, color: "#059669", bg: "#d1fae5" },
              { label: "最高スコア", value: "92点", color: "#2563eb", bg: "#dbeafe" },
              { label: "SUUMO物件", value: `${properties.filter(p => p.source === "SUUMO").length}件`, color: "#f97316", bg: "#ffedd5" },
              { label: "レインズ物件", value: `${properties.filter(p => p.source === "REINS").length}件`, color: "#2563eb", bg: "#dbeafe" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: s.bg }}><p className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
            ))}
          </div>
        </div>

        {/* AI judgment */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-green-800 mb-3">AI事業性判定</h3>
          <div className="space-y-2 text-xs text-green-900">
            <p><span className="font-bold">推奨物件:</span> 杉並区 成田東（92点/SUUMO）— 割安率+10.5%、建物30坪が余裕で配置可能、ハザードA評価。総事業費5,970万円で月額返済15.3万円と負担も適正。</p>
            <p><span className="font-bold">次点:</span> 練馬区 豊玉北（88点/レインズ）— 総事業費が4,974万円。洪水リスク「中」だが、返済負担は軽い。</p>
            <p><span className="font-bold">コスパ最強:</span> 足立区 千住（64点/レインズ）— 最安3,500万円で49.9坪の広さ。ただしハザードD評価のため要検討。</p>
          </div>
        </div>

        {/* Property cards */}
        <h3 className="text-sm font-bold text-text-main mb-3">物件一覧（スコア順）</h3>
        <div className="space-y-3">
          {properties.map((p) => (
            <button key={p.rank} onClick={() => setSelectedProperty(p.rank)} className="w-full text-left bg-white border border-border rounded-xl p-4 hover:shadow-lg hover:border-green-400 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: scoreColors(p.score) + "18" }}>
                    <span className="text-xl font-black" style={{ color: scoreColors(p.score) }}>{p.score}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: p.source === "SUUMO" ? "#f97316" : "#2563eb" }}>{p.source}</span>
                      <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: scoreColors(p.score) }}>#{p.rank}</span>
                      <span className="text-sm font-bold text-text-main">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: p.discountLabel === "割安" ? "#d1fae5" : p.discountLabel === "割高" ? "#fee2e2" : "#f3f4f6", color: p.discountLabel === "割安" ? "#059669" : p.discountLabel === "割高" ? "#dc2626" : "#6b7280" }}>{p.discountLabel} {p.discount}</span>
                    </div>
                    <p className="text-[10px] text-text-sub mt-0.5">{p.address} ｜ {p.station}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-text-sub">
                      <span>{p.size}㎡ ({p.sizeTsubo}坪)</span>
                      <span>¥{(p.price / 10000).toLocaleString()}万</span>
                      <span>坪{p.tsuboPrice}万</span>
                      <span className="font-bold" style={{ color: p.fitLabel.startsWith("◎") ? "#059669" : p.fitLabel.startsWith("△") ? "#d97706" : "#dc2626" }}>{p.fitLabel}</span>
                      <span>ハザード{p.hazardScore}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-sub">総事業費</p>
                  <p className="text-sm font-bold text-text-main">¥{(p.totalCost / 10000).toLocaleString()}万</p>
                  <p className="text-[10px] text-text-sub">月額 ¥{p.monthlyPayment.toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </>
    )}
  </>);
}

function SubsidyManagement({ onCreateNew, onExport }: ToolProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPref, setSelectedPref] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "pipeline" | "alert">("search");
  const [expandedKeywords, setExpandedKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSubsidy, setExpandedSubsidy] = useState<number | null>(null);

  const prefectures = ["all", "国（全国共通）", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];

  // Comprehensive municipality data for all 47 prefectures
  const municipalityData: Record<string, string[]> = {
    "北海道": ["札幌市中央区", "札幌市北区", "札幌市東区", "札幌市白石区", "札幌市豊平区", "札幌市南区", "札幌市西区", "札幌市厚別区", "札幌市手稲区", "札幌市清田区", "函館市", "小樽市", "旭川市", "室蘭市", "釧路市", "帯広市", "北見市", "夕張市", "岩見沢市", "網走市", "留萌市", "苫小牧市", "稚内市", "美唄市", "芦別市", "江別市", "赤平市", "紋別市", "士別市", "名寄市", "三笠市", "根室市", "千歳市", "滝川市", "砂川市", "歌志内市", "深川市", "富良野市", "登別市", "恵庭市", "伊達市", "北広島市", "石狩市", "北斗市", "当別町", "新篠津町", "南幌町", "月形町", "長沼町", "由仁町", "栗山町", "夕張郡", "岩村田町", "美唄市", "上砂川町", "南富良野町", "占冠村", "和寒町", "剣淵町", "下川町", "美深町", "音威子府村", "中川町", "豊富町", "幌延町", "小清水町", "清里町", "訓子府町", "置戸町", "常呂町", "佐呂間町", "遠軽町", "湧別町", "上湧別町", "苫前町", "羽幌町", "初山別村", "天塩町", "猿払村", "浜頓別町", "中頓別町", "枝幸町", "豊頓町", "利尻町", "利尻富士町", "礼文町", "増毛町", "留萌市", "小平町", "苫小牧市", "白老町", "厚真町", "安平町", "むかわ町", "日高町", "平取町", "新冠町", "浦河町", "様似町", "えりも町", "新ひだか町", "足寄町", "陸別町", "本別町", "大樹町", "広尾町", "幕別町", "池田町", "豊頃町", "音更町", "士幌町", "上士幌町", "鹿追町", "新得町", "清水町", "芽室町", "中札内村", "更別村", "大空町", "東神楽町", "当麻町", "比布町", "愛別町", "上川町", "東川町", "美瑛町", "南富良野町", "中富良野町", "精華町", "上富良野町", "中山町", "増毛町", "雨竜町", "沼田町", "北竜町", "秩父別町", "妹背牛町", "朱鞠内町"],
    "青森県": ["青森市", "弘前市", "八戸市", "黒石市", "五所川原市", "十和田市", "三沢市", "むつ市", "平川市", "平内町", "今別町", "蓬田村", "外ヶ浜町", "鶴田町", "中泊町", "野辺地町", "七戸町", "凡そ町", "東北町", "おいらせ町", "大間町", "東通村", "風間浦村", "佐井村"],
    "岩手県": ["盛岡市", "宮古市", "大船渡市", "花巻市", "北上市", "久慈市", "遠野市", "一関市", "陸前高田市", "釜石市", "二戸市", "八幡平市", "奥州市", "滝沢市", "雫石町", "葛巻町", "岩手町", "紫波町", "矢巾町", "西和賀町", "平泉町", "大槌町", "山田町", "岩泉町", "田野畑村", "普代村", "軽米町", "野田村", "九戸村"],
    "宮城県": ["仙台市青葉区", "仙台市宮城野区", "仙台市若林区", "仙台市太白区", "仙台市泉区", "石巻市", "塩竈市", "気仙沼市", "白石市", "名取市", "角田市", "多賀城市", "岩沼市", "登米市", "栗原市", "東松島市", "大崎市", "富谷市", "蛇田町", "利府町", "大和町", "大郷町", "大衡村", "色麻町", "加美町", "涌谷町", "美里町", "女川町", "南三陸町"],
    "秋田県": ["秋田市", "能代市", "横手市", "大館市", "男鹿市", "湯沢市", "鹿角市", "由利本荘市", "潟上市", "大仙市", "北秋田市", "にかほ市", "仙北市", "小坂町", "上小阿仁村", "藍沢町", "三種町", "八峰町", "五城目町", "八郎潟町", "井川町", "大潟村"],
    "山形県": ["山形市", "米沢市", "鶴岡市", "酒田市", "新庄市", "寒河江市", "上山市", "村山市", "長井市", "天童市", "東根市", "尾花沢市", "南陽市", "山辺町", "中山町", "河北町", "大江町", "大石田町", "金山町", "最上町", "舟形町", "真室川町", "大蔵村", "鮭川村", "戸沢村", "高畠町", "川西町", "小国町", "白鷹町", "飯豊町"],
    "福島県": ["福島市", "会津若松市", "郡山市", "いわき市", "白河市", "須賀川市", "喜多方市", "相馬市", "二本松市", "田村市", "南相馬市", "伊達市", "本宮市", "矢吹町", "棚倉町", "矢祭町", "塙町", "鮫川村", "石川町", "玉川村", "平田村", "浅川町", "古殿町", "三春町", "小野町", "広野町", "楢葉町", "富岡町", "川内村", "大熊町", "双葉町", "浪江町", "葛尾村", "新地町", "飯舘村", "会津坂下町", "湯川村", "柳津町", "三島町", "金山町", "昭和村", "会津美里町", "下郷町", "檜枝岐村", "只見町", "南会津町", "猪苗代町", "会津若松市", "北塩原村", "西会津町"],
    "茨城県": ["水戸市", "日立市", "土浦市", "古河市", "石岡市", "結城市", "龍ケ崎市", "下妻市", "常総市", "常陸太田市", "高萩市", "北茨城市", "笠間市", "取手市", "牛久市", "つくば市", "ひたちなか市", "茨城町", "大洗町", "城里町", "東海村", "那珂町", "鉾田市", "潮来市", "美浦村", "阿見町", "利根町", "稲敷市", "稲敷町", "神栖市", "行方市", "鹿嶋市", "かすみがうら市", "桜川市", "小美玉市", "坂東市"],
    "栃木県": ["宇都宮市", "足利市", "栃木市", "佐野市", "鹿沼市", "日光市", "小山市", "真岡市", "大田原市", "矢板市", "那須塩原市", "さくら市", "那須烏山市", "下野市", "上三川町", "益子町", "茂木町", "市貝町", "芳賀町", "壬生町", "野木町", "塩谷町", "高根沢町", "那須町", "那珂川町"],
    "群馬県": ["前橋市", "高崎市", "桐生市", "伊勢崎市", "太田市", "沼田市", "館林市", "渋川市", "藤岡市", "富岡市", "安中市", "みどり市", "榛東村", "吉賀町", "上野村", "神流町", "下仁田町", "南牧村", "甘楽町", "中之条町", "長野原町", "嬬恋村", "草津町", "高山村", "東吾妻町", "片品村", "川場村", "昭和村", "みなかみ町", "玉村町", "板倉町", "明和町", "千代田町", "大泉町", "邑楽町"],
    "埼玉県": ["さいたま市西区", "さいたま市北区", "さいたま市大宮区", "さいたま市見沼区", "さいたま市中央区", "さいたま市桜区", "さいたま市浦和区", "さいたま市南区", "さいたま市緑区", "さいたま市岩槻区", "川越市", "熊谷市", "川口市", "行田市", "秩父市", "所沢市", "飯能市", "加須市", "本庄市", "東松山市", "春日部市", "狭山市", "羽生市", "鶴ヶ島市", "越谷市", "蕨市", "戸田市", "入間市", "朝霞市", "志木市", "和光市", "新座市", "桶川市", "久喜市", "北本市", "八潮市", "富士見市", "三郷市", "蓮田市", "坂戸市", "幸手市", "鶴ヶ島市", "日高市", "吉川市", "ふじみ野市", "白岡市", "伊奈町", "三芳町", "毛呂山町", "越生町", "滑川町", "嵐山町", "小川町", "川島町", "吉見町", "鳩山町", "ときがわ町", "東秩父村", "美里町", "神川町", "上里町", "寄居町"],
    "千葉県": ["千葉市中央区", "千葉市花見川区", "千葉市稲毛区", "千葉市若葉区", "千葉市緑区", "千葉市美浜区", "銚子市", "市川市", "船橋市", "館山市", "木更津市", "松戸市", "野田市", "茂原市", "成田市", "佐倉市", "東金市", "旭市", "習志野市", "柏市", "勝浦市", "市原市", "流山市", "八千代市", "我孫子市", "鴨川市", "鎌ケ谷市", "匝瑳市", "香取市", "山武市", "いすみ市", "大多喜町", "御宿町", "九十九里町", "芝山町", "横芝光町", "一宮町", "睦沢町", "長南町", "白子町", "長生村", "長柄町", "長南町"],
    "東京都": ["千代田区", "中央区", "港区", "新宿区", "文京区", "台東区", "墨田区", "江東区", "品川区", "目黒区", "大田区", "世田谷区", "渋谷区", "中野区", "杉並区", "豊島区", "北区", "荒川区", "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区", "八王子市", "立川市", "武蔵野市", "三鷹市", "青梅市", "府中市", "昭島市", "調布市", "町田市", "小金井市", "小平市", "日野市", "東村山市", "国分寺市", "国立市", "福生市", "狛江市", "東大和市", "清瀬市", "東久留米市", "武蔵村山市", "多摩市", "稲城市", "羽村市", "あきる野市", "西東京市", "瑞穂町", "日の出町", "檜原村", "奥多摩町"],
    "神奈川県": ["横浜市鶴見区", "横浜市神奈川区", "横浜市西区", "横浜市中区", "横浜市南区", "横浜市港南区", "横浜市保土ケ谷区", "横浜市旭区", "横浜市磯子区", "横浜市金沢区", "横浜市港北区", "横浜市緑区", "横浜市青葉区", "横浜市都筑区", "川崎市川崎区", "川崎市幸区", "川崎市中原区", "川崎市高津区", "川崎市多摩区", "川崎市宮前区", "川崎市麻生区", "相模原市緑区", "相模原市中央区", "相模原市南区", "横須賀市", "平塚市", "鎌倉市", "藤沢市", "小田原市", "茅ヶ崎市", "逗子市", "三浦市", "秦野市", "厚木市", "大和市", "伊勢原市", "海老名市", "座間市", "南足柄市", "綾瀬市", "葉山町", "寒川町", "大磯町", "二宮町", "中井町", "大井町", "松田町", "山北町", "開成町", "箱根町", "真鶴町", "湯河原町", "愛川町", "清川村"],
    "新潟県": ["新潟市北区", "新潟市東区", "新潟市中央区", "新潟市江南区", "新潟市秋葉区", "新潟市南区", "新潟市西区", "新潟市西蒲区", "長岡市", "三条市", "柏崎市", "新発田市", "小千谷市", "加茂市", "十日町市", "見附市", "村上市", "燕市", "糸魚川市", "妙高市", "五泉市", "上越市", "阿賀野市", "佐渡市", "魚沼市", "南魚沼市", "胎内市", "聖籠町", "弥彦村", "田上町", "阿賀町", "出雲崎町", "湯沢町", "津南町", "刈羽村"],
    "富山県": ["富山市", "高岡市", "魚津市", "氷見市", "滑川市", "黒部市", "砺波市", "小松島市", "南砺市", "射水市", "舟橋村", "上市町", "立山町", "入善町", "朝日町"],
    "石川県": ["金沢市", "七尾市", "小松市", "輪島市", "珠洲市", "加賀市", "羽咋市", "かほく市", "白山市", "能美市", "野々市市", "川北町", "津幡町", "内灘町", "志賀町", "宝達志水町", "中能登町"],
    "福井県": ["福井市", "敦賀市", "小浜市", "大野市", "勝山市", "鯖江市", "あわら市", "越前市", "坂井市", "永平寺町", "池田町", "南越前町", "越前町", "高浜町", "おおい町", "若狭町"],
    "山梨県": ["甲府市", "富士吉田市", "都留市", "山梨市", "大月市", "韮崎市", "南アルプス市", "北杜市", "甲斐市", "笛吹市", "甲州市", "中央市", "市川三郷町", "早川町", "身延町", "南部町", "富士川町", "昭和町", "道志村", "西桂町", "忍野村", "山中湖村", "富士河口湖町", "小菅村", "丹波山村"],
    "長野県": ["長野市", "松本市", "上田市", "岡谷市", "飯田市", "諏訪市", "須坂市", "小諸市", "伊那市", "駒ヶ根市", "中野市", "大町市", "飯山市", "茅野市", "塩尻市", "佐久市", "千曲市", "東御市", "安曇野市", "小海町", "川上村", "南牧村", "北相木村", "佐久穂町", "軽井沢町", "御代田町", "立科町", "青木村", "長和町", "下諏訪町", "富士見町", "原村", "辰野町", "箕輪町", "飯島町", "南箕輪村", "中川村", "松川町", "高森町", "阿南町", "阿智村", "平谷村", "根羽村", "下條村", "売木村", "天龍村", "泰阜村", "喬木村", "豊丘村", "大鹿村", "上松町", "南木曽町", "木祖村", "王滝村", "開田高原町", "木曽町", "麻績村", "生坂村", "山形村", "朝日村", "筑北村", "池田町", "松川村", "白馬村", "小谷村"],
    "岐阜県": ["岐阜市", "大垣市", "高山市", "多治見市", "関市", "中津川市", "美濃市", "瑞浪市", "羽島市", "恵那市", "美濃加茂市", "土岐市", "各務原市", "可児市", "山県市", "瑞穂市", "飛騨市", "本巣市", "郡上市", "下呂市", "海津市", "岐南町", "笠松町", "養老町", "垂井町", "関ヶ原町", "神戸町", "輪之内町", "安八町", "揖斐川町", "大野町", "池田町", "北方町", "坂祝町", "富加町", "川辺町", "七宗町", "八百津町", "白川町", "東白川村"],
    "静岡県": ["静岡市葵区", "静岡市駿河区", "静岡市清水区", "浜松市中央区", "浜松市東区", "浜松市西区", "浜松市南区", "浜松市北区", "浜松市浜北区", "浜松市天竜区", "沼津市", "熱海市", "三島市", "富士宮市", "伊東市", "島田市", "富士市", "焼津市", "掛川市", "藤枝市", "御殿場市", "袋井市", "下田市", "裾野市", "湖西市", "伊豆市", "御前崎市", "菊川市", "伊豆の国市", "牧之原市", "東伊豆町", "河津町", "南伊豆町", "松崎町", "西伊豆町", "函南町", "清水町", "長泉町", "小山町", "吉田町", "川根本町"],
    "愛知県": ["名古屋市千種区", "名古屋市東区", "名古屋市北区", "名古屋市西区", "名古屋市中村区", "名古屋市中区", "名古屋市昭和区", "名古屋市瑞穂区", "名古屋市熱田区", "名古屋市中川区", "名古屋市港区", "名古屋市南区", "名古屋市守山区", "名古屋市緑区", "名古屋市名東区", "名古屋市天白区", "豊橋市", "岡崎市", "一宮市", "瀬戸市", "半田市", "春日井市", "豊川市", "津島市", "碧南市", "刈谷市", "豊田市", "安城市", "西尾市", "蒲郡市", "犬山市", "常滑市", "江南市", "小牧市", "稲沢市", "新城市", "東海市", "大府市", "知多市", "知立市", "尾張旭市", "高浜市", "岩倉市", "豊明市", "日進市", "清須市", "北名古屋市", "弥富市", "みよし市", "あま市", "長久手市", "東郷町", "豊山町", "大口町", "扶桑町", "大治町", "蟹江町", "飛島村", "阿久比町", "東浦町", "南知多町", "美浜町", "武豊町"],
    "三重県": ["津市", "四日市市", "伊津市", "松阪市", "桑名市", "鈴鹿市", "名張市", "尾鷲市", "亀山市", "鳥羽市", "熊野市", "いなべ市", "志摩市", "伊賀市", "菰野町", "朝日町", "川越町", "多気町", "明和町", "大台町", "玉城町", "度会町", "大紀町", "南伊勢町", "紀北町", "御浜町", "紀宝町"],
    "滋賀県": ["大津市", "彦根市", "長浜市", "近江八幡市", "草津市", "守山市", "栗東市", "甲賀市", "野洲市", "湖南市", "高島市", "東近江市", "米原市", "日野町", "竜王町", "愛荘町", "豊郷町", "甲良町", "多賀町"],
    "京都府": ["京都市北区", "京都市上京区", "京都市左京区", "京都市中京区", "京都市東山区", "京都市下京区", "京都市南区", "京都市右京区", "京都市伏見区", "京都市山科区", "京都市西京区", "福知山市", "舞鶴市", "綾部市", "宇治市", "宮津市", "亀岡市", "城陽市", "向日市", "長岡京市", "八幡市", "京田辺市", "京丹後市", "南丹市", "木津川市", "大山崎町", "久御山町", "井手町", "宇治田原町", "笑顔町", "南山城村", "京丹波町", "与謝野町"],
    "大阪府": ["大阪市都島区", "大阪市福島区", "大阪市此花区", "大阪市港区", "大阪市大正区", "大阪市旭区", "大阪市城東区", "大阪市阿倍野区", "大阪市住ノ江区", "大阪市東淀川区", "大阪市東成区", "大阪市西成区", "大阪市戸島区", "大阪市東住吉区", "大阪市西淀川区", "大阪市淀川区", "大阪市鶴見区", "大阪市住吉区", "大阪市東区", "大阪市中央区", "豊中市", "池田市", "吹田市", "泉大津市", "高槻市", "貝塚市", "守口市", "枚方市", "茨木市", "八尾市", "泉佐野市", "富田林市", "寝屋川市", "河内長野市", "松原市", "大東市", "和泉市", "箕面市", "柏原市", "羽曳野市", "門真市", "摂津市", "高槻市", "島本町", "豊能町", "能勢町", "忠岡町", "熊取町", "田尻町", "岬町", "太子町", "河南町", "千早赤阪村"],
    "兵庫県": ["神戸市東灘区", "神戸市灘区", "神戸市兵庫区", "神戸市長田区", "神戸市須磨区", "神戸市垂水区", "神戸市北区", "神戸市中央区", "神戸市西区", "姫路市", "尼崎市", "明石市", "西宮市", "洲本市", "芦屋市", "伊丹市", "相生市", "豊岡市", "加古川市", "赤穂市", "西脇市", "宝塚市", "三木市", "高砂市", "川西市", "小野市", "三田市", "加西市", "篠山市", "養父市", "丹波市", "南あわじ市", "朝来市", "淡路市", "宍粟市", "加東市", "たつの市", "猪名川町", "多可町", "稲美町", "播磨町", "市川町", "福崎町", "神河町", "太子町", "上郡町", "佐用町", "香美町", "新温泉町"],
    "奈良県": ["奈良市", "大和高田市", "大和郡山市", "天理市", "橿原市", "桜井市", "五條市", "御所市", "生駒市", "香芝市", "葛城市", "宇陀市", "山辺町", "平群町", "三郷町", "斑鳩町", "安堵町", "川西町", "三宅町", "田原本町", "曽爾村", "御杖村", "高取町", "明日香村", "上牧町", "王寺町", "広陵町", "河合町", "大淀町", "下市町", "黒滝村", "天川村", "野迫川村", "十津川村", "下北山村", "上北山村", "川上村"],
    "和歌山県": ["和歌山市", "海南市", "橋本市", "有田市", "御坊市", "田辺市", "新宮市", "紀の川市", "岩出市", "紀美野町", "かつらぎ町", "九度山町", "高野町", "湯浅町", "広川町", "有田川町", "美浜町", "日高町", "由良町", "印南町", "みなべ町", "日高川町", "白浜町", "上富田町", "すさみ町", "那智勝浦町", "太地町", "古座川町", "北山村", "串本町"],
    "鳥取県": ["鳥取市", "米子市", "倉吉市", "境港市", "岩美町", "八頭町", "智頭町", "若桜町", "三朝町", "湯梨浜町", "琴浦町", "北栄町", "日南町", "日野町", "江府町"],
    "島根県": ["松江市", "浜田市", "出雲市", "益田市", "大田市", "安来市", "江津市", "雲南市", "奥出雲町", "飯南町", "川本町", "美郷町", "邑南町", "津和野町", "吉賀町", "海士町", "西ノ島町", "知夫村"],
    "岡山県": ["岡山市北区", "岡山市中区", "岡山市東区", "倉敷市", "津山市", "玉野市", "笠岡市", "井原市", "総社市", "高梁市", "新見市", "備前市", "瀬戸内市", "赤磐市", "真庭市", "美作市", "浅口市", "和気町", "早島町", "里庄町", "矢掛町", "新庄村", "鏡野町", "勝央町", "奈義町", "久米南町", "美咲町", "吉備中央町"],
    "広島県": ["広島市中区", "広島市東区", "広島市南区", "広島市西区", "広島市安佐南区", "広島市安佐北区", "広島市安芸区", "広島市佐伯区", "呉市", "竹原市", "三原市", "尾道市", "福山市", "府中市", "三次市", "庄原市", "大竹市", "東広島市", "廿日市市", "安芸高田市", "江田島市", "府中町", "海田町", "熊野町", "坂町", "安芸太田町", "北広島町", "大崎上島町"],
    "山口県": ["下関市", "宇部市", "山口市", "萩市", "防府市", "下松市", "岩国市", "光市", "長門市", "柳井市", "美祢市", "周南市", "山陽小野田市", "和木町", "上関町", "田布施町", "平生町"],
    "徳島県": ["徳島市", "鳴門市", "小松島市", "阿南市", "吉野川市", "阿波市", "美馬市", "三好市", "東みよし町", "那賀町", "佐那河内村", "神山町", "上勝町", "つるぎ町", "東祖谷村", "西祖谷村"],
    "香川県": ["高松市", "丸亀市", "坂出市", "善通寺市", "観音寺市", "さぬき市", "東かがわ市", "三豊市", "土庄町", "小豆島町", "直島町", "宇多津町", "綾川町", "琴平町", "多度津町", "まんのう町"],
    "愛媛県": ["松山市", "今治市", "宇和島市", "八幡浜市", "新居浜市", "西条市", "大洲市", "伊野市", "越知町", "仁淀川町", "いの町", "鬼北町", "久万高原町", "松前町", "砥部町", "内子町", "鬼北町"],
    "高知県": ["高知市", "室戸市", "安芸市", "南国市", "いの町", "佐川町", "須崎市", "中土佐町", "檮原町", "日高村", "越知町", "仁淀川町", "梼原町", "四国町", "いの町", "佐川町", "越知町", "仁淀川町", "いの町", "須崎市", "中土佐町", "檮原町", "日高村", "越知町", "仁淀川町", "梼原町", "四国町", "鬼北町"],
    "福岡県": ["福岡市東区", "福岡市博多区", "福岡市中央区", "福岡市南区", "福岡市西区", "福岡市城南区", "福岡市早良区", "北九州市門司区", "北九州市若松区", "北九州市戸畑区", "北九州市小倉北区", "北九州市小倉南区", "北九州市八幡東区", "北九州市八幡西区", "大牟田市", "久留米市", "直方市", "飯塚市", "田川市", "柳川市", "八女市", "筑後市", "大川市", "行橋市", "豊前市", "中間市", "小郡市", "筑紫野市", "春日市", "大野城市", "宗像市", "太宰府市", "古賀市", "福津市", "うきは市", "みやま市", "朝倉市", "糸島市", "那珂川町", "宇美町", "篠栗町", "志免町", "須恵町", "新宮町", "久山町", "粕屋町", "芦屋町", "水巻町", "岡垣町", "遠賀町", "小竹町", "鞍手町", "宮若市", "赤村", "福智町", "添田町", "香春町", "糸田町", "川崎町", "大任町", "庄内町", "大刀洗町"],
    "佐賀県": ["佐賀市", "唐津市", "鳥栖市", "多久市", "伊万里市", "武雄市", "鹿島市", "小城市", "嬉野市", "神埼市", "吉賀町", "基山町", "みやき町", "上峰町", "白石町", "江北町", "大町町", "太玉町"],
    "長崎県": ["長崎市", "佐世保市", "島原市", "諫早市", "大村市", "平戸市", "松浦市", "対馬市", "壱岐市", "五島市", "西海市", "雲仙市", "南島原市", "長与町", "時津町", "東彼波佐見町", "川棚町", "波佐見町", "小値賀町", "佐渡島町"],
    "熊本県": ["熊本市中央区", "熊本市東区", "熊本市西区", "熊本市南区", "熊本市北区", "八代市", "人吉市", "荒尾市", "水俣市", "玉名市", "山鹿市", "菊池市", "宇土市", "上天草市", "宇城市", "阿蘇市", "合志市", "下益城郡", "美里町", "玉東町", "南関町", "長洲町", "和水町", "大津町", "菊陽町", "南小国町", "小国町", "産山村", "高森町", "南阿蘇村", "白川村", "南玉名郡", "甲佐町", "山都町", "氷川町", "球磨郡", "錦町", "多良木町", "湯前町", "水上村", "相良町", "五木村", "山江村", "球磨村", "あさぎり町"],
    "大分県": ["大分市", "別府市", "中津市", "日田市", "佐伯市", "臼杵市", "津久見市", "豊後高田市", "杵築市", "宇佐市", "豊後大野市", "由布市", "国東市", "姫島村", "日出町", "九重町", "玖珠町"],
    "宮崎県": ["宮崎市", "都城市", "延岡市", "日向市", "串間市", "西都市", "えびの市", "三股町", "高原町", "国富町", "綾町", "高鍋町", "新富町", "西米良村", "木城町", "川南町", "都農町", "門川町", "諸塚村", "椎葉村", "美郷町"],
    "鹿児島県": ["鹿児島市", "鹿屋市", "枕崎市", "阿久根市", "出水市", "指宿市", "西之表市", "垂水市", "薩摩川内市", "日置市", "曽於市", "霧島市", "いちき串木野市", "南さつま市", "志布志市", "奄美市", "南九州市", "伊仙町", "天城町", "喜界町", "徳之島町", "中種子町", "南種子町", "屋久島町", "大崎町", "東串良町", "錦江町", "南大隅町", "肝付町", "三島村", "十島村"],
    "沖縄県": ["那覇市", "宜野湾市", "石垣市", "浦添市", "名護市", "糸満市", "沖縄市", "豊見城市", "うるま市", "宮古島市", "南城市", "北中城村", "中城村", "西原町", "与那原町", "南風原町", "八重瀬町", "多良間村", "竹富町", "与那国町"],
  };

  // Keyword expansion dictionary
  const keywordDictionary: Record<string, string[]> = {
    "給湯器": ["エコキュート", "ヒートポンプ", "給湯省エネ", "高効率給湯器", "CO2冷媒ヒートポンプ"],
    "断熱": ["断熱改修", "断熱リフォーム", "外皮性能向上", "UA値改善", "高性能断熱材", "グラスウール", "セルロースファイバー"],
    "窓": ["窓リノベ", "内窓", "二重窓", "複層ガラス", "Low-Eガラス", "樹脂サッシ", "アルミ樹脂複合"],
    "太陽光": ["太陽光発電", "ソーラーパネル", "PV", "自家消費", "FIT", "蓄電池", "V2H"],
    "リフォーム": ["住宅改修", "リノベーション", "改修工事", "バリアフリー", "ユニバーサルデザイン"],
    "耐震": ["耐震診断", "耐震補強", "制震", "免震", "Is値", "耐震基準適合"],
    "DX": ["デジタルトランスフォーメーション", "IT導入", "クラウド化", "業務効率化", "RPA", "AI導入"],
    "EC": ["電子商取引", "ネットショップ", "オンライン販売", "ECサイト構築"],
    "設備投資": ["機械設備", "生産性向上", "省力化", "自動化", "ロボット導入"],
    "人材": ["人材育成", "研修", "雇用", "採用", "スキルアップ", "リスキリング", "働き方改革"],
  };

  const expandKeywords = (query: string): string[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const expanded = new Set<string>();
    expanded.add(q);

    for (const [key, values] of Object.entries(keywordDictionary)) {
      if (key.toLowerCase().includes(q) || q.includes(key.toLowerCase())) {
        values.forEach(v => expanded.add(v.toLowerCase()));
      }
      values.forEach(v => {
        if (v.toLowerCase().includes(q)) {
          expanded.add(key.toLowerCase());
          values.forEach(vv => expanded.add(vv.toLowerCase()));
        }
      });
    }

    const synonyms: Record<string, string[]> = {
      "省エネ": ["省エネルギー", "エネルギー削減", "エコ"],
      "ZEH": ["ゼロエネルギーハウス", "ゼロエネ"],
      "リフォーム": ["改修", "リノベーション"],
      "耐震": ["耐震改修", "耐震補強"],
    };
    for (const [key, values] of Object.entries(synonyms)) {
      if (q.includes(key.toLowerCase())) {
        values.forEach(v => expanded.add(v.toLowerCase()));
      }
    }

    return Array.from(expanded);
  };

  // 50 subsidies with full detail info
  const allSubsidies = [
    { id: 1, name: "子育てエコホーム支援事業", category: "新築", amount: "最大100万円", deadline: "2026/03/31", jurisdiction: "国土交通省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["子育て","エコ","省エネ","新築","ZEH"], totalBudget: 210000000000, usedBudget: 136500000000, description: "子育て世帯・若者夫婦世帯を対象に、高い省エネ性能を有する新築住宅の取得や住宅の省エネ改修等に対して補助金を交付する事業。ZEH水準の省エネ住宅で80万円、長期優良住宅で100万円を補助。", target: "子育て世帯（18歳未満の子を有する世帯）または若者夫婦世帯（夫婦いずれかが39歳以下）", applicationPeriod: "2025年4月1日〜2026年3月31日（予算上限に達し次第終了）", guidelinesUrl: "https://kosodate-ecohome.mlit.go.jp/", officialUrl: "https://kosodate-ecohome.mlit.go.jp/" },
    { id: 2, name: "先進的窓リノベ事業", category: "リフォーム", amount: "最大200万円", deadline: "2026/03/31", jurisdiction: "環境省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["窓","リノベ","断熱","リフォーム","省エネ"], totalBudget: 135000000000, usedBudget: 108000000000, description: "既存住宅の窓の断熱改修（内窓設置・外窓交換・ガラス交換）に対して、工事内容に応じた補助金を交付。高性能な断熱窓への改修を促進し、住宅の省エネ化を推進。", target: "既存住宅の所有者（個人・法人問わず）", applicationPeriod: "2025年3月下旬〜2026年3月31日（予算上限に達し次第終了）", guidelinesUrl: "https://window-renovation2025.env.go.jp/", officialUrl: "https://window-renovation2025.env.go.jp/" },
    { id: 3, name: "給湯省エネ事業", category: "省エネ改修", amount: "最大20万円/台", deadline: "2026/03/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["給湯","エコキュート","省エネ","改修"], totalBudget: 58000000000, usedBudget: 34800000000, description: "高効率給湯器（エコキュート・ハイブリッド給湯器・エネファーム等）の導入に対して補助金を交付。家庭のエネルギー消費の大部分を占める給湯分野の省エネ化を推進。", target: "住宅に高効率給湯器を導入する方（新築・既存問わず）", applicationPeriod: "2025年3月下旬〜2026年3月31日（予算上限に達し次第終了）", guidelinesUrl: "https://kyutou-shoene2025.meti.go.jp/", officialUrl: "https://kyutou-shoene2025.meti.go.jp/" },
    { id: 4, name: "長期優良住宅化リフォーム推進事業", category: "リフォーム", amount: "最大250万円", deadline: "2026/06/30", jurisdiction: "国土交通省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["長期優良","リフォーム","耐震","省エネ"], totalBudget: 45000000000, usedBudget: 13500000000, description: "既存住宅の長寿命化・省エネ化に資するリフォーム工事に対して補助金を交付。インスペクション（建物状況調査）の実施が必須条件。評価基準型で最大100万円、認定長期優良住宅型で最大250万円。", target: "既存住宅のリフォーム工事を行う住宅所有者", applicationPeriod: "2025年5月〜2026年6月30日（交付申請期限）", guidelinesUrl: "https://www.kenken.go.jp/chouki_r/", officialUrl: "https://www.kenken.go.jp/chouki_r/" },
    { id: 5, name: "住宅省エネキャンペーン2025", category: "新築・リフォーム", amount: "最大60万円", deadline: "2026/03/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["省エネ","住宅","キャンペーン","新築","リフォーム"], totalBudget: 100000000000, usedBudget: 45000000000, description: "住宅の省エネ化を総合的に推進するキャンペーン。断熱改修・高効率設備導入・窓改修などを組み合わせた省エネリフォームに対して幅広く補助金を交付。", target: "住宅の省エネ改修を行う個人・事業者", applicationPeriod: "2025年4月〜2026年3月31日", guidelinesUrl: "https://jutaku-shoene2025.meti.go.jp/", officialUrl: "https://jutaku-shoene2025.meti.go.jp/" },
    { id: 6, name: "東京都木造住宅耐震改修助成事業", category: "耐震改修", amount: "最大150万円", deadline: "2026/12/28", jurisdiction: "東京都", pref: "東京都", city: "all", status: "受付中", keywords: ["耐震","木造","補強","改修","東京"], totalBudget: 5000000000, usedBudget: 1750000000, description: "昭和56年5月以前に建築された木造住宅の耐震診断・耐震改修工事に対して費用を助成。耐震診断は無料、耐震改修工事は最大150万円を助成。", target: "東京都内に昭和56年5月以前建築の木造住宅を所有する方", applicationPeriod: "2025年4月1日〜2026年12月28日", guidelinesUrl: "https://www.taishin.metro.tokyo.lg.jp/", officialUrl: "https://www.taishin.metro.tokyo.lg.jp/" },
    { id: 7, name: "世田谷区住宅リフォーム助成", category: "リフォーム", amount: "最大20万円", deadline: "2026/09/30", jurisdiction: "世田谷区", pref: "東京都", city: "世田谷区", status: "受付中", keywords: ["リフォーム","助成","世田谷","バリアフリー"], totalBudget: 200000000, usedBudget: 120000000, description: "世田谷区民が区内業者を利用して行う住宅リフォーム工事に対して助成。バリアフリー・省エネ・防犯対策など幅広い工事が対象。工事費用の10%（最大20万円）を助成。", target: "世田谷区内に住宅を所有し居住する区民", applicationPeriod: "2025年4月〜2026年9月30日（先着順）", guidelinesUrl: "https://www.city.setagaya.lg.jp/", officialUrl: "https://www.city.setagaya.lg.jp/" },
    { id: 8, name: "東京都ZEH導入補助金", category: "新築", amount: "最大70万円", deadline: "2026/06/30", jurisdiction: "東京都", pref: "東京都", city: "all", status: "準備中", keywords: ["ZEH","ゼッチ","新築","省エネ","東京"], totalBudget: 3000000000, usedBudget: 0, description: "東京都内でZEH（ネット・ゼロ・エネルギー・ハウス）基準を満たす新築住宅を建築する場合に補助金を交付。太陽光発電・高断熱・高効率設備の一体的導入を促進。", target: "東京都内にZEH基準の新築住宅を建築する方", applicationPeriod: "2026年4月開始予定（現在準備中）", guidelinesUrl: "https://www.kankyo.metro.tokyo.lg.jp/", officialUrl: "https://www.kankyo.metro.tokyo.lg.jp/" },
    { id: 9, name: "東京都既存住宅省エネ改修助成", category: "省エネ改修", amount: "最大300万円", deadline: "2026/09/30", jurisdiction: "東京都", pref: "東京都", city: "all", status: "受付中", keywords: ["省エネ","改修","既存住宅","東京","断熱"], totalBudget: 3000000000, usedBudget: 1800000000, description: "東京都内の既存住宅の省エネ改修（断熱改修・高効率設備導入等）に対して助成。断熱改修と設備導入を組み合わせることで最大300万円の助成が可能。", target: "東京都内の既存住宅所有者", applicationPeriod: "2025年4月〜2026年9月30日", guidelinesUrl: "https://www.tokyo-co2down.jp/", officialUrl: "https://www.tokyo-co2down.jp/" },
    { id: 10, name: "太陽光発電・蓄電池導入事業（国）", category: "省エネ設備", amount: "最大100万円", deadline: "2026/05/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["太陽光","蓄電池","自家消費","FIT"], totalBudget: 80000000000, usedBudget: 48000000000, description: "住宅用太陽光発電設備・蓄電池の導入に対して補助金を交付。自家消費型の太陽光発電を推進し、電力の自給自足とCO2排出削減を目指す。", target: "住宅に太陽光発電・蓄電池を導入する個人・事業者", applicationPeriod: "2025年4月〜2026年5月31日（予算上限に達し次第終了）", guidelinesUrl: "https://sii.or.jp/", officialUrl: "https://sii.or.jp/" },
    { id: 11, name: "愛知県住宅用地球温暖化対策設備導入促進費補助金", category: "省エネ設備", amount: "最大10万円", deadline: "2026/03/31", jurisdiction: "愛知県", pref: "愛知県", city: "all", status: "受付中", keywords: ["温暖化","太陽光","蓄電池","省エネ","愛知"], totalBudget: 500000000, usedBudget: 375000000, description: "愛知県内の住宅に太陽光発電・蓄電池・HEMS等の地球温暖化対策設備を導入する場合に補助金を交付。設備種類ごとに定額補助。", target: "愛知県内に住宅を所有する個人", applicationPeriod: "2025年4月〜2026年3月31日（先着順）", guidelinesUrl: "https://www.pref.aichi.jp/kankyo/", officialUrl: "https://www.pref.aichi.jp/kankyo/" },
    { id: 12, name: "福岡県住宅用エネルギーシステム導入促進事業", category: "省エネ設備", amount: "最大15万円", deadline: "2026/11/30", jurisdiction: "福岡県", pref: "福岡県", city: "all", status: "受付中", keywords: ["エネルギー","太陽光","蓄電池","福岡"], totalBudget: 800000000, usedBudget: 240000000, description: "福岡県内の住宅に太陽光発電・蓄電池・燃料電池等のエネルギーシステムを導入する場合に補助金を交付。再生可能エネルギーの普及拡大を推進。", target: "福岡県内に住宅を所有する個人", applicationPeriod: "2025年5月〜2026年11月30日", guidelinesUrl: "https://www.pref.fukuoka.lg.jp/", officialUrl: "https://www.pref.fukuoka.lg.jp/" },
    { id: 13, name: "北海道住宅省エネルギー改修補助", category: "省エネ改修", amount: "最大120万円", deadline: "2026/10/31", jurisdiction: "北海道", pref: "北海道", city: "all", status: "受付中", keywords: ["省エネ","断熱","改修","北海道","寒冷地"], totalBudget: 2000000000, usedBudget: 600000000, description: "北海道内の既存住宅の断熱改修・高効率設備導入に対して補助金を交付。寒冷地特有の暖房負荷軽減を目的とし、高断熱化工事を重点的に支援。", target: "北海道内に既存住宅を所有する方", applicationPeriod: "2025年5月〜2026年10月31日", guidelinesUrl: "https://www.pref.hokkaido.lg.jp/kz/kkd/", officialUrl: "https://www.pref.hokkaido.lg.jp/kz/kkd/" },
    { id: 14, name: "神奈川県既存住宅省エネ改修費補助", category: "省エネ改修", amount: "最大80万円", deadline: "2026/08/31", jurisdiction: "神奈川県", pref: "神奈川県", city: "all", status: "受付中", keywords: ["省エネ","改修","神奈川","既存"], totalBudget: 1500000000, usedBudget: 1050000000, description: "神奈川県内の既存住宅の省エネルギー改修に対して補助金を交付。断熱改修・窓改修・高効率設備導入が対象。", target: "神奈川県内に既存住宅を所有する個人", applicationPeriod: "2025年4月〜2026年8月31日（予算上限に達し次第終了）", guidelinesUrl: "https://www.pref.kanagawa.jp/docs/r3p/", officialUrl: "https://www.pref.kanagawa.jp/docs/r3p/" },
    { id: 15, name: "広島県住宅耐震化促進事業", category: "耐震改修", amount: "最大90万円", deadline: "2026/12/28", jurisdiction: "広島県", pref: "広島県", city: "all", status: "受付中", keywords: ["耐震","改修","広島","木造"], totalBudget: 600000000, usedBudget: 180000000, description: "広島県内の旧耐震基準（昭和56年5月以前）木造住宅の耐震診断・耐震改修工事に対して補助金を交付。南海トラフ地震への備えを推進。", target: "広島県内の旧耐震基準木造住宅の所有者", applicationPeriod: "2025年4月〜2026年12月28日", guidelinesUrl: "https://www.pref.hiroshima.lg.jp/", officialUrl: "https://www.pref.hiroshima.lg.jp/" },
    { id: 16, name: "練馬区住宅リフォーム補助金", category: "リフォーム", amount: "最大30万円", deadline: "2026/07/31", jurisdiction: "練馬区", pref: "東京都", city: "練馬区", status: "受付中", keywords: ["リフォーム","練馬","助成","バリアフリー"], totalBudget: 150000000, usedBudget: 75000000, description: "練馬区民が区内業者を利用して行う住宅リフォーム工事に対して補助。バリアフリー・省エネ・耐震改修が対象。工事費の10%（最大30万円）を補助。", target: "練馬区内に居住する住宅所有者", applicationPeriod: "2025年4月〜2026年7月31日（先着順）", guidelinesUrl: "https://www.city.nerima.tokyo.jp/", officialUrl: "https://www.city.nerima.tokyo.jp/" },
    { id: 17, name: "品川区住宅耐震改修助成金", category: "耐震改修", amount: "最大150万円", deadline: "2026/12/28", jurisdiction: "品川区", pref: "東京都", city: "品川区", status: "受付中", keywords: ["耐震","品川","木造","補強"], totalBudget: 300000000, usedBudget: 90000000, description: "品川区内の旧耐震基準木造住宅の耐震診断・耐震改修工事に対する助成。耐震診断は無料、改修工事は最大150万円を助成。", target: "品川区内に旧耐震基準の木造住宅を所有する方", applicationPeriod: "通年（2026年12月28日まで）", guidelinesUrl: "https://www.city.shinagawa.tokyo.jp/", officialUrl: "https://www.city.shinagawa.tokyo.jp/" },
    { id: 18, name: "埼玉県住宅における省エネ対策支援事業", category: "省エネ改修", amount: "最大50万円", deadline: "2026/11/30", jurisdiction: "埼玉県", pref: "埼玉県", city: "all", status: "受付中", keywords: ["省エネ","埼玉","断熱","改修"], totalBudget: 800000000, usedBudget: 320000000, description: "埼玉県内の既存住宅における省エネ対策（断熱改修・高効率設備導入等）に対して補助金を交付。窓断熱・壁断熱・屋根断熱が主な対象工事。", target: "埼玉県内に既存住宅を所有する個人", applicationPeriod: "2025年5月〜2026年11月30日", guidelinesUrl: "https://www.pref.saitama.lg.jp/", officialUrl: "https://www.pref.saitama.lg.jp/" },
    { id: 19, name: "デジタルトランスフォーメーション推進補助金", category: "DX", amount: "最大500万円", deadline: "2026/04/30", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["DX","デジタル化","IT導入","クラウド"], totalBudget: 50000000000, usedBudget: 15000000000, description: "中小企業のデジタルトランスフォーメーション（DX）推進を支援。クラウドサービス導入・業務プロセスのデジタル化・データ活用基盤構築等に対して補助金を交付。", target: "中小企業・小規模事業者", applicationPeriod: "2025年4月〜2026年4月30日（複数回公募）", guidelinesUrl: "https://www.meti.go.jp/policy/it_policy/", officialUrl: "https://www.meti.go.jp/policy/it_policy/" },
    { id: 20, name: "IT導入補助金（通常枠・インボイス枠）", category: "DX", amount: "最大450万円", deadline: "2026/05/15", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["IT導入補助金","IT導入","中小企業","業務効率化","RPA","AI","インボイス","会計ソフト","受発注","電子帳簿"], totalBudget: 30000000000, usedBudget: 12000000000, description: "中小企業・小規模事業者のITツール導入を支援する補助金。通常枠（業務効率化・売上アップ）とインボイス枠（会計ソフト・受発注ソフト・決済ソフト等）があり、事前にIT導入支援事業者の登録が必要。", target: "中小企業・小規模事業者（IT導入支援事業者と連携して申請）", applicationPeriod: "2025年3月〜2026年5月15日（複数回締切あり）", guidelinesUrl: "https://it-shien.smrj.go.jp/", officialUrl: "https://it-shien.smrj.go.jp/" },
    { id: 21, name: "クラウド導入支援事業", category: "DX", amount: "最大200万円", deadline: "2026/06/30", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["クラウド化","データ活用","セキュリティ"], totalBudget: 15000000000, usedBudget: 7500000000, description: "中小企業のクラウドサービス導入を推進する事業。クラウド型の業務管理・会計・顧客管理等のシステム導入費用と、導入に伴うコンサルティング費用を補助。", target: "クラウドサービスを新たに導入する中小企業", applicationPeriod: "2025年5月〜2026年6月30日", guidelinesUrl: "https://www.meti.go.jp/policy/", officialUrl: "https://www.meti.go.jp/policy/" },
    { id: 22, name: "ECサイト構築支援補助金", category: "EC", amount: "最大300万円", deadline: "2026/04/15", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["EC","電子商取引","ネットショップ","オンライン販売"], totalBudget: 20000000000, usedBudget: 8000000000, description: "中小企業のECサイト構築・リニューアルを支援する補助金。新規ECサイト構築費用・既存サイトのリニューアル費用・決済システム導入費用等が対象。", target: "ECサイトを新規構築またはリニューアルする中小企業", applicationPeriod: "2025年4月〜2026年4月15日", guidelinesUrl: "https://www.meti.go.jp/policy/economy/", officialUrl: "https://www.meti.go.jp/policy/economy/" },
    { id: 23, name: "オンライン販売促進事業", category: "EC", amount: "最大150万円", deadline: "2026/05/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["オンライン販売","デジタル活用","販売強化"], totalBudget: 10000000000, usedBudget: 3000000000, description: "中小企業のオンライン販売チャネル拡充を支援。EC出店費用・デジタルマーケティング・オンライン接客ツール導入等に対して補助金を交付。", target: "オンライン販売を強化したい中小企業", applicationPeriod: "2025年4月〜2026年5月31日", guidelinesUrl: "https://www.meti.go.jp/", officialUrl: "https://www.meti.go.jp/" },
    { id: 24, name: "設備投資補助金（生産性向上特別措置制度）", category: "設備投資", amount: "最大1000万円", deadline: "2026/03/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["設備投資","機械設備","生産性向上","自動化"], totalBudget: 60000000000, usedBudget: 24000000000, description: "中小企業の生産性向上に資する設備投資を支援。先端設備等導入計画の認定を受けた場合、設備取得費用の一部を補助。固定資産税の特例措置もあり。", target: "先端設備等導入計画の認定を受けた中小企業", applicationPeriod: "2025年4月〜2026年3月31日", guidelinesUrl: "https://seisansei.smrj.go.jp/", officialUrl: "https://seisansei.smrj.go.jp/" },
    { id: 25, name: "省力化投資補助金", category: "設備投資", amount: "最大800万円", deadline: "2026/05/30", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["省力化","自動化","ロボット導入","業務効率化"], totalBudget: 40000000000, usedBudget: 12000000000, description: "人手不足に悩む中小企業の省力化・自動化投資を支援。カタログに掲載された汎用製品（ロボット・自動化機器等）の導入費用を補助。", target: "人手不足を抱える中小企業・小規模事業者", applicationPeriod: "2025年4月〜2026年5月30日（複数回公募）", guidelinesUrl: "https://shoryokuka.smrj.go.jp/", officialUrl: "https://shoryokuka.smrj.go.jp/" },
    { id: 26, name: "人材育成支援事業（キャリアアップ助成金）", category: "人材", amount: "最大100万円/年", deadline: "2026/12/31", jurisdiction: "厚生労働省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["人材育成","研修","スキルアップ","キャリア"], totalBudget: 25000000000, usedBudget: 10000000000, description: "有期契約労働者・パート・派遣労働者等の正社員化や処遇改善を行う事業主に対して助成。正社員化コース・賃金規定等改定コース等、複数のコースあり。", target: "非正規雇用労働者のキャリアアップに取り組む事業主", applicationPeriod: "通年（2026年12月31日まで）", guidelinesUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html", officialUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html" },
    { id: 27, name: "リスキリング支援事業", category: "人材", amount: "最大150万円", deadline: "2026/06/30", jurisdiction: "厚生労働省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["リスキリング","スキルアップ","人材育成"], totalBudget: 20000000000, usedBudget: 6000000000, description: "従業員のリスキリング（新たなスキル習得）を支援する事業。DXスキル・AI活用・データ分析等の研修費用に対して補助金を交付。", target: "従業員のリスキリングに取り組む事業主", applicationPeriod: "2025年4月〜2026年6月30日", guidelinesUrl: "https://www.mhlw.go.jp/stf/", officialUrl: "https://www.mhlw.go.jp/stf/" },
    { id: 28, name: "働き方改革推進支援事業", category: "人材", amount: "最大200万円", deadline: "2026/04/30", jurisdiction: "厚生労働省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["働き方改革","雇用","採用","人事改革"], totalBudget: 15000000000, usedBudget: 4500000000, description: "労働時間短縮・年次有給休暇取得促進・テレワーク導入等の働き方改革に取り組む中小企業を支援。就業規則の整備や設備導入費用を補助。", target: "働き方改革に取り組む中小企業事業主", applicationPeriod: "2025年4月〜2026年4月30日", guidelinesUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/", officialUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/" },
    { id: 29, name: "大阪府住宅リフォームマイスター制度", category: "リフォーム", amount: "最大50万円", deadline: "2026/12/31", jurisdiction: "大阪府", pref: "大阪府", city: "all", status: "受付中", keywords: ["リフォーム","マイスター","大阪"], totalBudget: 1000000000, usedBudget: 350000000, description: "大阪府が認定したリフォームマイスター（優良リフォーム事業者）を利用してリフォームを行う場合に補助金を交付。安心・安全なリフォームを促進。", target: "大阪府内に住宅を所有する方（マイスター認定事業者を利用）", applicationPeriod: "通年（2026年12月31日まで）", guidelinesUrl: "https://www.pref.osaka.lg.jp/jumachi/", officialUrl: "https://www.pref.osaka.lg.jp/jumachi/" },
    { id: 30, name: "京都府断熱改修支援事業", category: "断熱", amount: "最大180万円", deadline: "2026/08/31", jurisdiction: "京都府", pref: "京都府", city: "all", status: "受付中", keywords: ["断熱","断熱改修","改修","省エネ"], totalBudget: 1200000000, usedBudget: 360000000, description: "京都府内の既存住宅の断熱改修に対して補助金を交付。外壁・屋根・床・窓の断熱改修が対象。京都の伝統的木造住宅にも配慮した制度設計。", target: "京都府内に既存住宅を所有する方", applicationPeriod: "2025年5月〜2026年8月31日", guidelinesUrl: "https://www.pref.kyoto.jp/jutaku/", officialUrl: "https://www.pref.kyoto.jp/jutaku/" },
    { id: 31, name: "兵庫県エコハウス支援事業", category: "省エネ改修", amount: "最大250万円", deadline: "2026/07/31", jurisdiction: "兵庫県", pref: "兵庫県", city: "all", status: "受付中", keywords: ["エコ","省エネ","リフォーム"], totalBudget: 2000000000, usedBudget: 800000000, description: "兵庫県内の住宅のエコハウス化（断熱・省エネ・創エネの一体改修）に対して補助金を交付。断熱改修+太陽光発電+蓄電池の一体導入で最大補助額。", target: "兵庫県内に住宅を所有する個人", applicationPeriod: "2025年5月〜2026年7月31日", guidelinesUrl: "https://web.pref.hyogo.lg.jp/ks26/", officialUrl: "https://web.pref.hyogo.lg.jp/ks26/" },
    { id: 32, name: "岡山県太陽光導入事業", category: "太陽光", amount: "最大120万円", deadline: "2026/09/30", jurisdiction: "岡山県", pref: "岡山県", city: "all", status: "受付中", keywords: ["太陽光","太陽光発電","自家消費"], totalBudget: 800000000, usedBudget: 240000000, description: "岡山県内の住宅に太陽光発電設備を導入する場合に補助金を交付。「晴れの国おかやま」の豊富な日射量を活かした太陽光発電の普及を推進。", target: "岡山県内に住宅を所有する個人", applicationPeriod: "2025年5月〜2026年9月30日", guidelinesUrl: "https://www.pref.okayama.jp/page/", officialUrl: "https://www.pref.okayama.jp/page/" },
    { id: 33, name: "三重県住宅省エネルギー改修事業", category: "省エネ改修", amount: "最大100万円", deadline: "2026/10/31", jurisdiction: "三重県", pref: "三重県", city: "all", status: "受付中", keywords: ["省エネ","断熱","改修","三重"], totalBudget: 600000000, usedBudget: 180000000, description: "三重県内の既存住宅の省エネルギー改修に対して補助金を交付。断熱改修（窓・壁・屋根・床）と高効率設備導入が対象。", target: "三重県内に既存住宅を所有する個人", applicationPeriod: "2025年5月〜2026年10月31日", guidelinesUrl: "https://www.pref.mie.lg.jp/JUTAKU/", officialUrl: "https://www.pref.mie.lg.jp/JUTAKU/" },
    { id: 34, name: "三重県木造住宅耐震補強事業", category: "耐震改修", amount: "最大100万円", deadline: "2026/12/28", jurisdiction: "三重県", pref: "三重県", city: "all", status: "受付中", keywords: ["耐震","木造","補強","三重"], totalBudget: 400000000, usedBudget: 120000000, description: "三重県内の旧耐震基準木造住宅の耐震診断・耐震補強工事に対して補助金を交付。南海トラフ地震に備えた住宅の安全性向上を推進。", target: "三重県内に昭和56年5月以前建築の木造住宅を所有する方", applicationPeriod: "通年（2026年12月28日まで）", guidelinesUrl: "https://www.pref.mie.lg.jp/JUTAKU/", officialUrl: "https://www.pref.mie.lg.jp/JUTAKU/" },
    { id: 35, name: "宮城県住宅リフォーム支援事業", category: "リフォーム", amount: "最大60万円", deadline: "2026/11/30", jurisdiction: "宮城県", pref: "宮城県", city: "all", status: "受付中", keywords: ["リフォーム","改修","宮城"], totalBudget: 700000000, usedBudget: 280000000, description: "宮城県内の住宅リフォームに対して補助金を交付。省エネ改修・バリアフリー改修・耐震改修等の幅広いリフォームが対象。県内業者の利用が条件。", target: "宮城県内に住宅を所有する個人（県内業者利用必須）", applicationPeriod: "2025年5月〜2026年11月30日", guidelinesUrl: "https://www.pref.miyagi.jp/soshiki/kentiku/", officialUrl: "https://www.pref.miyagi.jp/soshiki/kentiku/" },
    { id: 36, name: "千葉県住宅用太陽光発電設備等導入促進事業", category: "省エネ設備", amount: "最大15万円", deadline: "2026/09/30", jurisdiction: "千葉県", pref: "千葉県", city: "all", status: "受付中", keywords: ["太陽光","蓄電池","千葉","省エネ"], totalBudget: 1000000000, usedBudget: 400000000, description: "千葉県内の住宅に太陽光発電設備・蓄電池を導入する場合に補助金を交付。停電時の電力確保と再生可能エネルギーの普及を推進。", target: "千葉県内に住宅を所有する個人", applicationPeriod: "2025年4月〜2026年9月30日（先着順）", guidelinesUrl: "https://www.pref.chiba.lg.jp/ontai/", officialUrl: "https://www.pref.chiba.lg.jp/ontai/" },
    { id: 37, name: "静岡県住宅耐震化促進事業", category: "耐震改修", amount: "最大100万円", deadline: "2026/12/28", jurisdiction: "静岡県", pref: "静岡県", city: "all", status: "受付中", keywords: ["耐震","静岡","木造","補強"], totalBudget: 800000000, usedBudget: 240000000, description: "静岡県内の旧耐震基準木造住宅の耐震診断・耐震補強工事に対して補助金を交付。東海地震への備えとして全国トップレベルの補助制度。", target: "静岡県内に旧耐震基準の木造住宅を所有する方", applicationPeriod: "通年（2026年12月28日まで）", guidelinesUrl: "https://www.pref.shizuoka.jp/kenmin/km-150/", officialUrl: "https://www.pref.shizuoka.jp/kenmin/km-150/" },
    { id: 38, name: "新潟県住宅省エネルギー改修支援事業", category: "省エネ改修", amount: "最大150万円", deadline: "2026/10/31", jurisdiction: "新潟県", pref: "新潟県", city: "all", status: "受付中", keywords: ["省エネ","断熱","新潟","寒冷地"], totalBudget: 900000000, usedBudget: 270000000, description: "新潟県内の既存住宅の省エネルギー改修に対して補助金を交付。寒冷地ならではの高断熱化ニーズに対応し、暖房負荷の大幅軽減を目指す。", target: "新潟県内に既存住宅を所有する方", applicationPeriod: "2025年5月〜2026年10月31日", guidelinesUrl: "https://www.pref.niigata.lg.jp/sec/kenchikujutaku/", officialUrl: "https://www.pref.niigata.lg.jp/sec/kenchikujutaku/" },
    { id: 39, name: "長野県信州健康ゼロエネ住宅助成金", category: "新築", amount: "最大200万円", deadline: "2026/08/31", jurisdiction: "長野県", pref: "長野県", city: "all", status: "受付中", keywords: ["ZEH","省エネ","新築","長野"], totalBudget: 1200000000, usedBudget: 480000000, description: "長野県独自のZEH基準「信州健康ゼロエネ住宅」を満たす新築住宅に対して助成金を交付。全国最高水準の断熱性能を求める長野県ならではの制度。", target: "長野県内に信州健康ゼロエネ住宅基準の新築住宅を建築する方", applicationPeriod: "2025年5月〜2026年8月31日", guidelinesUrl: "https://www.pref.nagano.lg.jp/kenchiku/", officialUrl: "https://www.pref.nagano.lg.jp/kenchiku/" },
    { id: 40, name: "岐阜県住宅リフォーム助成事業", category: "リフォーム", amount: "最大50万円", deadline: "2026/09/30", jurisdiction: "岐阜県", pref: "岐阜県", city: "all", status: "受付中", keywords: ["リフォーム","岐阜","改修"], totalBudget: 500000000, usedBudget: 200000000, description: "岐阜県内の住宅リフォームに対して補助金を交付。省エネ改修・バリアフリー改修が対象。県内業者の利用が必須条件。", target: "岐阜県内に住宅を所有する個人（県内業者利用必須）", applicationPeriod: "2025年5月〜2026年9月30日", guidelinesUrl: "https://www.pref.gifu.lg.jp/page/", officialUrl: "https://www.pref.gifu.lg.jp/page/" },
    { id: 41, name: "滋賀県既存住宅省エネ改修支援事業", category: "省エネ改修", amount: "最大80万円", deadline: "2026/11/30", jurisdiction: "滋賀県", pref: "滋賀県", city: "all", status: "受付中", keywords: ["省エネ","断熱","滋賀","改修"], totalBudget: 400000000, usedBudget: 120000000, description: "滋賀県内の既存住宅の省エネ改修に対して補助金を交付。断熱改修・高効率給湯器導入・窓改修等が対象。琵琶湖の環境保全にも貢献。", target: "滋賀県内に既存住宅を所有する個人", applicationPeriod: "2025年5月〜2026年11月30日", guidelinesUrl: "https://www.pref.shiga.lg.jp/ippan/kendoseibi/", officialUrl: "https://www.pref.shiga.lg.jp/ippan/kendoseibi/" },
    { id: 42, name: "奈良県住宅耐震化支援事業", category: "耐震改修", amount: "最大120万円", deadline: "2026/12/28", jurisdiction: "奈良県", pref: "奈良県", city: "all", status: "受付中", keywords: ["耐震","奈良","木造","補強"], totalBudget: 350000000, usedBudget: 105000000, description: "奈良県内の旧耐震基準木造住宅の耐震診断・耐震改修工事に対して補助金を交付。歴史的建造物が多い奈良県で住宅の安全性向上を推進。", target: "奈良県内に旧耐震基準の木造住宅を所有する方", applicationPeriod: "通年（2026年12月28日まで）", guidelinesUrl: "https://www.pref.nara.jp/8707.htm", officialUrl: "https://www.pref.nara.jp/8707.htm" },
    { id: 43, name: "福岡県既存住宅省エネ改修促進事業", category: "省エネ改修", amount: "最大100万円", deadline: "2026/10/31", jurisdiction: "福岡県", pref: "福岡県", city: "all", status: "受付中", keywords: ["省エネ","断熱","福岡","改修"], totalBudget: 1000000000, usedBudget: 300000000, description: "福岡県内の既存住宅の省エネ改修に対して補助金を交付。断熱改修・窓改修・高効率設備導入が対象。国の補助金との併用も可能。", target: "福岡県内に既存住宅を所有する個人", applicationPeriod: "2025年5月〜2026年10月31日", guidelinesUrl: "https://www.pref.fukuoka.lg.jp/contents/", officialUrl: "https://www.pref.fukuoka.lg.jp/contents/" },
    { id: 44, name: "熊本県住宅耐震化緊急促進事業", category: "耐震改修", amount: "最大150万円", deadline: "2026/12/28", jurisdiction: "熊本県", pref: "熊本県", city: "all", status: "受付中", keywords: ["耐震","熊本","木造","地震"], totalBudget: 1500000000, usedBudget: 450000000, description: "熊本地震の教訓を踏まえ、旧耐震基準木造住宅の耐震化を緊急的に促進する事業。耐震診断は無料、耐震改修工事は最大150万円を補助。全国最高水準の補助率。", target: "熊本県内に旧耐震基準の木造住宅を所有する方", applicationPeriod: "通年（2026年12月28日まで）", guidelinesUrl: "https://www.pref.kumamoto.jp/soshiki/105/", officialUrl: "https://www.pref.kumamoto.jp/soshiki/105/" },
    { id: 45, name: "沖縄県住宅リフォーム支援事業", category: "リフォーム", amount: "最大40万円", deadline: "2026/11/30", jurisdiction: "沖縄県", pref: "沖縄県", city: "all", status: "受付中", keywords: ["リフォーム","沖縄","改修","台風対策"], totalBudget: 300000000, usedBudget: 90000000, description: "沖縄県内の住宅リフォームに対して補助金を交付。台風対策（窓強化・屋根補修）・省エネ改修・バリアフリー改修が主な対象。県内業者利用が条件。", target: "沖縄県内に住宅を所有する個人（県内業者利用必須）", applicationPeriod: "2025年5月〜2026年11月30日", guidelinesUrl: "https://www.pref.okinawa.jp/site/doboku/", officialUrl: "https://www.pref.okinawa.jp/site/doboku/" },
    { id: 49, name: "IT導入補助金（セキュリティ対策推進枠）", category: "DX", amount: "最大100万円", deadline: "2026/05/15", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["IT導入補助金","セキュリティ","サイバー対策","中小企業"], totalBudget: 10000000000, usedBudget: 3000000000, description: "中小企業のサイバーセキュリティ対策を支援する補助金。IPA「サイバーセキュリティお助け隊サービス」のうち、IT導入支援事業者が提供するセキュリティサービス利用料を補助。", target: "サイバーセキュリティ対策を導入する中小企業", applicationPeriod: "2025年3月〜2026年5月15日", guidelinesUrl: "https://it-shien.smrj.go.jp/security/", officialUrl: "https://it-shien.smrj.go.jp/security/" },
    { id: 50, name: "IT導入補助金（複数社連携IT導入枠）", category: "DX", amount: "最大3,000万円", deadline: "2026/05/15", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["IT導入補助金","連携","サプライチェーン","複数社"], totalBudget: 5000000000, usedBudget: 1500000000, description: "複数の中小企業が連携してITツールを導入する場合に、幹事社を通じて一括申請・補助を行う枠。サプライチェーン全体の効率化・デジタル化を推進。", target: "複数社連携でITツールを導入する中小企業グループ", applicationPeriod: "2025年3月〜2026年5月15日", guidelinesUrl: "https://it-shien.smrj.go.jp/multi/", officialUrl: "https://it-shien.smrj.go.jp/multi/" },
    { id: 46, name: "小規模事業者持続化補助金", category: "経営支援", amount: "最大250万円", deadline: "2026/06/30", jurisdiction: "日本商工会議所", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["小規模","持続化","販路開拓","経営"], totalBudget: 80000000000, usedBudget: 32000000000, description: "小規模事業者の販路開拓や業務効率化を支援する補助金。チラシ・HP作成・展示会出展・設備導入等が対象。商工会議所・商工会の支援を受けて申請。", target: "商工会議所等の管轄地域内の小規模事業者", applicationPeriod: "2025年4月〜2026年6月30日（複数回公募）", guidelinesUrl: "https://s23.jizokukahojokin.info/", officialUrl: "https://s23.jizokukahojokin.info/" },
    { id: 47, name: "ものづくり・商業・サービス補助金", category: "設備投資", amount: "最大1,250万円", deadline: "2026/05/31", jurisdiction: "中小企業庁", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["ものづくり","製造業","サービス","革新"], totalBudget: 100000000000, usedBudget: 40000000000, description: "中小企業の革新的な製品・サービス開発、生産プロセス改善のための設備投資を支援する補助金。通常枠・回復型賃上げ枠・デジタル枠・グリーン枠等、複数の申請類型あり。", target: "革新的な取組を行う中小企業・小規模事業者", applicationPeriod: "2025年4月〜2026年5月31日（複数回公募）", guidelinesUrl: "https://portal.monodukuri-hojo.jp/", officialUrl: "https://portal.monodukuri-hojo.jp/" },
    { id: 48, name: "事業再構築補助金", category: "経営支援", amount: "最大1,500万円", deadline: "2026/04/30", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["事業再構築","新事業","転換","経営革新"], totalBudget: 120000000000, usedBudget: 60000000000, description: "新市場進出・事業転換・業種転換・業態転換等の思い切った事業再構築に取り組む中小企業を支援。認定経営革新等支援機関と共同で事業計画を策定して申請。", target: "事業再構築に取り組む中小企業（認定支援機関との共同申請）", applicationPeriod: "2025年4月〜2026年4月30日（複数回公募）", guidelinesUrl: "https://jigyou-saikouchiku.go.jp/", officialUrl: "https://jigyou-saikouchiku.go.jp/" },
  ];

  const ALERT_LEVELS = [
    { threshold: 95, label: "危険", color: "#dc2626", bg: "#fef2f2" },
    { threshold: 85, label: "警告", color: "#ea580c", bg: "#fff7ed" },
    { threshold: 70, label: "注意", color: "#d97706", bg: "#fffbeb" },
    { threshold: 50, label: "情報", color: "#2563eb", bg: "#eff6ff" },
  ];

  const getAlertLevel = (rate: number) => {
    for (const level of ALERT_LEVELS) {
      if (rate >= level.threshold) return level;
    }
    return null;
  };

  const filtered = allSubsidies.filter(s => {
    // 都道府県フィルタ: "all"なら全件、それ以外は「国（全国共通）」＋選択した都道府県を表示
    const prefMatch = selectedPref === "all" || s.pref === "国（全国共通）" || s.pref === selectedPref;
    if (!prefMatch) return false;

    if (selectedCity !== "all" && s.pref !== "国（全国共通）") {
      const cityMatch = s.city === "all" || s.city === selectedCity;
      if (!cityMatch) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const expanded = expandKeywords(searchQuery.trim());
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.jurisdiction.toLowerCase().includes(q) || s.keywords.some(k => k.toLowerCase().includes(q)) || expanded.some(ek => s.keywords.some(k => k.toLowerCase().includes(ek)) || s.name.toLowerCase().includes(ek) || s.category.toLowerCase().includes(ek));
  });

  const totalAvailable = allSubsidies.filter(s => s.status === "受付中").length;
  const filteredCount = filtered.length;

  return (<>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-black text-text-main">補助金・助成金</h2>
    </div>
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div><p className="text-sm font-bold text-purple-800">全国対応 補助金・助成金検索</p><p className="text-xs text-purple-600">国・都道府県・市区町村の最新補助金情報を自動取得 ｜ 予算消化アラート付き ｜ キーワード拡張検索対応</p></div>
    </div>

    <div className="flex gap-2 mb-6">
      <button onClick={() => setActiveTab("search")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "search" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>🔍 補助金検索</button>
      <button onClick={() => setActiveTab("pipeline")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "pipeline" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>📊 検索パイプライン</button>
      <button onClick={() => setActiveTab("alert")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "alert" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>⚠️ アラート管理</button>
    </div>

    {activeTab === "search" ? (<>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: "利用可能な制度", value: totalAvailable + "件", color: "#7c3aed" }, { label: "検索結果", value: filteredCount + "件", color: "#3b82f6" }, { label: "受給済み", value: "¥420万", color: "#10b981" }, { label: "申請期限間近", value: "5件", color: "#ef4444" }].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-text-main mb-3">補助金・助成金を検索</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-xs text-text-sub mb-1 block">キーワード検索</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setExpandedKeywords(expandKeywords(e.target.value)); setIsSearching(!!e.target.value); }} placeholder="例: 省エネ, リフォーム, 耐震, ZEH, 太陽光, DX, EC..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
            </div>
            <p className="text-[10px] text-text-sub mt-1">制度名・カテゴリ・管轄・キーワードから簡易検索できます</p>
            {expandedKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {expandedKeywords.slice(0, 8).map((kw, i) => (
                  <span key={i} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{kw}</span>
                ))}
                {expandedKeywords.length > 8 && <span className="text-[10px] text-text-sub px-2 py-1">+{expandedKeywords.length - 8}件</span>}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-text-sub mb-1 block">都道府県</label>
            <select value={selectedPref} onChange={e => { setSelectedPref(e.target.value); setSelectedCity("all"); }} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white">
              <option value="all">すべて（国＋全都道府県）</option>
              {prefectures.filter(p => p !== "all").map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-sub mb-1 block">市区町村</label>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white" disabled={selectedPref === "all" || selectedPref === "国（全国共通）"}>
              <option value="all">すべて</option>
              {selectedPref !== "all" && selectedPref !== "国（全国共通）" && municipalityData[selectedPref] && municipalityData[selectedPref].map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
        {(searchQuery || selectedPref !== "all" || selectedCity !== "all") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {searchQuery && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">キーワード: {searchQuery}</span>}
            {selectedPref !== "all" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">都道府県: {selectedPref}</span>}
            {selectedCity !== "all" && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">市区町村: {selectedCity}</span>}
            <button onClick={() => { setSearchQuery(""); setSelectedPref("all"); setSelectedCity("all"); setExpandedKeywords([]); setIsSearching(false); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 条件クリア</button>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((s, i) => {
            const rate = s.totalBudget > 0 ? (s.usedBudget / s.totalBudget) * 100 : 0;
            const isExpanded = expandedSubsidy === s.id;
            return (
              <div key={s.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? "border-purple-400 shadow-lg" : "border-border hover:border-purple-300 hover:shadow-md"}`}>
                <button onClick={() => setExpandedSubsidy(isExpanded ? null : s.id)} className="w-full text-left p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: s.status === "受付中" ? "#7c3aed" : "#9ca3af" }}>{s.status}</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">{s.category}</span>
                        <h4 className="text-sm font-bold text-text-main">{s.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-sub">
                        <span>💰 {s.amount}</span>
                        <span>📅 〜{s.deadline}</span>
                        <span>🏛️ {s.jurisdiction}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="w-20">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: rate >= 85 ? "#dc2626" : rate >= 70 ? "#ea580c" : rate >= 50 ? "#d97706" : "#7c3aed" }} /></div>
                          <span className="text-[10px] font-bold" style={{ color: rate >= 85 ? "#dc2626" : rate >= 70 ? "#ea580c" : "#6b7280" }}>{rate.toFixed(0)}%</span>
                        </div>
                      </div>
                      <span className="text-text-sub text-lg">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-purple-200 bg-purple-50/30 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-xs font-bold text-purple-800 mb-2">📋 概要</h5>
                        <p className="text-sm text-text-main leading-relaxed">{s.description}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-purple-800 mb-2">👥 対象者</h5>
                        <p className="text-sm text-text-main leading-relaxed">{s.target}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <h5 className="text-[10px] font-bold text-purple-600 mb-1">💰 補助金額</h5>
                        <p className="text-base font-black text-purple-800">{s.amount}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <h5 className="text-[10px] font-bold text-purple-600 mb-1">📅 公募期間</h5>
                        <p className="text-sm font-bold text-text-main">{s.applicationPeriod}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <h5 className="text-[10px] font-bold text-purple-600 mb-1">🏛️ 管轄</h5>
                        <p className="text-sm font-bold text-text-main">{s.jurisdiction}（{s.pref}）</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-purple-200 p-3 mb-4">
                      <h5 className="text-[10px] font-bold text-purple-600 mb-2">📊 予算消化状況</h5>
                      <div className="flex justify-between text-xs text-text-sub mb-1">
                        <span>消化: {(s.usedBudget / 100000000).toFixed(1)}億円</span>
                        <span>総予算: {(s.totalBudget / 100000000).toFixed(1)}億円</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
                        <div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: rate >= 85 ? "#dc2626" : rate >= 70 ? "#ea580c" : rate >= 50 ? "#d97706" : "#7c3aed" }} />
                      </div>
                      <p className="text-[10px] text-text-sub">残予算: {((s.totalBudget - s.usedBudget) / 100000000).toFixed(1)}億円（消化率 {rate.toFixed(1)}%）</p>
                    </div>
                    <div className="flex gap-3">
                      <a href={s.guidelinesUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-purple-600 text-white rounded-lg text-sm font-bold text-center hover:bg-purple-700 transition-colors">📄 公募要項を見る →</a>
                      <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-white border-2 border-purple-600 text-purple-700 rounded-lg text-sm font-bold text-center hover:bg-purple-50 transition-colors">🌐 専用HPへ →</a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-border rounded-xl p-8 text-center">
          <p className="text-text-sub text-sm">該当する補助金・助成金が見つかりませんでした</p>
          <p className="text-text-sub text-xs mt-1">キーワードや都道府県を変更してお試しください</p>
        </div>
      )}

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
        <h4 className="text-sm font-bold text-purple-800 mb-3">公式サイトで最新情報を確認</h4>
        <p className="text-xs text-purple-600 mb-3">デモ版はサンプルデータです。最新の補助金・助成金情報は以下の公式サイトをご確認ください。</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "jGrants（補助金申請）", url: "https://www.jgrants-portal.go.jp/", desc: "経産省 補助金電子申請" },
            { name: "国土交通省 住宅支援", url: "https://www.mlit.go.jp/jutakukentiku/house/", desc: "住宅省エネ・耐震等" },
            { name: "環境省 補助金", url: "https://www.env.go.jp/policy/", desc: "省エネ・再エネ補助金" },
            { name: "住宅リフォーム推進協議会", url: "https://www.j-reform.com/", desc: "リフォーム助成金情報" },
          ].map((site, i) => (
            <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="block bg-white border border-purple-200 rounded-lg p-3 hover:border-purple-400 hover:shadow-md transition-all">
              <p className="text-xs font-bold text-purple-700 mb-1">{site.name}</p>
              <p className="text-[10px] text-text-sub">{site.desc}</p>
              <p className="text-[10px] text-purple-500 mt-1">→ 公式サイトへ</p>
            </a>
          ))}
        </div>
      </div>
    </>) : activeTab === "pipeline" ? (<>
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">検索パイプライン（7ステップ処理）</h3>
        <div className="grid grid-cols-7 gap-2">
          {[
            { num: 1, label: "キーワード展開", desc: "業界辞書" },
            { num: 2, label: "データ収集", desc: "フェッチ" },
            { num: 3, label: "フィールド抽出", desc: "解析" },
            { num: 4, label: "適格性スコアリング", desc: "評価" },
            { num: 5, label: "締切状態判定", desc: "期限判定" },
            { num: 6, label: "アラートロジック", desc: "通知生成" },
            { num: 7, label: "出力フォーマット", desc: "表示" },
          ].map((step, i) => (
            <div key={i} className="bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-3 text-center">
              <div className="text-lg font-black text-purple-600 mb-1">{step.num}</div>
              <p className="text-[10px] font-bold text-text-main">{step.label}</p>
              <p className="text-[9px] text-text-sub mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[10px] text-blue-800 font-bold">監視状況</p>
          <p className="text-[9px] text-blue-700 mt-1">国 (毎日チェック) / 都道府県 (週1回) / 市区町村 (月2回)</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-blue-800 font-medium">リアルタイム監視中</span>
          </div>
        </div>
      </div>
    </>) : (<>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-main">予算消化モニタリング（自動監視）</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">監視中 ｜ 毎日 9:00 自動チェック</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {ALERT_LEVELS.map((lv, i) => (
            <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: lv.bg }}>
              <p className="text-xs font-bold" style={{ color: lv.color }}>{lv.label}</p>
              <p className="text-lg font-black" style={{ color: lv.color }}>{lv.threshold}%〜</p>
              <p className="text-[10px]" style={{ color: lv.color }}>消化率</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-sub">Slack通知連携対応 ｜ 閾値到達時に自動アラート送信 ｜ 重複通知防止機能付き</p>
      </div>

      <div className="space-y-3">
        {allSubsidies.filter(s => s.totalBudget > 0 && s.usedBudget > 0).sort((a, b) => (b.usedBudget / b.totalBudget) - (a.usedBudget / a.totalBudget)).map((s, i) => {
          const rate = (s.usedBudget / s.totalBudget) * 100;
          const remaining = s.totalBudget - s.usedBudget;
          const dailyBurn = s.usedBudget / 120;
          const daysLeft = dailyBurn > 0 ? Math.ceil(remaining / dailyBurn) : null;
          const alert = getAlertLevel(rate);
          return (
            <div key={i} className="bg-white border rounded-xl p-4" style={{ borderColor: alert ? alert.color + "40" : "#e5e7eb" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-text-main">{s.name}</h4>
                    {alert && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: alert.bg, color: alert.color }}>{alert.label} {rate.toFixed(1)}%</span>}
                  </div>
                  <p className="text-xs text-text-sub mt-0.5">{s.jurisdiction} ｜ {s.pref}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-sub">残予算</p>
                  <p className="text-sm font-bold text-text-main">{(remaining / 100000000).toFixed(1)}億円</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-text-sub mb-1">
                  <span>消化: {(s.usedBudget / 100000000).toFixed(1)}億円</span>
                  <span>総予算: {(s.totalBudget / 100000000).toFixed(1)}億円</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: alert ? alert.color : "#7c3aed" }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-text-sub">
                  <span>📅 期限: {s.deadline}</span>
                  {daysLeft && <span>⏳ 予算終了予測: 約{daysLeft}日後</span>}
                </div>
                {alert && alert.threshold >= 85 && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 animate-pulse">🔔 Slack通知済み</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>)}
  </>);
}


function Analytics({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="経営分析" color="#e11d48" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "年間売上", value: "¥6億8,000万", change: "+12.3%" }, { label: "年間粗利", value: "¥1億5,800万", change: "+8.7%" }, { label: "平均粗利率", value: "23.2%", change: "+1.5%" }, { label: "受注残", value: "¥4億2,000万", change: "+15.2%" }].map((s, i) => (
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
      {[{ label: "進行中の工事", value: "12", change: "+2", color: "#3b82f6" }, { label: "今月の売上", value: "¥1,520万", change: "+8.3%", color: "#10b981" }, { label: "未回収金額", value: "¥210万", change: "-12%", color: "#f59e0b" }, { label: "今月の粗利率", value: "23.5%", change: "+1.2%", color: "#8b5cf6" }].map((card, i) => (
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

  const handleToolSelect = (id: string) => {
    if (id === "land-search") {
      window.open("https://suumo.jp/tochi/", "_blank");
      setSidebarOpen(false);
      return;
    }
    setActiveTool(id);
    setSidebarOpen(false);
  };

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
