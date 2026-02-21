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
  { id: "estimate", name: "積算関連", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
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
    <ToolHeader title="積算関連" color="#10b981" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["見積番号", "件名", "提出先", "金額", "提出日", "状態"]} rows={[
      ["E-2026-045", "△△ビル空調更新工事", "△△商事", "¥12,800,000", "2026/02/10", <StatusBadge key="1" status="送付済" />],
      ["E-2026-044", "○○邸外壁塗装工事", "○○様", "¥3,200,000", "2026/02/08", <StatusBadge key="2" status="承認済" />],
      ["E-2026-043", "□□倉庫改修工事", "□□物流", "¥18,500,000", "2026/02/05", <StatusBadge key="3" status="下書き" />],
      ["E-2026-042", "●●店舗内装工事", "●●フーズ", "¥7,600,000", "2026/02/01", <StatusBadge key="4" status="承認済" />],
    ]} />
  </>);
}

const ESTIMATE_TEMPLATE_B64 = "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";

function Budget({ onCreateNew, onExport }: ToolProps) {
  const [view, setView] = useState<"list"|"create-building"|"create-exterior"|"result-building"|"result-exterior">("list");
  const [blueprintFile, setBlueprintFile] = useState("");
  const [tsubo, setTsubo] = useState("");
  const [buildingType, setBuildingType] = useState("2階建");
  const [buildingOrder, setBuildingOrder] = useState("注文");
  const [futaiCost, setFutaiCost] = useState("");
  const [shokeihi, setShokeihi] = useState("");
  const [projectName, setProjectName] = useState("");
  const [airconEnabled, setAirconEnabled] = useState<"あり"|"なし">("あり");
  const [airconCount, setAirconCount] = useState("4");
  const [airconCost, setAirconCost] = useState("");
  const [waterproofEnabled, setWaterproofEnabled] = useState<"あり"|"なし">("あり");
  const [waterproofCost, setWaterproofCost] = useState("");
  const [batteryEnabled, setBatteryEnabled] = useState<"あり"|"なし">("なし");
  const [batteryCost, setBatteryCost] = useState("");
  const [solarEnabled, setSolarEnabled] = useState<"あり"|"なし">("なし");
  const [solarCost, setSolarCost] = useState("");
  const [evEnabled, setEvEnabled] = useState<"あり"|"なし">("なし");
  const [evCost, setEvCost] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [budgetResult, setBudgetResult] = useState<{ name: string; tsubo: string; type: string; orderType: string; items: { category: string; detail: string; amount: number; note: string }[]; total: number } | null>(null);
  // 外構工事用
  const [extBlueprintFile, setExtBlueprintFile] = useState("");
  const [extProjectName, setExtProjectName] = useState("");
  const [extResult, setExtResult] = useState<{ name: string; items: { category: string; detail: string; amount: number; note: string }[]; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const extFileRef = useRef<HTMLInputElement>(null);

  const buildingTypes = ["平屋", "2階建", "3階建", "アパート", "店舗"];
  const orderTypes = ["注文", "規格", "セミオーダー"];

  const analyzeSteps = ["図面データを読み込み中...", "間取り・構造を解析中...", "建物仕様を特定中...", "資材単価をマッチング中...", "工事費を積算中...", "実行予算書を生成中..."];
  const extAnalyzeSteps = ["外構図面を読み込み中...", "敷地境界・面積を解析中...", "外構仕様を特定中...", "資材単価をマッチング中...", "外構工事費を積算中...", "外構予算書を生成中..."];

  const generateBuildingBudget = () => {
    if (!blueprintFile) return;
    if (!tsubo) { alert("建物の坪数を入力してください（必須）"); return; }
    if (!futaiCost) { alert("付帯工事の金額を入力してください（必須）"); return; }
    if (!shokeihi) { alert("諸経費の金額を入力してください（必須）"); return; }
    if (airconEnabled === "あり" && !airconCost) { alert("エアコンの金額を入力してください（必須）"); return; }
    if (waterproofEnabled === "あり" && !waterproofCost) { alert("防水工事の金額を入力してください（必須）"); return; }
    if (batteryEnabled === "あり" && !batteryCost) { alert("蓄電池の金額を入力してください（必須）"); return; }
    if (solarEnabled === "あり" && !solarCost) { alert("太陽光の金額を入力してください（必須）"); return; }
    if (evEnabled === "あり" && !evCost) { alert("EV充電器の金額を入力してください（必須）"); return; }
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      if (step >= analyzeSteps.length) {
        clearInterval(iv);
        const t = parseFloat(tsubo) || 30;
        const unitCosts: Record<string, number> = { "平屋": 75, "2階建": 68, "3階建": 72, "アパート": 58, "店舗": 82 };
        const unit = unitCosts[buildingType] || 68;
        const base = t * unit;
        const orderAdj: Record<string, number> = { "注文": 1.0, "規格": 0.85, "セミオーダー": 0.92 };
        const adj = orderAdj[buildingOrder] || 1.0;
        const adjBase = base * adj;
        const items: { category: string; detail: string; amount: number; note: string }[] = [
          { category: "仮設工事", detail: "足場・仮囲い・養生・仮設電気水道", amount: Math.round(adjBase * 0.05), note: "足場面積から算出" },
          { category: "基礎工事", detail: "根切り・砕石・捨コン・配筋・型枠・コンクリート打設", amount: Math.round(adjBase * 0.12), note: buildingType === "3階建" ? "杭基礎含む" : "ベタ基礎" },
          { category: "躯体工事", detail: buildingType === "店舗" ? "鉄骨造・デッキプレート" : "木造軸組・プレカット材", amount: Math.round(adjBase * 0.18), note: "図面より柱・梁数量算出" },
          { category: "屋根・板金工事", detail: buildingType === "アパート" ? "ガルバリウム鋼板葺き" : "瓦葺き・板金役物", amount: Math.round(adjBase * 0.06), note: "屋根面積: " + Math.round(t * 3.3 * (buildingType === "平屋" ? 1.2 : 0.6)) + "㎡" },
          { category: "外壁工事", detail: "窯業系サイディング16mm・通気工法", amount: Math.round(adjBase * 0.08), note: "外壁面積より算出" },
          { category: "建具工事", detail: "アルミ樹脂複合サッシ・玄関ドア・室内建具", amount: Math.round(adjBase * 0.08), note: "Low-E複層ガラス仕様" },
          { category: "内装工事", detail: "石膏ボード・クロス・フローリング・タイル", amount: Math.round(adjBase * 0.10), note: "延床" + Math.round(t * 3.3) + "㎡" },
          { category: "電気設備工事", detail: "分電盤・配線・照明・コンセント・LAN", amount: Math.round(adjBase * 0.08), note: buildingType === "店舗" ? "動力電源含む" : "太陽光対応PB" },
          { category: "給排水衛生設備", detail: "給水管・排水管・衛生器具・給湯器", amount: Math.round(adjBase * 0.08), note: buildingType === "アパート" ? (Math.round(t / 8) + "戸分") : "" },
          { category: "空調換気設備", detail: "24h換気システム・換気扇・ダクト", amount: Math.round(adjBase * 0.03), note: "エアコン別途" },
        ];
        // エアコン（あり/なし選択 → ありの場合のみ手入力）
        if (airconEnabled === "あり") {
          const acCount = parseInt(airconCount) || 0;
          const acCost = parseFloat(airconCost) || 0;
          if (acCount > 0 && acCost > 0) {
            items.push({ category: "エアコン", detail: `ルームエアコン ${acCount}台`, amount: acCost, note: `${acCount}台 × 手入力` });
          }
        }
        // 防水工事（あり/なし選択 → ありの場合のみ手入力）
        if (waterproofEnabled === "あり") {
          const wpCost = parseFloat(waterproofCost) || 0;
          if (wpCost > 0) {
            items.push({ category: "防水工事", detail: buildingType === "アパート" ? "シート防水・FRP防水" : "FRP防水（バルコニー）", amount: wpCost, note: "手入力" });
          }
        }
        // 蓄電池（あり/なし選択 → ありの場合のみ手入力）
        if (batteryEnabled === "あり") {
          const btCost = parseFloat(batteryCost) || 0;
          if (btCost > 0) {
            items.push({ category: "蓄電池", detail: "家庭用蓄電池システム", amount: btCost, note: "手入力" });
          }
        }
        // 太陽光（あり/なし選択 → ありの場合のみ手入力）
        if (solarEnabled === "あり") {
          const slCost = parseFloat(solarCost) || 0;
          if (slCost > 0) {
            items.push({ category: "太陽光", detail: "太陽光発電システム", amount: slCost, note: "手入力" });
          }
        }
        // EV充電器（あり/なし選択 → ありの場合のみ手入力）
        if (evEnabled === "あり") {
          const evVal = parseFloat(evCost) || 0;
          if (evVal > 0) {
            items.push({ category: "EV充電器", detail: "EV充電設備一式", amount: evVal, note: "手入力" });
          }
        }
        // 付帯工事（手入力）
        const futaiVal = parseFloat(futaiCost) || 0;
        if (futaiVal > 0) {
          items.push({ category: "付帯工事", detail: "地盤改良・水道引込等", amount: futaiVal, note: "手入力" });
        }
        // 諸経費（手入力・必須）
        const shokeihiVal = parseFloat(shokeihi) || 0;
        items.push({ category: "諸経費", detail: "現場管理費・一般管理費・産廃処理", amount: shokeihiVal, note: "手入力" });
        const total = items.reduce((sum, it) => sum + it.amount, 0);
        setBudgetResult({ name: projectName || "新規工事", tsubo, type: buildingType, orderType: buildingOrder, items, total });
        setIsAnalyzing(false);
        setView("result-building");
      }
    }, 600);
  };

  const generateExteriorBudget = () => {
    if (!extBlueprintFile) return;
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      if (step >= extAnalyzeSteps.length) {
        clearInterval(iv);
        const items: { category: string; detail: string; amount: number; note: string }[] = [
          { category: "駐車場工事", detail: "土間コンクリート打設・目地・型枠", amount: 85, note: "2台分想定" },
          { category: "アプローチ工事", detail: "インターロッキング・タイル・石張り", amount: 45, note: "玄関〜道路" },
          { category: "フェンス・塀工事", detail: "アルミフェンス・化粧ブロック・門柱", amount: 65, note: "敷地外周" },
          { category: "植栽工事", detail: "シンボルツリー・低木・芝張り・砂利敷き", amount: 35, note: "植栽計画に基づく" },
          { category: "土工事", detail: "残土処分・整地・盛土・砕石敷き", amount: 30, note: "GL調整含む" },
          { category: "排水工事", detail: "雨水桝・排水管・側溝・浸透桝", amount: 25, note: "敷地内排水" },
          { category: "照明・電気工事", detail: "外灯・ガーデンライト・インターホン移設", amount: 20, note: "" },
          { category: "その他", detail: "物置・サイクルポート・宅配ボックス", amount: 15, note: "" },
        ];
        const total = items.reduce((sum, it) => sum + it.amount, 0);
        setExtResult({ name: extProjectName || "新規外構工事", items, total });
        setIsAnalyzing(false);
        setView("result-exterior");
      }
    }, 600);
  };

  // ========== 建物予算 結果表示 ==========
  if (view === "result-building" && budgetResult) {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <p className="text-sm font-bold text-green-800">AI図面解析完了 —「{budgetResult.name}」の建物実行予算書を作成しました</p>
            <p className="text-xs text-green-600">{budgetResult.type}（{budgetResult.orderType}）｜ {budgetResult.tsubo}坪（{Math.round(parseFloat(budgetResult.tsubo) * 3.3)}㎡）｜ 図面: {blueprintFile}</p>
          </div>
        </div>
        <button onClick={() => { setView("create-building"); setBudgetResult(null); }} className="text-xs text-amber-600 hover:text-amber-800 font-bold">再作成</button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4 text-center"><span className="text-xs font-bold text-amber-700">建物のみ（外構工事は含まれていません）</span></div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">実行予算 合計</p><p className="text-xl font-black text-amber-600">{(budgetResult.total).toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">粗利率</p><p className="text-xl font-black text-green-600">30%</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">粗利額</p><p className="text-xl font-black text-green-600">{Math.round(budgetResult.total * 0.3).toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">坪単価</p><p className="text-xl font-black text-text-main">{Math.round(budgetResult.total / parseFloat(budgetResult.tsubo)).toLocaleString()}万/坪</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">㎡単価</p><p className="text-xl font-black text-text-main">{(budgetResult.total / (parseFloat(budgetResult.tsubo) * 3.3)).toFixed(1)}万/㎡</p></div>
      </div>
      <DataTable headers={["工種", "工事内容", "金額（万円）", "備考"]} rows={budgetResult.items.map((it, i) => [
        it.category,
        <span key={`d${i}`} className="text-xs">{it.detail}</span>,
        <span key={`a${i}`} className="font-bold">{it.amount.toLocaleString()}</span>,
        <span key={`n${i}`} className="text-xs text-text-sub">{it.note}</span>,
      ]).concat([
        [<span key="tt" className="font-black text-amber-600">実行予算 合計</span>,"",<span key="ta" className="font-black text-amber-600 text-base">{budgetResult.total.toLocaleString()}万</span>,""],
        [<span key="gt" className="font-black text-green-600">粗利（30%）</span>,"",<span key="ga" className="font-black text-green-600 text-base">{Math.round(budgetResult.total * 0.3).toLocaleString()}万</span>,""],
        [<span key="ct" className="font-black text-blue-600">請負金額（税抜）</span>,<span key="cd" className="text-xs text-text-sub">実行予算 + 粗利</span>,<span key="ca" className="font-black text-blue-600 text-lg">{Math.round(budgetResult.total * 1.3).toLocaleString()}万</span>,<span key="cn" className="text-xs text-text-sub">税込 {Math.round(budgetResult.total * 1.3 * 1.1).toLocaleString()}万</span>],
      ])} />
      {/* 見積書変換 & Excelダウンロード */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">お客様提出用 見積書に変換</p>
              <p className="text-[10px] text-emerald-600">実行予算 → 粗利30%加算 → 雛形Excelに自動入力してダウンロード</p>
            </div>
          </div>
          <button onClick={async () => {
            const W = window as unknown as Record<string, unknown>;
            if (!W.XLSX) { await new Promise<void>((res, rej) => { const s = document.createElement("script"); s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"; s.onload = () => res(); s.onerror = () => rej(); document.head.appendChild(s); }); }
            const X = W.XLSX as { read: Function; writeFile: Function };
            const wb = X.read(ESTIMATE_TEMPLATE_B64, { type: "base64" });
            const ws = wb.Sheets["見積もり"];
            const ws2 = wb.Sheets["建築にかかわる費用"];
            const sc = (sh: Record<string, unknown>, ref: string, val: unknown, t = "n") => { const c = sh[ref] as Record<string, unknown> | undefined; if (c) { c.v = val; c.t = t; delete c.f; } else { sh[ref] = { v: val, t }; } };
            const futaiCats = ["付帯工事","諸経費","エアコン","防水工事","蓄電池","太陽光","EV充電器","外構工事"];
            const optionCats = ["仮設工事","基礎工事","躯体工事","屋根・板金工事","外壁工事","建具工事","内装工事","電気設備工事","給排水衛生設備","空調換気設備","エアコン","防水工事"];
            const mainItems = budgetResult.items.filter(it => !futaiCats.includes(it.category));
            const futaiItems = budgetResult.items.filter(it => futaiCats.includes(it.category));
            const optionTotal = mainItems.reduce((s, it) => s + Math.round(it.amount * 1.3), 0) * 10000;
            const futaiTotal = futaiItems.reduce((s, it) => s + Math.round(it.amount * 1.3), 0) * 10000;
            const bodyPrice = 0; // 本体工事費はオプション工事に含む（新テンプレート仕様）
            const contractAmt = optionTotal + futaiTotal;
            const tax = Math.round(contractAmt * 0.1);
            const totalWithTax = contractAmt + tax;
            // 見積もりシート（新テンプレート行番号）
            sc(ws, "B5", budgetResult.name + " 様", "s");
            sc(ws, "N20", bodyPrice); sc(ws, "N22", optionTotal); sc(ws, "N24", futaiTotal);
            sc(ws, "N27", contractAmt); sc(ws, "N30", tax); sc(ws, "N33", totalWithTax); sc(ws, "K10", totalWithTax);
            sc(ws, "X65", bodyPrice);
            // オプション工事明細 rows 69-80
            mainItems.forEach((it, i) => { const r = 69 + i; if (r <= 80) { sc(ws, "J"+r, 1); sc(ws, "M"+r, "式", "s"); sc(ws, "U"+r, Math.round(it.amount*1.3)*10000); } });
            // 付帯工事明細 rows 86-94（新テンプレート: 付帯/諸経費/エアコン/防水/太陽光/蓄電池/EV充電器/外構）
            const futaiMap: Record<string, number> = { "付帯工事": 86, "諸経費": 87, "エアコン": 88, "防水工事": 89, "太陽光": 90, "蓄電池": 91, "EV充電器": 92, "外構工事": 93 };
            futaiItems.forEach(it => { const r = futaiMap[it.category]; if (r) { sc(ws, "J"+r, 1); sc(ws, "M"+r, "式", "s"); sc(ws, "U"+r, Math.round(it.amount*1.3)*10000); } });
            sc(ws, "N82", optionTotal); sc(ws, "N96", futaiTotal);
            // 床面積
            const t = parseFloat(budgetResult.tsubo) || 30; const is1f = budgetResult.type === "平屋";
            sc(ws, "E48", is1f ? Math.round(t*3.3) : Math.round(t*3.3*0.55)); sc(ws, "I48", is1f ? Math.round(t*10)/10 : Math.round(t*0.55*10)/10);
            sc(ws, "E49", is1f ? 0 : Math.round(t*3.3*0.45)); sc(ws, "I49", is1f ? 0 : Math.round(t*0.45*10)/10);
            sc(ws, "E51", Math.round(t*3.3)); sc(ws, "I51", t);
            // 建築にかかわる費用シート
            if (ws2) { sc(ws2, "I11", bodyPrice); sc(ws2, "I13", futaiTotal); sc(ws2, "I18", contractAmt); }
            X.writeFile(wb, "見積書_" + budgetResult.name + "_" + new Date().toISOString().slice(0,10) + ".xlsx");
          }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            見積書ダウンロード（Excel）
          </button>
        </div>
      </div>
    </>);
  }

  // ========== 外構予算 結果表示 ==========
  if (view === "result-exterior" && extResult) {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <p className="text-sm font-bold text-green-800">AI図面解析完了 —「{extResult.name}」の外構工事予算書を作成しました</p>
            <p className="text-xs text-green-600">外構図面: {extBlueprintFile}</p>
          </div>
        </div>
        <button onClick={() => { setView("create-exterior"); setExtResult(null); }} className="text-xs text-amber-600 hover:text-amber-800 font-bold">再作成</button>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-4 text-center"><span className="text-xs font-bold text-emerald-700">外構工事のみ</span></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">外構工事 合計</p><p className="text-xl font-black text-emerald-600">{extResult.total.toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">粗利（30%）</p><p className="text-xl font-black text-green-600">{Math.round(extResult.total * 0.3).toLocaleString()}万</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">請負金額（税込）</p><p className="text-xl font-black text-blue-600">{Math.round(extResult.total * 1.3 * 1.1).toLocaleString()}万</p></div>
      </div>
      <DataTable headers={["工種", "工事内容", "金額（万円）", "備考"]} rows={extResult.items.map((it, i) => [
        it.category,
        <span key={`d${i}`} className="text-xs">{it.detail}</span>,
        <span key={`a${i}`} className="font-bold">{it.amount.toLocaleString()}</span>,
        <span key={`n${i}`} className="text-xs text-text-sub">{it.note}</span>,
      ]).concat([
        [<span key="tt" className="font-black text-emerald-600">外構工事 合計</span>,"",<span key="ta" className="font-black text-emerald-600 text-base">{extResult.total.toLocaleString()}万</span>,""],
        [<span key="gt" className="font-black text-green-600">粗利（30%）</span>,"",<span key="ga" className="font-black text-green-600 text-base">{Math.round(extResult.total * 0.3).toLocaleString()}万</span>,""],
        [<span key="ct" className="font-black text-blue-600">請負金額（税抜）</span>,<span key="cd" className="text-xs text-text-sub">外構予算 + 粗利</span>,<span key="ca" className="font-black text-blue-600 text-lg">{Math.round(extResult.total * 1.3).toLocaleString()}万</span>,<span key="cn" className="text-xs text-text-sub">税込 {Math.round(extResult.total * 1.3 * 1.1).toLocaleString()}万</span>],
      ])} />
      {/* 外構見積書変換 & Excelダウンロード */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">お客様提出用 外構見積書に変換</p>
              <p className="text-[10px] text-emerald-600">外構予算 → 粗利30%加算 → 雛形Excelに自動入力してダウンロード</p>
            </div>
          </div>
          <button onClick={async () => {
            const W = window as unknown as Record<string, unknown>;
            if (!W.XLSX) { await new Promise<void>((res, rej) => { const s = document.createElement("script"); s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"; s.onload = () => res(); s.onerror = () => rej(); document.head.appendChild(s); }); }
            const X = W.XLSX as { read: Function; writeFile: Function };
            const wb = X.read(ESTIMATE_TEMPLATE_B64, { type: "base64" });
            const ws = wb.Sheets["見積もり"];
            const ws2 = wb.Sheets["建築にかかわる費用"];
            const sc = (sh: Record<string, unknown>, ref: string, val: unknown, t = "n") => { const c = sh[ref] as Record<string, unknown> | undefined; if (c) { c.v = val; c.t = t; delete c.f; } else { sh[ref] = { v: val, t }; } };
            const extItems = extResult.items;
            const extTotal = extItems.reduce((s, it) => s + Math.round(it.amount * 1.3), 0) * 10000;
            const tax = Math.round(extTotal * 0.1);
            const totalWithTax = extTotal + tax;
            sc(ws, "B5", extResult.name + " 様", "s");
            sc(ws, "N20", 0); sc(ws, "N22", 0); sc(ws, "N24", extTotal);
            sc(ws, "N27", extTotal); sc(ws, "N30", tax); sc(ws, "N33", totalWithTax); sc(ws, "K10", totalWithTax);
            sc(ws, "X65", 0); sc(ws, "N96", extTotal);
            extItems.forEach((it, i) => { const r = 86 + i; if (r <= 94) { sc(ws, "J"+r, 1); sc(ws, "M"+r, "式", "s"); sc(ws, "U"+r, Math.round(it.amount*1.3)*10000); } });
            if (ws2) { sc(ws2, "I11", 0); sc(ws2, "I13", extTotal); sc(ws2, "I18", extTotal); sc(ws2, "I60", extTotal); }
            X.writeFile(wb, "外構見積書_" + extResult.name + "_" + new Date().toISOString().slice(0,10) + ".xlsx");
          }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            外構見積書ダウンロード（Excel）
          </button>
        </div>
      </div>
    </>);
  }

  // ========== 建物予算 新規作成 ==========
  if (view === "create-building") {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      {isAnalyzing ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-base font-bold text-text-main mb-2">AI が建物図面を解析中...</p>
          <div className="max-w-md mx-auto space-y-2 mt-4">
            {analyzeSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < analyzeStep ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : i === analyzeStep ? (<div className="w-[18px] h-[18px] border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                ) : (<div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />)}
                <span className={`text-sm ${i < analyzeStep ? "text-green-700 font-medium" : i === analyzeStep ? "text-amber-700 font-bold" : "text-text-sub"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h3 className="text-base font-bold text-text-main">建物のみ 自動積算</h3>
          </div>
          <p className="text-xs text-text-sub mb-6">建物図面をアップロードし、建物情報を入力すると、AIが図面を解読して建物の実行予算を自動作成します。（外構工事は含みません）</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">建物図面アップロード <span className="text-red-500">*</span></label>
            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.jww,.dxf,.dwg" onChange={e => { if (e.target.files?.[0]) setBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-amber-400","bg-amber-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-amber-400","bg-amber-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-amber-400","bg-amber-50"); if (e.dataTransfer.files?.[0]) setBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-amber-300 hover:bg-amber-50/30 transition-colors cursor-pointer">
              {blueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-amber-700">{blueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-sm font-medium text-text-main mb-1">建物図面をアップロード（クリックまたはドラッグ&ドロップ）</p>
                  <p className="text-xs text-text-sub">対応形式: PDF / JPG / PNG / JWW / DXF / DWG</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">工事名</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm" placeholder="例: ○○邸新築工事" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">建物の坪数 <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={tsubo} onChange={e => setTsubo(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm pr-10" placeholder="例: 35" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">坪</span>
              </div>
              {tsubo && <p className="text-[10px] text-text-sub mt-1">= {Math.round(parseFloat(tsubo) * 3.3)}㎡</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">構造種別 <span className="text-red-500">*</span></label>
              <div className="flex gap-1.5 flex-wrap">
                {buildingTypes.map(bt => (
                  <button key={bt} onClick={() => setBuildingType(bt)} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-colors border ${buildingType === bt ? "bg-amber-500 text-white border-amber-500" : "bg-white text-text-main border-border hover:border-amber-300"}`}>{bt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">建物種別 <span className="text-red-500">*</span></label>
              <div className="flex gap-1.5 flex-wrap">
                {orderTypes.map(ot => (
                  <button key={ot} onClick={() => setBuildingOrder(ot)} className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-colors border ${buildingOrder === ot ? "bg-blue-500 text-white border-blue-500" : "bg-white text-text-main border-border hover:border-blue-300"}`}>{ot}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">付帯工事（万円） <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={futaiCost} onChange={e => setFutaiCost(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm pr-12" placeholder="例: 150" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
              </div>
              <p className="text-[10px] text-text-sub mt-1">地盤改良・水道引込等（手入力 → 自動加算）</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">諸経費（万円） <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" value={shokeihi} onChange={e => setShokeihi(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm pr-12" placeholder="例: 100" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
              </div>
              <p className="text-[10px] text-text-sub mt-1">現場管理費・一般管理費等（手入力 → 自動加算）</p>
            </div>
          </div>

          {/* エアコン（あり/なし選択） */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-blue-800">エアコン</label>
              <div className="flex gap-2">
                {(["あり", "なし"] as const).map(v => (
                  <button key={v} onClick={() => setAirconEnabled(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${airconEnabled === v ? (v === "あり" ? "bg-blue-600 text-white" : "bg-gray-500 text-white") : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-100"}`}>{v}</button>
                ))}
              </div>
            </div>
            {airconEnabled === "あり" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-blue-600 mb-1">台数</label>
                    <select value={airconCount} onChange={e => setAirconCount(e.target.value)} className="w-full px-4 py-3 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={String(n)}>{n}台</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-blue-600 mb-1">金額（万円）<span className="text-red-500 ml-1">*</span></label>
                    <div className="relative">
                      <input type="number" value={airconCost} onChange={e => setAirconCost(e.target.value)} className="w-full px-4 py-3 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 pr-12" placeholder="例: 60" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600 mt-2">ルームエアコンの台数と合計金額を入力 → 自動加算</p>
              </>
            )}
            {airconEnabled === "なし" && <p className="text-[10px] text-gray-500">エアコンは積算に含めません</p>}
          </div>

          {/* 防水工事（あり/なし選択） */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-teal-800">防水工事</label>
              <div className="flex gap-2">
                {(["あり", "なし"] as const).map(v => (
                  <button key={v} onClick={() => setWaterproofEnabled(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${waterproofEnabled === v ? (v === "あり" ? "bg-teal-600 text-white" : "bg-gray-500 text-white") : "bg-white border border-teal-200 text-teal-600 hover:bg-teal-100"}`}>{v}</button>
                ))}
              </div>
            </div>
            {waterproofEnabled === "あり" && (
              <>
                <div className="relative">
                  <input type="number" value={waterproofCost} onChange={e => setWaterproofCost(e.target.value)} className="w-full px-4 py-3 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 pr-12" placeholder="例: 50" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
                </div>
                <p className="text-[10px] text-teal-600 mt-2">FRP防水・シート防水等の金額を入力 → 自動加算</p>
              </>
            )}
            {waterproofEnabled === "なし" && <p className="text-[10px] text-gray-500">防水工事は積算に含めません</p>}
          </div>

          {/* 蓄電池（あり/なし選択） */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-purple-800">蓄電池</label>
              <div className="flex gap-2">
                {(["あり", "なし"] as const).map(v => (
                  <button key={v} onClick={() => setBatteryEnabled(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${batteryEnabled === v ? (v === "あり" ? "bg-purple-600 text-white" : "bg-gray-500 text-white") : "bg-white border border-purple-200 text-purple-600 hover:bg-purple-100"}`}>{v}</button>
                ))}
              </div>
            </div>
            {batteryEnabled === "あり" && (
              <>
                <div className="relative">
                  <input type="number" value={batteryCost} onChange={e => setBatteryCost(e.target.value)} className="w-full px-4 py-3 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 pr-12" placeholder="例: 150" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
                </div>
                <p className="text-[10px] text-purple-600 mt-2">蓄電池システムの金額を入力 → 自動加算</p>
              </>
            )}
            {batteryEnabled === "なし" && <p className="text-[10px] text-gray-500">蓄電池は積算に含めません</p>}
          </div>

          {/* 太陽光（あり/なし選択） */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-orange-800">太陽光</label>
              <div className="flex gap-2">
                {(["あり", "なし"] as const).map(v => (
                  <button key={v} onClick={() => setSolarEnabled(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${solarEnabled === v ? (v === "あり" ? "bg-orange-600 text-white" : "bg-gray-500 text-white") : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-100"}`}>{v}</button>
                ))}
              </div>
            </div>
            {solarEnabled === "あり" && (
              <>
                <div className="relative">
                  <input type="number" value={solarCost} onChange={e => setSolarCost(e.target.value)} className="w-full px-4 py-3 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 pr-12" placeholder="例: 200" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
                </div>
                <p className="text-[10px] text-orange-600 mt-2">太陽光発電システムの金額を入力 → 自動加算</p>
              </>
            )}
            {solarEnabled === "なし" && <p className="text-[10px] text-gray-500">太陽光は積算に含めません</p>}
          </div>

          {/* EV充電器（あり/なし選択） */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-cyan-800">EV充電器</label>
              <div className="flex gap-2">
                {(["あり", "なし"] as const).map(v => (
                  <button key={v} onClick={() => setEvEnabled(v)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${evEnabled === v ? (v === "あり" ? "bg-cyan-600 text-white" : "bg-gray-500 text-white") : "bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-100"}`}>{v}</button>
                ))}
              </div>
            </div>
            {evEnabled === "あり" && (
              <>
                <div className="relative">
                  <input type="number" value={evCost} onChange={e => setEvCost(e.target.value)} className="w-full px-4 py-3 border border-cyan-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 pr-12" placeholder="例: 30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub">万円</span>
                </div>
                <p className="text-[10px] text-cyan-600 mt-2">EV充電設備の金額を入力 → 自動加算</p>
              </>
            )}
            {evEnabled === "なし" && <p className="text-[10px] text-gray-500">EV充電器は積算に含めません</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setView("list")} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
            <button onClick={generateBuildingBudget} disabled={!blueprintFile} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${blueprintFile ? "bg-amber-500 hover:bg-amber-600" : "bg-gray-300 cursor-not-allowed"}`}>
              AI図面解析 → 建物予算を自動作成
            </button>
          </div>
        </div>
      )}
    </>);
  }

  // ========== 外構工事 新規作成 ==========
  if (view === "create-exterior") {
    return (<>
      <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => setView("list")} onExport={onExport} />
      {isAnalyzing ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-base font-bold text-text-main mb-2">AI が外構図面を解析中...</p>
          <div className="max-w-md mx-auto space-y-2 mt-4">
            {extAnalyzeSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < analyzeStep ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : i === analyzeStep ? (<div className="w-[18px] h-[18px] border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                ) : (<div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />)}
                <span className={`text-sm ${i < analyzeStep ? "text-green-700 font-medium" : i === analyzeStep ? "text-emerald-700 font-bold" : "text-text-sub"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-text-main">外構工事のみ 自動積算</h3>
          </div>
          <p className="text-xs text-text-sub mb-6">外構図面をアップロードすると、AIが図面を解読して外構工事の実行予算を自動作成します。</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">外構図面アップロード <span className="text-red-500">*</span></label>
            <input type="file" ref={extFileRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.jww,.dxf,.dwg" onChange={e => { if (e.target.files?.[0]) setExtBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => extFileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-emerald-400","bg-emerald-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-emerald-400","bg-emerald-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-emerald-400","bg-emerald-50"); if (e.dataTransfer.files?.[0]) setExtBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer">
              {extBlueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-emerald-700">{extBlueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setExtBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-sm font-medium text-text-main mb-1">外構図面をアップロード（クリックまたはドラッグ&ドロップ）</p>
                  <p className="text-xs text-text-sub">対応形式: PDF / JPG / PNG / JWW / DXF / DWG</p>
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">工事名</label>
            <input type="text" value={extProjectName} onChange={e => setExtProjectName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm" placeholder="例: ○○邸外構工事" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setView("list")} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
            <button onClick={generateExteriorBudget} disabled={!extBlueprintFile} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${extBlueprintFile ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-300 cursor-not-allowed"}`}>
              AI図面解析 → 外構予算を自動作成
            </button>
          </div>
        </div>
      )}
    </>);
  }

  // ========== 一覧画面（2つの新規作成ボタン） ==========
  return (<>
    <ToolHeader title="実行予算" color="#f59e0b" onCreateNew={() => {}} onExport={onExport} />

    {/* 新規作成: 建物 / 外構 の2つのカード */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button onClick={() => setView("create-building")} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 text-left hover:shadow-lg hover:border-amber-500 transition-all group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <p className="text-base font-bold text-amber-800">建物のみ 自動積算</p>
            <p className="text-xs text-amber-600">新規作成</p>
          </div>
        </div>
        <p className="text-xs text-text-sub">建物図面をアップロード → AI解析 → 建物の実行予算を自動作成</p>
        <p className="text-[10px] text-amber-600 mt-2 font-bold">※ 外構工事は含みません</p>
      </button>
      <button onClick={() => setView("create-exterior")} className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-6 text-left hover:shadow-lg hover:border-emerald-500 transition-all group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><rect x="1" y="6" width="22" height="12" rx="2" ry="2"/><path d="M1 10h22"/></svg>
          </div>
          <div>
            <p className="text-base font-bold text-emerald-800">外構工事のみ 自動積算</p>
            <p className="text-xs text-emerald-600">新規作成</p>
          </div>
        </div>
        <p className="text-xs text-text-sub">外構図面をアップロード → AI解析 → 外構の実行予算を自動作成</p>
        <p className="text-[10px] text-emerald-600 mt-2 font-bold">駐車場・アプローチ・フェンス・植栽等</p>
      </button>
    </div>

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
  const [buildingOrder, setBuildingOrder] = useState<"注文" | "規格">("注文");
  const [generated, setGenerated] = useState<{ name: string; area: string; order: string; totalDays: number; categories: { name: string; color: string; tasks: { name: string; startDay: number; endDay: number }[] }[] } | null>(null);
  const [blueprintFile, setBlueprintFile] = useState<string>("");
  const blueprintRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  // Excel雛形ベースの工程テンプレート（注文住宅: ~6ヶ月 / 規格住宅: ~3.5ヶ月）
  const generateSchedule = () => {
    if (!siteName) return;
    if (!duration) { alert("想定工期を入力してください（必須）"); return; }

    setIsAnalyzing(true);
    setAnalyzeStep(0);
    const steps = ["図面データ読込中...", "建物仕様を解析中...", "工種別工程を算出中...", "六曜・休日を考慮中...", "ガントチャートを生成中...", "最適化チェック完了"];
    let step = 0;
    const iv = setInterval(() => { step++; setAnalyzeStep(step); if (step >= steps.length) { clearInterval(iv); setTimeout(() => { setIsAnalyzing(false); createScheduleResult(); }, 500); } }, 600);
  };

  const createScheduleResult = () => {
    const months = parseFloat(duration) || (buildingOrder === "規格" ? 3.5 : 6);
    const totalDays = Math.round(months * 30);
    const name = siteName || "新規工事";
    const isKikaku = buildingOrder === "規格";
    const ratio = isKikaku ? 0.58 : 1.0; // 規格は工期短縮

    // Excel雛形に基づく工種・作業項目（NONDESIGN 2F工程表ベース）
    const categories = [
      { name: "仮設工事", color: "#6b7280", tasks: [
        { name: "仮設トイレ・フェンス・看板", startDay: 1, endDay: Math.round(totalDays * 0.95) },
        { name: "仮設関係撤去", startDay: Math.round(totalDays * 0.92), endDay: Math.round(totalDays * 0.95) },
      ]},
      { name: "電気工事", color: "#f59e0b", tasks: [
        { name: "仮設電気", startDay: Math.round(3 * ratio), endDay: Math.round(5 * ratio) },
        { name: "電気配線", startDay: Math.round(totalDays * 0.35), endDay: Math.round(totalDays * 0.38) },
        { name: "外部フード", startDay: Math.round(totalDays * 0.42), endDay: Math.round(totalDays * 0.44) },
        { name: "穴あけ", startDay: Math.round(totalDays * 0.52), endDay: Math.round(totalDays * 0.54) },
        { name: "照明器具取付", startDay: Math.round(totalDays * 0.78), endDay: Math.round(totalDays * 0.82) },
      ]},
      { name: "設備工事", color: "#06b6d4", tasks: [
        { name: "仮設水道", startDay: 1, endDay: Math.round(3 * ratio) },
        { name: "配管逃げ", startDay: Math.round(totalDays * 0.08), endDay: Math.round(totalDays * 0.10) },
        { name: "外部配管", startDay: Math.round(totalDays * 0.18), endDay: Math.round(totalDays * 0.22) },
        { name: "床下配管転がし", startDay: Math.round(totalDays * 0.22), endDay: Math.round(totalDays * 0.25) },
        { name: "キッチン・トイレ取付", startDay: Math.round(totalDays * 0.78), endDay: Math.round(totalDays * 0.82) },
        { name: "洗面台・エコキュート取付", startDay: Math.round(totalDays * 0.82), endDay: Math.round(totalDays * 0.85) },
      ]},
      { name: "基礎工事", color: "#3b82f6", tasks: [
        { name: "丁張・遣り方", startDay: Math.round(5 * ratio), endDay: Math.round(7 * ratio) },
        { name: "防湿シート・捨てコン", startDay: Math.round(7 * ratio), endDay: Math.round(9 * ratio) },
        { name: "鉄筋組み", startDay: Math.round(9 * ratio), endDay: Math.round(13 * ratio) },
        { name: "外周型枠・ベース打設", startDay: Math.round(13 * ratio), endDay: Math.round(17 * ratio) },
        { name: "立上り型枠・アンカー・打設", startDay: Math.round(17 * ratio), endDay: Math.round(20 * ratio) },
        { name: "養生", startDay: Math.round(20 * ratio), endDay: Math.round(25 * ratio) },
        { name: "型枠バラシ・玄関増し打ち", startDay: Math.round(25 * ratio), endDay: Math.round(28 * ratio) },
      ]},
      { name: "大工工事", color: "#ef4444", tasks: [
        { name: "土台敷き", startDay: Math.round(totalDays * 0.22), endDay: Math.round(totalDays * 0.24) },
        { name: "上棟（面材まで）", startDay: Math.round(totalDays * 0.25), endDay: Math.round(totalDays * 0.27) },
        { name: "サッシ取付", startDay: Math.round(totalDays * 0.27), endDay: Math.round(totalDays * 0.29) },
        { name: "防水シート", startDay: Math.round(totalDays * 0.29), endDay: Math.round(totalDays * 0.32) },
        { name: "構造金物", startDay: Math.round(totalDays * 0.32), endDay: Math.round(totalDays * 0.35) },
        { name: "天井下地・外部胴縁", startDay: Math.round(totalDays * 0.35), endDay: Math.round(totalDays * 0.40) },
        { name: "断熱（天井・壁）", startDay: Math.round(totalDays * 0.40), endDay: Math.round(totalDays * 0.45) },
        { name: "床張り", startDay: Math.round(totalDays * 0.45), endDay: Math.round(totalDays * 0.50) },
        { name: "天井・壁PB", startDay: Math.round(totalDays * 0.50), endDay: Math.round(totalDays * 0.55) },
        { name: "階段・建具枠・造作", startDay: Math.round(totalDays * 0.55), endDay: Math.round(totalDays * 0.60) },
      ]},
      { name: "クロス工事", color: "#a855f7", tasks: [
        { name: "パテ（天井・壁）", startDay: Math.round(totalDays * 0.60), endDay: Math.round(totalDays * 0.63) },
        { name: "クロス（2F→1F）", startDay: Math.round(totalDays * 0.63), endDay: Math.round(totalDays * 0.68) },
      ]},
      { name: "足場工事", color: "#64748b", tasks: [
        { name: "足場設置", startDay: Math.round(totalDays * 0.24), endDay: Math.round(totalDays * 0.26) },
        { name: "足場解体", startDay: Math.round(totalDays * 0.55), endDay: Math.round(totalDays * 0.57) },
      ]},
      { name: "UB工事", color: "#0891b2", tasks: [
        { name: "UB施工", startDay: Math.round(totalDays * 0.38), endDay: Math.round(totalDays * 0.42) },
      ]},
      { name: "左官工事", color: "#d97706", tasks: [
        { name: "内部パテ・塗り", startDay: Math.round(totalDays * 0.68), endDay: Math.round(totalDays * 0.76) },
        { name: "基礎巾木仕上げ", startDay: Math.round(totalDays * 0.76), endDay: Math.round(totalDays * 0.80) },
        { name: "玄関モルタル仕上げ", startDay: Math.round(totalDays * 0.80), endDay: Math.round(totalDays * 0.84) },
      ]},
      { name: "外壁工事", color: "#059669", tasks: [
        { name: "屋根ルーフィング・唐草", startDay: Math.round(totalDays * 0.25), endDay: Math.round(totalDays * 0.28) },
        { name: "屋根葺き", startDay: Math.round(totalDays * 0.28), endDay: Math.round(totalDays * 0.32) },
        { name: "外壁工事（1F・2F）", startDay: Math.round(totalDays * 0.40), endDay: Math.round(totalDays * 0.48) },
        { name: "軒樋・たて樋", startDay: Math.round(totalDays * 0.48), endDay: Math.round(totalDays * 0.50) },
      ]},
      { name: "コーキング工事", color: "#7c3aed", tasks: [
        { name: "外部コーキング", startDay: Math.round(totalDays * 0.48), endDay: Math.round(totalDays * 0.52) },
        { name: "内部コーキング", startDay: Math.round(totalDays * 0.85), endDay: Math.round(totalDays * 0.88) },
      ]},
      { name: "防蟻工事", color: "#be185d", tasks: [
        { name: "防蟻工事", startDay: Math.round(totalDays * 0.30), endDay: Math.round(totalDays * 0.32) },
      ]},
      { name: "防水工事", color: "#0d9488", tasks: [
        { name: "FRP工事", startDay: Math.round(totalDays * 0.35), endDay: Math.round(totalDays * 0.38) },
      ]},
      { name: "ハウスクリーニング", color: "#2563eb", tasks: [
        { name: "ハウスクリーニング", startDay: Math.round(totalDays * 0.88), endDay: Math.round(totalDays * 0.92) },
      ]},
      { name: "検査", color: "#dc2626", tasks: [
        { name: "配筋検査", startDay: Math.round(9 * ratio), endDay: Math.round(10 * ratio) },
        { name: "土台検査", startDay: Math.round(totalDays * 0.22), endDay: Math.round(totalDays * 0.23) },
        { name: "上棟屋根防水検査", startDay: Math.round(totalDays * 0.27), endDay: Math.round(totalDays * 0.28) },
        { name: "金物検査", startDay: Math.round(totalDays * 0.35), endDay: Math.round(totalDays * 0.36) },
        { name: "防水検査", startDay: Math.round(totalDays * 0.40), endDay: Math.round(totalDays * 0.41) },
        { name: "品質・完了検査", startDay: Math.round(totalDays * 0.92), endDay: Math.round(totalDays * 0.94) },
        { name: "建築確認完了検査", startDay: Math.round(totalDays * 0.94), endDay: Math.round(totalDays * 0.96) },
      ]},
    ];

    setGenerated({ name, area: floorArea, order: buildingOrder, totalDays, categories });
    setShowCreate(false);
    setSiteName(""); setFloorArea(""); setDuration("");
  };

  // 月ヘッダー生成
  const getMonthHeaders = (totalDays: number) => {
    const headers: { label: string; startPct: number; widthPct: number }[] = [];
    const startDate = new Date();
    for (let m = 0; m < Math.ceil(totalDays / 30); m++) {
      const d = new Date(startDate); d.setMonth(d.getMonth() + m);
      const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
      headers.push({ label, startPct: (m * 30 / totalDays) * 100, widthPct: Math.min(30, totalDays - m * 30) / totalDays * 100 });
    }
    return headers;
  };

  return (
    <>
      <ToolHeader title="工程スケジュール" color="#8b5cf6" onCreateNew={() => setShowCreate(true)} onExport={onExport} />

      {/* AI解析アニメーション */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-5" />
            <h3 className="text-lg font-bold text-text-main mb-4 text-center">AI工程スケジュール生成中...</h3>
            <div className="space-y-3">
              {["図面データ読込中...", "建物仕様を解析中...", "工種別工程を算出中...", "六曜・休日を考慮中...", "ガントチャートを生成中...", "最適化チェック完了"].map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{analyzeStep > i ? "✅" : analyzeStep === i ? "⏳" : "⭕"}</span>
                  <span className={`text-sm ${analyzeStep > i ? "text-green-700 font-bold" : analyzeStep === i ? "text-text-main font-bold animate-pulse" : "text-text-sub"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreate ? (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-bold text-text-main mb-6">工程スケジュール 新規作成</h3>

          {/* 建物種別（注文 / 規格） */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-2">建物種別 <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {(["注文", "規格"] as const).map(t => (
                <button key={t} onClick={() => { setBuildingOrder(t); if (t === "規格" && !duration) setDuration("3.5"); }} className={`flex-1 py-4 rounded-xl border-2 text-center transition-all ${buildingOrder === t ? "border-purple-500 bg-purple-50 shadow-md" : "border-border hover:border-purple-300"}`}>
                  <p className={`text-base font-bold ${buildingOrder === t ? "text-purple-700" : "text-text-main"}`}>{t === "注文" ? "注文住宅" : "規格住宅"}</p>
                  <p className="text-xs text-text-sub mt-1">{t === "注文" ? "自由設計 ｜ 工期5〜7ヶ月" : "標準プラン ｜ 工期3〜4ヶ月"}</p>
                  {t === "規格" && buildingOrder === "規格" && (
                    <div className="mt-2 bg-orange-100 border border-orange-300 rounded-lg px-3 py-1.5 inline-block">
                      <p className="text-xs font-bold text-orange-700">推奨工期: 3.5ヶ月</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {buildingOrder === "規格" && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-orange-500 text-lg">⚡</span>
                <p className="text-xs text-orange-800 font-bold">規格住宅の場合、工期は <span className="text-orange-600 text-sm">3.5ヶ月推奨</span> です。標準化されたプランにより工期短縮が可能です。</p>
              </div>
            )}
          </div>

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
              <div className="relative">
                <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder={buildingOrder === "規格" ? "3.5" : "6"} />
                {buildingOrder === "規格" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-600 font-bold">3.5ヶ月推奨</span>}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">図面アップロード</label>
            <input type="file" ref={blueprintRef} className="hidden" accept=".pdf,.jww,.dxf,.atr,.dwg" onChange={e => { if (e.target.files?.[0]) setBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => blueprintRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-purple-400","bg-purple-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); if (e.dataTransfer.files?.[0]) setBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-colors cursor-pointer">
              {blueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-purple-700">{blueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 削除</button>
                </div>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <p className="text-sm font-medium text-text-main mb-1">クリックまたはドラッグ&ドロップ</p>
                  <p className="text-xs text-text-sub">対応形式: PDF / JWW / DXF / archiトレンド (.atr) / その他CADデータ</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
            <button onClick={generateSchedule} disabled={!siteName || !duration} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${siteName && duration ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-300 cursor-not-allowed"}`}>AI工程スケジュールを自動作成</button>
          </div>
        </div>
      ) : generated ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <div>
                <span className="text-sm font-bold text-green-700">「{generated.name}」の工程スケジュールを自動作成しました</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{generated.order}住宅</span>
                  {generated.area && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">延床 {generated.area}</span>}
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">工期 {(generated.totalDays / 30).toFixed(1)}ヶ月（{generated.totalDays}日）</span>
                </div>
              </div>
            </div>
            <button onClick={() => setGenerated(null)} className="text-xs text-text-sub hover:text-text-main">既存工程に戻る</button>
          </div>

          {/* サマリーカード */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-border p-3"><p className="text-[10px] text-text-sub">総工期</p><p className="text-lg font-black text-purple-700">{(generated.totalDays / 30).toFixed(1)}ヶ月</p><p className="text-[10px] text-text-sub">{generated.totalDays}日間</p></div>
            <div className="bg-white rounded-xl border border-border p-3"><p className="text-[10px] text-text-sub">工種数</p><p className="text-lg font-black text-blue-700">{generated.categories.length}工種</p><p className="text-[10px] text-text-sub">{generated.categories.reduce((a, c) => a + c.tasks.length, 0)}作業</p></div>
            <div className="bg-white rounded-xl border border-border p-3"><p className="text-[10px] text-text-sub">建物種別</p><p className="text-lg font-black text-green-700">{generated.order}住宅</p></div>
            <div className="bg-white rounded-xl border border-border p-3"><p className="text-[10px] text-text-sub">テンプレート</p><p className="text-lg font-black text-orange-700">実績ベース</p><p className="text-[10px] text-text-sub">NONDESIGN雛形</p></div>
          </div>

          {/* ガントチャート */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {/* 月ヘッダー */}
            <div className="flex border-b border-border">
              <div className="w-36 shrink-0 bg-gray-50 p-2 text-[10px] font-bold text-text-sub border-r border-border">工種 / 作業</div>
              <div className="flex-1 relative h-8 bg-gray-50">
                {getMonthHeaders(generated.totalDays).map((m, i) => (
                  <div key={i} className="absolute top-0 h-full flex items-center border-r border-border" style={{ left: `${m.startPct}%`, width: `${m.widthPct}%` }}>
                    <span className="text-[10px] font-bold text-text-sub px-2 truncate">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 工種・作業行 */}
            {generated.categories.map((cat, ci) => (
              <div key={ci}>
                {/* カテゴリヘッダー */}
                <div className="flex border-b border-border bg-gray-50/60">
                  <div className="w-36 shrink-0 p-2 border-r border-border flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[11px] font-bold text-text-main truncate">{cat.name}</span>
                  </div>
                  <div className="flex-1" />
                </div>
                {/* タスク行 */}
                {cat.tasks.map((task, ti) => {
                  const leftPct = (task.startDay / generated.totalDays) * 100;
                  const widthPct = Math.max(2, ((task.endDay - task.startDay) / generated.totalDays) * 100);
                  return (
                    <div key={ti} className="flex border-b border-border/50 hover:bg-purple-50/30 transition-colors">
                      <div className="w-36 shrink-0 p-1.5 pl-6 border-r border-border">
                        <span className="text-[10px] text-text-sub truncate block">{task.name}</span>
                      </div>
                      <div className="flex-1 relative h-7">
                        <div className="absolute top-1 h-5 rounded-sm text-[9px] text-white flex items-center px-1.5 font-medium overflow-hidden whitespace-nowrap" style={{ backgroundColor: cat.color, left: `${leftPct}%`, width: `${widthPct}%`, opacity: 0.85 }}>
                          {widthPct > 8 ? task.name : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-text-sub mt-3 text-center">※ 本工程表は実績ベースのAI自動生成です。実際の工程は現場条件により変動します。 ｜ 六曜・休日は考慮済み</p>
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
                <span className="flex-1 truncate text-left">積算関連</span>
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
