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
  return (<>
    <ToolHeader title="工事台帳" color="#3b82f6" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "進行中", value: "12件", color: "#3b82f6" }, { label: "今月完了", value: "3件", color: "#10b981" }, { label: "受注総額", value: "¥2億8,500万", color: "#f59e0b" }].map((s, i) => (
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
              <p className="font-bold text-text-main mb-1">AI画像最適化エンジン処理中...</p>
              <p className="text-xs text-text-sub">住宅/不動産画像の解析・補正・広告素材生成を実行しています</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">← 戻る</button>
          <h2 className="text-lg font-bold text-text-main">素材生成 - Canvaレベルエディタ</h2>
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span className="text-sm font-bold text-green-700">素材の生成が完了しました</span>
            </div>

            {/* A) AI画像解析結果 */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h4 className="text-sm font-bold text-text-main mb-4">AI画像解析結果</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-2 font-mono text-text-sub">
                {optimizeMode === "housing" ? (
                  <>
                    <div><span className="font-bold">建物タイプ:</span> 2階建て注文住宅</div>
                    <div><span className="font-bold">撮影:</span> 外観（南東ファサード）</div>
                    <div><span className="font-bold">ファサード強み:</span> ガルバリウム＋木調アクセント、大開口窓</div>
                    <div><span className="font-bold">光源方向:</span> 午前の自然光（南東方向）</div>
                    <div><span className="font-bold">素材感:</span> ○ 外壁良好 / ○ 木部温かみあり / △ 床反射やや弱い</div>
                  </>
                ) : (
                  <>
                    <div><span className="font-bold">物件種別:</span> 新築戸建て</div>
                    <div><span className="font-bold">撮影:</span> 外観（正面）</div>
                    <div><span className="font-bold">ターゲット:</span> 30-40代ファミリー層</div>
                    <div><span className="font-bold">価格帯:</span> 3,500-5,000万円台</div>
                    <div><span className="font-bold">強み:</span> 南向き・角地・駐車場2台分</div>
                  </>
                )}
              </div>
            </div>

            {/* B) Canva-level visual preview */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-text-main">Canvaレベル広告プレビュー</h4>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {["1:1", "9:16", "4:5", "16:9"].map(fmt => (
                    <button key={fmt} onClick={() => setPreviewFormat(fmt as any)} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${previewFormat === fmt ? "bg-orange-500 text-white" : "bg-white text-text-sub hover:text-text-main"}`}>{fmt}</button>
                  ))}
                </div>
              </div>
              <div className={`bg-gradient-to-br from-blue-200 via-green-100 to-yellow-50 rounded-lg flex items-center justify-center border border-border relative overflow-hidden ${previewFormat === "1:1" ? "aspect-square" : previewFormat === "9:16" ? "aspect-[9/16]" : previewFormat === "4:5" ? "aspect-[4/5]" : "aspect-video"}`}>
                {/* Background with SVG house illustration */}
                <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full opacity-80">
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#87CEEB"/>
                      <stop offset="100%" stopColor="#E0F0FF"/>
                    </linearGradient>
                    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5f0e8"/>
                      <stop offset="100%" stopColor="#e8e0d0"/>
                    </linearGradient>
                  </defs>
                  <rect width="200" height="150" fill="url(#sky)"/>
                  <rect y="110" width="200" height="40" fill="#5a8c3c"/>
                  <rect x="40" y="50" width="120" height="60" fill="url(#wall)" rx="2"/>
                  <polygon points="30,52 100,15 170,52" fill="#8B4513"/>
                  <rect x="85" y="75" width="30" height="35" fill="#6B3410" rx="2"/>
                  <rect x="50" y="60" width="25" height="20" fill="#87CEEB" stroke="#d4c5a9" strokeWidth="2" rx="1"/>
                  <rect x="125" y="60" width="25" height="20" fill="#87CEEB" stroke="#d4c5a9" strokeWidth="2" rx="1"/>
                  <circle cx="20" cy="85" r="15" fill="#4a7c2e"/>
                  <rect x="18" y="95" width="4" height="15" fill="#6B3410"/>
                  <circle cx="180" cy="80" r="18" fill="#4a7c2e"/>
                  <rect x="178" y="93" width="4" height="17" fill="#6B3410"/>
                </svg>

                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-center z-10">
                  <div className="flex justify-center">
                    <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-full backdrop-blur">AI補正済み</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">理想の住まいを</p>
                    <p className="text-xl font-bold text-white drop-shadow-lg">確かな技術で</p>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors drop-shadow-lg mx-auto">無料相談はこちら</button>
                </div>
              </div>
            </div>

            {/* C) AI補正レポート */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h4 className="text-sm font-bold text-text-main mb-4">AI補正レポート</h4>
              <div className="space-y-2">
                {["外壁の素材感を強調", "窓の自然反射を追加", "軒・陰影の描写強化", "空のトーン最適化", "4K相当アップスケール", "ノイズ除去", "タイトル余白確保"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><circle cx="12" cy="12" r="10" fill="#16a34a"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>
                    <span className="text-text-main">{item}</span>
                    <span className="text-green-600 font-bold">→ 完了</span>
                  </div>
                ))}
              </div>
            </div>

            {/* D) 3 Ad Copy Patterns */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h4 className="text-sm font-bold text-text-main mb-4">推奨テキスト（3パターン）</h4>
              <div className="space-y-3">
                {[
                  { label: "パターンA", headline: "理想の住まいを、確かな技術で。", sub: "信頼できる施工を実現", body: "創業以来の実績と信頼。無料相談受付中。まずはお気軽にお問い合わせください。", cta: "無料相談する" },
                  { label: "パターンB", headline: "新築・リフォーム、まずは無料相談から。", sub: "地域No.1の実績", body: "お客様満足度98%。今なら見積もり無料キャンペーン実施中。", cta: "見積を依頼する" },
                  { label: "パターンC", headline: "あなたの「こうしたい」を形にします。", sub: "丁寧な施工とサポート", body: "経験豊富な職人が丁寧に施工。アフターサポートも万全。お気軽にご相談ください。", cta: "相談する" },
                ].map((t, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">{t.label}</span>
                      <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">コピー</button>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">{t.headline}</p>
                      <p className="text-xs text-text-sub">{t.sub} ({t.headline.length} 字)</p>
                    </div>
                    <p className="text-xs text-text-main leading-relaxed">{t.body}</p>
                    <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded font-medium hover:bg-orange-600 transition-colors">{t.cta}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* E) SNSトリミング案 */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h4 className="text-sm font-bold text-text-main mb-4">SNSトリミング推奨寸法</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { platform: "Instagram 1:1", size: "1080 x 1080px" },
                  { platform: "Instagram Stories", size: "1080 x 1920px" },
                  { platform: "Facebook Feed", size: "1200 x 1500px" },
                  { platform: "Google バナー", size: "1200 x 628px" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-text-main">{item.platform}</p>
                    <p className="text-xs text-text-sub mt-1">{item.size}</p>
                  </div>
                ))}
              </div>
            </div>

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
  const [landTab, setLandTab] = useState<"search" | "results">("results");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const properties = [
    { rank: 1, score: 92, name: "杉並区 成田東 土地", address: "東京都杉並区成田東3丁目", size: 150.0, sizeTsubo: 45.4, price: 48500000, tsuboPrice: 106.8, avgTsubo: 118.0, discount: "+10.5%", discountLabel: "割安", zoning: "第一種住居", coverage: 60, far: 200, maxFloor: 90.8, fitLabel: "◎ 余裕あり", landCategory: "宅地", farmConversion: false, hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "A", demolition: 0, grading: 0, totalCost: 59695000, loanAmount: 59695000, monthlyPayment: 153000, yearIncome: 0, status: "受付中", station: "南阿佐ケ谷駅 徒歩12分", scoreDetail: { cheap: 14, fit: 14, loan: 13, demolition: 10, grading: 14, hazard: 14, asset: 13 } },
    { rank: 2, score: 85, name: "練馬区 豊玉北 分譲地", address: "東京都練馬区豊玉北4丁目", size: 135.3, sizeTsubo: 40.9, price: 38000000, tsuboPrice: 92.8, avgTsubo: 98.0, discount: "+5.3%", discountLabel: "相場", zoning: "第二種住居", coverage: 60, far: 200, maxFloor: 81.8, fitLabel: "◎ 余裕あり", landCategory: "宅地", farmConversion: false, hazardFlood: "中", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "B", demolition: 0, grading: 500000, totalCost: 49735000, loanAmount: 49735000, monthlyPayment: 127000, yearIncome: 0, status: "受付中", station: "練馬駅 徒歩15分", scoreDetail: { cheap: 11, fit: 14, loan: 14, demolition: 10, grading: 12, hazard: 11, asset: 13 } },
    { rank: 3, score: 78, name: "世田谷区 桜丘 土地", address: "東京都世田谷区桜丘2丁目", size: 128.5, sizeTsubo: 38.9, price: 58000000, tsuboPrice: 149.0, avgTsubo: 155.0, discount: "+3.9%", discountLabel: "相場", zoning: "第一種住居", coverage: 50, far: 100, maxFloor: 38.9, fitLabel: "△ やや不足", landCategory: "宅地", farmConversion: false, hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "低", hazardScore: "A", demolition: 0, grading: 0, totalCost: 70610000, loanAmount: 70610000, monthlyPayment: 181000, yearIncome: 0, status: "受付中", station: "千歳船橋駅 徒歩10分", scoreDetail: { cheap: 10, fit: 8, loan: 10, demolition: 10, grading: 15, hazard: 14, asset: 11 } },
    { rank: 4, score: 71, name: "目黒区 中根 住宅用地", address: "東京都目黒区中根1丁目", size: 105.2, sizeTsubo: 31.8, price: 72000000, tsuboPrice: 226.0, avgTsubo: 235.0, discount: "+3.8%", discountLabel: "相場", zoning: "第一種低層", coverage: 40, far: 80, maxFloor: 25.5, fitLabel: "✕ 不可", landCategory: "宅地", farmConversion: false, hazardFlood: "低", hazardSlide: "なし", hazardTsunami: "なし", hazardLiquefaction: "中", hazardScore: "B", demolition: 0, grading: 0, totalCost: 85640000, loanAmount: 85640000, monthlyPayment: 219000, yearIncome: 0, status: "受付中", station: "都立大学駅 徒歩8分", scoreDetail: { cheap: 10, fit: 4, loan: 8, demolition: 10, grading: 15, hazard: 12, asset: 12 } },
    { rank: 5, score: 65, name: "品川区 大井 住宅用地", address: "東京都品川区大井2丁目", size: 98.0, sizeTsubo: 29.6, price: 85000000, tsuboPrice: 286.0, avgTsubo: 278.0, discount: "-2.9%", discountLabel: "割高", zoning: "第一種低層", coverage: 50, far: 100, maxFloor: 29.6, fitLabel: "✕ 不可", landCategory: "宅地", farmConversion: false, hazardFlood: "中", hazardSlide: "なし", hazardTsunami: "低", hazardLiquefaction: "中", hazardScore: "C", demolition: 0, grading: 800000, totalCost: 101980000, loanAmount: 101980000, monthlyPayment: 261000, yearIncome: 0, status: "受付中", station: "大井町駅 徒歩14分", scoreDetail: { cheap: 6, fit: 4, loan: 6, demolition: 10, grading: 12, hazard: 10, asset: 12 } },
  ];

  const scoreColors = (s: number) => s >= 85 ? "#059669" : s >= 70 ? "#2563eb" : s >= 50 ? "#d97706" : "#dc2626";
  const hazardColor = (v: string) => v === "なし" || v === "低" ? "#059669" : v === "中" ? "#d97706" : "#dc2626";

  const detail = selectedProperty !== null ? properties.find(p => p.rank === selectedProperty) : null;

  return (<>
    <ToolHeader title="土地探し" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><p className="text-sm font-bold text-green-800">SUUMO連動 全国土地 事業性完全分析エンジン</p><p className="text-xs text-green-600">SUUMO検索 × 自動査定 × ハザード評価 × 総事業費算出 × 投資判断まで一括分析</p></div>
    </div>

    <div className="flex gap-2 mb-6">
      <button onClick={() => { setLandTab("search"); setSelectedProperty(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${landTab === "search" ? "bg-green-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>🔍 検索条件入力</button>
      <button onClick={() => { setLandTab("results"); setSelectedProperty(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${landTab === "results" ? "bg-green-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>📊 分析結果</button>
    </div>

    {landTab === "search" ? (<>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-text-main mb-4">検索パラメータ入力</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="text-[10px] text-text-sub block mb-1">予算上限（万円）</label><input type="text" defaultValue="5,000" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">都道府県</label><input type="text" defaultValue="東京都" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">市区町村</label><input type="text" placeholder="例: 世田谷区" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">学区指定</label><input type="text" placeholder="任意" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="text-[10px] text-text-sub block mb-1">沿線</label><input type="text" placeholder="例: 中央線" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">最寄駅</label><input type="text" placeholder="例: 荻窪" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">徒歩（分以内）</label><input type="text" defaultValue="20" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">建築条件</label><select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>条件付き含む</option><option>条件なしのみ</option></select></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="text-[10px] text-text-sub block mb-1">土地面積（坪）下限</label><input type="text" defaultValue="30" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">土地面積（坪）上限</label><input type="text" defaultValue="70" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">農地含む</label><select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>含む</option><option>含まない</option></select></div>
          <div><label className="text-[10px] text-text-sub block mb-1">調整区域含む</label><select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>含む</option><option>含まない</option></select></div>
        </div>
        <h4 className="text-xs font-bold text-text-main mt-5 mb-3 border-t border-border pt-4">建物プラン・資金計画</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="text-[10px] text-text-sub block mb-1">希望建物坪数</label><input type="text" defaultValue="30" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">建物タイプ</label><select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>2階建て</option><option>3階建て</option><option>平屋</option></select></div>
          <div><label className="text-[10px] text-text-sub block mb-1">建物予算（万円）</label><input type="text" defaultValue="2,500" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">ローン金利（%）</label><input type="text" defaultValue="0.6" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div><label className="text-[10px] text-text-sub block mb-1">借入年数</label><input type="text" defaultValue="35" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="text-[10px] text-text-sub block mb-1">頭金（万円）</label><input type="text" defaultValue="0" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
        </div>
        <button onClick={() => setLandTab("results")} className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">🔍 SUUMO検索 × 事業性分析を実行</button>
      </div>
    </>) : detail ? (<>
      {/* Detail view */}
      <button onClick={() => setSelectedProperty(null)} className="text-sm text-green-600 hover:text-green-800 mb-4 font-bold">← 一覧に戻る</button>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: scoreColors(detail.score) }}>#{detail.rank}</span>
              <h3 className="text-base font-bold text-text-main">{detail.name}</h3>
            </div>
            <p className="text-xs text-text-sub">{detail.address} ｜ {detail.station}</p>
          </div>
          <div className="text-center"><div className="text-3xl font-black" style={{ color: scoreColors(detail.score) }}>{detail.score}</div><p className="text-[10px] text-text-sub">/ 100点</p></div>
        </div>
        {/* Score breakdown */}
        <div className="grid grid-cols-7 gap-2 mb-5">
          {[{ label: "割安度", val: detail.scoreDetail.cheap, max: 15 }, { label: "建物適合", val: detail.scoreDetail.fit, max: 15 }, { label: "ローン", val: detail.scoreDetail.loan, max: 15 }, { label: "解体", val: detail.scoreDetail.demolition, max: 10 }, { label: "造成", val: detail.scoreDetail.grading, max: 15 }, { label: "ハザード", val: detail.scoreDetail.hazard, max: 15 }, { label: "資産性", val: detail.scoreDetail.asset, max: 15 }].map((sc, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-lg p-2"><p className="text-[9px] text-text-sub">{sc.label}</p><p className="text-sm font-black" style={{ color: scoreColors(sc.val / sc.max * 100) }}>{sc.val}<span className="text-[9px] text-text-sub font-normal">/{sc.max}</span></p></div>
          ))}
        </div>
        {/* Property info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-green-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">土地価格</p><p className="text-lg font-black text-green-700">¥{(detail.price / 10000).toLocaleString()}万</p></div>
          <div className="bg-blue-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">面積</p><p className="text-lg font-black text-blue-700">{detail.size}㎡ ({detail.sizeTsubo}坪)</p></div>
          <div className="bg-purple-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">坪単価</p><p className="text-lg font-black text-purple-700">¥{detail.tsuboPrice}万</p><p className="text-[10px] font-bold" style={{ color: detail.discountLabel === "割安" ? "#059669" : detail.discountLabel === "割高" ? "#dc2626" : "#6b7280" }}>{detail.discount} {detail.discountLabel}</p></div>
          <div className="bg-orange-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">建物適合</p><p className="text-lg font-black" style={{ color: detail.fitLabel.startsWith("◎") ? "#059669" : detail.fitLabel.startsWith("△") ? "#d97706" : "#dc2626" }}>{detail.fitLabel}</p><p className="text-[10px] text-text-sub">最大延床: {detail.maxFloor}坪</p></div>
        </div>
        {/* Hazard */}
        <div className="bg-white border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">ハザード評価 <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: detail.hazardScore === "A" ? "#d1fae5" : detail.hazardScore === "B" ? "#fef3c7" : "#fee2e2", color: detail.hazardScore === "A" ? "#059669" : detail.hazardScore === "B" ? "#d97706" : "#dc2626" }}>総合 {detail.hazardScore}</span></h4>
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "洪水", val: detail.hazardFlood }, { label: "土砂災害", val: detail.hazardSlide }, { label: "津波", val: detail.hazardTsunami }, { label: "液状化", val: detail.hazardLiquefaction }].map((h, i) => (
              <div key={i} className="text-center rounded-lg p-2 border border-border"><p className="text-[10px] text-text-sub">{h.label}</p><p className="text-sm font-bold" style={{ color: hazardColor(h.val) }}>{h.val}</p></div>
            ))}
          </div>
        </div>
        {/* Total cost */}
        <div className="bg-gray-50 border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">総事業費内訳</h4>
          <div className="space-y-2">
            {[{ label: "土地価格", val: detail.price }, { label: "建物価格（30坪想定）", val: 25000000 }, { label: "解体費", val: detail.demolition }, { label: "造成費", val: detail.grading }, { label: "外構費", val: 1500000 }, { label: "諸費用（7%）", val: Math.round((detail.price + 25000000 + detail.demolition + detail.grading + 1500000) * 0.07) }].map((c, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-text-sub">{c.label}</span><span className="font-bold text-text-main">¥{c.val.toLocaleString()}</span></div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2"><span className="text-green-700">総事業費合計</span><span className="text-green-700 text-base">¥{detail.totalCost.toLocaleString()}</span></div>
          </div>
        </div>
        {/* Loan */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-xs font-bold mb-2">住宅ローンシミュレーション（元利均等）</h4>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[10px] text-text-sub">借入額</p><p className="text-sm font-bold text-blue-700">¥{detail.loanAmount.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">金利 0.6% / 35年</p><p className="text-sm font-bold text-blue-700">月額 ¥{detail.monthlyPayment.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">総返済額</p><p className="text-sm font-bold text-blue-700">¥{(detail.monthlyPayment * 420).toLocaleString()}</p></div>
          </div>
        </div>
      </div>
    </>) : (<>
      {/* Results list */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: "検索ヒット", value: "5件", color: "#059669" }, { label: "最高スコア", value: "92点", color: "#3b82f6" }, { label: "平均坪単価", value: "¥172万", color: "#8b5cf6" }, { label: "割安物件", value: "1件", color: "#f59e0b" }].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
        ))}
      </div>

      {/* Top 3 comparison */}
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-text-main mb-4">最有力3件 事業性比較</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-border">
              {["", "1位 杉並区", "2位 練馬区", "3位 世田谷区"].map((h, i) => <th key={i} className="text-left py-2 px-2 text-xs text-text-sub font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                { label: "総合スコア", vals: ["92点", "85点", "78点"], colors: ["#059669", "#2563eb", "#2563eb"] },
                { label: "土地価格", vals: ["4,850万", "3,800万", "5,800万"], colors: ["#059669", "#059669", "#d97706"] },
                { label: "総事業費", vals: ["5,970万", "4,974万", "7,061万"], colors: ["#3b82f6", "#059669", "#d97706"] },
                { label: "月額返済", vals: ["15.3万", "12.7万", "18.1万"], colors: ["#3b82f6", "#059669", "#d97706"] },
                { label: "建物適合", vals: ["◎ 余裕", "◎ 余裕", "△ やや不足"], colors: ["#059669", "#059669", "#d97706"] },
                { label: "ハザード", vals: ["A", "B", "A"], colors: ["#059669", "#d97706", "#059669"] },
                { label: "割安判定", vals: ["割安 +10.5%", "相場 +5.3%", "相場 +3.9%"], colors: ["#059669", "#6b7280", "#6b7280"] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2 px-2 text-xs text-text-sub font-bold">{row.label}</td>
                  {row.vals.map((v, j) => <td key={j} className="py-2 px-2 text-xs font-bold" style={{ color: row.colors[j] }}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI judgment */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-green-800 mb-3">AI事業性判定</h3>
        <div className="space-y-2 text-xs text-green-900">
          <p><span className="font-bold">推奨物件:</span> 杉並区 成田東（92点）— 割安率+10.5%、建物30坪が余裕で配置可能、ハザードA評価。総事業費5,970万円で月額返済15.3万円と負担も適正。</p>
          <p><span className="font-bold">次点:</span> 練馬区 豊玉北（85点）— 総事業費が最安の4,974万円。洪水リスク「中」がマイナスだが、返済負担は最も軽い。</p>
          <p><span className="font-bold">注意:</span> 世田谷区 桜丘（78点）— 容積率100%で建物30坪は延床ギリギリ。3階建てへの変更を要検討。</p>
          <p><span className="font-bold">最大リスク:</span> 目黒区・品川区は土地価格が高く総事業費8,500万〜1億超。ローン審査の年収条件（年収の7倍以内）に注意。</p>
        </div>
      </div>

      {/* Property cards */}
      <div className="space-y-3">
        {properties.map((p) => (
          <button key={p.rank} onClick={() => setSelectedProperty(p.rank)} className="w-full text-left bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-green-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: scoreColors(p.score) + "15" }}>
                  <span className="text-lg font-black" style={{ color: scoreColors(p.score) }}>{p.score}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
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
    </>)}
  </>);
}

function SubsidyManagement({ onCreateNew, onExport }: ToolProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPref, setSelectedPref] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "alert">("search");

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

  const allSubsidies = [
    { id: 1, name: "子育てエコホーム支援事業", category: "新築", amount: "最大100万円", deadline: "2026/03/31", jurisdiction: "国土交通省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["子育て","エコ","省エネ","新築","ZEH"], totalBudget: 210000000000, usedBudget: 136500000000 },
    { id: 2, name: "先進的窓リノベ事業", category: "リフォーム", amount: "最大200万円", deadline: "2026/03/31", jurisdiction: "環境省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["窓","リノベ","断熱","リフォーム","省エネ"], totalBudget: 135000000000, usedBudget: 108000000000 },
    { id: 3, name: "給湯省エネ事業", category: "省エネ改修", amount: "最大20万円/台", deadline: "2026/03/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["給湯","エコキュート","省エネ","改修"], totalBudget: 58000000000, usedBudget: 34800000000 },
    { id: 4, name: "長期優良住宅化リフォーム推進事業", category: "リフォーム", amount: "最大250万円", deadline: "2026/06/30", jurisdiction: "国土交通省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["長期優良","リフォーム","耐震","省エネ"], totalBudget: 45000000000, usedBudget: 13500000000 },
    { id: 5, name: "住宅省エネキャンペーン2025", category: "新築・リフォーム", amount: "最大60万円", deadline: "2026/03/31", jurisdiction: "経済産業省", pref: "国（全国共通）", city: "all", status: "受付中", keywords: ["省エネ","住宅","キャンペーン","新築","リフォーム"], totalBudget: 100000000000, usedBudget: 45000000000 },
    { id: 6, name: "東京都木造住宅耐震改修助成事業", category: "耐震改修", amount: "最大150万円", deadline: "2026/12/28", jurisdiction: "東京都", pref: "東京都", city: "all", status: "受付中", keywords: ["耐震","木造","補強","改修","東京"], totalBudget: 5000000000, usedBudget: 1750000000 },
    { id: 7, name: "世田谷区住宅リフォーム助成", category: "リフォーム", amount: "最大20万円", deadline: "2026/09/30", jurisdiction: "世田谷区", pref: "東京都", city: "世田谷区", status: "受付中", keywords: ["リフォーム","助成","世田谷","バリアフリー"], totalBudget: 200000000, usedBudget: 120000000 },
    { id: 8, name: "東京都ZEH導入補助金", category: "新築", amount: "最大70万円", deadline: "2026/06/30", jurisdiction: "東京都", pref: "東京都", city: "all", status: "準備中", keywords: ["ZEH","ゼッチ","新築","省エネ","東京"], totalBudget: 3000000000, usedBudget: 0 },
    { id: 9, name: "東京都既存住宅省エネ改修助成", category: "省エネ改修", amount: "最大300万円", deadline: "2026/09/30", jurisdiction: "東京都", pref: "東京都", city: "all", status: "受付中", keywords: ["省エネ","改修","既存住宅","東京","断熱"], totalBudget: 3000000000, usedBudget: 1800000000 },
    { id: 10, name: "大阪府住宅リフォームマイスター制度", category: "リフォーム", amount: "最大50万円", deadline: "2026/12/31", jurisdiction: "大阪府", pref: "大阪府", city: "all", status: "受付中", keywords: ["リフォーム","マイスター","大阪"], totalBudget: 1000000000, usedBudget: 350000000 },
    { id: 11, name: "愛知県住宅用地球温暖化対策設備導入促進費補助金", category: "省エネ設備", amount: "最大10万円", deadline: "2026/03/31", jurisdiction: "愛知県", pref: "愛知県", city: "all", status: "受付中", keywords: ["温暖化","太陽光","蓄電池","省エネ","愛知"], totalBudget: 500000000, usedBudget: 375000000 },
    { id: 12, name: "福岡県住宅用エネルギーシステム導入促進事業", category: "省エネ設備", amount: "最大15万円", deadline: "2026/11/30", jurisdiction: "福岡県", pref: "福岡県", city: "all", status: "受付中", keywords: ["エネルギー","太陽光","蓄電池","福岡"], totalBudget: 800000000, usedBudget: 240000000 },
    { id: 13, name: "北海道住宅省エネルギー改修補助", category: "省エネ改修", amount: "最大120万円", deadline: "2026/10/31", jurisdiction: "北海道", pref: "北海道", city: "all", status: "受付中", keywords: ["省エネ","断熱","改修","北海道","寒冷地"], totalBudget: 2000000000, usedBudget: 600000000 },
    { id: 14, name: "神奈川県既存住宅省エネ改修費補助", category: "省エネ改修", amount: "最大80万円", deadline: "2026/08/31", jurisdiction: "神奈川県", pref: "神奈川県", city: "all", status: "受付中", keywords: ["省エネ","改修","神奈川","既存"], totalBudget: 1500000000, usedBudget: 1050000000 },
    { id: 15, name: "広島県住宅耐震化促進事業", category: "耐震改修", amount: "最大90万円", deadline: "2026/12/28", jurisdiction: "広島県", pref: "広島県", city: "all", status: "受付中", keywords: ["耐震","改修","広島","木造"], totalBudget: 600000000, usedBudget: 180000000 },
    { id: 16, name: "練馬区住宅リフォーム補助金", category: "リフォーム", amount: "最大30万円", deadline: "2026/07/31", jurisdiction: "練馬区", pref: "東京都", city: "練馬区", status: "受付中", keywords: ["リフォーム","練馬","助成","バリアフリー"], totalBudget: 150000000, usedBudget: 75000000 },
    { id: 17, name: "品川区住宅耐震改修助成金", category: "耐震改修", amount: "最大150万円", deadline: "2026/12/28", jurisdiction: "品川区", pref: "東京都", city: "品川区", status: "受付中", keywords: ["耐震","品川","木造","補強"], totalBudget: 300000000, usedBudget: 90000000 },
    { id: 18, name: "埼玉県住宅における省エネ対策支援事業", category: "省エネ改修", amount: "最大50万円", deadline: "2026/11/30", jurisdiction: "埼玉県", pref: "埼玉県", city: "all", status: "受付中", keywords: ["省エネ","埼玉","断熱","改修"], totalBudget: 800000000, usedBudget: 320000000 },
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

  // Filter subsidies
  const filtered = allSubsidies.filter(s => {
    const prefMatch = selectedPref === "all" || s.pref === selectedPref;
    if (!prefMatch) return false;

    // City filter - if a city is selected and the subsidy is not national-wide (pref !== "国（全国共通）"), check city match
    if (selectedCity !== "all" && s.pref !== "国（全国共通）") {
      const cityMatch = s.city === "all" || s.city === selectedCity;
      if (!cityMatch) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.jurisdiction.toLowerCase().includes(q) || s.keywords.some(k => k.toLowerCase().includes(q));
  });

  const totalAvailable = allSubsidies.filter(s => s.status === "受付中").length;
  const filteredCount = filtered.length;

  return (<>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-black text-text-main">補助金・助成金</h2>
    </div>
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div><p className="text-sm font-bold text-purple-800">全国対応 補助金・助成金検索</p><p className="text-xs text-purple-600">国・都道府県・市区町村の最新補助金情報を自動取得 ｜ 予算消化アラート付き</p></div>
    </div>

    {/* Tab switcher */}
    <div className="flex gap-2 mb-6">
      <button onClick={() => setActiveTab("search")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "search" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>🔍 補助金検索</button>
      <button onClick={() => setActiveTab("alert")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "alert" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>⚠️ 予算残アラート</button>
    </div>

    {activeTab === "search" ? (<>
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: "利用可能な制度", value: totalAvailable + "件", color: "#7c3aed" }, { label: "検索結果", value: filteredCount + "件", color: "#3b82f6" }, { label: "受給済み", value: "¥420万", color: "#10b981" }, { label: "申請期限間近", value: "5件", color: "#ef4444" }].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
        ))}
      </div>

      {/* Search area */}
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-text-main mb-3">補助金・助成金を検索</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-xs text-text-sub mb-1 block">キーワード検索</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="例: 省エネ, リフォーム, 耐震, ZEH, 太陽光..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
            </div>
            <p className="text-[10px] text-text-sub mt-1">制度名・カテゴリ・管轄・キーワードから簡易検索できます</p>
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
            <button onClick={() => { setSearchQuery(""); setSelectedPref("all"); setSelectedCity("all"); }} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ 条件クリア</button>
          </div>
        )}
      </div>

      {/* Results table */}
      {filtered.length > 0 ? (
        <DataTable headers={["制度名", "対象", "補助額", "申請期限", "管轄", "消化率", "状態"]} rows={filtered.map((s, i) => {
          const rate = s.totalBudget > 0 ? (s.usedBudget / s.totalBudget) * 100 : 0;
          const alert = getAlertLevel(rate);
          return [
            s.name,
            s.category,
            s.amount,
            s.deadline,
            s.jurisdiction,
            <div key={`rate-${i}`} className="w-24">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: rate >= 85 ? "#dc2626" : rate >= 70 ? "#ea580c" : rate >= 50 ? "#d97706" : "#7c3aed" }} /></div>
                <span className="text-[10px] font-bold" style={{ color: rate >= 85 ? "#dc2626" : rate >= 70 ? "#ea580c" : "#6b7280" }}>{rate.toFixed(0)}%</span>
              </div>
            </div>,
            <StatusBadge key={`st-${i}`} status={s.status} />,
          ];
        })} />
      ) : (
        <div className="bg-gray-50 border border-border rounded-xl p-8 text-center">
          <p className="text-text-sub text-sm">該当する補助金・助成金が見つかりませんでした</p>
          <p className="text-text-sub text-xs mt-1">キーワードや都道府県を変更してお試しください</p>
        </div>
      )}
    </>) : (<>
      {/* Budget Alert Tab */}
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

      {/* Budget alert items */}
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
