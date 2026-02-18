"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ============ åå®ç¾© ============

type FormFieldDef = { name: string; label: string; type: "text" | "number" | "date" | "select" | "textarea" | "file"; options?: string[]; placeholder?: string; required?: boolean };
type ToolDef = { id: string; name: string; icon: string; color: string };
type ToolProps = { onCreateNew?: () => void; onExport?: () => void };

// ============ ãã¼ã«å®ç¾©ï¼æ¥å ±åé¤ã»åçâåºåã«å¤æ´ï¼ ============

const tools: ToolDef[] = [
  { id: "construction-ledger", name: "å·¥äºå°å¸³", icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z", color: "#3b82f6" },
  { id: "estimate", name: "è¦ç©ä½æ", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
  { id: "budget", name: "å®è¡äºç®", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#f59e0b" },
  { id: "order", name: "è³æçºæ³¨", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", color: "#ef4444" },
  { id: "schedule", name: "å·¥ç¨ã¹ã±ã¸ã¥ã¼ã«", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", color: "#8b5cf6" },
  { id: "ad", name: "åºåç´ æä½æã»å¹ææ¸¬å®", icon: "M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6", color: "#f97316" },
  { id: "payment", name: "å¥éç®¡ç", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", color: "#06b6d4" },
  { id: "cost", name: "åä¾¡ç®¡ç", icon: "M22 12h-4l-3 9L9 3l-3 9H2", color: "#ec4899" },
  { id: "customer", name: "é¡§å®¢ç®¡ç", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", color: "#6366f1" },
  { id: "after-service", name: "ã¢ãã¿ã¼ç®¡ç", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3", color: "#84cc16" },
  { id: "document", name: "æ¸é¡ç®¡ç", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", color: "#a855f7" },
  { id: "vendor", name: "æ¥­èç®¡ç", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", color: "#0ea5e9" },
  { id: "land-search", name: "åå°æ¢ã", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0-3-3 3 3 0 0 0 3 3z", color: "#059669" },
  { id: "subsidy", name: "è£å©éã»å©æé", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#7c3aed" },
  { id: "analytics", name: "çµå¶åæ", icon: "M18 20V10 M12 20V4 M6 20v-6", color: "#e11d48" },
];

const demoUser = { email: "demo@builder-os.jp", companyName: "æ ªå¼ä¼ç¤¾ãã¢å»ºè¨­" };

const projectOptions = ["ââãã³ã·ã§ã³æ°ç¯å·¥äº", "â³â³ãã«æ¹ä¿®å·¥äº", "â¡â¡ä½å®ãªãã©ã¼ã ", "ââåæ¥­æ½è¨­å¤æ§å·¥äº"];

// ============ ãã©ã¼ã å®ç¾©ï¼å¨13ãã¼ã«ï¼ ============

const formDefs: Record<string, { title: string; fields: FormFieldDef[] }> = {
  "construction-ledger": {
    title: "å·¥äºå°å¸³ æ°è¦ç»é²",
    fields: [
      { name: "name", label: "å·¥äºå", type: "text", placeholder: "ä¾: ââé¸æ°ç¯å·¥äº", required: true },
      { name: "client", label: "çºæ³¨è", type: "text", placeholder: "ä¾: ââä¸åç£æ ªå¼ä¼ç¤¾", required: true },
      { name: "amount", label: "è«è² éé¡ï¼ç¨æï¼", type: "number", placeholder: "ä¾: 50000000" },
      { name: "start", label: "å·¥äºéå§æ¥", type: "date", required: true },
      { name: "end", label: "å·¥äºå®äºäºå®æ¥", type: "date" },
      { name: "handoverDate", label: "å¼æ¸¡ãæ¥", type: "date" },
      { name: "manager", label: "ç¾å ´è²¬ä»»è", type: "text", placeholder: "ä¾: å±±ç° å¤ªé" },
      { name: "type", label: "å·¥äºç¨®å¥", type: "select", options: ["æ°ç¯", "æ¹ä¿®", "ãªãã©ã¼ã ", "å¤æ§", "ãã®ä»"] },
      { name: "note", label: "åè", type: "textarea", placeholder: "ç¹è¨äºé ãããã°å¥å" },
    ],
  },
  estimate: {
    title: "è¦ç©æ¸ æ°è¦ä½æ",
    fields: [
      { name: "subject", label: "ä»¶å", type: "text", placeholder: "ä¾: ââãã«ç©ºèª¿æ´æ°å·¥äº", required: true },
      { name: "client", label: "æåºå", type: "text", placeholder: "ä¾: ââåäºæ ªå¼ä¼ç¤¾", required: true },
      { name: "amount", label: "è¦ç©éé¡ï¼ç¨æï¼", type: "number", placeholder: "ä¾: 12000000" },
      { name: "deadline", label: "æåºæé", type: "date" },
      { name: "validity", label: "æå¹æé", type: "select", options: ["30æ¥é", "60æ¥é", "90æ¥é"] },
      { name: "note", label: "åèã»æ¡ä»¶", type: "textarea", placeholder: "è¦ç©æ¡ä»¶ã»é¤å¤äºé ãªã©" },
    ],
  },
  budget: {
    title: "å®è¡äºç® æ°è¦ç»é²",
    fields: [
      { name: "project", label: "å¯¾è±¡å·¥äº", type: "select", options: projectOptions, required: true },
      { name: "material", label: "ææè²»", type: "number", placeholder: "ä¾: 30000000" },
      { name: "labor", label: "å´åè²»", type: "number", placeholder: "ä¾: 25000000" },
      { name: "outsource", label: "å¤æ³¨è²»", type: "number", placeholder: "ä¾: 20000000" },
      { name: "expense", label: "çµè²»", type: "number", placeholder: "ä¾: 10000000" },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  order: {
    title: "çºæ³¨æ¸ æ°è¦ä½æ",
    fields: [
      { name: "vendor", label: "çºæ³¨å", type: "text", placeholder: "ä¾: ABCå»ºææ ªå¼ä¼ç¤¾", required: true },
      { name: "project", label: "å·¥äºå", type: "select", options: projectOptions, required: true },
      { name: "item", label: "çºæ³¨åå®¹", type: "text", placeholder: "ä¾: ééª¨ææä¸å¼", required: true },
      { name: "amount", label: "çºæ³¨éé¡ï¼ç¨æï¼", type: "number", placeholder: "ä¾: 5000000" },
      { name: "orderDate", label: "çºæ³¨æ¥", type: "date", required: true },
      { name: "deliveryDate", label: "ç´æ", type: "date", required: true },
      { name: "note", label: "çºæ³¨æ¡ä»¶ã»åè", type: "textarea" },
    ],
  },
  schedule: {
    title: "å·¥ç¨ æ°è¦ç»é²",
    fields: [
      { name: "project", label: "å¯¾è±¡å·¥äº", type: "select", options: projectOptions, required: true },
      { name: "task", label: "ä½æ¥­å·¥ç¨å", type: "text", placeholder: "ä¾: åºç¤éç­å·¥äº", required: true },
      { name: "start", label: "éå§æ¥", type: "date", required: true },
      { name: "end", label: "çµäºæ¥", type: "date", required: true },
      { name: "assignee", label: "æå½è", type: "text", placeholder: "ä¾: å±±ç° å¤ªé" },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  payment: {
    title: "å¥é æ°è¦ç»é²",
    fields: [
      { name: "project", label: "å·¥äºå", type: "select", options: projectOptions, required: true },
      { name: "invoiceAmount", label: "è«æ±éé¡", type: "number", placeholder: "ä¾: 12800000", required: true },
      { name: "paymentAmount", label: "å¥ééé¡", type: "number", placeholder: "ä¾: 12800000" },
      { name: "dueDate", label: "å¥éäºå®æ¥", type: "date", required: true },
      { name: "method", label: "å¥éæ¹æ³", type: "select", options: ["éè¡æ¯è¾¼", "æå½¢", "å°åæ", "ç¾é", "ãã®ä»"] },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  cost: {
    title: "åä¾¡ æ°è¦ç»é²",
    fields: [
      { name: "project", label: "å·¥äºå", type: "select", options: projectOptions, required: true },
      { name: "category", label: "è²»ç®", type: "select", options: ["ææè²»", "å´åè²»", "å¤æ³¨è²»", "çµè²»"], required: true },
      { name: "item", label: "åå®¹", type: "text", placeholder: "ä¾: ã³ã³ã¯ãªã¼ãæè¨­", required: true },
      { name: "amount", label: "éé¡", type: "number", placeholder: "ä¾: 3500000", required: true },
      { name: "date", label: "è¨ä¸æ¥", type: "date", required: true },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  ad: {
    title: "åºå æ°è¦ä½æ",
    fields: [
      { name: "type", label: "åºåç¨®å¥", type: "select", options: ["ãªã¹ãã£ã³ã°åºå", "SNSåºåï¼Instagramï¼", "SNSåºåï¼Facebookï¼", "ãã©ã·ã»DM", "çæ¿ã»ãµã¤ã³", "åç»åºå", "ãã®ä»"], required: true },
      { name: "name", label: "ã­ã£ã³ãã¼ã³å", type: "text", placeholder: "ä¾: æ¥ã®æ°ç¯ã­ã£ã³ãã¼ã³2026", required: true },
      { name: "budget", label: "äºç®ï¼åï¼", type: "number", placeholder: "ä¾: 500000", required: true },
      { name: "start", label: "éä¿¡éå§æ¥", type: "date", required: true },
      { name: "end", label: "éä¿¡çµäºæ¥", type: "date" },
      { name: "target", label: "ã¿ã¼ã²ããã¨ãªã¢", type: "text", placeholder: "ä¾: æ±äº¬é½ä¸ç°è°·åºã»ç®é»åº" },
      { name: "creative", label: "åºåç´ æ", type: "file" },
      { name: "note", label: "ã¡ã¢", type: "textarea", placeholder: "è¨´æ±ãã¤ã³ãã»åè" },
    ],
  },
  customer: {
    title: "é¡§å®¢ æ°è¦ç»é²",
    fields: [
      { name: "company", label: "ä¼ç¤¾å / æ°å", type: "text", placeholder: "ä¾: ââä¸åç£æ ªå¼ä¼ç¤¾", required: true },
      { name: "contact", label: "æå½èå", type: "text", placeholder: "ä¾: ä¸­æ å¤ªé", required: true },
      { name: "phone", label: "é»è©±çªå·", type: "text", placeholder: "ä¾: 03-1234-5678" },
      { name: "email", label: "ã¡ã¼ã«ã¢ãã¬ã¹", type: "text", placeholder: "ä¾: nakamura@example.co.jp" },
      { name: "address", label: "ä½æ", type: "text", placeholder: "ä¾: æ±äº¬é½åä»£ç°åºââ1-2-3" },
      { name: "type", label: "é¡§å®¢ç¨®å¥", type: "select", options: ["æ³äºº", "åäºº", "ç®¡ççµå", "å®å¬åº"] },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  "after-service": {
    title: "ã¢ãã¿ã¼æ¡ä»¶ æ°è¦ç»é²",
    fields: [
      { name: "property", label: "ç©ä»¶å", type: "text", placeholder: "ä¾: ââé¸", required: true },
      { name: "customer", label: "é¡§å®¢å", type: "text", placeholder: "ä¾: ââæ§", required: true },
      { name: "content", label: "ä¸å·ååå®¹", type: "textarea", placeholder: "ä¾: é¨æ¼ãï¼2Få¯å®¤å¤©äºããï¼", required: true },
      { name: "priority", label: "åªååº¦", type: "select", options: ["ç·æ¥", "é«", "ä¸­", "ä½"], required: true },
      { name: "dueDate", label: "å¯¾å¿æé", type: "date", required: true },
      { name: "assignee", label: "å¯¾å¿æå½è", type: "text", placeholder: "ä¾: ä½è¤ æ¬¡é" },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  document: {
    title: "æ¸é¡ ã¢ããã­ã¼ã",
    fields: [
      { name: "project", label: "å·¥äºå", type: "select", options: projectOptions, required: true },
      { name: "category", label: "ã«ãã´ãª", type: "select", options: ["å³é¢", "è¦ç©", "è¨ç»æ¸", "å®å¨æ¸é¡", "è­°äºé²", "å¥ç´æ¸", "åçå¸³", "ãã®ä»"], required: true },
      { name: "file", label: "ãã¡ã¤ã«", type: "file", required: true },
      { name: "note", label: "åèã»èª¬æ", type: "textarea" },
    ],
  },
  vendor: {
    title: "æ¥­è æ°è¦ç»é²",
    fields: [
      { name: "company", label: "æ¥­èå", type: "text", placeholder: "ä¾: ââå»ºææ ªå¼ä¼ç¤¾", required: true },
      { name: "type", label: "æ¥­ç¨®", type: "select", options: ["å»ºæ", "é»æ°å·¥äº", "è¨­åå·¥äº", "å¡è£", "ééª¨", "å·¦å®", "é²æ°´", "åè£", "è§£ä½", "ãã®ä»"], required: true },
      { name: "contact", label: "æå½èå", type: "text", placeholder: "ä¾: æ¾æ¬ å¶æ¥­é¨é·" },
      { name: "phone", label: "é»è©±çªå·", type: "text", placeholder: "ä¾: 03-1111-2222" },
      { name: "email", label: "ã¡ã¼ã«ã¢ãã¬ã¹", type: "text", placeholder: "ä¾: matsumoto@example.co.jp" },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  "land-search": {
    title: "åå°æ¢ã æ°è¦æ¤ç´¢",
    fields: [
      { name: "area", label: "å¸æã¨ãªã¢", type: "text", placeholder: "ä¾: æ±äº¬é½ä¸ç°è°·åº", required: true },
      { name: "budget", label: "äºç®ä¸é", type: "number", placeholder: "ä¾: 30000000" },
      { name: "size", label: "å¸æé¢ç©ï¼ã¡ï¼", type: "number", placeholder: "ä¾: 200" },
      { name: "use", label: "ç¨é", type: "select", options: ["ä½å®ç¨å°", "äºæ¥­ç¨å°", "åè­²ç¨å°", "ãã®ä»"] },
      { name: "note", label: "åèã»å¸ææ¡ä»¶", type: "textarea", placeholder: "é§å¾æ­©10åä»¥åãååããªã©" },
    ],
  },
  subsidy: {
    title: "è£å©éã»å©æé æ¤ç´¢",
    fields: [
      { name: "prefecture", label: "é½éåºç", type: "text", placeholder: "ä¾: æ±äº¬é½", required: true },
      { name: "city", label: "å¸åºçºæ", type: "text", placeholder: "ä¾: ä¸ç°è°·åº" },
      { name: "type", label: "å·¥äºç¨®å¥", type: "select", options: ["æ°ç¯", "ãªãã©ã¼ã ", "èéæ¹ä¿®", "çã¨ãæ¹ä¿®", "ããªã¢ããªã¼", "ãã®ä»"], required: true },
      { name: "note", label: "åè", type: "textarea" },
    ],
  },
  analytics: {
    title: "ã¬ãã¼ãçæ",
    fields: [
      { name: "type", label: "ã¬ãã¼ãç¨®å¥", type: "select", options: ["ææ¬¡çµå¶ã¬ãã¼ã", "ç²å©åæ", "å·¥äºå¥åæ¯", "æ¥­èå¥æ¯æå®ç¸¾", "é¡§å®¢å¥å£²ä¸"], required: true },
      { name: "period", label: "å¯¾è±¡æé", type: "select", options: ["ä»æ", "åæ", "ä»ååæ", "åååæ", "ä»å¹´åº¦", "åå¹´åº¦"], required: true },
      { name: "format", label: "åºåå½¢å¼", type: "select", options: ["PDF", "Excel", "ç»é¢è¡¨ç¤º"] },
    ],
  },
};

// ============ å±éUIã³ã³ãã¼ãã³ã ============

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
              <option value="">é¸æãã¦ãã ãã</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "file" ? (
            <div className="w-full px-4 py-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p className="text-xs text-text-sub">ã¯ãªãã¯ãã¦ãã¡ã¤ã«ãé¸æ</p>
            </div>
          ) : (
            <input type={f.type} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder={f.placeholder} required={f.required} />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button type="submit" className="flex-1 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
          ä¿å­ãã
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
          + æ°è¦ä½æ
        </button>
        <button onClick={onExport} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors">ã¨ã¯ã¹ãã¼ã</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { "é²è¡ä¸­": "bg-blue-100 text-blue-700", "å®äº": "bg-green-100 text-green-700", "æ¿èªæ¸": "bg-green-100 text-green-700", "ä¸æ¸ã": "bg-gray-100 text-gray-600", "éä»æ¸": "bg-blue-100 text-blue-700", "æªå¥é": "bg-red-100 text-red-700", "å¥éæ¸": "bg-green-100 text-green-700", "ä¸é¨å¥é": "bg-yellow-100 text-yellow-700", "å¯¾å¿ä¸­": "bg-blue-100 text-blue-700", "å¯¾å¿æ¸": "bg-green-100 text-green-700", "è¦å¯¾å¿": "bg-red-100 text-red-700", "éä¿¡ä¸­": "bg-blue-100 text-blue-700", "æºåä¸­": "bg-yellow-100 text-yellow-700", "çµäº": "bg-gray-100 text-gray-600" };
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

// ============ ãã¼ã«ç»é¢ ============

function ConstructionLedger({ onCreateNew, onExport }: ToolProps) {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([
    { id: "K-2026-001", name: "ââãã³ã·ã§ã³æ°ç¯å·¥äº", client: "ââä¸åç£", amount: "Â¥128,500,000", deadline: "2026/06/30", progress: 65, status: "é²è¡ä¸­" as const },
    { id: "K-2026-002", name: "â³â³ãã«æ¹ä¿®å·¥äº", client: "â³â³åäº", amount: "Â¥45,000,000", deadline: "2026/09/15", progress: 30, status: "é²è¡ä¸­" as const },
    { id: "K-2026-003", name: "â¡â¡ä½å®ãªãã©ã¼ã ", client: "â¡â¡æ§", amount: "Â¥8,500,000", deadline: "2026/03/20", progress: 75, status: "é²è¡ä¸­" as const },
    { id: "K-2026-004", name: "ââåæ¥­æ½è¨­å¤æ§å·¥äº", client: "ââéçº", amount: "Â¥32,000,000", deadline: "2026/04/30", progress: 90, status: "é²è¡ä¸­" as const },
    { id: "K-2025-012", name: "ââäºåæãã«æ°ç¯", client: "ââå»ºè¨­", amount: "Â¥68,000,000", deadline: "2025/12/20", progress: 100, status: "å®äº" as const },
  ]);
  const [formData, setFormData] = useState({ name: "", client: "", amount: "", deadline: "", startDate: "", type: "æ°ç¯", memo: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!formData.name || !formData.client) return;
    const newId = `K-2026-${String(entries.length + 1).padStart(3, "0")}`;
    const amountNum = parseInt(formData.amount.replace(/[^0-9]/g, "")) || 0;
    const formatted = amountNum > 0 ? `Â¥${amountNum.toLocaleString()}` : "æªå®";
    setEntries(prev => [{ id: newId, name: formData.name, client: formData.client, amount: formatted, deadline: formData.deadline || "æªå®", progress: 0, status: "é²è¡ä¸­" as const }, ...prev]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setFormData({ name: "", client: "", amount: "", deadline: "", startDate: "", type: "æ°ç¯", memo: "" }); }, 1200);
  };

  const inProgress = entries.filter(e => e.status === "é²è¡ä¸­").length;
  const completed = entries.filter(e => e.status === "å®äº").length;

  if (showForm) {
    return (<>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowForm(false)} className="text-sm text-text-sub hover:text-primary">â ä¸è¦§ã«æ»ã</button>
        <h2 className="text-lg font-bold text-text-main">å·¥äºå°å¸³ ã¼ æ°è¦ç»é²</h2>
      </div>
      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="text-sm font-bold text-emerald-700">ä¿å­ãã¾ããï¼ä¸è¦§ã«åæ ããã¾ãã</p>
        </div>
      )}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">å·¥äºå <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="ä¾: ââé¸æ°ç¯å·¥äº" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">çºæ³¨è <span className="text-red-500">*</span></label>
            <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="ä¾: ââä¸åç£æ ªå¼ä¼ç¤¾" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">å·¥äºç¨®å¥</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white">
              {["æ°ç¯", "æ¹ä¿®", "ãªãã©ã¼ã ", "å¤æ§", "è§£ä½", "è¨­å", "ãã®ä»"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">è«è² éé¡</label>
            <input type="text" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="ä¾: 50000000" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">çå·¥æ¥</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-1.5">å¼æ¸¡ãäºå®æ¥</label>
            <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-text-main mb-1.5">åè</label>
          <textarea value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" placeholder="ç¹è¨äºé ãããã°å¥åãã¦ãã ãã" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">ã­ã£ã³ã»ã«</button>
          <button onClick={handleSave} disabled={!formData.name || !formData.client} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${formData.name && formData.client ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}>ä¿å­ãã</button>
        </div>
      </div>
    </>);
  }

  return (<>
    <ToolHeader title="å·¥äºå°å¸³" color="#3b82f6" onCreateNew={() => setShowForm(true)} onExport={onExport} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "é²è¡ä¸­", value: inProgress + "ä»¶", color: "#3b82f6" }, { label: "å®äº", value: completed + "ä»¶", color: "#10b981" }, { label: "åæ³¨ç·é¡", value: "Â¥2å8,500ä¸", color: "#f59e0b" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["å·¥äºçªå·", "å·¥äºå", "çºæ³¨è", "è«è² éé¡", "å¼æ¸¡ãæ¥", "é²æ", "ç¶æ"]} rows={entries.map((e, i) => [
      e.id, e.name, e.client, e.amount, e.deadline,
      <div key={`p-${i}`} className="w-16"><div className="flex items-center gap-1"><div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${e.progress}%`, backgroundColor: e.progress >= 90 ? "#10b981" : e.progress >= 50 ? "#3b82f6" : "#f59e0b" }} /></div><span className="text-[10px] text-text-sub">{e.progress}%</span></div></div>,
      <StatusBadge key={`s-${i}`} status={e.status} />,
    ])} />
  </>);
}

function Estimate({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="è¦ç©ä½æ" color="#10b981" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["è¦ç©çªå·", "ä»¶å", "æåºå", "éé¡", "æåºæ¥", "ç¶æ"]} rows={[
      ["E-2026-045", "â³â³ãã«ç©ºèª¿æ´æ°å·¥äº", "â³â³åäº", "Â¥12,800,000", "2026/02/10", <StatusBadge key="1" status="éä»æ¸" />],
      ["E-2026-044", "ââé¸å¤å£å¡è£å·¥äº", "ââæ§", "Â¥3,200,000", "2026/02/08", <StatusBadge key="2" status="æ¿èªæ¸" />],
      ["E-2026-043", "â¡â¡ååº«æ¹ä¿®å·¥äº", "â¡â¡ç©æµ", "Â¥18,500,000", "2026/02/05", <StatusBadge key="3" status="ä¸æ¸ã" />],
      ["E-2026-042", "ââåºèåè£å·¥äº", "ââãã¼ãº", "Â¥7,600,000", "2026/02/01", <StatusBadge key="4" status="æ¿èªæ¸" />],
    ]} />
  </>);
}

function Budget({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="å®è¡äºç®" color="#f59e0b" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "äºç®ç·é¡", value: "Â¥2å8,500ä¸" }, { label: "å®è¡é¡", value: "Â¥1å9,800ä¸" }, { label: "æ®äºç®", value: "Â¥8,700ä¸" }, { label: "äºç®æ¶åç", value: "69.5%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["å·¥äºå", "è«è² é¡", "äºç®é¡", "å®ç¸¾é¡", "å·®é¡", "æ¶åç"]} rows={[
      ["ââãã³ã·ã§ã³æ°ç¯", "Â¥1å2,850ä¸", "Â¥9,850ä¸", "Â¥7,230ä¸", <span key="1" className="text-green-600 font-bold">+Â¥2,620ä¸</span>, "73.4%"],
      ["â³â³ãã«æ¹ä¿®", "Â¥4,500ä¸", "Â¥3,600ä¸", "Â¥1,280ä¸", <span key="2" className="text-green-600 font-bold">+Â¥2,320ä¸</span>, "35.6%"],
      ["â¡â¡ä½å®ãªãã©ã¼ã ", "Â¥850ä¸", "Â¥680ä¸", "Â¥590ä¸", <span key="3" className="text-green-600 font-bold">+Â¥90ä¸</span>, "86.8%"],
      ["ââåæ¥­æ½è¨­å¤æ§", "Â¥3,200ä¸", "Â¥2,560ä¸", "Â¥2,410ä¸", <span key="4" className="text-green-600 font-bold">+Â¥150ä¸</span>, "94.1%"],
    ]} />
  </>);
}

function OrderManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="è³æçºæ³¨" color="#ef4444" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["çºæ³¨çªå·", "çºæ³¨å", "å·¥äºå", "éé¡", "çºæ³¨æ¥", "ç´æ", "ç¶æ"]} rows={[
      ["PO-2026-089", "ABCå»ºæ", "ââãã³ã·ã§ã³", "Â¥3,200,000", "02/12", "02/28", <StatusBadge key="1" status="é²è¡ä¸­" />],
      ["PO-2026-088", "ââé»æ°å·¥æ¥­", "â³â³ãã«", "Â¥8,500,000", "02/10", "03/15", <StatusBadge key="2" status="é²è¡ä¸­" />],
      ["PO-2026-087", "â¡â¡å¡è£åº", "â¡â¡ä½å®", "Â¥1,800,000", "02/08", "02/20", <StatusBadge key="3" status="å®äº" />],
      ["PO-2026-086", "â³â³è¨­åå·¥æ¥­", "ââãã³ã·ã§ã³", "Â¥12,000,000", "02/05", "03/31", <StatusBadge key="4" status="é²è¡ä¸­" />],
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
    const name = siteName || "æ°è¦å·¥äº";
    const phases: { name: string; start: number; end: number; color: string }[] = [];
    let current = 0;
    const tpl = [
      { name: "ä»®è¨­å·¥äº", ratio: 0.05, color: "#6b7280" },
      { name: "åºç¤å·¥äº", ratio: 0.15, color: "#3b82f6" },
      { name: "èº¯ä½å·¥äº", ratio: 0.25, color: "#ef4444" },
      { name: "å±æ ¹ã»é²æ°´å·¥äº", ratio: 0.08, color: "#8b5cf6" },
      { name: "å¤å£å·¥äº", ratio: 0.12, color: "#f59e0b" },
      { name: "åè£å·¥äº", ratio: 0.15, color: "#10b981" },
      { name: "è¨­åå·¥äº", ratio: 0.10, color: "#06b6d4" },
      { name: "å¤æ§å·¥äº", ratio: 0.05, color: "#84cc16" },
      { name: "æ¤æ»ã»å¼æ¸¡ã", ratio: 0.05, color: "#e11d48" },
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
      <ToolHeader title="å·¥ç¨ã¹ã±ã¸ã¥ã¼ã«" color="#8b5cf6" onCreateNew={() => setShowCreate(true)} onExport={onExport} />

      {showCreate ? (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-bold text-text-main mb-6">å·¥ç¨ã¹ã±ã¸ã¥ã¼ã« æ°è¦ä½æ</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">ç¾å ´å <span className="text-red-500">*</span></label>
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="ä¾: ââé¸æ°ç¯å·¥äº" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">å»¶åºé¢ç©</label>
              <input type="text" value={floorArea} onChange={e => setFloorArea(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="ä¾: 120ã¡" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-main mb-1.5">æ³å®å·¥æï¼ã¶æï¼ <span className="text-red-500">*</span></label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" placeholder="ä¾: 6" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-1.5">å³é¢ã¢ããã­ã¼ã</label>
            <input type="file" ref={blueprintRef} className="hidden" accept=".pdf,.jww,.dxf,.atr,.dwg" onChange={e => { if (e.target.files?.[0]) setBlueprintFile(e.target.files[0].name); }} />
            <div onClick={() => blueprintRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-purple-400","bg-purple-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-purple-400","bg-purple-50"); if (e.dataTransfer.files?.[0]) setBlueprintFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-300 hover:bg-purple-50/30 transition-colors cursor-pointer">
              {blueprintFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-purple-700">{blueprintFile}</span>
                  <button onClick={ev => { ev.stopPropagation(); setBlueprintFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2">â åé¤</button>
                </div>
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <p className="text-sm font-medium text-text-main mb-1">ã¯ãªãã¯ã¾ãã¯ãã©ãã°&ãã­ãã</p>
                  <p className="text-xs text-text-sub">å¯¾å¿å½¢å¼: PDF / JWW / DXF / archiãã¬ã³ã (.atr) / ãã®ä»CADãã¼ã¿</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">ã­ã£ã³ã»ã«</button>
            <button onClick={handleGenerate} disabled={!siteName || !duration} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${siteName && duration ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-300 cursor-not-allowed"}`}>å·¥ç¨ã¹ã±ã¸ã¥ã¼ã«ãèªåä½æ</button>
          </div>
        </div>
      ) : generated ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span className="text-sm font-bold text-green-700">ã{generated.name}ãã®å·¥ç¨ã¹ã±ã¸ã¥ã¼ã«ãèªåä½æãã¾ãã{generated.area && `ï¼å»¶åº ${generated.area}ï¼`}</span>
            </div>
            <button onClick={() => setGenerated(null)} className="text-xs text-text-sub hover:text-text-main">æ¢å­å·¥ç¨ã«æ»ã</button>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-5">{generated.name} å·¥ç¨ã¹ã±ã¸ã¥ã¼ã«</h3>
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
                    <span className="text-[10px] text-text-sub w-12 shrink-0 text-right">{phase.end - phase.start}ã¶æ</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">2026å¹´2æ å·¥ç¨è¡¨</h3>
            <div className="flex gap-2"><button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">â åæ</button><button className="px-3 py-1 text-xs border border-border rounded hover:bg-gray-50">æ¬¡æ â</button></div>
          </div>
          {[{ name: "ââãã³ã·ã§ã³æ°ç¯", start: 0, width: 100, color: "#3b82f6", tasks: ["åºç¤å·¥äº", "ééª¨å»ºæ¹", "å¤å£å·¥äº"] }, { name: "â³â³ãã«æ¹ä¿®", start: 10, width: 70, color: "#10b981", tasks: ["è§£ä½å·¥äº", "åè£å·¥äº", "è¨­åå·¥äº"] }, { name: "â¡â¡ä½å®ãªãã©ã¼ã ", start: 5, width: 60, color: "#f59e0b", tasks: ["æ°´åã", "åè£", "å¤å£å¡è£"] }, { name: "ââåæ¥­æ½è¨­å¤æ§", start: 0, width: 50, color: "#ef4444", tasks: ["èè£å·¥äº", "æ¤æ ½å·¥äº", "ç§æå·¥äº"] }].map((p, i) => (
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
    <ToolHeader title="å¥éç®¡ç" color="#06b6d4" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[{ label: "å¥éæ¸", value: "Â¥1å4,250ä¸", color: "#10b981" }, { label: "æªå¥é", value: "Â¥2,830ä¸", color: "#ef4444" }, { label: "ä»æå¥éäºå®", value: "Â¥1,870ä¸", color: "#3b82f6" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["å·¥äºå", "è«æ±é¡", "å¥éé¡", "æ®é¡", "å¥éäºå®æ¥", "ç¶æ"]} rows={[
      ["ââãã³ã·ã§ã³ï¼2æåï¼", "Â¥12,800,000", "Â¥0", "Â¥12,800,000", "2026/02/28", <StatusBadge key="1" status="æªå¥é" />],
      ["â³â³ãã«ï¼1æåï¼", "Â¥8,500,000", "Â¥8,500,000", "Â¥0", "2026/01/31", <StatusBadge key="2" status="å¥éæ¸" />],
      ["â¡â¡ä½å®ï¼æçµéï¼", "Â¥2,800,000", "Â¥1,400,000", "Â¥1,400,000", "2026/02/15", <StatusBadge key="3" status="ä¸é¨å¥é" />],
    ]} />
  </>);
}

function CostManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="åä¾¡ç®¡ç" color="#ec4899" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "è«è² ç·é¡", value: "Â¥2å1,400ä¸" }, { label: "åä¾¡åè¨", value: "Â¥1å6,300ä¸" }, { label: "ç²å©", value: "Â¥5,100ä¸" }, { label: "ç²å©ç", value: "23.8%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p></div>
      ))}
    </div>
    <DataTable headers={["å·¥äºå", "è«è² é¡", "ææè²»", "å´åè²»", "å¤æ³¨è²»", "çµè²»", "åä¾¡è¨", "ç²å©ç"]} rows={[
      ["ââãã³ã·ã§ã³", "Â¥1å2,850ä¸", "Â¥3,210ä¸", "Â¥2,840ä¸", "Â¥2,560ä¸", "Â¥1,220ä¸", "Â¥9,830ä¸", <span key="1" className="font-bold text-green-600">23.5%</span>],
      ["â³â³ãã«æ¹ä¿®", "Â¥4,500ä¸", "Â¥1,130ä¸", "Â¥980ä¸", "Â¥850ä¸", "Â¥420ä¸", "Â¥3,380ä¸", <span key="2" className="font-bold text-green-600">24.9%</span>],
      ["â¡â¡ä½å®", "Â¥850ä¸", "Â¥210ä¸", "Â¥190ä¸", "Â¥150ä¸", "Â¥80ä¸", "Â¥630ä¸", <span key="3" className="font-bold text-yellow-600">25.9%</span>],
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
        <div className="mb-6"><h2 className="text-lg font-bold text-text-main">åºåç´ æä½æã»å¹ææ¸¬å®</h2></div>
        <div className="grid grid-cols-3 gap-6">
          <button onClick={() => setView("creative")} className="bg-white rounded-2xl border-2 border-border hover:border-orange-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">ç´ æçæ</h3>
            <p className="text-sm text-text-sub leading-relaxed">Metaã»Googleå¯¾å¿ã®<br/>åºåç´ æã¨ãã­ã¹ããèªåçæ</p>
          </button>
          <button onClick={() => setView("measurement")} className="bg-white rounded-2xl border-2 border-border hover:border-blue-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">å¹ææ¸¬å®</h3>
            <p className="text-sm text-text-sub leading-relaxed">APIé£æºã§èªåå¹ææ¸¬å®<br/>ã¢ã©ã¼ãã»ã¡ã¼ã«éç¥é£å</p>
          </button>
          <button onClick={() => setView("research")} className="bg-white rounded-2xl border-2 border-border hover:border-purple-400 hover:shadow-lg transition-all p-8 text-center group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">ç«¶åãªãµã¼ã</h3>
            <p className="text-sm text-text-sub leading-relaxed">ç«¶åä»ç¤¾ã®åºåã»æ½ç­ã<br/>èªååæã»ã¬ãã¼ã</p>
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
              <p className="font-bold text-text-main mb-1">AI ã¯ãªã¨ã¤ãã£ããã£ã¬ã¯ã¿ã¼åæä¸­...</p>
              <p className="text-xs text-text-sub">â  ç»ååæ â â¡ æ¦ç¥ãã¸ã·ã§ãã³ã° â â¢ åºåããªã¨ã¼ã·ã§ã³çæ â â£ ãã©ãããã©ã¼ã æé©å â â¤ ããã©ã¼ãã³ã¹äºæ¸¬</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">â æ»ã</button>
          <h2 className="text-lg font-bold text-text-main">ä½å®ã»ä¸åç£ AIã¯ãªã¨ã¤ãã£ããã£ã¬ã¯ã¿ã¼</h2>
        </div>
        <div className="flex items-center gap-2 mb-8">
          {["åªä½é¸æ", "ç´ æã¢ããã­ã¼ã", "AIåæã»çæçµæ"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= creativeStep ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-sm ${i <= creativeStep ? "text-text-main font-medium" : "text-text-sub"}`}>{s}</span>
              {i < 2 && <div className={`w-12 h-0.5 ${i < creativeStep ? "bg-orange-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        {creativeStep === 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">éä¿¡ããåªä½ã¨ã¢ã¼ããé¸æãã¦ãã ãã</h3>
            <div className="mb-8">
              <p className="text-xs font-bold text-text-sub mb-3">åªä½é¸æ:</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => togglePlatform("meta")} className={`p-6 rounded-xl border-2 text-left transition-all ${selectedPlatforms.includes("meta") ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">f</div>
                    <span className="font-bold text-text-main">Meta</span>
                    {selectedPlatforms.includes("meta") && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">Facebookã»Instagramåºå</p>
                </button>
                <button onClick={() => togglePlatform("google")} className={`p-6 rounded-xl border-2 text-left transition-all ${selectedPlatforms.includes("google") ? "border-red-500 bg-red-50" : "border-border hover:border-red-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center text-lg font-bold" style={{ color: "#4285f4" }}>G</div>
                    <span className="font-bold text-text-main">Google</span>
                    {selectedPlatforms.includes("google") && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#ef4444"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">Googleåºåã»ãã£ã¹ãã¬ã¤</p>
                </button>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-xs font-bold text-text-sub mb-3">æé©åã¢ã¼ã:</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setOptimizeMode("housing")} className={`p-6 rounded-xl border-2 text-left transition-all ${optimizeMode === "housing" ? "border-green-500 bg-green-50" : "border-border hover:border-green-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">ð </span>
                    <span className="font-bold text-text-main">ä½å®ç¹å</span>
                    {optimizeMode === "housing" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#16a34a"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">æ³¨æä½å®ã»å»ºå£²åãæé©å</p>
                </button>
                <button onClick={() => setOptimizeMode("realestate")} className={`p-6 rounded-xl border-2 text-left transition-all ${optimizeMode === "realestate" ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">ð¢</span>
                    <span className="font-bold text-text-main">ä¸åç£ç¹å</span>
                    {optimizeMode === "realestate" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-auto"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2"/></svg>}
                  </div>
                  <p className="text-xs text-text-sub">è²©å£²ã»ä»²ä»ç©ä»¶åãæé©å</p>
                </button>
              </div>
            </div>
            <button onClick={() => selectedPlatforms.length > 0 && setCreativeStep(1)} disabled={selectedPlatforms.length === 0} className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${selectedPlatforms.length > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}>æ¬¡ã¸</button>
          </div>
        )}
        {creativeStep === 1 && (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">åºåã«ä½¿ç¨ããç´ æãã¢ããã­ã¼ã</h3>
            <input type="file" ref={adFileRef} className="hidden" accept="image/*,video/mp4,video/quicktime" onChange={e => { if (e.target.files?.[0]) setAdFile(e.target.files[0].name); }} />
            <div onClick={() => adFileRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-orange-400","bg-orange-50"); }} onDragLeave={e => { e.currentTarget.classList.remove("border-orange-400","bg-orange-50"); }} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("border-orange-400","bg-orange-50"); if (e.dataTransfer.files?.[0]) setAdFile(e.dataTransfer.files[0].name); }} className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-6 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer">
              {adFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  <div className="text-left">
                    <p className="text-sm font-bold text-orange-700">{adFile}</p>
                    <p className="text-xs text-text-sub">ã¢ããã­ã¼ãå®äº</p>
                  </div>
                  <button onClick={ev => { ev.stopPropagation(); setAdFile(""); }} className="text-xs text-red-500 hover:text-red-700 ml-2 px-2 py-1 border border-red-200 rounded">â åé¤</button>
                </div>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <p className="text-sm font-medium text-text-main mb-1">ã¯ãªãã¯ã¾ãã¯ãã©ãã°&ãã­ãã</p>
                  <p className="text-xs text-text-sub">JPG, PNG, MP4, MOVï¼æå¤§100MBï¼</p>
                </>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-text-sub mb-3">é¸æåå®¹:</p>
              <div className="space-y-2">
                <div className="flex gap-2">{selectedPlatforms.map(p => <span key={p} className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-border">{p === "meta" ? "Meta (Facebook/Instagram)" : "Googleåºå"}</span>)}</div>
                <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium border border-border">{optimizeMode === "housing" ? "ð  ä½å®ç¹åã¢ã¼ã" : "ð¢ ä¸åç£ç¹åã¢ã¼ã"}</span>
              </div>
            </div>
            <button onClick={() => { if (adFile) { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); setCreativeStep(2); }, 2000); } }} disabled={!adFile} className={`w-full py-3 rounded-lg font-bold transition-colors ${adFile ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>ç´ æãçæãã</button>
          </div>
        )}
        {creativeStep === 2 && (
          <div className="space-y-6">
            {/* STEP 1: IMAGE ANALYSIS */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">â </div>
                <h4 className="text-sm font-bold text-text-main">ç»ååæ</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ç©ä»¶ã¿ã¤ã</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "æ³¨æä½å®" : "æè³ç¨ç©ä»¶"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ä¾¡æ ¼å¸¯ãã¸ã·ã§ã³</span>
                    <span className="text-sm font-bold text-text-main">ãã¬ãã¢ã </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ææãã¼ã³</span>
                    <span className="text-sm font-bold text-text-main">ä¸è³ªã§è½ã¡çãã®ãã</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ãã¶ã¤ã³ã¬ãã«</span>
                    <span className="text-sm font-bold text-text-main">ã¢ã¼ã­ãã¯ãã¬ãã«</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">ã¿ã¼ã²ããå±¤</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "ååè³¼å¥è" : "æè³å®¶åã"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-sub">æ³å®ä¾¡æ ¼å¸¯</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "Â¥3,500ä¸ãÂ¥5,500ä¸" : "Â¥8,000ä¸ãÂ¥1.2å"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-sub">å¸å ´ãã¸ã·ã§ã³</span>
                    <span className="text-sm font-bold text-text-main">{optimizeMode === "housing" ? "é«æåº¦ãã¶ã¤ã³ä½å®" : "é½å¿ãã¬ãã¢ã ç©ä»¶"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: STRATEGIC POSITIONING */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">â¡</div>
                <h4 className="text-sm font-bold text-text-main">æ¦ç¥çãã¸ã·ã§ãã³ã°</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-text-sub">è¨´æ±è»¸</span>
                  <p className="text-sm text-text-main mt-1">{optimizeMode === "housing" ? "ãã¶ã¤ã³ Ã ã©ã¤ãã¹ã¿ã¤ã«" : "è³ç£ä¾¡å¤ Ã å®å¨æ§"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">å¿çããªã¬ã¼</span>
                  <p className="text-sm text-text-main mt-1">{optimizeMode === "housing" ? "æ§ã Ã å®å¿æ" : "åççå¤æ­ Ã å°æ¥ä¾¡å¤"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">ãã¼ã³è¨­å®</span>
                  <p className="text-sm text-text-main mt-1">ã¤ã³ããªã¸ã§ã³ãã§è½ã¡çããå°è±¡</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-sub">é¿ããã¹ãè¡¨ç¾</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["èªå¤§è¡¨ç¾", "ãæå®å¤ã", "æ¼ãå£²ã", "éç¾å®çãªç´æ"].map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-red-50 border border-red-200 text-red-600 rounded">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: 3 HIGH-END AD VARIATIONS */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">â¢</div>
                <h4 className="text-sm font-bold text-text-main">åºåããªã¨ã¼ã·ã§ã³ï¼3ãã¿ã¼ã³ï¼</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(optimizeMode === "housing" ? [
                  { label: "ãã¿ã¼ã³A", headline: "æ®ããããè¨­è¨ããã", headlineChars: 9, subcopy: "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«", subcopyChars: 18, cta: "ç¡æç¸è«ãäºç´ãã", target: "30ã40ä»£ ååä½å®è³¼å¥è", trigger: "æ§ã Ã å®å¿æ", best: true },
                  { label: "ãã¿ã¼ã³B", headline: "éå¯ã¨åã®ããå®¶ã", headlineChars: 9, subcopy: "å»ºç¯å®¶ã¨åµããç¹å¥ãªæ¥å¸¸ç©ºé", subcopyChars: 16, cta: "ã¢ãã«ãã¦ã¹ãè¦å­¦ãã", target: "30ã50ä»£ ãã¶ã¤ã³å¿åå±¤", trigger: "å¸å°æ§ Ã ã©ã¤ãã¹ã¿ã¤ã«", best: false },
                  { label: "ãã¿ã¼ã³C", headline: "è³ç£ã«ãªããä½ã¾ãã", headlineChars: 9, subcopy: "å°æ¥ã®ä¾¡å¤ãè¦æ®ããä½å®è¨­è¨", subcopyChars: 16, cta: "è³æãè«æ±ãã", target: "35ã50ä»£ è³ç£å½¢ææè­å±¤", trigger: "åççå¤æ­ Ã å°æ¥ä¾¡å¤", best: false },
                ] : [
                  { label: "ãã¿ã¼ã³A", headline: "å©åããé½å¿ã§ç¢ºä¿ã", headlineChars: 9, subcopy: "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥", subcopyChars: 16, cta: "åæ¯ã·ãã¥ã¬ã¼ã·ã§ã³", target: "35ã55ä»£ ä¸åç£æè³å®¶", trigger: "åççå¤æ­ Ã å®å¨æ§", best: true },
                  { label: "ãã¿ã¼ã³B", headline: "å å®ãªè³ç£éç¨ãã", headlineChars: 9, subcopy: "é·æå®å®åå¥ãçãç©ä»¶é¸ã³", subcopyChars: 16, cta: "ç©ä»¶è³æãè«æ±ãã", target: "40ã60ä»£ å®å®å¿åæè³å®¶", trigger: "å®å¨æ§ Ã å°æ¥ä¾¡å¤", best: false },
                  { label: "ãã¿ã¼ã³C", headline: "è³ç£å½¢æã¯ãä¸åç£ã§ã", headlineChars: 10, subcopy: "ãã­ãå³é¸ããæè³ç©ä»¶ããææ¡", subcopyChars: 18, cta: "ç¡æç¸è«ãäºç´ãã", target: "30ã45ä»£ è³ç£å½¢æåå¿è", trigger: "åççå¤æ­ Ã å®å¿æ", best: false },
                ]).map((pattern, i) => (
                  <div key={i} className={`rounded-lg border-2 p-4 ${pattern.best ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-border"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: pattern.best ? "#fed7aa" : "#f3f4f6", color: pattern.best ? "#92400e" : "#6b7280" }}>{pattern.label}</span>
                        {pattern.best && <span className="text-orange-600 font-bold text-sm">â­ æ¨å¥¨</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-text-main">{pattern.headline}</p>
                          <span className="text-[10px] text-text-sub bg-white px-2 py-0.5 rounded border border-border">{pattern.headlineChars}å­</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-text-main">{pattern.subcopy}</p>
                          <span className="text-[10px] text-text-sub bg-white px-2 py-0.5 rounded border border-border">{pattern.subcopyChars}å­</span>
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
                  <h4 className="text-sm font-bold text-text-main">çæãããåºåç´ æãã¬ãã¥ã¼</h4>
                  <p className="text-[10px] text-text-sub">åãã©ãããã©ã¼ã åãã«æé©åãããã¯ãªã¨ã¤ãã£ã</p>
                </div>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">â çæå®äº</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Instagram Feed 1:1 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Instagram Feedï¼1:1ï¼</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                    {/* IG Header */}
                    <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
                      <span className="text-[9px] font-bold text-gray-900">builder_os_demo</span>
                      <span className="text-[9px] text-blue-500 ml-1">ãã©ã­ã¼ä¸­</span>
                      <span className="text-[9px] text-gray-400 ml-auto">åºå</span>
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
                        <p className="text-white font-bold text-xs leading-tight">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ããã" : "å©åããé½å¿ã§ç¢ºä¿ã"}</p>
                        <p className="text-white/80 text-[8px] mt-0.5">{optimizeMode === "housing" ? "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥"}</p>
                      </div>
                    </div>
                    {/* IG Actions */}
                    <div className="bg-white px-3 py-2 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </div>
                      <p className="text-[8px] text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">builder_os_demo</span> {optimizeMode === "housing" ? "å»ºç¯å®¶ã¨åµããããªãã ãã®ä½ã¾ããç¡æç¸è«åä»ä¸­ã" : "ãã­ãå³é¸ããé½å¿æè³ç©ä»¶ãåæ¯ã·ãã¥ã¬ã¼ã·ã§ã³ç¡æã"}</p>
                      <button className="w-full mt-1.5 py-1 bg-blue-500 text-white text-[8px] font-bold rounded">{optimizeMode === "housing" ? "ç¡æç¸è«ãäºç´ãã" : "åæ¯ã·ãã¥ã¬ã¼ã·ã§ã³"}</button>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1080 Ã 1080px</p>
                </div>

                {/* Instagram Stories 9:16 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Instagram Storiesï¼9:16ï¼</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg" style={{ aspectRatio: "9/16", maxHeight: "380px" }}>
                    <div className="w-full h-full relative" style={{ background: "linear-gradient(180deg, #1a3a5c 0%, #2d6cb5 15%, #f0ece4 15%, #e8e2d8 50%, #4a7c3c 50%, #2d5818 100%)" }}>
                      {/* Stories UI - top */}
                      <div className="absolute top-0 left-0 right-0 z-10 p-2">
                        <div className="w-full h-0.5 bg-white/30 rounded-full mb-2"><div className="w-1/3 h-full bg-white rounded-full" /></div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 border border-white" />
                          <span className="text-[8px] font-bold text-white">builder_os_demo</span>
                          <span className="text-[8px] text-white/60">åºå</span>
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
                          <p className="text-white font-black text-sm leading-tight mb-1">{optimizeMode === "housing" ? "æ®ãããã\nè¨­è¨ããã" : "å©åãã\né½å¿ã§ç¢ºä¿ã"}</p>
                          <p className="text-white/70 text-[8px] mb-2">{optimizeMode === "housing" ? "å»ºç¯å®¶ã¨åµããããªãã ãã®ä½ã¾ã" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥"}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] bg-white/20 text-white px-1.5 py-0.5 rounded">{optimizeMode === "housing" ? "æ³¨æä½å®" : "æè³ç©ä»¶"}</span>
                            <span className="text-[7px] bg-white/20 text-white px-1.5 py-0.5 rounded">{optimizeMode === "housing" ? "ç¡æç¸è«" : "å©åãä¿è¨¼"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Swipe up CTA */}
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <div className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1">
                          <span className="text-[7px] font-bold text-gray-900">{optimizeMode === "housing" ? "ç¡æç¸è«ãäºç´" : "ã·ãã¥ã¬ã¼ã·ã§ã³"}</span>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1080 Ã 1920px</p>
                </div>

                {/* Google Display 16:9 */}
                <div>
                  <p className="text-[10px] font-bold text-text-sub mb-2 text-center">Google Displayï¼16:9ï¼</p>
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
                            <p className="text-white font-black text-[10px] leading-tight mb-1">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ããã" : "å©åããé½å¿ã§ç¢ºä¿ã"}</p>
                            <p className="text-white/60 text-[7px] mb-2">{optimizeMode === "housing" ? "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥"}</p>
                            <button className="self-start text-[7px] bg-orange-500 text-white px-2 py-0.5 rounded font-bold">{optimizeMode === "housing" ? "ç¡æç¸è«" : "è©³ããè¦ã"}</button>
                          </div>
                        </div>
                        {/* Google Ad badge */}
                        <div className="absolute top-1 left-1 bg-yellow-400 text-[6px] font-bold text-gray-800 px-1 rounded">Ad</div>
                      </div>
                    </div>
                    {/* Google Search Ad */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow">
                      <p className="text-[9px] text-gray-500 mb-1">Google æ¤ç´¢åºåãã¬ãã¥ã¼</p>
                      <div className="border border-gray-100 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[7px] bg-gray-900 text-white px-1 rounded font-bold">Ad</span>
                          <span className="text-[8px] text-emerald-700">www.builder-os-demo.jp</span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-700 mb-0.5">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ãããï½å»ºç¯å®¶ã¨åµãä½ã¾ã" : "å©åããé½å¿ã§ç¢ºä¿ãï½ãã­ãå³é¸ããæè³ç©ä»¶"}</p>
                        <p className="text-[8px] text-gray-600 leading-relaxed">{optimizeMode === "housing" ? "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«ãå»ºç¯å®¶ã¨ã®ç¸è«ã¯ç¡æãä»ãªãç¡æç¸è«ã­ã£ã³ãã¼ã³éå¬ä¸­ã" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥ãé·æå®å®åå¥ãå®ç¾ãåæ¯ã·ãã¥ã¬ã¼ã·ã§ã³ä»ããä»ããç¸è«ã"}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-text-sub text-center mt-1.5">1200 Ã 628px / ãã­ã¹ãåºå</p>
                </div>
              </div>
              {/* Download/export bar */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] text-text-sub">
                  <span>ð 4ãã©ã¼ãããèªåçæ</span>
                  <span>ð¨ é«è§£ååº¦åºåå¯¾å¿</span>
                  <span>ð± ã¬ã¹ãã³ã·ãæé©åæ¸ã¿</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-[10px] px-3 py-1.5 border border-border rounded font-medium hover:bg-gray-50 transition-colors">ä¸æ¬ãã¦ã³ã­ã¼ã</button>
                  <button className="text-[10px] px-3 py-1.5 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors">å¥ç¨¿ãã¼ã¿æ¸ãåºã</button>
                </div>
              </div>
            </div>

            {/* STEP 4: PLATFORM OPTIMIZATION */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600">â£</div>
                <h4 className="text-sm font-bold text-text-main">ãã©ãããã©ã¼ã æé©å</h4>
              </div>
              <div className="space-y-6">
                {/* Meta Format */}
                {selectedPlatforms.includes("meta") && (
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">f</div>
                      <p className="text-sm font-bold text-text-main">Metaï¼Facebook/Instagramï¼</p>
                    </div>
                    <div className="space-y-2 text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded border border-gray-700">
                      <div><span className="text-purple-400">primary_text:</span> <span className="text-green-300">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ãããããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«ãå»ºç¯å®¶ã¨åµãé«æåº¦ãã¶ã¤ã³ä½å®ãç¡æç¸è«ããäºç´ãã ããã" : "å©åããé½å¿ã§ç¢ºä¿ãè³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥ãé·æå®å®åå¥ãçãæè³ç©ä»¶ããææ¡ãåæ¯ã·ãã¥ã¬ã¼ã·ã§ã³å®æ½ä¸­ã"}</span></div>
                      <div><span className="text-purple-400">headline:</span> <span className="text-green-300">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ããã" : "å©åããé½å¿ã§ç¢ºä¿ã"}</span> <span className="text-yellow-300 text-[9px]">({optimizeMode === "housing" ? "9" : "9"}å­)</span></div>
                      <div><span className="text-purple-400">description:</span> <span className="text-green-300">{optimizeMode === "housing" ? "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«ãå»ºç¯å®¶ã¨åµãä½ã¾ãã" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥ãé·æå®å®åå¥ãå®ç¾ã"}</span> <span className="text-yellow-300 text-[9px]">(â¤90å­)</span></div>
                      <div><span className="text-purple-400">CTA:</span> <span className="text-green-300">{optimizeMode === "housing" ? "ç¡æç¸è«ãã" : "ã·ãã¥ã¬ã¼ã·ã§ã³"}</span></div>
                    </div>
                  </div>
                )}

                {/* Google Format */}
                {selectedPlatforms.includes("google") && (
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-white border border-red-300 rounded flex items-center justify-center font-bold text-[10px]" style={{ color: "#4285f4" }}>G</div>
                      <p className="text-sm font-bold text-text-main">Googleæ¤ç´¢åºå</p>
                    </div>
                    <div className="space-y-2 text-[10px] font-mono bg-gray-900 text-green-400 p-3 rounded border border-gray-700">
                      <div><span className="text-purple-400">headlines:</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "æ®ããããè¨­è¨ããã" : "å©åããé½å¿ã§ç¢ºä¿ã"}</span> <span className="text-yellow-300">(9å­)</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "å»ºç¯å®¶ã¨åµãä½ã¾ã" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°"}</span> <span className="text-yellow-300">(10å­)</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "çæ³ã®äººçãå½¢ã«å®ç¾" : "ãã­ãå³é¸ããæè³ç©ä»¶"}</span> <span className="text-yellow-300">(11å­)</span></div>
                      <div className="mt-2"><span className="text-purple-400">descriptions:</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "ããªãã®çæ³ãç¢ºããªæè¡ã§å½¢ã«ãå»ºç¯å®¶ã¨ã®ç¸è«ã¯ç¡æã" : "è³ç£ä¾¡å¤ãè½ã¡ãªãç«å°æ¦ç¥ãé·æå®å®åå¥ãå®ç¾ãä»ããç¸è«ã"}</span></div>
                      <div className="ml-4"><span className="text-green-300">{optimizeMode === "housing" ? "ä»ãªãç¡æç¸è«ã­ã£ã³ãã¼ã³éå¬ä¸­ãåå¥å¯¾å¿ã§å¤¢ã®ãå®¶ãå®ç¾ã" : "ãã­ãå³é¸ããæè³ç©ä»¶ãåæ¯ã·ãã¥ã¬ã¼ã·ã§ã³ä»ããè³æè«æ±ä»ããã"}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 5: PERFORMANCE PREDICTION */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-600">â¤</div>
                <h4 className="text-sm font-bold text-text-main">ããã©ã¼ãã³ã¹äºæ¸¬</h4>
              </div>
              <div className="space-y-4">
                {/* CTR Prediction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-main">æå¾CTR</span>
                    <span className="text-sm font-bold text-emerald-600">{optimizeMode === "housing" ? "1.8%ã2.5%" : "1.5%ã2.2%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: optimizeMode === "housing" ? "75%" : "65%" }}></div>
                  </div>
                </div>

                {/* CVR Prediction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-main">æå¾CVR</span>
                    <span className="text-sm font-bold text-blue-600">{optimizeMode === "housing" ? "3.2%ã4.8%" : "2.5%ã3.8%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: optimizeMode === "housing" ? "80%" : "70%" }}></div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-bold text-text-sub mb-1">äºæ¸¬çç±</p>
                  <p className="text-xs text-text-main leading-relaxed">
                    {optimizeMode === "housing" ? "é«ä¾¡æ ¼å¸¯åæã®ããé·ãæ¤è¨æéãå¿è¦ãä¿¡é ¼æ§ç¯ > èå¥®ã§ãçæ§çãªè¨´æ±ãå¹æçããã¶ã¤ã³ã¨å®å¿æã®çµã¿åãããå¿ççãªéå£ãä½ä¸ããã¾ãã" : "æè³å¤æ­ã¯åççã»åæçãå°æ¥ä¾¡å¤ã¨å®å¨æ§ã®ä¸¡ç«ãè©ä¾¡ããããå·éã§åæçãªãã¼ã³ãè³¼è²·ææ¬²ã«ã¤ãªããã¾ãã"}
                  </p>
                </div>

                {/* Key Success Factors */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-sub">æåè¦å </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(optimizeMode === "housing" ? [
                      "ä¿¡é ¼æãæåªå",
                      "ãã¸ã¥ã¢ã«åè³ªã®é«ã",
                      "æ¥å ´äºç´ã¸ã®èªå°",
                      "æ®µéçãªé¢ä¿æ§ç¯",
                    ] : [
                      "å©åãã®æç¢ºæ§",
                      "ç«å°ã®å®å¨æ§",
                      "é·æä¾¡å¤ã®èª¬æ",
                      "ã·ãã¥ã¬ã¼ã·ã§ã³æä¾",
                    ]).map((factor, i) => (
                      <div key={i} className="text-[10px] px-2 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 rounded font-medium flex items-center gap-1">
                        <span>â</span> {factor}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Rules */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs font-bold text-text-sub mb-2">éè¦ã«ã¼ã«</p>
                  <div className="space-y-1">
                    {(optimizeMode === "housing" ? [
                      "æ¥å ´äºç´ãæçµç®æ¨ã«è¨­å®",
                      "ãã¡ã¤ãã³ã·ã£ã«ä¸å®ãåããããã¼ã³",
                      "ä¿¡é ¼ > èå¥®",
                      "åçæ§ > éå°æ¼åº",
                    ] : [
                      "å©åããå¼·èª¿",
                      "é·æè³ç£å®å¨æ§",
                      "å·éã§åæçãªãã¼ã³",
                      "å°æ¥ä¾¡å¤ãéè¦",
                    ]).map((rule, i) => (
                      <div key={i} className="text-[10px] text-text-main flex items-center gap-2">
                        <span className="text-orange-500 font-bold">â</span> {rule}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={() => { setCreativeStep(0); setSelectedPlatforms([]); setAdFile(""); }} className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors">ããä¸åº¦ä½æ</button>
              <button onClick={backToMain} className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">å®äº</button>
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
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">â æ»ã</button>
          <h2 className="text-lg font-bold text-text-main">å¹ææ¸¬å®</h2>
        </div>
        {!measurementActive ? (
          <div>
            <h3 className="text-sm font-bold text-text-main mb-4">åæè¨­å® - ã¢ã«ã¦ã³ãé£æº</h3>
            <p className="text-xs text-text-sub mb-6">APIé£æºã«ãããåãã©ãããã©ã¼ã ã®ãã¼ã¿ãèªååå¾ãã¾ãã</p>
            <div className="space-y-4 mb-6">
              <div className={`p-5 rounded-xl border-2 transition-all ${metaConnected ? "border-green-400 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">f</div>
                    <div><p className="font-bold text-text-main">Metaãã¸ãã¹ã¢ã«ã¦ã³ãé£æº</p><p className="text-xs text-text-sub">Facebookã»Instagramåºåãã¼ã¿ãèªååå¾</p></div>
                  </div>
                  {metaConnected ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">é£æºæ¸ã¿ â</span>
                  ) : (
                    <button onClick={() => setMetaConnected(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700 transition-colors">APIé£æºãã</button>
                  )}
                </div>
              </div>
              <div className={`p-5 rounded-xl border-2 transition-all ${googleConnected ? "border-green-400 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center font-bold" style={{ color: "#4285f4" }}>G</div>
                    <div><p className="font-bold text-text-main">Googleãã¸ãã¹ã¢ã«ã¦ã³ãé£æº</p><p className="text-xs text-text-sub">Googleåºåã»ã¢ããªãã£ã¯ã¹ãã¼ã¿ãèªååå¾</p></div>
                  </div>
                  {googleConnected ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">é£æºæ¸ã¿ â</span>
                  ) : (
                    <button onClick={() => setGoogleConnected(true)} className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg font-bold hover:bg-red-600 transition-colors">APIé£æºãã</button>
                  )}
                </div>
              </div>
            </div>
            {metaConnected && googleConnected && (
              <button onClick={() => setMeasurementActive(true)} className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">å¹ææ¸¬å®ãéå§ãã</button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[{ label: "ç·ã¤ã³ãã¬ãã·ã§ã³", value: "245,200", change: "+12.3%" }, { label: "ã¯ãªãã¯æ°", value: "6,840", change: "+8.7%" }, { label: "åé¿æ°", value: "127ä»¶", change: "+15.2%" }, { label: "CPA", value: "Â¥6,693", change: "-5.1%" }].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p><p className="text-xs text-green-600 font-bold mt-1">{s.change}</p></div>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-red-700">ç´ æå¤æ´ãå¿è¦ã§ã</p><p className="text-xs text-red-600">ãæ¥ã®æ°ç¯ã­ã£ã³ãã¼ã³ãã®CTRã0.8%ãä¸åãã¾ãããç´ æã®å·®ãæ¿ããæ¨å¥¨ãã¾ãã</p></div>
                <button className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-bold shrink-0">ç´ æãå¤æ´</button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-blue-700">è³æè«æ±ãããã¾ãã</p><p className="text-xs text-blue-600">Instagramåºåçµç±ã§æ°è¦ã®è³æè«æ±ã3ä»¶ããã¾ããï¼æ¬æ¥ 14:32ï¼</p></div>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold shrink-0">è©³ç´°ãè¦ã</button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
                <div className="flex-1"><p className="text-sm font-bold text-yellow-700">ã¡ã¼ã«éç¥é£åä¸­</p><p className="text-xs text-yellow-600">Googleåºåã®éç¥ã¡ã¼ã«ï¼budget@builder-os.jpï¼ã¨é£åä¸­ãæªèª­éç¥: 2ä»¶</p></div>
                <button className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg font-bold shrink-0">ç¢ºèªãã</button>
              </div>
            </div>
            <DataTable headers={["ã­ã£ã³ãã¼ã³", "åªä½", "IMP", "ã¯ãªãã¯", "åé¿", "CPA", "ç¶æ"]} rows={[
              ["æ¥ã®æ°ç¯ã­ã£ã³ãã¼ã³", "Meta", "45,200", "1,850", "42ä»¶", "Â¥5,202", <StatusBadge key="1" status="è¦å¯¾å¿" />],
              ["Instagram ã¢ãã«ãã¦ã¹", "Meta", "128,000", "3,200", "38ä»¶", "Â¥4,868", <StatusBadge key="2" status="éä¿¡ä¸­" />],
              ["ãªã¹ãã£ã³ã°åºå", "Google", "72,000", "1,790", "47ä»¶", "Â¥5,106", <StatusBadge key="3" status="éä¿¡ä¸­" />],
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
          <button onClick={backToMain} className="text-sm text-text-sub hover:text-primary">â æ»ã</button>
          <h2 className="text-lg font-bold text-text-main">ç«¶åãªãµã¼ã</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: "è¿½è·¡ä¸­ã®ç«¶å", value: "5ç¤¾", color: "#8b5cf6" }, { label: "æ¤åºãããåºå", value: "23ä»¶", color: "#3b82f6" }, { label: "å¸å ´ã·ã§ã¢æ¨å®", value: "12.3%", color: "#10b981" }].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
          ))}
        </div>
        <DataTable headers={["ç«¶åä»ç¤¾", "ã¨ãªã¢", "æ¤åºåºåæ°", "æ¨å®æé¡", "ä¸»è¦åªä½", "ç´è¿ã®åã"]} rows={[
          ["ââãã¼ã ", "ä¸ç°è°·åºã»ç®é»åº", "8ä»¶", "Â¥35ä¸", "Meta/Google", <StatusBadge key="1" status="éä¿¡ä¸­" />],
          ["â³â³å»ºè¨­", "æä¸¦åºã»ä¸­éåº", "5ä»¶", "Â¥20ä¸", "Google", <StatusBadge key="2" status="éä¿¡ä¸­" />],
          ["â¡â¡ãã¦ã¹", "ç·´é¦¬åº", "6ä»¶", "Â¥28ä¸", "Meta", <StatusBadge key="3" status="éä¿¡ä¸­" />],
          ["ââå·¥ååº", "æ¿æ©åºã»ååº", "3ä»¶", "Â¥15ä¸", "ãã©ã·/DM", <StatusBadge key="4" status="éä¿¡ä¸­" />],
          ["ââãªãã©ã¼ã ", "åå·åº", "1ä»¶", "Â¥8ä¸", "Google", <StatusBadge key="5" status="çµäº" />],
        ]} />
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-4">ç«¶åã­ã¼ã¯ã¼ãéè¤åæ</h3>
            <div className="space-y-3">
              {[{ kw: "æ±äº¬é½ æ°ç¯", us: true, comp: 3 }, { kw: "ä¸ç°è°·åº ãªãã©ã¼ã ", us: true, comp: 2 }, { kw: "ç®é» æ³¨æä½å®", us: false, comp: 4 }, { kw: "æ±äº¬ å·¥ååº", us: true, comp: 5 }, { kw: "æä¸¦ ãªããã¼ã·ã§ã³", us: false, comp: 2 }].map((k, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-text-main">{k.kw}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${k.us ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{k.us ? "åºç¨¿ä¸­" : "æªåºç¨¿"}</span>
                    <span className="text-xs text-text-sub">ç«¶å {k.comp}ç¤¾</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm mb-4">ç«¶åã®ææ°åºåã¯ãªã¨ã¤ãã£ã</h3>
            <div className="space-y-3">
              {[{ comp: "ââãã¼ã ", text: "æ¥ã®æ°çæ´»å¿æ´ãã§ã¢éå¬ä¸­ï¼ã¢ãã«ãã¦ã¹è¦å­¦äºç´åä»ä¸­", media: "Instagram", date: "2/13" }, { comp: "â³â³å»ºè¨­", text: "èéç­ç´3ã®å®å¿ä½å®ãç¡æèéè¨ºæ­å®æ½ä¸­", media: "Googleæ¤ç´¢", date: "2/12" }, { comp: "â¡â¡ãã¦ã¹", text: "ãªãã©ã¼ã ç¸è«ä¼ 2/15-16éå¬ãæ¥å ´äºç´ã§ååå¸é²å", media: "Facebook", date: "2/10" }].map((ad, i) => (
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
    <ToolHeader title="é¡§å®¢ç®¡ç" color="#6366f1" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["é¡§å®¢å", "æå½è", "é»è©±çªå·", "ã¡ã¼ã«", "ç´¯è¨åå¼é¡", "å·¥äºä»¶æ°"]} rows={[
      ["ââä¸åç£æ ªå¼ä¼ç¤¾", "ä¸­æ é¨é·", "03-1234-5678", "nakamura@example.co.jp", "Â¥256,000,000", "8ä»¶"],
      ["â³â³åäºæ ªå¼ä¼ç¤¾", "é«æ© èª²é·", "03-2345-6789", "takahashi@example.co.jp", "Â¥128,000,000", "5ä»¶"],
      ["â¡â¡æ§ï¼åäººï¼", "â¡â¡ æ§", "090-1234-5678", "customer@example.com", "Â¥8,500,000", "1ä»¶"],
      ["ââéçºæ ªå¼ä¼ç¤¾", "ä¼è¤ æ¬¡é·", "03-3456-7890", "ito@example.co.jp", "Â¥85,000,000", "3ä»¶"],
    ]} />
  </>);
}

function AfterService({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="ã¢ãã¿ã¼ç®¡ç" color="#84cc16" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["åä»çªå·", "ç©ä»¶å", "é¡§å®¢å", "åå®¹", "åä»æ¥", "å¯¾å¿æé", "ç¶æ"]} rows={[
      ["AF-2026-023", "ââé¸", "ââæ§", "é¨æ¼ãï¼2Få¯å®¤å¤©äºï¼", "02/13", "02/20", <StatusBadge key="1" status="å¯¾å¿ä¸­" />],
      ["AF-2026-022", "â³â³ãã³ã·ã§ã³301å·", "â³â³æ§", "ã¯ã­ã¹å¥ããï¼ãªãã³ã°ï¼", "02/10", "02/17", <StatusBadge key="2" status="å¯¾å¿æ¸" />],
      ["AF-2026-021", "â¡â¡äºåæ", "â¡â¡åäº", "ç©ºèª¿å¹ãä¸è¯ï¼3Fï¼", "02/08", "02/15", <StatusBadge key="3" status="è¦å¯¾å¿" />],
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
    <ToolHeader title="æ¸é¡ç®¡ç" color="#a855f7" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-white rounded-xl border border-border p-5 mb-6">
      <h3 className="text-sm font-bold text-text-main mb-4">æ¸é¡éå½¢ãã¦ã³ã­ã¼ã</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { name: "å·¥äºè«è² å¥ç´æ¸", icon: "ð" },
          { name: "è¦ç©æ¸ãã³ãã¬ã¼ã", icon: "ð" },
          { name: "æ³¨ææ¸", icon: "ð" },
          { name: "è«æ±æ¸ãã³ãã¬ã¼ã", icon: "ð°" },
          { name: "å®å¨ç®¡çè¨ç»æ¸", icon: "ð" },
          { name: "ä½æ¥­æ¥å ±", icon: "ð" },
          { name: "æ½å·¥ä½å¶å°å¸³", icon: "ð" },
          { name: "ç«£å·¥å±", icon: "â" },
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
        ã{dlName}ãããã¦ã³ã­ã¼ããã¾ãã
      </div>
    )}
    <DataTable headers={["ãã¡ã¤ã«å", "ã«ãã´ãª", "å·¥äºå", "æ´æ°æ¥", "ãµã¤ãº", "å±æ"]} rows={[
      ["è¨­è¨å³é¢_rev3.pdf", "å³é¢", "ââãã³ã·ã§ã³", "02/14", "12.5MB", "5äºº"],
      ["è¦ç©æ¸_æçµç.xlsx", "è¦ç©", "â³â³ãã«æ¹ä¿®", "02/13", "2.1MB", "3äºº"],
      ["å·¥äºåçå¸³_2æ.pdf", "åçå¸³", "â¡â¡ä½å®", "02/12", "45.8MB", "4äºº"],
      ["å®å¨ç®¡çè¨ç»æ¸.docx", "å®å¨æ¸é¡", "ââãã³ã·ã§ã³", "02/10", "1.8MB", "8äºº"],
    ]} />
  </>);
}

function VendorManagement({ onCreateNew, onExport }: ToolProps) {
  return (<>
    <ToolHeader title="æ¥­èç®¡ç" color="#0ea5e9" onCreateNew={onCreateNew} onExport={onExport} />
    <DataTable headers={["æ¥­èå", "æ¥­ç¨®", "æå½è", "é»è©±çªå·", "è©ä¾¡", "åå¼é¡"]} rows={[
      ["ABCå»ºææ ªå¼ä¼ç¤¾", "å»ºæ", "æ¾æ¬ å¶æ¥­é¨é·", "03-1111-2222", "4.8", "Â¥45,200,000"],
      ["ââé»æ°å·¥æ¥­", "é»æ°å·¥äº", "äºä¸ ç¤¾é·", "03-2222-3333", "4.5", "Â¥32,100,000"],
      ["â¡â¡å¡è£åº", "å¡è£", "å°æ ä»£è¡¨", "090-3333-4444", "4.7", "Â¥18,500,000"],
      ["â³â³è¨­åå·¥æ¥­", "è¨­åå·¥äº", "å è¤ é¨é·", "03-4444-5555", "4.3", "Â¥28,600,000"],
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
  const [sf, setSf] = useState({ budget: "5,000", pref: "æ±äº¬é½", city: "", station: "", line: "", walk: "20", school: "", kenjo: "æ¡ä»¶ä»ãå«ã", tsuboMin: "30", tsuboMax: "70", nochi: "å«ã", chosei: "å«ã", buildTsubo: "30", buildType: "2éå»ºã¦", buildBudget: "2,500", rate: "0.6", years: "35", down: "0" });
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
    "åæµ·é": { ta: "01", ar: "010" }, "éæ£®ç": { ta: "02", ar: "020" }, "å²©æç": { ta: "03", ar: "020" }, "å®®åç": { ta: "04", ar: "020" }, "ç§ç°ç": { ta: "05", ar: "020" }, "å±±å½¢ç": { ta: "06", ar: "020" }, "ç¦å³¶ç": { ta: "07", ar: "020" },
    "è¨åç": { ta: "08", ar: "030" }, "æ æ¨ç": { ta: "09", ar: "030" }, "ç¾¤é¦¬ç": { ta: "10", ar: "030" }, "å¼çç": { ta: "11", ar: "030" }, "åèç": { ta: "12", ar: "030" }, "æ±äº¬é½": { ta: "13", ar: "030" }, "ç¥å¥å·ç": { ta: "14", ar: "030" },
    "æ°æ½ç": { ta: "15", ar: "040" }, "å¯å±±ç": { ta: "16", ar: "040" }, "ç³å·ç": { ta: "17", ar: "040" }, "ç¦äºç": { ta: "18", ar: "040" },
    "å±±æ¢¨ç": { ta: "19", ar: "040" }, "é·éç": { ta: "20", ar: "040" }, "å²éç": { ta: "21", ar: "050" }, "éå²¡ç": { ta: "22", ar: "050" }, "æç¥ç": { ta: "23", ar: "050" }, "ä¸éç": { ta: "24", ar: "050" },
    "æ»è³ç": { ta: "25", ar: "060" }, "äº¬é½åº": { ta: "26", ar: "060" }, "å¤§éªåº": { ta: "27", ar: "060" }, "åµåº«ç": { ta: "28", ar: "060" }, "å¥è¯ç": { ta: "29", ar: "060" }, "åæ­å±±ç": { ta: "30", ar: "060" },
    "é³¥åç": { ta: "31", ar: "070" }, "å³¶æ ¹ç": { ta: "32", ar: "070" }, "å²¡å±±ç": { ta: "33", ar: "070" }, "åºå³¶ç": { ta: "34", ar: "070" }, "å±±å£ç": { ta: "35", ar: "070" },
    "å¾³å³¶ç": { ta: "36", ar: "080" }, "é¦å·ç": { ta: "37", ar: "080" }, "æåªç": { ta: "38", ar: "080" }, "é«ç¥ç": { ta: "39", ar: "080" },
    "ç¦å²¡ç": { ta: "40", ar: "090" }, "ä½è³ç": { ta: "41", ar: "090" }, "é·å´ç": { ta: "42", ar: "090" }, "çæ¬ç": { ta: "43", ar: "090" }, "å¤§åç": { ta: "44", ar: "090" }, "å®®å´ç": { ta: "45", ar: "090" }, "é¹¿åå³¶ç": { ta: "46", ar: "090" }, "æ²ç¸ç": { ta: "47", ar: "090" },
  };

  const prefSlugMap: Record<string, string> = {
    "åæµ·é": "hokkaido", "éæ£®ç": "aomori", "å²©æç": "iwate", "å®®åç": "miyagi", "ç§ç°ç": "akita",
    "å±±å½¢ç": "yamagata", "ç¦å³¶ç": "fukushima", "è¨åç": "ibaraki", "æ æ¨ç": "tochigi", "ç¾¤é¦¬ç": "gunma",
    "å¼çç": "saitama", "åèç": "chiba", "æ±äº¬é½": "tokyo", "ç¥å¥å·ç": "kanagawa",
    "æ°æ½ç": "niigata", "å¯å±±ç": "toyama", "ç³å·ç": "ishikawa", "ç¦äºç": "fukui",
    "å±±æ¢¨ç": "yamanashi", "é·éç": "nagano", "å²éç": "gifu", "éå²¡ç": "shizuoka", "æç¥ç": "aichi", "ä¸éç": "mie",
    "æ»è³ç": "shiga", "äº¬é½åº": "kyoto", "å¤§éªåº": "osaka", "åµåº«ç": "hyogo", "å¥è¯ç": "nara", "åæ­å±±ç": "wakayama",
    "é³¥åç": "tottori", "å³¶æ ¹ç": "shimane", "å²¡å±±ç": "okayama", "åºå³¶ç": "hiroshima", "å±±å£ç": "yamaguchi",
    "å¾³å³¶ç": "tokushima", "é¦å·ç": "kagawa", "æåªç": "ehime", "é«ç¥ç": "kochi",
    "ç¦å²¡ç": "fukuoka", "ä½è³ç": "saga", "é·å´ç": "nagasaki", "çæ¬ç": "kumamoto", "å¤§åç": "oita", "å®®å´ç": "miyazaki", "é¹¿åå³¶ç": "kagoshima", "æ²ç¸ç": "okinawa",
  };

  const openSuumo = () => {
    const slug = prefSlugMap[sf.pref] || "tokyo";
    // é½éåºçã®å¸åºçºæé¸æãã¼ã¸ï¼ç©ä»¶æ°ãè¡¨ç¤ºãããç¢ºå®ãªURLï¼
    window.open(`https://suumo.jp/tochi/${slug}/city/`, "_blank");
  };

  const handleSearch = () => {
    if (!searchAreaM2 && !searchAreaTsubo) {
      setAreaError("ã¡ ã¾ãã¯ åªæ° ã®ã©ã¡ãããå¥åãã¦ãã ããï¼å¿é ï¼");
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
    { rank: 1, score: 92, name: "æä¸¦åº æç°æ± åå°", address: "æ±äº¬é½æä¸¦åºæç°æ±3ä¸ç®", size: 150.0, sizeTsubo: 45.4, price: 48500000, tsuboPrice: 106.8, avgTsubo: 118.0, discount: "+10.5%", discountLabel: "å²å®", zoning: "ç¬¬ä¸ç¨®ä½å±", coverage: 60, far: 200, maxFloor: 90.8, fitLabel: "â ä½è£ãã", hazardFlood: "ä½", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä½", hazardScore: "A", demolition: 0, grading: 0, totalCost: 59695000, loanAmount: 59695000, monthlyPayment: 153000, status: "åä»ä¸­", station: "åé¿ä½ã±è°·é§ å¾æ­©12å", source: "SUUMO" as const, propertyNo: "S-20260218-001", scoreDetail: { cheap: 14, fit: 14, loan: 13, demolition: 10, grading: 14, hazard: 14, asset: 13 } },
    { rank: 2, score: 88, name: "ç·´é¦¬åº è±çå åè­²å°", address: "æ±äº¬é½ç·´é¦¬åºè±çå4ä¸ç®", size: 135.3, sizeTsubo: 40.9, price: 38000000, tsuboPrice: 92.8, avgTsubo: 98.0, discount: "+5.3%", discountLabel: "ç¸å ´", zoning: "ç¬¬äºç¨®ä½å±", coverage: 60, far: 200, maxFloor: 81.8, fitLabel: "â ä½è£ãã", hazardFlood: "ä¸­", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä½", hazardScore: "B", demolition: 0, grading: 500000, totalCost: 49735000, loanAmount: 49735000, monthlyPayment: 127000, status: "åä»ä¸­", station: "ç·´é¦¬é§ å¾æ­©15å", source: "REINS" as const, propertyNo: "R-20260218-024", scoreDetail: { cheap: 11, fit: 14, loan: 14, demolition: 10, grading: 12, hazard: 11, asset: 13 } },
    { rank: 3, score: 82, name: "ä¸ç°è°·åº æ¡ä¸ åå°", address: "æ±äº¬é½ä¸ç°è°·åºæ¡ä¸2ä¸ç®", size: 128.5, sizeTsubo: 38.9, price: 58000000, tsuboPrice: 149.0, avgTsubo: 155.0, discount: "+3.9%", discountLabel: "ç¸å ´", zoning: "ç¬¬ä¸ç¨®ä½å±", coverage: 50, far: 100, maxFloor: 38.9, fitLabel: "â³ ããä¸è¶³", hazardFlood: "ä½", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä½", hazardScore: "A", demolition: 0, grading: 0, totalCost: 70610000, loanAmount: 70610000, monthlyPayment: 181000, status: "åä»ä¸­", station: "åæ­³è¹æ©é§ å¾æ­©10å", source: "SUUMO" as const, propertyNo: "S-20260218-003", scoreDetail: { cheap: 10, fit: 8, loan: 10, demolition: 10, grading: 15, hazard: 14, asset: 11 } },
    { rank: 4, score: 79, name: "æ¿æ©åº æå¢ åå°", address: "æ±äº¬é½æ¿æ©åºæå¢1ä¸ç®", size: 142.0, sizeTsubo: 42.9, price: 42000000, tsuboPrice: 97.9, avgTsubo: 105.0, discount: "+6.8%", discountLabel: "å²å®", zoning: "ç¬¬ä¸ç¨®ä½å±", coverage: 60, far: 200, maxFloor: 85.8, fitLabel: "â ä½è£ãã", hazardFlood: "ä¸­", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä¸­", hazardScore: "B", demolition: 0, grading: 300000, totalCost: 53870000, loanAmount: 53870000, monthlyPayment: 138000, status: "åä»ä¸­", station: "æå¢é§ å¾æ­©9å", source: "REINS" as const, propertyNo: "R-20260218-037", scoreDetail: { cheap: 12, fit: 14, loan: 13, demolition: 10, grading: 13, hazard: 10, asset: 7 } },
    { rank: 5, score: 75, name: "ç®é»åº ä¸­æ ¹ ä½å®ç¨å°", address: "æ±äº¬é½ç®é»åºä¸­æ ¹1ä¸ç®", size: 105.2, sizeTsubo: 31.8, price: 72000000, tsuboPrice: 226.0, avgTsubo: 235.0, discount: "+3.8%", discountLabel: "ç¸å ´", zoning: "ç¬¬ä¸ç¨®ä½å±¤", coverage: 40, far: 80, maxFloor: 25.5, fitLabel: "â ä¸å¯", hazardFlood: "ä½", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä¸­", hazardScore: "B", demolition: 0, grading: 0, totalCost: 85640000, loanAmount: 85640000, monthlyPayment: 219000, status: "åä»ä¸­", station: "é½ç«å¤§å­¦é§ å¾æ­©8å", source: "SUUMO" as const, propertyNo: "S-20260218-005", scoreDetail: { cheap: 10, fit: 4, loan: 8, demolition: 10, grading: 15, hazard: 12, asset: 12 } },
    { rank: 6, score: 72, name: "ä¸­éåº é·ºå®® åå°", address: "æ±äº¬é½ä¸­éåºé·ºå®®3ä¸ç®", size: 112.5, sizeTsubo: 34.0, price: 52000000, tsuboPrice: 152.9, avgTsubo: 160.0, discount: "+4.4%", discountLabel: "ç¸å ´", zoning: "ç¬¬ä¸ç¨®ä½å±¤", coverage: 50, far: 100, maxFloor: 34.0, fitLabel: "â ä½è£ãã", hazardFlood: "ä½", hazardSlide: "ãªã", hazardTsunami: "ãªã", hazardLiquefaction: "ä½", hazardScore: "A", demolition: 0, grading: 0, totalCost: 65350000, loanAmount: 65350000, monthlyPayment: 167000, status: "åä»ä¸­", station: "é·ºãå®®é§ å¾æ­©7å", source: "REINS" as const, propertyNo: "R-20260218-052", scoreDetail: { cheap: 9, fit: 12, loan: 9, demolition: 10, grading: 15, hazard: 14, asset: 3 } },
    { rank: 7, score: 68, name: "åå·åº å¤§äº ä½å®ç¨å°", address: "æ±äº¬é½åå·åºå¤§äº2ä¸ç®", size: 98.0, sizeTsubo: 29.6, price: 85000000, tsuboPrice: 286.0, avgTsubo: 278.0, discount: "-2.9%", discountLabel: "å²é«", zoning: "ç¬¬ä¸ç¨®ä½å±¤", coverage: 50, far: 100, maxFloor: 29.6, fitLabel: "â ä¸å¯", hazardFlood: "ä¸­", hazardSlide: "ãªã", hazardTsunami: "ä½", hazardLiquefaction: "ä¸­", hazardScore: "C", demolition: 0, grading: 800000, totalCost: 101980000, loanAmount: 101980000, monthlyPayment: 261000, status: "åä»ä¸­", station: "å¤§äºçºé§ å¾æ­©14å", source: "SUUMO" as const, propertyNo: "S-20260218-007", scoreDetail: { cheap: 6, fit: 4, loan: 6, demolition: 10, grading: 12, hazard: 10, asset: 12 } },
    { rank: 8, score: 64, name: "è¶³ç«åº åä½ åå°", address: "æ±äº¬é½è¶³ç«åºåä½æ­çº", size: 165.0, sizeTsubo: 49.9, price: 35000000, tsuboPrice: 70.1, avgTsubo: 75.0, discount: "+6.5%", discountLabel: "å²å®", zoning: "ç¬¬äºç¨®ä½å±", coverage: 60, far: 300, maxFloor: 99.8, fitLabel: "â ä½è£ãã", hazardFlood: "é«", hazardSlide: "ãªã", hazardTsunami: "ä½", hazardLiquefaction: "é«", hazardScore: "D", demolition: 0, grading: 200000, totalCost: 47320000, loanAmount: 47320000, monthlyPayment: 121000, status: "åä»ä¸­", station: "ååä½é§ å¾æ­©18å", source: "REINS" as const, propertyNo: "R-20260218-068", scoreDetail: { cheap: 13, fit: 14, loan: 14, demolition: 10, grading: 13, hazard: 3, asset: 7 } },
  ];

  const scoreColors = (s: number) => s >= 85 ? "#059669" : s >= 70 ? "#2563eb" : s >= 50 ? "#d97706" : "#dc2626";
  const hazardColor = (v: string) => v === "ãªã" || v === "ä½" ? "#059669" : v === "ä¸­" ? "#d97706" : "#dc2626";

  const detail = selectedProperty !== null ? properties.find(p => p.rank === selectedProperty) : null;

  // If viewing a property detail
  if (detail) {
    return (<>
      <ToolHeader title="åå°æ¢ã" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
      <button onClick={() => setSelectedProperty(null)} className="text-sm text-green-600 hover:text-green-800 mb-4 font-bold">â æ¤ç´¢çµæä¸è¦§ã«æ»ã</button>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: detail.source === "SUUMO" ? "#f97316" : "#2563eb" }}>{detail.source}</span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: scoreColors(detail.score) }}>#{detail.rank}</span>
              <h3 className="text-base font-bold text-text-main">{detail.name}</h3>
            </div>
            <p className="text-xs text-text-sub">{detail.address} ï½ {detail.station} ï½ ç©ä»¶No: {detail.propertyNo}</p>
          </div>
          <div className="text-center"><div className="text-3xl font-black" style={{ color: scoreColors(detail.score) }}>{detail.score}</div><p className="text-[10px] text-text-sub">/ 100ç¹</p></div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-5">
          {[{ label: "å²å®åº¦", val: detail.scoreDetail.cheap, max: 15 }, { label: "å»ºç©é©å", val: detail.scoreDetail.fit, max: 15 }, { label: "ã­ã¼ã³", val: detail.scoreDetail.loan, max: 15 }, { label: "è§£ä½", val: detail.scoreDetail.demolition, max: 10 }, { label: "é æ", val: detail.scoreDetail.grading, max: 15 }, { label: "ãã¶ã¼ã", val: detail.scoreDetail.hazard, max: 15 }, { label: "è³ç£æ§", val: detail.scoreDetail.asset, max: 15 }].map((sc, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-lg p-2"><p className="text-[9px] text-text-sub">{sc.label}</p><p className="text-sm font-black" style={{ color: scoreColors(sc.val / sc.max * 100) }}>{sc.val}<span className="text-[9px] text-text-sub font-normal">/{sc.max}</span></p></div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-green-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">åå°ä¾¡æ ¼</p><p className="text-lg font-black text-green-700">Â¥{(detail.price / 10000).toLocaleString()}ä¸</p></div>
          <div className="bg-blue-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">é¢ç©</p><p className="text-lg font-black text-blue-700">{detail.size}ã¡ ({detail.sizeTsubo}åª)</p></div>
          <div className="bg-purple-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">åªåä¾¡</p><p className="text-lg font-black text-purple-700">Â¥{detail.tsuboPrice}ä¸</p><p className="text-[10px] font-bold" style={{ color: detail.discountLabel === "å²å®" ? "#059669" : detail.discountLabel === "å²é«" ? "#dc2626" : "#6b7280" }}>{detail.discount} {detail.discountLabel}</p></div>
          <div className="bg-orange-50 rounded-lg p-3"><p className="text-[10px] text-text-sub">å»ºç©é©å</p><p className="text-lg font-black" style={{ color: detail.fitLabel.startsWith("â") ? "#059669" : detail.fitLabel.startsWith("â³") ? "#d97706" : "#dc2626" }}>{detail.fitLabel}</p><p className="text-[10px] text-text-sub">æå¤§å»¶åº: {detail.maxFloor}åª</p></div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">ãã¶ã¼ãè©ä¾¡ <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: detail.hazardScore === "A" ? "#d1fae5" : detail.hazardScore === "B" ? "#fef3c7" : "#fee2e2", color: detail.hazardScore === "A" ? "#059669" : detail.hazardScore === "B" ? "#d97706" : "#dc2626" }}>ç·å {detail.hazardScore}</span></h4>
          <div className="grid grid-cols-4 gap-3">
            {[{ label: "æ´ªæ°´", val: detail.hazardFlood }, { label: "åç ç½å®³", val: detail.hazardSlide }, { label: "æ´¥æ³¢", val: detail.hazardTsunami }, { label: "æ¶²ç¶å", val: detail.hazardLiquefaction }].map((h, i) => (
              <div key={i} className="text-center rounded-lg p-2 border border-border"><p className="text-[10px] text-text-sub">{h.label}</p><p className="text-sm font-bold" style={{ color: hazardColor(h.val) }}>{h.val}</p></div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border border-border rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-3">ç·äºæ¥­è²»åè¨³</h4>
          <div className="space-y-2">
            {[{ label: "åå°ä¾¡æ ¼", val: detail.price }, { label: "å»ºç©ä¾¡æ ¼ï¼30åªæ³å®ï¼", val: 25000000 }, { label: "è§£ä½è²»", val: detail.demolition }, { label: "é æè²»", val: detail.grading }, { label: "å¤æ§è²»", val: 1500000 }, { label: "è«¸è²»ç¨ï¼7%ï¼", val: Math.round((detail.price + 25000000 + detail.demolition + detail.grading + 1500000) * 0.07) }].map((c, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-text-sub">{c.label}</span><span className="font-bold text-text-main">Â¥{c.val.toLocaleString()}</span></div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2"><span className="text-green-700">ç·äºæ¥­è²»åè¨</span><span className="text-green-700 text-base">Â¥{detail.totalCost.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-xs font-bold mb-2">ä½å®ã­ã¼ã³ã·ãã¥ã¬ã¼ã·ã§ã³ï¼åå©åç­ï¼</h4>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[10px] text-text-sub">åå¥é¡</p><p className="text-sm font-bold text-blue-700">Â¥{detail.loanAmount.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">éå© 0.6% / 35å¹´</p><p className="text-sm font-bold text-blue-700">æé¡ Â¥{detail.monthlyPayment.toLocaleString()}</p></div>
            <div><p className="text-[10px] text-text-sub">ç·è¿æ¸é¡</p><p className="text-sm font-bold text-blue-700">Â¥{(detail.monthlyPayment * 420).toLocaleString()}</p></div>
          </div>
        </div>
        <button className="w-full py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ backgroundColor: detail.source === "SUUMO" ? "#f97316" : "#2563eb" }}>{detail.source === "SUUMO" ? "SUUMOã§è©³ç´°ãè¦ã â" : "ã¬ã¤ã³ãºç©ä»¶ç¢ºèª â"}</button>
      </div>
    </>);
  }

  // Main view: search form + results
  return (<>
    <ToolHeader title="åå°æ¢ã" color="#059669" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div><p className="text-sm font-bold text-green-800">SUUMO Ã ã¬ã¤ã³ãº å¨å½åå°æ¤ç´¢ã¨ã³ã¸ã³</p><p className="text-xs text-green-600">SUUMO + ã¬ã¤ã³ãºåææ¤ç´¢ Ã èªåæ»å® Ã ãã¶ã¼ãè©ä¾¡ Ã ç·äºæ¥­è²»ç®åº</p></div>
    </div>

    {/* Search Form - collapsible after search */}
    <div className="bg-white border border-border rounded-xl mb-6 overflow-hidden">
      <button onClick={() => setShowSearchForm(!showSearchForm)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">ð æ¤ç´¢æ¡ä»¶{hasSearched && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">æ¤ç´¢æ¸ã¿</span>}</h3>
        <span className="text-text-sub text-lg">{showSearchForm ? "â²" : "â¼"}</span>
      </button>
      {showSearchForm && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">äºç®ä¸éï¼ä¸åï¼</label><input type="text" value={sf.budget} onChange={e => uf("budget", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">é½éåºç</label><input type="text" value={sf.pref} onChange={e => uf("pref", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å¸åºçºæ</label><input type="text" value={sf.city} onChange={e => uf("city", e.target.value)} placeholder="ä¾: ä¸ç°è°·åº" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">æå¯é§</label><input type="text" value={sf.station} onChange={e => uf("station", e.target.value)} placeholder="ä¾: è»çªª" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">æ²¿ç·</label><input type="text" value={sf.line} onChange={e => uf("line", e.target.value)} placeholder="ä¾: ä¸­å¤®ç·" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å¾æ­©ï¼åä»¥åï¼</label><input type="text" value={sf.walk} onChange={e => uf("walk", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å»ºç¯æ¡ä»¶</label><select value={sf.kenjo} onChange={e => uf("kenjo", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>æ¡ä»¶ä»ãå«ã</option><option>æ¡ä»¶ãªãã®ã¿</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å­¦åºæå®</label><input type="text" value={sf.school} onChange={e => uf("school", e.target.value)} placeholder="ä»»æ" className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-green-800">å¸æé¢ç©ï¼ã©ã¡ããå¿é ï¼</span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">å¿é </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] text-text-sub block mb-1">å¸æé¢ç©ï¼ã¡ï¼</label>
                <input type="text" value={searchAreaM2} onChange={(e) => handleM2Change(e.target.value)} placeholder="ä¾: 100" className={`w-full px-3 py-2 border rounded-lg text-sm ${areaError ? "border-red-400 bg-red-50" : "border-border"}`} />
              </div>
              <div>
                <label className="text-[10px] text-text-sub block mb-1">å¸æé¢ç©ï¼åªæ°ï¼</label>
                <input type="text" value={searchAreaTsubo} onChange={(e) => handleTsuboChange(e.target.value)} placeholder="ä¾: 30" className={`w-full px-3 py-2 border rounded-lg text-sm ${areaError ? "border-red-400 bg-red-50" : "border-border"}`} />
              </div>
              <div className="col-span-2 flex items-end"><p className="text-[10px] text-green-700">â» ã©ã¡ããä¸æ¹ãå¥åããã¨èªåæç®ããã¾ãï¼1åª â 3.306ã¡ï¼</p></div>
            </div>
            {areaError && <p className="text-xs text-red-500 mt-2 font-bold">{areaError}</p>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><label className="text-[10px] text-text-sub block mb-1">åå°é¢ç©ï¼åªï¼ä¸é</label><input type="text" value={sf.tsuboMin} onChange={e => uf("tsuboMin", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">åå°é¢ç©ï¼åªï¼ä¸é</label><input type="text" value={sf.tsuboMax} onChange={e => uf("tsuboMax", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">è¾²å°å«ã</label><select value={sf.nochi} onChange={e => uf("nochi", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>å«ã</option><option>å«ã¾ãªã</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">èª¿æ´åºåå«ã</label><select value={sf.chosei} onChange={e => uf("chosei", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>å«ã</option><option>å«ã¾ãªã</option></select></div>
          </div>

          <h4 className="text-xs font-bold text-text-main mt-5 mb-3 border-t border-border pt-4">å»ºç©ãã©ã³ã»è³éè¨ç»</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="text-[10px] text-text-sub block mb-1">å¸æå»ºç©åªæ°</label><input type="text" value={sf.buildTsubo} onChange={e => uf("buildTsubo", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å»ºç©ã¿ã¤ã</label><select value={sf.buildType} onChange={e => uf("buildType", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"><option>2éå»ºã¦</option><option>3éå»ºã¦</option><option>å¹³å±</option></select></div>
            <div><label className="text-[10px] text-text-sub block mb-1">å»ºç©äºç®ï¼ä¸åï¼</label><input type="text" value={sf.buildBudget} onChange={e => uf("buildBudget", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">ã­ã¼ã³éå©ï¼%ï¼</label><input type="text" value={sf.rate} onChange={e => uf("rate", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div><label className="text-[10px] text-text-sub block mb-1">åå¥å¹´æ°</label><input type="text" value={sf.years} onChange={e => uf("years", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-text-sub block mb-1">é ­éï¼ä¸åï¼</label><input type="text" value={sf.down} onChange={e => uf("down", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSearch} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors text-base shadow-lg">ð æ¤ç´¢ï¼AIäºæ¥­æ§åæï¼</button>
            <button onClick={openSuumo} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors text-base shadow-lg">ð  SUUMOã§{sf.pref}ã®åå°ãæ¢ã â</button>
          </div>
          <p className="text-center text-[10px] text-text-sub mt-2">SUUMOã®{sf.pref}åå°ä¸è¦§ãã¼ã¸ãæ°ããã¿ãã§éãã¾ã ï½ AIåæã¯ããã·ã¥ãã¼ãåã«è¡¨ç¤ºããã¾ã</p>
        </div>
      )}
    </div>

    {/* Loading overlay */}
    {isSearching && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-5" />
          <h3 className="text-lg font-bold text-text-main mb-4 text-center">SUUMO Ã ã¬ã¤ã³ãº åææ¤ç´¢ä¸­...</h3>
          <div className="space-y-3">
            {["SUUMO ãã¼ã¿ãã¼ã¹æ¥ç¶", "ã¬ã¤ã³ãº ä¸åç£æµéæ¨æºæå ±ã·ã¹ãã æ¥ç¶", "æ¡ä»¶ãããã³ã°å®è¡ï¼852ä»¶ã¹ã­ã£ã³ï¼", "ãã¶ã¼ããããç§å", "äºæ¥­æ§ã¹ã³ã¢ç®åº", "AIæé©ã©ã³ã­ã³ã°çæ"].map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{searchStep > i + 1 ? "â" : searchStep === i + 1 ? "â³" : "â­"}</span>
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
            <span className="text-3xl">ð </span>
            <div>
              <h3 className="text-lg font-bold text-orange-800">SUUMOã®æ¤ç´¢çµæã¯æ°ããã¿ãã§è¡¨ç¤ºä¸­</h3>
              <p className="text-xs text-orange-700">SUUMOã¿ãã§æ¬ç©ã®ç©ä»¶æå ±ããç¢ºèªãã ãã ï½ ä»¥ä¸ã¯AIã«ããäºæ¥­æ§åæãµã³ãã«ã§ã</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={openSuumo} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors">ð  SUUMOã§{sf.pref}ã®åå°ãæ¢ã â</button>
          </div>
        </div>

        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">ð</span>
            <div>
              <h3 className="text-lg font-bold text-green-800">AIäºæ¥­æ§åæï¼åèãã¼ã¿ï¼â {properties.length}ä»¶</h3>
              <p className="text-xs text-green-700">å¸æé¢ç©: {searchAreaTsubo}åªï¼{searchAreaM2}ã¡ï¼ ï½ {sf.pref} ï½ ã¹ã³ã¢é ã«è¡¨ç¤º</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "æ¤ç´¢ãããæ°", value: `${properties.length}ä»¶`, color: "#059669", bg: "#d1fae5" },
              { label: "æé«ã¹ã³ã¢", value: "92ç¹", color: "#2563eb", bg: "#dbeafe" },
              { label: "SUUMOç©ä»¶", value: `${properties.filter(p => p.source === "SUUMO").length}ä»¶`, color: "#f97316", bg: "#ffedd5" },
              { label: "ã¬ã¤ã³ãºç©ä»¶", value: `${properties.filter(p => p.source === "REINS").length}ä»¶`, color: "#2563eb", bg: "#dbeafe" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: s.bg }}><p className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
            ))}
          </div>
        </div>

        {/* AI judgment */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-green-800 mb-3">AIäºæ¥­æ§å¤å®</h3>
          <div className="space-y-2 text-xs text-green-900">
            <p><span className="font-bold">æ¨å¥¨ç©ä»¶:</span> æä¸¦åº æç°æ±ï¼92ç¹/SUUMOï¼â å²å®ç+10.5%ãå»ºç©30åªãä½è£ã§éç½®å¯è½ããã¶ã¼ãAè©ä¾¡ãç·äºæ¥­è²»5,970ä¸åã§æé¡è¿æ¸15.3ä¸åã¨è² æãé©æ­£ã</p>
            <p><span className="font-bold">æ¬¡ç¹:</span> ç·´é¦¬åº è±çåï¼88ç¹/ã¬ã¤ã³ãºï¼â ç·äºæ¥­è²»ã4,974ä¸åãæ´ªæ°´ãªã¹ã¯ãä¸­ãã ããè¿æ¸è² æã¯è»½ãã</p>
            <p><span className="font-bold">ã³ã¹ãæå¼·:</span> è¶³ç«åº åä½ï¼64ç¹/ã¬ã¤ã³ãºï¼â æå®3,500ä¸åã§49.9åªã®åºãããã ããã¶ã¼ãDè©ä¾¡ã®ããè¦æ¤è¨ã</p>
          </div>
        </div>

        {/* Property cards */}
        <h3 className="text-sm font-bold text-text-main mb-3">ç©ä»¶ä¸è¦§ï¼ã¹ã³ã¢é ï¼</h3>
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: p.discountLabel === "å²å®" ? "#d1fae5" : p.discountLabel === "å²é«" ? "#fee2e2" : "#f3f4f6", color: p.discountLabel === "å²å®" ? "#059669" : p.discountLabel === "å²é«" ? "#dc2626" : "#6b7280" }}>{p.discountLabel} {p.discount}</span>
                    </div>
                    <p className="text-[10px] text-text-sub mt-0.5">{p.address} ï½ {p.station}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-text-sub">
                      <span>{p.size}ã¡ ({p.sizeTsubo}åª)</span>
                      <span>Â¥{(p.price / 10000).toLocaleString()}ä¸</span>
                      <span>åª{p.tsuboPrice}ä¸</span>
                      <span className="font-bold" style={{ color: p.fitLabel.startsWith("â") ? "#059669" : p.fitLabel.startsWith("â³") ? "#d97706" : "#dc2626" }}>{p.fitLabel}</span>
                      <span>ãã¶ã¼ã{p.hazardScore}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-sub">ç·äºæ¥­è²»</p>
                  <p className="text-sm font-bold text-text-main">Â¥{(p.totalCost / 10000).toLocaleString()}ä¸</p>
                  <p className="text-[10px] text-text-sub">æé¡ Â¥{p.monthlyPayment.toLocaleString()}</p>
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

  const prefectures = ["all", "å½ï¼å¨å½å±éï¼", "åæµ·é", "éæ£®ç", "å²©æç", "å®®åç", "ç§ç°ç", "å±±å½¢ç", "ç¦å³¶ç", "è¨åç", "æ æ¨ç", "ç¾¤é¦¬ç", "å¼çç", "åèç", "æ±äº¬é½", "ç¥å¥å·ç", "æ°æ½ç", "å¯å±±ç", "ç³å·ç", "ç¦äºç", "å±±æ¢¨ç", "é·éç", "å²éç", "éå²¡ç", "æç¥ç", "ä¸éç", "æ»è³ç", "äº¬é½åº", "å¤§éªåº", "åµåº«ç", "å¥è¯ç", "åæ­å±±ç", "é³¥åç", "å³¶æ ¹ç", "å²¡å±±ç", "åºå³¶ç", "å±±å£ç", "å¾³å³¶ç", "é¦å·ç", "æåªç", "é«ç¥ç", "ç¦å²¡ç", "ä½è³ç", "é·å´ç", "çæ¬ç", "å¤§åç", "å®®å´ç", "é¹¿åå³¶ç", "æ²ç¸ç"];

  // Comprehensive municipality data for all 47 prefectures
  const municipalityData: Record<string, string[]> = {
    "åæµ·é": ["æ­å¹å¸ä¸­å¤®åº", "æ­å¹å¸ååº", "æ­å¹å¸æ±åº", "æ­å¹å¸ç½ç³åº", "æ­å¹å¸è±å¹³åº", "æ­å¹å¸ååº", "æ­å¹å¸è¥¿åº", "æ­å¹å¸åå¥åº", "æ­å¹å¸æç¨²åº", "æ­å¹å¸æ¸ç°åº", "å½é¤¨å¸", "å°æ¨½å¸", "æ­å·å¸", "å®¤è­å¸", "é§è·¯å¸", "å¸¯åºå¸", "åè¦å¸", "å¤å¼µå¸", "å²©è¦æ²¢å¸", "ç¶²èµ°å¸", "çèå¸", "è«å°ç§å¸", "ç¨åå¸", "ç¾åå¸", "è¦å¥å¸", "æ±å¥å¸", "èµ¤å¹³å¸", "ç´å¥å¸", "å£«å¥å¸", "åå¯å¸", "ä¸ç¬ å¸", "æ ¹å®¤å¸", "åæ­³å¸", "æ»å·å¸", "ç å·å¸", "æ­å¿åå¸", "æ·±å·å¸", "å¯è¯éå¸", "ç»å¥å¸", "æµåº­å¸", "ä¼éå¸", "ååºå³¶å¸", "ç³ç©å¸", "åæå¸", "å½å¥çº", "æ°ç¯ æ´¥çº", "åå¹çº", "æå½¢çº", "é·æ²¼çº", "ç±ä»çº", "æ å±±çº", "å¤å¼µé¡", "å²©æç°çº", "ç¾åå¸", "ä¸ç å·çº", "åå¯è¯éçº", "å å æ", "åå¯çº", "å£æ·µçº", "ä¸å·çº", "ç¾æ·±çº", "é³å¨å­åºæ", "ä¸­å·çº", "è±å¯çº", "å¹å»¶çº", "å°æ¸æ°´çº", "æ¸éçº", "è¨å­åºçº", "ç½®æ¸çº", "å¸¸åçº", "ä½åéçº", "é è»½çº", "æ¹§å¥çº", "ä¸æ¹§å¥çº", "è«åçº", "ç¾½å¹çº", "åå±±å¥æ", "å¤©å¡©çº", "ç¿ææ", "æµé å¥çº", "ä¸­é å¥çº", "æå¹¸çº", "è±é çº", "å©å°»çº", "å©å°»å¯å£«çº", "ç¤¼æçº", "å¢æ¯çº", "çèå¸", "å°å¹³çº", "è«å°ç§å¸", "ç½èçº", "åççº", "å®å¹³çº", "ãããçº", "æ¥é«çº", "å¹³åçº", "æ°å çº", "æµ¦æ²³çº", "æ§ä¼¼çº", "ãããçº", "æ°ã²ã ãçº", "è¶³å¯çº", "é¸å¥çº", "æ¬å¥çº", "å¤§æ¨¹çº", "åºå°¾çº", "å¹å¥çº", "æ± ç°çº", "è±é çº", "é³æ´çº", "å£«å¹çº", "ä¸å£«å¹çº", "é¹¿è¿½çº", "æ°å¾çº", "æ¸æ°´çº", "è½å®¤çº", "ä¸­æ­åæ", "æ´å¥æ", "å¤§ç©ºçº", "æ±ç¥æ¥½çº", "å½éº»çº", "æ¯å¸çº", "æå¥çº", "ä¸å·çº", "æ±å·çº", "ç¾ççº", "åå¯è¯éçº", "ä¸­å¯è¯éçº", "ç²¾è¯çº", "ä¸å¯è¯éçº", "ä¸­å±±çº", "å¢æ¯çº", "é¨ç«çº", "æ²¼ç°çº", "åç«çº", "ç§©ç¶å¥çº", "å¦¹èççº", "æ±é åçº"],
    "éæ£®ç": ["éæ£®å¸", "å¼åå¸", "å«æ¸å¸", "é»ç³å¸", "äºæå·åå¸", "ååç°å¸", "ä¸æ²¢å¸", "ãã¤å¸", "å¹³å·å¸", "å¹³åçº", "ä»å¥çº", "è¬ç°æ", "å¤ã¶æµçº", "é¶´ç°çº", "ä¸­æ³çº", "éè¾ºå°çº", "ä¸æ¸çº", "å¡ãçº", "æ±åçº", "ããããçº", "å¤§éçº", "æ±éæ", "é¢¨éæµ¦æ", "ä½äºæ"],
    "å²©æç": ["çå²¡å¸", "å®®å¤å¸", "å¤§è¹æ¸¡å¸", "è±å·»å¸", "åä¸å¸", "ä¹æå¸", "é éå¸", "ä¸é¢å¸", "é¸åé«ç°å¸", "éç³å¸", "äºæ¸å¸", "å«å¹¡å¹³å¸", "å¥¥å·å¸", "æ»æ²¢å¸", "é«ç³çº", "èå·»çº", "å²©æçº", "ç´«æ³¢çº", "ç¢å·¾çº", "è¥¿åè³çº", "å¹³æ³çº", "å¤§æ§çº", "å±±ç°çº", "å²©æ³çº", "ç°éçæ", "æ®ä»£æ", "è»½ç±³çº", "éç°æ", "ä¹æ¸æ"],
    "å®®åç": ["ä»å°å¸éèåº", "ä»å°å¸å®®åéåº", "ä»å°å¸è¥æåº", "ä»å°å¸å¤ªç½åº", "ä»å°å¸æ³åº", "ç³å·»å¸", "å¡©ç«å¸", "æ°ä»æ²¼å¸", "ç½ç³å¸", "ååå¸", "è§ç°å¸", "å¤è³åå¸", "å²©æ²¼å¸", "ç»ç±³å¸", "æ åå¸", "æ±æ¾å³¶å¸", "å¤§å´å¸", "å¯è°·å¸", "èç°çº", "å©åºçº", "å¤§åçº", "å¤§é·çº", "å¤§è¡¡æ", "è²éº»çº", "å ç¾çº", "æ¶è°·çº", "ç¾éçº", "å¥³å·çº", "åä¸é¸çº"],
    "ç§ç°ç": ["ç§ç°å¸", "è½ä»£å¸", "æ¨ªæå¸", "å¤§é¤¨å¸", "ç·é¹¿å¸", "æ¹¯æ²¢å¸", "é¹¿è§å¸", "ç±å©æ¬èå¸", "æ½ä¸å¸", "å¤§ä»å¸", "åç§ç°å¸", "ã«ãã»å¸", "ä»åå¸", "å°åçº", "ä¸å°é¿ä»æ", "èæ²¢çº", "ä¸ç¨®çº", "å«å³°çº", "äºåç®çº", "å«éæ½çº", "äºå·çº", "å¤§æ½æ"],
    "å±±å½¢ç": ["å±±å½¢å¸", "ç±³æ²¢å¸", "é¶´å²¡å¸", "éç°å¸", "æ°åºå¸", "å¯æ²³æ±å¸", "ä¸å±±å¸", "æå±±å¸", "é·äºå¸", "å¤©ç«¥å¸", "æ±æ ¹å¸", "å°¾è±æ²¢å¸", "åé½å¸", "å±±è¾ºçº", "ä¸­å±±çº", "æ²³åçº", "å¤§æ±çº", "å¤§ç³ç°çº", "éå±±çº", "æä¸çº", "èå½¢çº", "çå®¤å·çº", "å¤§èµæ", "é®­å·æ", "æ¸æ²¢æ", "é«ç çº", "å·è¥¿çº", "å°å½çº", "ç½é·¹çº", "é£¯è±çº"],
    "ç¦å³¶ç": ["ç¦å³¶å¸", "ä¼æ´¥è¥æ¾å¸", "é¡å±±å¸", "ãããå¸", "ç½æ²³å¸", "é è³å·å¸", "åå¤æ¹å¸", "ç¸é¦¬å¸", "äºæ¬æ¾å¸", "ç°æå¸", "åç¸é¦¬å¸", "ä¼éå¸", "æ¬å®®å¸", "ç¢å¹çº", "æ£åçº", "ç¢ç¥­çº", "å¡çº", "é®«å·æ", "ç³å·çº", "çå·æ", "å¹³ç°æ", "æµå·çº", "å¤æ®¿çº", "ä¸æ¥çº", "å°éçº", "åºéçº", "æ¥¢èçº", "å¯å²¡çº", "å·åæ", "å¤§ççº", "åèçº", "æµªæ±çº", "èå°¾æ", "æ°å°çº", "é£¯èæ", "ä¼æ´¥åä¸çº", "æ¹¯å·æ", "æ³æ´¥çº", "ä¸å³¶çº", "éå±±çº", "æ­åæ", "ä¼æ´¥ç¾éçº", "ä¸é·çº", "æªæå²æ", "åªè¦çº", "åä¼æ´¥çº", "çªèä»£çº", "ä¼æ´¥è¥æ¾å¸", "åå¡©åæ", "è¥¿ä¼æ´¥çº"],
    "è¨åç": ["æ°´æ¸å¸", "æ¥ç«å¸", "åæµ¦å¸", "å¤æ²³å¸", "ç³å²¡å¸", "çµåå¸", "é¾ã±å´å¸", "ä¸å¦»å¸", "å¸¸ç·å¸", "å¸¸é¸å¤ªç°å¸", "é«è©å¸", "åè¨åå¸", "ç¬ éå¸", "åæå¸", "çä¹å¸", "ã¤ãã°å¸", "ã²ãã¡ãªãå¸", "è¨åçº", "å¤§æ´çº", "åéçº", "æ±æµ·æ", "é£ççº", "é¾ç°å¸", "æ½®æ¥å¸", "ç¾æµ¦æ", "é¿è¦çº", "å©æ ¹çº", "ç¨²æ·å¸", "ç¨²æ·çº", "ç¥æ å¸", "è¡æ¹å¸", "é¹¿å¶å¸", "ããã¿ãããå¸", "æ¡å·å¸", "å°ç¾çå¸", "åæ±å¸"],
    "æ æ¨ç": ["å®é½å®®å¸", "è¶³å©å¸", "æ æ¨å¸", "ä½éå¸", "é¹¿æ²¼å¸", "æ¥åå¸", "å°å±±å¸", "çå²¡å¸", "å¤§ç°åå¸", "ç¢æ¿å¸", "é£é å¡©åå¸", "ãããå¸", "é£é çå±±å¸", "ä¸éå¸", "ä¸ä¸å·çº", "çå­çº", "èæ¨çº", "å¸è²çº", "è³è³çº", "å£¬ççº", "éæ¨çº", "å¡©è°·çº", "é«æ ¹æ²¢çº", "é£é çº", "é£çå·çº"],
    "ç¾¤é¦¬ç": ["åæ©å¸", "é«å´å¸", "æ¡çå¸", "ä¼å¢å´å¸", "å¤ªç°å¸", "æ²¼ç°å¸", "é¤¨æå¸", "æ¸å·å¸", "è¤å²¡å¸", "å¯å²¡å¸", "å®ä¸­å¸", "ã¿ã©ãå¸", "æ¦æ±æ", "åè³çº", "ä¸éæ", "ç¥æµçº", "ä¸ä»ç°çº", "åç§æ", "çæ¥½çº", "ä¸­ä¹æ¡çº", "é·éåçº", "å¬¬ææ", "èæ´¥çº", "é«å±±æ", "æ±å¾å¦»çº", "çåæ", "å·å ´æ", "æ­åæ", "ã¿ãªãã¿çº", "çæçº", "æ¿åçº", "æåçº", "åä»£ç°çº", "å¤§æ³çº", "éæ¥½çº"],
    "å¼çç": ["ãããã¾å¸è¥¿åº", "ãããã¾å¸ååº", "ãããã¾å¸å¤§å®®åº", "ãããã¾å¸è¦æ²¼åº", "ãããã¾å¸ä¸­å¤®åº", "ãããã¾å¸æ¡åº", "ãããã¾å¸æµ¦ååº", "ãããã¾å¸ååº", "ãããã¾å¸ç·åº", "ãããã¾å¸å²©æ§»åº", "å·è¶å¸", "çè°·å¸", "å·å£å¸", "è¡ç°å¸", "ç§©ç¶å¸", "ææ²¢å¸", "é£¯è½å¸", "å é å¸", "æ¬åºå¸", "æ±æ¾å±±å¸", "æ¥æ¥é¨å¸", "ç­å±±å¸", "ç¾½çå¸", "é¶´ã¶å³¶å¸", "è¶è°·å¸", "è¨å¸", "æ¸ç°å¸", "å¥éå¸", "æéå¸", "å¿æ¨å¸", "ååå¸", "æ°åº§å¸", "æ¡¶å·å¸", "ä¹åå¸", "åæ¬å¸", "å«æ½®å¸", "å¯å£«è¦å¸", "ä¸é·å¸", "è®ç°å¸", "åæ¸å¸", "å¹¸æå¸", "é¶´ã¶å³¶å¸", "æ¥é«å¸", "åå·å¸", "ãµãã¿éå¸", "ç½å²¡å¸", "ä¼å¥çº", "ä¸è³çº", "æ¯åå±±çº", "è¶ççº", "æ»å·çº", "åµå±±çº", "å°å·çº", "å·å³¶çº", "åè¦çº", "é³©å±±çº", "ã¨ãããçº", "æ±ç§©ç¶æ", "ç¾éçº", "ç¥å·çº", "ä¸éçº", "å¯å±çº"],
    "åèç": ["åèå¸ä¸­å¤®åº", "åèå¸è±è¦å·åº", "åèå¸ç¨²æ¯åº", "åèå¸è¥èåº", "åèå¸ç·åº", "åèå¸ç¾æµåº", "éå­å¸", "å¸å·å¸", "è¹æ©å¸", "é¤¨å±±å¸", "æ¨æ´æ´¥å¸", "æ¾æ¸å¸", "éç°å¸", "èåå¸", "æç°å¸", "ä½åå¸", "æ±éå¸", "æ­å¸", "ç¿å¿éå¸", "æå¸", "åæµ¦å¸", "å¸åå¸", "æµå±±å¸", "å«åä»£å¸", "æå­«å­å¸", "é´¨å·å¸", "éã±è°·å¸", "åç³å¸", "é¦åå¸", "å±±æ­¦å¸", "ããã¿å¸", "å¤§å¤åçº", "å¾¡å®¿çº", "ä¹åä¹éçº", "èå±±çº", "æ¨ªèåçº", "ä¸å®®çº", "ç¦æ²¢çº", "é·åçº", "ç½å­çº", "é·çæ", "é·æçº", "é·åçº"],
    "æ±äº¬é½": ["åä»£ç°åº", "ä¸­å¤®åº", "æ¸¯åº", "æ°å®¿åº", "æäº¬åº", "å°æ±åº", "å¢¨ç°åº", "æ±æ±åº", "åå·åº", "ç®é»åº", "å¤§ç°åº", "ä¸ç°è°·åº", "æ¸è°·åº", "ä¸­éåº", "æä¸¦åº", "è±å³¶åº", "ååº", "èå·åº", "æ¿æ©åº", "ç·´é¦¬åº", "è¶³ç«åº", "èé£¾åº", "æ±æ¸å·åº", "å«çå­å¸", "ç«å·å¸", "æ­¦èµéå¸", "ä¸é·¹å¸", "éæ¢å¸", "åºä¸­å¸", "æ­å³¶å¸", "èª¿å¸å¸", "çºç°å¸", "å°éäºå¸", "å°å¹³å¸", "æ¥éå¸", "æ±æå±±å¸", "å½åå¯ºå¸", "å½ç«å¸", "ç¦çå¸", "çæ±å¸", "æ±å¤§åå¸", "æ¸ç¬å¸", "æ±ä¹çç±³å¸", "æ­¦èµæå±±å¸", "å¤æ©å¸", "ç¨²åå¸", "ç¾½æå¸", "ãããéå¸", "è¥¿æ±äº¬å¸", "çç©çº", "æ¥ã®åºçº", "æªåæ", "å¥¥å¤æ©çº"],
    "ç¥å¥å·ç": ["æ¨ªæµå¸é¶´è¦åº", "æ¨ªæµå¸ç¥å¥å·åº", "æ¨ªæµå¸è¥¿åº", "æ¨ªæµå¸ä¸­åº", "æ¨ªæµå¸ååº", "æ¨ªæµå¸æ¸¯ååº", "æ¨ªæµå¸ä¿åã±è°·åº", "æ¨ªæµå¸æ­åº", "æ¨ªæµå¸ç£¯å­åº", "æ¨ªæµå¸éæ²¢åº", "æ¨ªæµå¸æ¸¯ååº", "æ¨ªæµå¸ç·åº", "æ¨ªæµå¸éèåº", "æ¨ªæµå¸é½ç­åº", "å·å´å¸å·å´åº", "å·å´å¸å¹¸åº", "å·å´å¸ä¸­ååº", "å·å´å¸é«æ´¥åº", "å·å´å¸å¤æ©åº", "å·å´å¸å®®ååº", "å·å´å¸éº»çåº", "ç¸æ¨¡åå¸ç·åº", "ç¸æ¨¡åå¸ä¸­å¤®åº", "ç¸æ¨¡åå¸ååº", "æ¨ªé è³å¸", "å¹³å¡å¸", "éåå¸", "è¤æ²¢å¸", "å°ç°åå¸", "èã¶å´å¸", "éå­å¸", "ä¸æµ¦å¸", "ç§¦éå¸", "åæ¨å¸", "å¤§åå¸", "ä¼å¢åå¸", "æµ·èåå¸", "åº§éå¸", "åè¶³æå¸", "ç¶¾ç¬å¸", "èå±±çº", "å¯å·çº", "å¤§ç£¯çº", "äºå®®çº", "ä¸­äºçº", "å¤§äºçº", "æ¾ç°çº", "å±±åçº", "éæçº", "ç®±æ ¹çº", "çé¶´çº", "æ¹¯æ²³åçº", "æå·çº", "æ¸å·æ"],
    "æ°æ½ç": ["æ°æ½å¸ååº", "æ°æ½å¸æ±åº", "æ°æ½å¸ä¸­å¤®åº", "æ°æ½å¸æ±ååº", "æ°æ½å¸ç§èåº", "æ°æ½å¸ååº", "æ°æ½å¸è¥¿åº", "æ°æ½å¸è¥¿è²åº", "é·å²¡å¸", "ä¸æ¡å¸", "æå´å¸", "æ°çºç°å¸", "å°åè°·å¸", "å èå¸", "åæ¥çºå¸", "è¦éå¸", "æä¸å¸", "çå¸", "ç³¸é­å·å¸", "å¦é«å¸", "äºæ³å¸", "ä¸è¶å¸", "é¿è³éå¸", "ä½æ¸¡å¸", "é­æ²¼å¸", "åé­æ²¼å¸", "èåå¸", "èç± çº", "å¼¥å½¦æ", "ç°ä¸çº", "é¿è³çº", "åºé²å´çº", "æ¹¯æ²¢çº", "æ´¥åçº", "åç¾½æ"],
    "å¯å±±ç": ["å¯å±±å¸", "é«å²¡å¸", "é­æ´¥å¸", "æ°·è¦å¸", "æ»å·å¸", "é»é¨å¸", "ç ºæ³¢å¸", "å°æ¾å³¶å¸", "åç ºå¸", "å°æ°´å¸", "èæ©æ", "ä¸å¸çº", "ç«å±±çº", "å¥åçº", "ææ¥çº"],
    "ç³å·ç": ["éæ²¢å¸", "ä¸å°¾å¸", "å°æ¾å¸", "è¼ªå³¶å¸", "ç æ´²å¸", "å è³å¸", "ç¾½åå¸", "ãã»ãå¸", "ç½å±±å¸", "è½ç¾å¸", "éãå¸å¸", "å·åçº", "æ´¥å¹¡çº", "åççº", "å¿è³çº", "å®éå¿æ°´çº", "ä¸­è½ç»çº"],
    "ç¦äºç": ["ç¦äºå¸", "æ¦è³å¸", "å°æµå¸", "å¤§éå¸", "åå±±å¸", "é¯æ±å¸", "ãããå¸", "è¶åå¸", "åäºå¸", "æ°¸å¹³å¯ºçº", "æ± ç°çº", "åè¶åçº", "è¶åçº", "é«æµçº", "ãããçº", "è¥ç­çº"],
    "å±±æ¢¨ç": ["ç²åºå¸", "å¯å£«åç°å¸", "é½çå¸", "å±±æ¢¨å¸", "å¤§æå¸", "é®å´å¸", "åã¢ã«ãã¹å¸", "åæå¸", "ç²æå¸", "ç¬å¹å¸", "ç²å·å¸", "ä¸­å¤®å¸", "å¸å·ä¸é·çº", "æ©å·çº", "èº«å»¶çº", "åé¨çº", "å¯å£«å·çº", "æ­åçº", "éå¿æ", "è¥¿æ¡çº", "å¿éæ", "å±±ä¸­æ¹æ", "å¯å£«æ²³å£æ¹çº", "å°èæ", "ä¸¹æ³¢å±±æ"],
    "é·éç": ["é·éå¸", "æ¾æ¬å¸", "ä¸ç°å¸", "å²¡è°·å¸", "é£¯ç°å¸", "è«è¨ªå¸", "é åå¸", "å°è«¸å¸", "ä¼é£å¸", "é§ã¶æ ¹å¸", "ä¸­éå¸", "å¤§çºå¸", "é£¯å±±å¸", "èéå¸", "å¡©å°»å¸", "ä½ä¹å¸", "åæ²å¸", "æ±å¾¡å¸", "å®æéå¸", "å°æµ·çº", "å·ä¸æ", "åç§æ", "åç¸æ¨æ", "ä½ä¹ç©çº", "è»½äºæ²¢çº", "å¾¡ä»£ç°çº", "ç«ç§çº", "éæ¨æ", "é·åçº", "ä¸è«è¨ªçº", "å¯å£«è¦çº", "åæ", "è¾°éçº", "ç®è¼ªçº", "é£¯å³¶çº", "åç®è¼ªæ", "ä¸­å·æ", "æ¾å·çº", "é«æ£®çº", "é¿åçº", "é¿æºæ", "å¹³è°·æ", "æ ¹ç¾½æ", "ä¸æ¢æ", "å£²æ¨æ", "å¤©é¾æ", "æ³°éæ", "å¬æ¨æ", "è±ä¸æ", "å¤§é¹¿æ", "ä¸æ¾çº", "åæ¨æ½çº", "æ¨ç¥æ", "çæ»æ", "éç°é«åçº", "æ¨æ½çº", "éº»ç¸¾æ", "çåæ", "å±±å½¢æ", "ææ¥æ", "ç­åæ", "æ± ç°çº", "æ¾å·æ", "ç½é¦¬æ", "å°è°·æ"],
    "å²éç": ["å²éå¸", "å¤§å£å¸", "é«å±±å¸", "å¤æ²»è¦å¸", "é¢å¸", "ä¸­æ´¥å·å¸", "ç¾æ¿å¸", "çæµªå¸", "ç¾½å³¶å¸", "æµé£å¸", "ç¾æ¿å èå¸", "åå²å¸", "åååå¸", "å¯åå¸", "å±±çå¸", "çç©å¸", "é£é¨¨å¸", "æ¬å·£å¸", "é¡ä¸å¸", "ä¸åå¸", "æµ·æ´¥å¸", "å²åçº", "ç¬ æ¾çº", "é¤èçº", "åäºçº", "é¢ã¶åçº", "ç¥æ¸çº", "è¼ªä¹åçº", "å®å«çº", "ææå·çº", "å¤§éçº", "æ± ç°çº", "åæ¹çº", "åç¥çº", "å¯å çº", "å·è¾ºçº", "ä¸å®çº", "å«ç¾æ´¥çº", "ç½å·çº", "æ±ç½å·æ"],
    "éå²¡ç": ["éå²¡å¸èµåº", "éå²¡å¸é§¿æ²³åº", "éå²¡å¸æ¸æ°´åº", "æµæ¾å¸ä¸­å¤®åº", "æµæ¾å¸æ±åº", "æµæ¾å¸è¥¿åº", "æµæ¾å¸ååº", "æµæ¾å¸ååº", "æµæ¾å¸æµååº", "æµæ¾å¸å¤©ç«åº", "æ²¼æ´¥å¸", "ç±æµ·å¸", "ä¸å³¶å¸", "å¯å£«å®®å¸", "ä¼æ±å¸", "å³¶ç°å¸", "å¯å£«å¸", "ç¼æ´¥å¸", "æå·å¸", "è¤æå¸", "å¾¡æ®¿å ´å¸", "è¢äºå¸", "ä¸ç°å¸", "è£¾éå¸", "æ¹è¥¿å¸", "ä¼è±å¸", "å¾¡åå´å¸", "èå·å¸", "ä¼è±ã®å½å¸", "ç§ä¹åå¸", "æ±ä¼è±çº", "æ²³æ´¥çº", "åä¼è±çº", "æ¾å´çº", "è¥¿ä¼è±çº", "å½åçº", "æ¸æ°´çº", "é·æ³çº", "å°å±±çº", "åç°çº", "å·æ ¹æ¬çº"],
    "æç¥ç": ["åå¤å±å¸åç¨®åº", "åå¤å±å¸æ±åº", "åå¤å±å¸ååº", "åå¤å±å¸è¥¿åº", "åå¤å±å¸ä¸­æåº", "åå¤å±å¸ä¸­åº", "åå¤å±å¸æ­ååº", "åå¤å±å¸çç©åº", "åå¤å±å¸ç±ç°åº", "åå¤å±å¸ä¸­å·åº", "åå¤å±å¸æ¸¯åº", "åå¤å±å¸ååº", "åå¤å±å¸å®å±±åº", "åå¤å±å¸ç·åº", "åå¤å±å¸åæ±åº", "åå¤å±å¸å¤©ç½åº", "è±æ©å¸", "å²¡å´å¸", "ä¸å®®å¸", "ç¬æ¸å¸", "åç°å¸", "æ¥æ¥äºå¸", "è±å·å¸", "æ´¥å³¶å¸", "ç¢§åå¸", "åè°·å¸", "è±ç°å¸", "å®åå¸", "è¥¿å°¾å¸", "è²é¡å¸", "ç¬å±±å¸", "å¸¸æ»å¸", "æ±åå¸", "å°ç§å¸", "ç¨²æ²¢å¸", "æ°åå¸", "æ±æµ·å¸", "å¤§åºå¸", "ç¥å¤å¸", "ç¥ç«å¸", "å°¾å¼µæ­å¸", "é«æµå¸", "å²©åå¸", "è±æå¸", "æ¥é²å¸", "æ¸é å¸", "ååå¤å±å¸", "å¼¥å¯å¸", "ã¿ããå¸", "ãã¾å¸", "é·ä¹æå¸", "æ±é·çº", "è±å±±çº", "å¤§å£çº", "æ¶æ¡çº", "å¤§æ²»çº", "è¹æ±çº", "é£å³¶æ", "é¿ä¹æ¯çº", "æ±æµ¦çº", "åç¥å¤çº", "ç¾æµçº", "æ­¦è±çº"],
    "ä¸éç": ["æ´¥å¸", "åæ¥å¸å¸", "ä¼æ´¥å¸", "æ¾éªå¸", "æ¡åå¸", "é´é¹¿å¸", "åå¼µå¸", "å°¾é·²å¸", "äºå±±å¸", "é³¥ç¾½å¸", "çéå¸", "ããªã¹å¸", "å¿æ©å¸", "ä¼è³å¸", "è°éçº", "ææ¥çº", "å·è¶çº", "å¤æ°çº", "æåçº", "å¤§å°çº", "çåçº", "åº¦ä¼çº", "å¤§ç´çº", "åä¼å¢çº", "ç´åçº", "å¾¡æµçº", "ç´å®çº"],
    "æ»è³ç": ["å¤§æ´¥å¸", "å½¦æ ¹å¸", "é·æµå¸", "è¿æ±å«å¹¡å¸", "èæ´¥å¸", "å®å±±å¸", "æ æ±å¸", "ç²è³å¸", "éæ´²å¸", "æ¹åå¸", "é«å³¶å¸", "æ±è¿æ±å¸", "ç±³åå¸", "æ¥éçº", "ç«ççº", "æèçº", "è±é·çº", "ç²è¯çº", "å¤è³çº"],
    "äº¬é½åº": ["äº¬é½å¸ååº", "äº¬é½å¸ä¸äº¬åº", "äº¬é½å¸å·¦äº¬åº", "äº¬é½å¸ä¸­äº¬åº", "äº¬é½å¸æ±å±±åº", "äº¬é½å¸ä¸äº¬åº", "äº¬é½å¸ååº", "äº¬é½å¸å³äº¬åº", "äº¬é½å¸ä¼è¦åº", "äº¬é½å¸å±±ç§åº", "äº¬é½å¸è¥¿äº¬åº", "ç¦ç¥å±±å¸", "èé¶´å¸", "ç¶¾é¨å¸", "å®æ²»å¸", "å®®æ´¥å¸", "äºå²¡å¸", "åé½å¸", "åæ¥å¸", "é·å²¡äº¬å¸", "å«å¹¡å¸", "äº¬ç°è¾ºå¸", "äº¬ä¸¹å¾å¸", "åä¸¹å¸", "æ¨æ´¥å·å¸", "å¤§å±±å´çº", "ä¹å¾¡å±±çº", "äºæçº", "å®æ²»ç°åçº", "ç¬é¡çº", "åå±±åæ", "äº¬ä¸¹æ³¢çº", "ä¸è¬éçº"],
    "å¤§éªåº": ["å¤§éªå¸é½å³¶åº", "å¤§éªå¸ç¦å³¶åº", "å¤§éªå¸æ­¤è±åº", "å¤§éªå¸æ¸¯åº", "å¤§éªå¸å¤§æ­£åº", "å¤§éªå¸æ­åº", "å¤§éªå¸åæ±åº", "å¤§éªå¸é¿åéåº", "å¤§éªå¸ä½ãæ±åº", "å¤§éªå¸æ±æ·å·åº", "å¤§éªå¸æ±æåº", "å¤§éªå¸è¥¿æåº", "å¤§éªå¸æ¸å³¶åº", "å¤§éªå¸æ±ä½ååº", "å¤§éªå¸è¥¿æ·å·åº", "å¤§éªå¸æ·å·åº", "å¤§éªå¸é¶´è¦åº", "å¤§éªå¸ä½ååº", "å¤§éªå¸æ±åº", "å¤§éªå¸ä¸­å¤®åº", "è±ä¸­å¸", "æ± ç°å¸", "å¹ç°å¸", "æ³å¤§æ´¥å¸", "é«æ§»å¸", "è²å¡å¸", "å®å£å¸", "ææ¹å¸", "è¨æ¨å¸", "å«å°¾å¸", "æ³ä½éå¸", "å¯ç°æå¸", "å¯å±å·å¸", "æ²³åé·éå¸", "æ¾åå¸", "å¤§æ±å¸", "åæ³å¸", "ç®é¢å¸", "æåå¸", "ç¾½æ³éå¸", "éçå¸", "ææ´¥å¸", "é«æ§»å¸", "å³¶æ¬çº", "è±è½çº", "è½å¢çº", "å¿ å²¡çº", "çåçº", "ç°å°»çº", "å²¬çº", "å¤ªå­çº", "æ²³åçº", "åæ©èµ¤éªæ"],
    "åµåº«ç": ["ç¥æ¸å¸æ±çåº", "ç¥æ¸å¸çåº", "ç¥æ¸å¸åµåº«åº", "ç¥æ¸å¸é·ç°åº", "ç¥æ¸å¸é ç£¨åº", "ç¥æ¸å¸åæ°´åº", "ç¥æ¸å¸ååº", "ç¥æ¸å¸ä¸­å¤®åº", "ç¥æ¸å¸è¥¿åº", "å§«è·¯å¸", "å°¼å´å¸", "æç³å¸", "è¥¿å®®å¸", "æ´²æ¬å¸", "è¦å±å¸", "ä¼ä¸¹å¸", "ç¸çå¸", "è±å²¡å¸", "å å¤å·å¸", "èµ¤ç©å¸", "è¥¿èå¸", "å®å¡å¸", "ä¸æ¨å¸", "é«ç å¸", "å·è¥¿å¸", "å°éå¸", "ä¸ç°å¸", "å è¥¿å¸", "ç¯ å±±å¸", "é¤ç¶å¸", "ä¸¹æ³¢å¸", "åãããå¸", "ææ¥å¸", "æ·¡è·¯å¸", "å®ç²å¸", "å æ±å¸", "ãã¤ã®å¸", "çªåå·çº", "å¤å¯çº", "ç¨²ç¾çº", "æ­ç£¨çº", "å¸å·çº", "ç¦å´çº", "ç¥æ²³çº", "å¤ªå­çº", "ä¸é¡çº", "ä½ç¨çº", "é¦ç¾çº", "æ°æ¸©æ³çº"],
    "å¥è¯ç": ["å¥è¯å¸", "å¤§åé«ç°å¸", "å¤§åé¡å±±å¸", "å¤©çå¸", "æ©¿åå¸", "æ¡äºå¸", "äºæ¢å¸", "å¾¡æå¸", "çé§å¸", "é¦èå¸", "èåå¸", "å®éå¸", "å±±è¾ºçº", "å¹³ç¾¤çº", "ä¸é·çº", "æé³©çº", "å®å µçº", "å·è¥¿çº", "ä¸å®çº", "ç°åæ¬çº", "æ½ç¾æ", "å¾¡ææ", "é«åçº", "ææ¥é¦æ", "ä¸ç§çº", "çå¯ºçº", "åºéµçº", "æ²³åçº", "å¤§æ·çº", "ä¸å¸çº", "é»æ»æ", "å¤©å·æ", "éè¿«å·æ", "åæ´¥å·æ", "ä¸åå±±æ", "ä¸åå±±æ", "å·ä¸æ"],
    "åæ­å±±ç": ["åæ­å±±å¸", "æµ·åå¸", "æ©æ¬å¸", "æç°å¸", "å¾¡åå¸", "ç°è¾ºå¸", "æ°å®®å¸", "ç´ã®å·å¸", "å²©åºå¸", "ç´ç¾éçº", "ãã¤ããçº", "ä¹åº¦å±±çº", "é«éçº", "æ¹¯æµçº", "åºå·çº", "æç°å·çº", "ç¾æµçº", "æ¥é«çº", "ç±è¯çº", "å°åçº", "ã¿ãªã¹çº", "æ¥é«å·çº", "ç½æµçº", "ä¸å¯ç°çº", "ããã¿çº", "é£æºåæµ¦çº", "å¤ªå°çº", "å¤åº§å·çº", "åå±±æ", "ä¸²æ¬çº"],
    "é³¥åç": ["é³¥åå¸", "ç±³å­å¸", "ååå¸", "å¢æ¸¯å¸", "å²©ç¾çº", "å«é ­çº", "æºé ­çº", "è¥æ¡çº", "ä¸æçº", "æ¹¯æ¢¨æµçº", "ç´æµ¦çº", "åæ çº", "æ¥åçº", "æ¥éçº", "æ±åºçº"],
    "å³¶æ ¹ç": ["æ¾æ±å¸", "æµç°å¸", "åºé²å¸", "çç°å¸", "å¤§ç°å¸", "å®æ¥å¸", "æ±æ´¥å¸", "é²åå¸", "å¥¥åºé²çº", "é£¯åçº", "å·æ¬çº", "ç¾é·çº", "éåçº", "æ´¥åéçº", "åè³çº", "æµ·å£«çº", "è¥¿ãå³¶çº", "ç¥å¤«æ"],
    "å²¡å±±ç": ["å²¡å±±å¸ååº", "å²¡å±±å¸ä¸­åº", "å²¡å±±å¸æ±åº", "åæ·å¸", "æ´¥å±±å¸", "çéå¸", "ç¬ å²¡å¸", "äºåå¸", "ç·ç¤¾å¸", "é«æ¢å¸", "æ°è¦å¸", "ååå¸", "ç¬æ¸åå¸", "èµ¤ç£å¸", "çåº­å¸", "ç¾ä½å¸", "æµå£å¸", "åæ°çº", "æ©å³¶çº", "éåºçº", "ç¢æçº", "æ°åºæ", "é¡éçº", "åå¤®çº", "å¥ç¾©çº", "ä¹ç±³åçº", "ç¾å²çº", "ååä¸­å¤®çº"],
    "åºå³¶ç": ["åºå³¶å¸ä¸­åº", "åºå³¶å¸æ±åº", "åºå³¶å¸ååº", "åºå³¶å¸è¥¿åº", "åºå³¶å¸å®ä½ååº", "åºå³¶å¸å®ä½ååº", "åºå³¶å¸å®è¸åº", "åºå³¶å¸ä½ä¼¯åº", "åå¸", "ç«¹åå¸", "ä¸åå¸", "å°¾éå¸", "ç¦å±±å¸", "åºä¸­å¸", "ä¸æ¬¡å¸", "åºåå¸", "å¤§ç«¹å¸", "æ±åºå³¶å¸", "å»¿æ¥å¸å¸", "å®è¸é«ç°å¸", "æ±ç°å³¶å¸", "åºä¸­çº", "æµ·ç°çº", "çéçº", "åçº", "å®è¸å¤ªç°çº", "ååºå³¶çº", "å¤§å´ä¸å³¶çº"],
    "å±±å£ç": ["ä¸é¢å¸", "å®é¨å¸", "å±±å£å¸", "è©å¸", "é²åºå¸", "ä¸æ¾å¸", "å²©å½å¸", "åå¸", "é·éå¸", "æ³äºå¸", "ç¾ç¥¢å¸", "å¨åå¸", "å±±é½å°éç°å¸", "åæ¨çº", "ä¸é¢çº", "ç°å¸æ½çº", "å¹³ççº"],
    "å¾³å³¶ç": ["å¾³å³¶å¸", "é³´éå¸", "å°æ¾å³¶å¸", "é¿åå¸", "åéå·å¸", "é¿æ³¢å¸", "ç¾é¦¬å¸", "ä¸å¥½å¸", "æ±ã¿ããçº", "é£è³çº", "ä½é£æ²³åæ", "ç¥å±±çº", "ä¸åçº", "ã¤ããçº", "æ±ç¥è°·æ", "è¥¿ç¥è°·æ"],
    "é¦å·ç": ["é«æ¾å¸", "ä¸¸äºå¸", "ååºå¸", "åéå¯ºå¸", "è¦³é³å¯ºå¸", "ãã¬ãå¸", "æ±ãããå¸", "ä¸è±å¸", "ååºçº", "å°è±å³¶çº", "ç´å³¶çº", "å®å¤æ´¥çº", "ç¶¾å·çº", "ç´å¹³çº", "å¤åº¦æ´¥çº", "ã¾ãã®ãçº"],
    "æåªç": ["æ¾å±±å¸", "ä»æ²»å¸", "å®åå³¶å¸", "å«å¹¡æµå¸", "æ°å±æµå¸", "è¥¿æ¡å¸", "å¤§æ´²å¸", "ä¼éå¸", "è¶ç¥çº", "ä»æ·å·çº", "ãã®çº", "é¬¼åçº", "ä¹ä¸é«åçº", "æ¾åçº", "ç ¥é¨çº", "åå­çº", "é¬¼åçº"],
    "é«ç¥ç": ["é«ç¥å¸", "å®¤æ¸å¸", "å®è¸å¸", "åå½å¸", "ãã®çº", "ä½å·çº", "é å´å¸", "ä¸­åä½çº", "æª®åçº", "æ¥é«æ", "è¶ç¥çº", "ä»æ·å·çº", "æ¢¼åçº", "åå½çº", "ãã®çº", "ä½å·çº", "è¶ç¥çº", "ä»æ·å·çº", "ãã®çº", "é å´å¸", "ä¸­åä½çº", "æª®åçº", "æ¥é«æ", "è¶ç¥çº", "ä»æ·å·çº", "æ¢¼åçº", "åå½çº", "é¬¼åçº"],
    "ç¦å²¡ç": ["ç¦å²¡å¸æ±åº", "ç¦å²¡å¸åå¤åº", "ç¦å²¡å¸ä¸­å¤®åº", "ç¦å²¡å¸ååº", "ç¦å²¡å¸è¥¿åº", "ç¦å²¡å¸åååº", "ç¦å²¡å¸æ©è¯åº", "åä¹å·å¸éå¸åº", "åä¹å·å¸è¥æ¾åº", "åä¹å·å¸æ¸çåº", "åä¹å·å¸å°åååº", "åä¹å·å¸å°åååº", "åä¹å·å¸å«å¹¡æ±åº", "åä¹å·å¸å«å¹¡è¥¿åº", "å¤§çç°å¸", "ä¹çç±³å¸", "ç´æ¹å¸", "é£¯å¡å¸", "ç°å·å¸", "æ³å·å¸", "å«å¥³å¸", "ç­å¾å¸", "å¤§å·å¸", "è¡æ©å¸", "è±åå¸", "ä¸­éå¸", "å°é¡å¸", "ç­ç´«éå¸", "æ¥æ¥å¸", "å¤§éåå¸", "å®åå¸", "å¤ªå®°åºå¸", "å¤è³å¸", "ç¦æ´¥å¸", "ããã¯å¸", "ã¿ãã¾å¸", "æåå¸", "ç³¸å³¶å¸", "é£çå·çº", "å®ç¾çº", "ç¯ æ çº", "å¿åçº", "é æµçº", "æ°å®®çº", "ä¹å±±çº", "ç²å±çº", "è¦å±çº", "æ°´å·»çº", "å²¡å£çº", "é è³çº", "å°ç«¹çº", "éæçº", "å®®è¥å¸", "èµ¤æ", "ç¦æºçº", "æ·»ç°çº", "é¦æ¥çº", "ç³¸ç°çº", "å·å´çº", "å¤§ä»»çº", "åºåçº", "å¤§åæ´çº"],
    "ä½è³ç": ["ä½è³å¸", "åæ´¥å¸", "é³¥æ å¸", "å¤ä¹å¸", "ä¼ä¸éå¸", "æ­¦éå¸", "é¹¿å³¶å¸", "å°åå¸", "å¬éå¸", "ç¥å¼å¸", "åè³çº", "åºå±±çº", "ã¿ããçº", "ä¸å³°çº", "ç½ç³çº", "æ±åçº", "å¤§çºçº", "å¤ªççº"],
    "é·å´ç": ["é·å´å¸", "ä½ä¸ä¿å¸", "å³¶åå¸", "è««æ©å¸", "å¤§æå¸", "å¹³æ¸å¸", "æ¾æµ¦å¸", "å¯¾é¦¬å¸", "å£±å²å¸", "äºå³¶å¸", "è¥¿æµ·å¸", "é²ä»å¸", "åå³¶åå¸", "é·ä¸çº", "ææ´¥çº", "æ±å½¼æ³¢ä½è¦çº", "å·æ£çº", "æ³¢ä½è¦çº", "å°å¤è³çº", "ä½æ¸¡å³¶çº"],
    "çæ¬ç": ["çæ¬å¸ä¸­å¤®åº", "çæ¬å¸æ±åº", "çæ¬å¸è¥¿åº", "çæ¬å¸ååº", "çæ¬å¸ååº", "å«ä»£å¸", "äººåå¸", "èå°¾å¸", "æ°´ä¿£å¸", "çåå¸", "å±±é¹¿å¸", "èæ± å¸", "å®åå¸", "ä¸å¤©èå¸", "å®åå¸", "é¿èå¸", "åå¿å¸", "ä¸çåé¡", "ç¾éçº", "çæ±çº", "åé¢çº", "é·æ´²çº", "åæ°´çº", "å¤§æ´¥çº", "èé½çº", "åå°å½çº", "å°å½çº", "ç£å±±æ", "é«æ£®çº", "åé¿èæ", "ç½å·æ", "åçåé¡", "ç²ä½çº", "å±±é½çº", "æ°·å·çº", "çç£¨é¡", "é¦çº", "å¤è¯æ¨çº", "æ¹¯åçº", "æ°´ä¸æ", "ç¸è¯çº", "äºæ¨æ", "å±±æ±æ", "çç£¨æ", "ããããçº"],
    "å¤§åç": ["å¤§åå¸", "å¥åºå¸", "ä¸­æ´¥å¸", "æ¥ç°å¸", "ä½ä¼¯å¸", "è¼æµå¸", "æ´¥ä¹è¦å¸", "è±å¾é«ç°å¸", "æµç¯å¸", "å®ä½å¸", "è±å¾å¤§éå¸", "ç±å¸å¸", "å½æ±å¸", "å§«å³¶æ", "æ¥åºçº", "ä¹éçº", "çç çº"],
    "å®®å´ç": ["å®®å´å¸", "é½åå¸", "å»¶å²¡å¸", "æ¥åå¸", "ä¸²éå¸", "è¥¿é½å¸", "ãã³ã®å¸", "ä¸è¡çº", "é«åçº", "å½å¯çº", "ç¶¾çº", "é«éçº", "æ°å¯çº", "è¥¿ç±³è¯æ", "æ¨åçº", "å·åçº", "é½è¾²çº", "éå·çº", "è«¸å¡æ", "æ¤èæ", "ç¾é·çº"],
    "é¹¿åå³¶ç": ["é¹¿åå³¶å¸", "é¹¿å±å¸", "æå´å¸", "é¿ä¹æ ¹å¸", "åºæ°´å¸", "æå®¿å¸", "è¥¿ä¹è¡¨å¸", "åæ°´å¸", "è©æ©å·åå¸", "æ¥ç½®å¸", "æ½æ¼å¸", "é§å³¶å¸", "ãã¡ãä¸²æ¨éå¸", "åãã¤ã¾å¸", "å¿å¸å¿å¸", "å¥ç¾å¸", "åä¹å·å¸", "ä¼ä»çº", "å¤©åçº", "åççº", "å¾³ä¹å³¶çº", "ä¸­ç¨®å­çº", "åç¨®å­çº", "å±ä¹å³¶çº", "å¤§å´çº", "æ±ä¸²è¯çº", "é¦æ±çº", "åå¤§éçº", "èä»çº", "ä¸å³¶æ", "åå³¶æ"],
    "æ²ç¸ç": ["é£è¦å¸", "å®éæ¹¾å¸", "ç³å£å¸", "æµ¦æ·»å¸", "åè­·å¸", "ç³¸æºå¸", "æ²ç¸å¸", "è±è¦åå¸", "ããã¾å¸", "å®®å¤å³¶å¸", "ååå¸", "åä¸­åæ", "ä¸­åæ", "è¥¿åçº", "ä¸é£åçº", "åé¢¨åçº", "å«éç¬çº", "å¤è¯éæ", "ç«¹å¯çº", "ä¸é£å½çº"],
  };

  // Keyword expansion dictionary
  const keywordDictionary: Record<string, string[]> = {
    "çµ¦æ¹¯å¨": ["ã¨ã³ã­ã¥ã¼ã", "ãã¼ããã³ã", "çµ¦æ¹¯çã¨ã", "é«å¹ççµ¦æ¹¯å¨", "CO2å·åªãã¼ããã³ã"],
    "æ­ç±": ["æ­ç±æ¹ä¿®", "æ­ç±ãªãã©ã¼ã ", "å¤ç®æ§è½åä¸", "UAå¤æ¹å", "é«æ§è½æ­ç±æ", "ã°ã©ã¹ã¦ã¼ã«", "ã»ã«ã­ã¼ã¹ãã¡ã¤ãã¼"],
    "çª": ["çªãªãã", "åçª", "äºéçª", "è¤å±¤ã¬ã©ã¹", "Low-Eã¬ã©ã¹", "æ¨¹èãµãã·", "ã¢ã«ãæ¨¹èè¤å"],
    "å¤ªé½å": ["å¤ªé½åçºé»", "ã½ã¼ã©ã¼ããã«", "PV", "èªå®¶æ¶è²»", "FIT", "èé»æ± ", "V2H"],
    "ãªãã©ã¼ã ": ["ä½å®æ¹ä¿®", "ãªããã¼ã·ã§ã³", "æ¹ä¿®å·¥äº", "ããªã¢ããªã¼", "ã¦ããã¼ãµã«ãã¶ã¤ã³"],
    "èé": ["èéè¨ºæ­", "èéè£å¼·", "å¶é", "åé", "Iså¤", "èéåºæºé©å"],
    "DX": ["ãã¸ã¿ã«ãã©ã³ã¹ãã©ã¼ã¡ã¼ã·ã§ã³", "ITå°å¥", "ã¯ã©ã¦ãå", "æ¥­åå¹çå", "RPA", "AIå°å¥"],
    "EC": ["é»å­ååå¼", "ãããã·ã§ãã", "ãªã³ã©ã¤ã³è²©å£²", "ECãµã¤ãæ§ç¯"],
    "è¨­åæè³": ["æ©æ¢°è¨­å", "çç£æ§åä¸", "çåå", "èªåå", "ã­ãããå°å¥"],
    "äººæ": ["äººæè²æ", "ç ä¿®", "éç¨", "æ¡ç¨", "ã¹ã­ã«ã¢ãã", "ãªã¹ã­ãªã³ã°", "åãæ¹æ¹é©"],
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
      "çã¨ã": ["çã¨ãã«ã®ã¼", "ã¨ãã«ã®ã¼åæ¸", "ã¨ã³"],
      "ZEH": ["ã¼ã­ã¨ãã«ã®ã¼ãã¦ã¹", "ã¼ã­ã¨ã"],
      "ãªãã©ã¼ã ": ["æ¹ä¿®", "ãªããã¼ã·ã§ã³"],
      "èé": ["èéæ¹ä¿®", "èéè£å¼·"],
    };
    for (const [key, values] of Object.entries(synonyms)) {
      if (q.includes(key.toLowerCase())) {
        values.forEach(v => expanded.add(v.toLowerCase()));
      }
    }

    return Array.from(expanded);
  };

  // 32+ subsidies covering all 10 categories
  const allSubsidies = [
    { id: 1, name: "å­è²ã¦ã¨ã³ãã¼ã æ¯æ´äºæ¥­", category: "æ°ç¯", amount: "æå¤§100ä¸å", deadline: "2026/03/31", jurisdiction: "å½åäº¤éç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["å­è²ã¦","ã¨ã³","çã¨ã","æ°ç¯","ZEH"], totalBudget: 210000000000, usedBudget: 136500000000 },
    { id: 2, name: "åé²ççªãªããäºæ¥­", category: "ãªãã©ã¼ã ", amount: "æå¤§200ä¸å", deadline: "2026/03/31", jurisdiction: "ç°å¢ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["çª","ãªãã","æ­ç±","ãªãã©ã¼ã ","çã¨ã"], totalBudget: 135000000000, usedBudget: 108000000000 },
    { id: 3, name: "çµ¦æ¹¯çã¨ãäºæ¥­", category: "çã¨ãæ¹ä¿®", amount: "æå¤§20ä¸å/å°", deadline: "2026/03/31", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["çµ¦æ¹¯","ã¨ã³ã­ã¥ã¼ã","çã¨ã","æ¹ä¿®"], totalBudget: 58000000000, usedBudget: 34800000000 },
    { id: 4, name: "é·æåªè¯ä½å®åãªãã©ã¼ã æ¨é²äºæ¥­", category: "ãªãã©ã¼ã ", amount: "æå¤§250ä¸å", deadline: "2026/06/30", jurisdiction: "å½åäº¤éç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["é·æåªè¯","ãªãã©ã¼ã ","èé","çã¨ã"], totalBudget: 45000000000, usedBudget: 13500000000 },
    { id: 5, name: "ä½å®çã¨ãã­ã£ã³ãã¼ã³2025", category: "æ°ç¯ã»ãªãã©ã¼ã ", amount: "æå¤§60ä¸å", deadline: "2026/03/31", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["çã¨ã","ä½å®","ã­ã£ã³ãã¼ã³","æ°ç¯","ãªãã©ã¼ã "], totalBudget: 100000000000, usedBudget: 45000000000 },
    { id: 6, name: "æ±äº¬é½æ¨é ä½å®èéæ¹ä¿®å©æäºæ¥­", category: "èéæ¹ä¿®", amount: "æå¤§150ä¸å", deadline: "2026/12/28", jurisdiction: "æ±äº¬é½", pref: "æ±äº¬é½", city: "all", status: "åä»ä¸­", keywords: ["èé","æ¨é ","è£å¼·","æ¹ä¿®","æ±äº¬"], totalBudget: 5000000000, usedBudget: 1750000000 },
    { id: 7, name: "ä¸ç°è°·åºä½å®ãªãã©ã¼ã å©æ", category: "ãªãã©ã¼ã ", amount: "æå¤§20ä¸å", deadline: "2026/09/30", jurisdiction: "ä¸ç°è°·åº", pref: "æ±äº¬é½", city: "ä¸ç°è°·åº", status: "åä»ä¸­", keywords: ["ãªãã©ã¼ã ","å©æ","ä¸ç°è°·","ããªã¢ããªã¼"], totalBudget: 200000000, usedBudget: 120000000 },
    { id: 8, name: "æ±äº¬é½ZEHå°å¥è£å©é", category: "æ°ç¯", amount: "æå¤§70ä¸å", deadline: "2026/06/30", jurisdiction: "æ±äº¬é½", pref: "æ±äº¬é½", city: "all", status: "æºåä¸­", keywords: ["ZEH","ã¼ãã","æ°ç¯","çã¨ã","æ±äº¬"], totalBudget: 3000000000, usedBudget: 0 },
    { id: 9, name: "æ±äº¬é½æ¢å­ä½å®çã¨ãæ¹ä¿®å©æ", category: "çã¨ãæ¹ä¿®", amount: "æå¤§300ä¸å", deadline: "2026/09/30", jurisdiction: "æ±äº¬é½", pref: "æ±äº¬é½", city: "all", status: "åä»ä¸­", keywords: ["çã¨ã","æ¹ä¿®","æ¢å­ä½å®","æ±äº¬","æ­ç±"], totalBudget: 3000000000, usedBudget: 1800000000 },
    { id: 10, name: "å¤ªé½åçºé»ã»èé»æ± å°å¥äºæ¥­ï¼å½ï¼", category: "çã¨ãè¨­å", amount: "æå¤§100ä¸å", deadline: "2026/05/31", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["å¤ªé½å","èé»æ± ","èªå®¶æ¶è²»","FIT"], totalBudget: 80000000000, usedBudget: 48000000000 },
    { id: 11, name: "æç¥çä½å®ç¨å°çæ¸©æåå¯¾ç­è¨­åå°å¥ä¿é²è²»è£å©é", category: "çã¨ãè¨­å", amount: "æå¤§10ä¸å", deadline: "2026/03/31", jurisdiction: "æç¥ç", pref: "æç¥ç", city: "all", status: "åä»ä¸­", keywords: ["æ¸©æå","å¤ªé½å","èé»æ± ","çã¨ã","æç¥"], totalBudget: 500000000, usedBudget: 375000000 },
    { id: 12, name: "ç¦å²¡çä½å®ç¨ã¨ãã«ã®ã¼ã·ã¹ãã å°å¥ä¿é²äºæ¥­", category: "çã¨ãè¨­å", amount: "æå¤§15ä¸å", deadline: "2026/11/30", jurisdiction: "ç¦å²¡ç", pref: "ç¦å²¡ç", city: "all", status: "åä»ä¸­", keywords: ["ã¨ãã«ã®ã¼","å¤ªé½å","èé»æ± ","ç¦å²¡"], totalBudget: 800000000, usedBudget: 240000000 },
    { id: 13, name: "åæµ·éä½å®çã¨ãã«ã®ã¼æ¹ä¿®è£å©", category: "çã¨ãæ¹ä¿®", amount: "æå¤§120ä¸å", deadline: "2026/10/31", jurisdiction: "åæµ·é", pref: "åæµ·é", city: "all", status: "åä»ä¸­", keywords: ["çã¨ã","æ­ç±","æ¹ä¿®","åæµ·é","å¯å·å°"], totalBudget: 2000000000, usedBudget: 600000000 },
    { id: 14, name: "ç¥å¥å·çæ¢å­ä½å®çã¨ãæ¹ä¿®è²»è£å©", category: "çã¨ãæ¹ä¿®", amount: "æå¤§80ä¸å", deadline: "2026/08/31", jurisdiction: "ç¥å¥å·ç", pref: "ç¥å¥å·ç", city: "all", status: "åä»ä¸­", keywords: ["çã¨ã","æ¹ä¿®","ç¥å¥å·","æ¢å­"], totalBudget: 1500000000, usedBudget: 1050000000 },
    { id: 15, name: "åºå³¶çä½å®èéåä¿é²äºæ¥­", category: "èéæ¹ä¿®", amount: "æå¤§90ä¸å", deadline: "2026/12/28", jurisdiction: "åºå³¶ç", pref: "åºå³¶ç", city: "all", status: "åä»ä¸­", keywords: ["èé","æ¹ä¿®","åºå³¶","æ¨é "], totalBudget: 600000000, usedBudget: 180000000 },
    { id: 16, name: "ç·´é¦¬åºä½å®ãªãã©ã¼ã è£å©é", category: "ãªãã©ã¼ã ", amount: "æå¤§30ä¸å", deadline: "2026/07/31", jurisdiction: "ç·´é¦¬åº", pref: "æ±äº¬é½", city: "ç·´é¦¬åº", status: "åä»ä¸­", keywords: ["ãªãã©ã¼ã ","ç·´é¦¬","å©æ","ããªã¢ããªã¼"], totalBudget: 150000000, usedBudget: 75000000 },
    { id: 17, name: "åå·åºä½å®èéæ¹ä¿®å©æé", category: "èéæ¹ä¿®", amount: "æå¤§150ä¸å", deadline: "2026/12/28", jurisdiction: "åå·åº", pref: "æ±äº¬é½", city: "åå·åº", status: "åä»ä¸­", keywords: ["èé","åå·","æ¨é ","è£å¼·"], totalBudget: 300000000, usedBudget: 90000000 },
    { id: 18, name: "å¼ççä½å®ã«ãããçã¨ãå¯¾ç­æ¯æ´äºæ¥­", category: "çã¨ãæ¹ä¿®", amount: "æå¤§50ä¸å", deadline: "2026/11/30", jurisdiction: "å¼çç", pref: "å¼çç", city: "all", status: "åä»ä¸­", keywords: ["çã¨ã","å¼ç","æ­ç±","æ¹ä¿®"], totalBudget: 800000000, usedBudget: 320000000 },
    { id: 19, name: "ãã¸ã¿ã«ãã©ã³ã¹ãã©ã¼ã¡ã¼ã·ã§ã³æ¨é²è£å©é", category: "DX", amount: "æå¤§500ä¸å", deadline: "2026/04/30", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["DX","ãã¸ã¿ã«å","ITå°å¥","ã¯ã©ã¦ã"], totalBudget: 50000000000, usedBudget: 15000000000 },
    { id: 20, name: "ä¸­å°ä¼æ¥­ITå°å¥è£å©é", category: "DX", amount: "æå¤§450ä¸å", deadline: "2026/05/15", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["ITå°å¥","æ¥­åå¹çå","RPA","AI"], totalBudget: 30000000000, usedBudget: 12000000000 },
    { id: 21, name: "ã¯ã©ã¦ãå°å¥æ¯æ´äºæ¥­", category: "DX", amount: "æå¤§200ä¸å", deadline: "2026/06/30", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["ã¯ã©ã¦ãå","ãã¼ã¿æ´»ç¨","ã»ã­ã¥ãªãã£"], totalBudget: 15000000000, usedBudget: 7500000000 },
    { id: 22, name: "ECãµã¤ãæ§ç¯æ¯æ´è£å©é", category: "EC", amount: "æå¤§300ä¸å", deadline: "2026/04/15", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["EC","é»å­ååå¼","ãããã·ã§ãã","ãªã³ã©ã¤ã³è²©å£²"], totalBudget: 20000000000, usedBudget: 8000000000 },
    { id: 23, name: "ãªã³ã©ã¤ã³è²©å£²ä¿é²äºæ¥­", category: "EC", amount: "æå¤§150ä¸å", deadline: "2026/05/31", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["ãªã³ã©ã¤ã³è²©å£²","ãã¸ã¿ã«æ´»ç¨","è²©å£²å¼·å"], totalBudget: 10000000000, usedBudget: 3000000000 },
    { id: 24, name: "è¨­åæè³è£å©éï¼çç£æ§åä¸ç¹å¥æªç½®å¶åº¦ï¼", category: "è¨­åæè³", amount: "æå¤§1000ä¸å", deadline: "2026/03/31", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["è¨­åæè³","æ©æ¢°è¨­å","çç£æ§åä¸","èªåå"], totalBudget: 60000000000, usedBudget: 24000000000 },
    { id: 25, name: "çååæè³è£å©é", category: "è¨­åæè³", amount: "æå¤§800ä¸å", deadline: "2026/05/30", jurisdiction: "çµæ¸ç£æ¥­ç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["çåå","èªåå","ã­ãããå°å¥","æ¥­åå¹çå"], totalBudget: 40000000000, usedBudget: 12000000000 },
    { id: 26, name: "äººæè²ææ¯æ´äºæ¥­ï¼ã­ã£ãªã¢ã¢ããå©æéï¼", category: "äººæ", amount: "æå¤§100ä¸å/å¹´", deadline: "2026/12/31", jurisdiction: "åçå´åç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["äººæè²æ","ç ä¿®","ã¹ã­ã«ã¢ãã","ã­ã£ãªã¢"], totalBudget: 25000000000, usedBudget: 10000000000 },
    { id: 27, name: "ãªã¹ã­ãªã³ã°æ¯æ´äºæ¥­", category: "äººæ", amount: "æå¤§150ä¸å", deadline: "2026/06/30", jurisdiction: "åçå´åç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["ãªã¹ã­ãªã³ã°","ã¹ã­ã«ã¢ãã","äººæè²æ"], totalBudget: 20000000000, usedBudget: 6000000000 },
    { id: 28, name: "åãæ¹æ¹é©æ¨é²æ¯æ´äºæ¥­", category: "äººæ", amount: "æå¤§200ä¸å", deadline: "2026/04/30", jurisdiction: "åçå´åç", pref: "å½ï¼å¨å½å±éï¼", city: "all", status: "åä»ä¸­", keywords: ["åãæ¹æ¹é©","éç¨","æ¡ç¨","äººäºæ¹é©"], totalBudget: 15000000000, usedBudget: 4500000000 },
    { id: 29, name: "å¤§éªåºä½å®ãªãã©ã¼ã ãã¤ã¹ã¿ã¼å¶åº¦", category: "ãªãã©ã¼ã ", amount: "æå¤§50ä¸å", deadline: "2026/12/31", jurisdiction: "å¤§éªåº", pref: "å¤§éªåº", city: "all", status: "åä»ä¸­", keywords: ["ãªãã©ã¼ã ","ãã¤ã¹ã¿ã¼","å¤§éª"], totalBudget: 1000000000, usedBudget: 350000000 },
    { id: 30, name: "äº¬é½åºæ­ç±æ¹ä¿®æ¯æ´äºæ¥­", category: "æ­ç±", amount: "æå¤§180ä¸å", deadline: "2026/08/31", jurisdiction: "äº¬é½åº", pref: "äº¬é½åº", city: "all", status: "åä»ä¸­", keywords: ["æ­ç±","æ­ç±æ¹ä¿®","æ¹ä¿®","çã¨ã"], totalBudget: 1200000000, usedBudget: 360000000 },
    { id: 31, name: "åµåº«çã¨ã³ãã¦ã¹æ¯æ´äºæ¥­", category: "çã¨ãæ¹ä¿®", amount: "æå¤§250ä¸å", deadline: "2026/07/31", jurisdiction: "åµåº«ç", pref: "åµåº«ç", city: "all", status: "åä»ä¸­", keywords: ["ã¨ã³","çã¨ã","ãªãã©ã¼ã "], totalBudget: 2000000000, usedBudget: 800000000 },
    { id: 32, name: "å²¡å±±çå¤ªé½åå°å¥äºæ¥­", category: "å¤ªé½å", amount: "æå¤§120ä¸å", deadline: "2026/09/30", jurisdiction: "å²¡å±±ç", pref: "å²¡å±±ç", city: "all", status: "åä»ä¸­", keywords: ["å¤ªé½å","å¤ªé½åçºé»","èªå®¶æ¶è²»"], totalBudget: 800000000, usedBudget: 240000000 },
  ];

  const ALERT_LEVELS = [
    { threshold: 95, label: "å±éº", color: "#dc2626", bg: "#fef2f2" },
    { threshold: 85, label: "è­¦å", color: "#ea580c", bg: "#fff7ed" },
    { threshold: 70, label: "æ³¨æ", color: "#d97706", bg: "#fffbeb" },
    { threshold: 50, label: "æå ±", color: "#2563eb", bg: "#eff6ff" },
  ];

  const getAlertLevel = (rate: number) => {
    for (const level of ALERT_LEVELS) {
      if (rate >= level.threshold) return level;
    }
    return null;
  };

  const filtered = allSubsidies.filter(s => {
    const prefMatch = selectedPref === "all" || s.pref === selectedPref;
    if (!prefMatch) return false;

    if (selectedCity !== "all" && s.pref !== "å½ï¼å¨å½å±éï¼") {
      const cityMatch = s.city === "all" || s.city === selectedCity;
      if (!cityMatch) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.jurisdiction.toLowerCase().includes(q) || s.keywords.some(k => k.toLowerCase().includes(q));
  });

  const totalAvailable = allSubsidies.filter(s => s.status === "åä»ä¸­").length;
  const filteredCount = filtered.length;

  return (<>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-black text-text-main">è£å©éã»å©æé</h2>
    </div>
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center gap-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div><p className="text-sm font-bold text-purple-800">å¨å½å¯¾å¿ è£å©éã»å©æéæ¤ç´¢</p><p className="text-xs text-purple-600">å½ã»é½éåºçã»å¸åºçºæã®ææ°è£å©éæå ±ãèªååå¾ ï½ äºç®æ¶åã¢ã©ã¼ãä»ã ï½ ã­ã¼ã¯ã¼ãæ¡å¼µæ¤ç´¢å¯¾å¿</p></div>
    </div>

    <div className="flex gap-2 mb-6">
      <button onClick={() => setActiveTab("search")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "search" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>ð è£å©éæ¤ç´¢</button>
      <button onClick={() => setActiveTab("pipeline")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "pipeline" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>ð æ¤ç´¢ãã¤ãã©ã¤ã³</button>
      <button onClick={() => setActiveTab("alert")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "alert" ? "bg-purple-600 text-white" : "bg-gray-100 text-text-sub hover:bg-gray-200"}`}>â ï¸ ã¢ã©ã¼ãç®¡ç</button>
    </div>

    {activeTab === "search" ? (<>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: "å©ç¨å¯è½ãªå¶åº¦", value: totalAvailable + "ä»¶", color: "#7c3aed" }, { label: "æ¤ç´¢çµæ", value: filteredCount + "ä»¶", color: "#3b82f6" }, { label: "åçµ¦æ¸ã¿", value: "Â¥420ä¸", color: "#10b981" }, { label: "ç³è«æééè¿", value: "5ä»¶", color: "#ef4444" }].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p></div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-text-main mb-3">è£å©éã»å©æéãæ¤ç´¢</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-xs text-text-sub mb-1 block">ã­ã¼ã¯ã¼ãæ¤ç´¢</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setExpandedKeywords(expandKeywords(e.target.value)); setIsSearching(!!e.target.value); }} placeholder="ä¾: çã¨ã, ãªãã©ã¼ã , èé, ZEH, å¤ªé½å, DX, EC..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
            </div>
            <p className="text-[10px] text-text-sub mt-1">å¶åº¦åã»ã«ãã´ãªã»ç®¡è½ã»ã­ã¼ã¯ã¼ãããç°¡ææ¤ç´¢ã§ãã¾ã</p>
            {expandedKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {expandedKeywords.slice(0, 8).map((kw, i) => (
                  <span key={i} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{kw}</span>
                ))}
                {expandedKeywords.length > 8 && <span className="text-[10px] text-text-sub px-2 py-1">+{expandedKeywords.length - 8}ä»¶</span>}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-text-sub mb-1 block">é½éåºç</label>
            <select value={selectedPref} onChange={e => { setSelectedPref(e.target.value); setSelectedCity("all"); }} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white">
              <option value="all">ãã¹ã¦ï¼å½ï¼å¨é½éåºçï¼</option>
              {prefectures.filter(p => p !== "all").map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-sub mb-1 block">å¸åºçºæ</label>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white" disabled={selectedPref === "all" || selectedPref === "å½ï¼å¨å½å±éï¼"}>
              <option value="all">ãã¹ã¦</option>
              {selectedPref !== "all" && selectedPref !== "å½ï¼å¨å½å±éï¼" && municipalityData[selectedPref] && municipalityData[selectedPref].map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>
        {(searchQuery || selectedPref !== "all" || selectedCity !== "all") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {searchQuery && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">ã­ã¼ã¯ã¼ã: {searchQuery}</span>}
            {selectedPref !== "all" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">é½éåºç: {selectedPref}</span>}
            {selectedCity !== "all" && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">å¸åºçºæ: {selectedCity}</span>}
            <button onClick={() => { setSearchQuery(""); setSelectedPref("all"); setSelectedCity("all"); setExpandedKeywords([]); setIsSearching(false); }} className="text-xs text-red-500 hover:text-red-700 ml-2">â æ¡ä»¶ã¯ãªã¢</button>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <DataTable headers={["å¶åº¦å", "å¯¾è±¡", "è£å©é¡", "ç³è«æé", "ç®¡è½", "æ¶åç", "ç¶æ"]} rows={filtered.map((s, i) => {
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
          <p className="text-text-sub text-sm">è©²å½ããè£å©éã»å©æéãè¦ã¤ããã¾ããã§ãã</p>
          <p className="text-text-sub text-xs mt-1">ã­ã¼ã¯ã¼ããé½éåºçãå¤æ´ãã¦ãè©¦ããã ãã</p>
        </div>
      )}
    </>) : activeTab === "pipeline" ? (<>
      <div className="bg-white border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">æ¤ç´¢ãã¤ãã©ã¤ã³ï¼7ã¹ãããå¦çï¼</h3>
        <div className="grid grid-cols-7 gap-2">
          {[
            { num: 1, label: "ã­ã¼ã¯ã¼ãå±é", desc: "æ¥­çè¾æ¸" },
            { num: 2, label: "ãã¼ã¿åé", desc: "ãã§ãã" },
            { num: 3, label: "ãã£ã¼ã«ãæ½åº", desc: "è§£æ" },
            { num: 4, label: "é©æ ¼æ§ã¹ã³ã¢ãªã³ã°", desc: "è©ä¾¡" },
            { num: 5, label: "ç· åç¶æå¤å®", desc: "æéå¤å®" },
            { num: 6, label: "ã¢ã©ã¼ãã­ã¸ãã¯", desc: "éç¥çæ" },
            { num: 7, label: "åºåãã©ã¼ããã", desc: "è¡¨ç¤º" },
          ].map((step, i) => (
            <div key={i} className="bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-3 text-center">
              <div className="text-lg font-black text-purple-600 mb-1">{step.num}</div>
              <p className="text-[10px] font-bold text-text-main">{step.label}</p>
              <p className="text-[9px] text-text-sub mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[10px] text-blue-800 font-bold">ç£è¦ç¶æ³</p>
          <p className="text-[9px] text-blue-700 mt-1">å½ (æ¯æ¥ãã§ãã¯) / é½éåºç (é±1å) / å¸åºçºæ (æ2å)</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-blue-800 font-medium">ãªã¢ã«ã¿ã¤ã ç£è¦ä¸­</span>
          </div>
        </div>
      </div>
    </>) : (<>
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-main">äºç®æ¶åã¢ãã¿ãªã³ã°ï¼èªåç£è¦ï¼</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">ç£è¦ä¸­ ï½ æ¯æ¥ 9:00 èªåãã§ãã¯</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {ALERT_LEVELS.map((lv, i) => (
            <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: lv.bg }}>
              <p className="text-xs font-bold" style={{ color: lv.color }}>{lv.label}</p>
              <p className="text-lg font-black" style={{ color: lv.color }}>{lv.threshold}%ã</p>
              <p className="text-[10px]" style={{ color: lv.color }}>æ¶åç</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-sub">Slackéç¥é£æºå¯¾å¿ ï½ é¾å¤å°éæã«èªåã¢ã©ã¼ãéä¿¡ ï½ éè¤éç¥é²æ­¢æ©è½ä»ã</p>
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
                  <p className="text-xs text-text-sub mt-0.5">{s.jurisdiction} ï½ {s.pref}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-sub">æ®äºç®</p>
                  <p className="text-sm font-bold text-text-main">{(remaining / 100000000).toFixed(1)}åå</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[10px] text-text-sub mb-1">
                  <span>æ¶å: {(s.usedBudget / 100000000).toFixed(1)}åå</span>
                  <span>ç·äºç®: {(s.totalBudget / 100000000).toFixed(1)}åå</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: alert ? alert.color : "#7c3aed" }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-text-sub">
                  <span>ð æé: {s.deadline}</span>
                  {daysLeft && <span>â³ äºç®çµäºäºæ¸¬: ç´{daysLeft}æ¥å¾</span>}
                </div>
                {alert && alert.threshold >= 85 && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 animate-pulse">ð Slackéç¥æ¸ã¿</span>}
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
    <ToolHeader title="çµå¶åæ" color="#e11d48" onCreateNew={onCreateNew} onExport={onExport} />
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{ label: "å¹´éå£²ä¸", value: "Â¥6å8,000ä¸", change: "+12.3%" }, { label: "å¹´éç²å©", value: "Â¥1å5,800ä¸", change: "+8.7%" }, { label: "å¹³åç²å©ç", value: "23.2%", change: "+1.5%" }, { label: "åæ³¨æ®", value: "Â¥4å2,000ä¸", change: "+15.2%" }].map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4"><p className="text-xs text-text-sub">{s.label}</p><p className="text-xl font-black text-text-main">{s.value}</p><p className="text-xs text-green-600 font-bold mt-1">{s.change} åå¹´æ¯</p></div>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">ææ¬¡å£²ä¸æ¨ç§»</h3>
        <div className="flex items-end gap-2 h-40">
          {[42, 55, 48, 62, 58, 70, 65, 78, 72, 85, 68, 80].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-blue-500 rounded-t" style={{ height: `${v}%` }} /><span className="text-[9px] text-text-sub">{i + 1}æ</span></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-sm mb-4">å·¥ç¨®å¥å£²ä¸æ§æ</h3>
        <div className="space-y-3">
          {[{ name: "æ°ç¯å·¥äº", percent: 45, color: "#3b82f6" }, { name: "æ¹ä¿®å·¥äº", percent: 25, color: "#10b981" }, { name: "ãªãã©ã¼ã ", percent: 15, color: "#f59e0b" }, { name: "å¤æ§å·¥äº", percent: 10, color: "#8b5cf6" }, { name: "ãã®ä»", percent: 5, color: "#6b7280" }].map((item, i) => (
            <div key={i}><div className="flex justify-between text-sm mb-1"><span>{item.name}</span><span className="font-bold">{item.percent}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} /></div></div>
          ))}
        </div>
      </div>
    </div>
  </>);
}

// ============ ããã·ã¥ãã¼ããã¼ã  ============

function DashboardHome({ onToolSelect }: { onToolSelect: (id: string) => void }) {
  return (<>
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4 M12 8h.01" /></svg>
        </div>
        <div><p className="font-bold text-blue-800">ãã¢ã¢ã¼ãã§é²è¦§ä¸­</p><p className="text-sm text-blue-600">å·¦ãµã¤ããã¼ã¾ãã¯ä¸ã®ãã¼ã«ãã¯ãªãã¯ãã¦åæ©è½ãç¢ºèªã§ãã¾ã</p></div>
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[{ label: "é²è¡ä¸­ã®å·¥äº", value: "12", change: "+2", color: "#3b82f6" }, { label: "ä»æã®å£²ä¸", value: "Â¥1,520ä¸", change: "+8.3%", color: "#10b981" }, { label: "æªååéé¡", value: "Â¥210ä¸", change: "-12%", color: "#f59e0b" }, { label: "ä»æã®ç²å©ç", value: "23.5%", change: "+1.2%", color: "#8b5cf6" }].map((card, i) => (
        <div key={i} className="bg-white rounded-xl border border-border p-4 sm:p-5"><p className="text-xs text-text-sub mb-1">{card.label}</p><p className="text-xl sm:text-2xl font-black text-text-main">{card.value}</p><p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.change} åææ¯</p></div>
      ))}
    </div>
    <div className="mb-6">
      <h2 className="text-sm font-bold text-text-main mb-4">ãã¼ã« ã¯ã¤ãã¯ã¢ã¯ã»ã¹</h2>
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
        <h3 className="text-sm font-bold text-text-main mb-4">æè¿ã®æ´æ°</h3>
        <div className="space-y-3">
          {[{ action: "è¦ç©æ¿èª", detail: "â³â³ãã«æ¹ä¿®å·¥äº - Â¥4,500,000", time: "1æéå" }, { action: "å·¥ç¨æ´æ°", detail: "â¡â¡ä½å®ãªãã©ã¼ã  - å®äºç 75%", time: "2æéå" }, { action: "å¥éç¢ºèª", detail: "ââåæ¥­æ½è¨­ - Â¥8,200,000", time: "æ¬æ¥" }, { action: "åºååé¿", detail: "Instagramåºå - ååã3ä»¶", time: "æ¬æ¥" }, { action: "çºæ³¨å®äº", detail: "ABCå»ºæ - ééª¨ææä¸å¼", time: "æ¨æ¥" }].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">{item.action}</span><span className="text-sm text-text-main">{item.detail}</span></div>
              <span className="text-xs text-text-sub whitespace-nowrap ml-2">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-main mb-4">å·¥äºé²æãµããªã¼</h3>
        <div className="space-y-4">
          {[{ name: "ââãã³ã·ã§ã³æ°ç¯å·¥äº", progress: 65 }, { name: "â³â³ãã«æ¹ä¿®å·¥äº", progress: 30 }, { name: "â¡â¡ä½å®ãªãã©ã¼ã ", progress: 75 }, { name: "ââåæ¥­æ½è¨­å¤æ§å·¥äº", progress: 90 }].map((project, i) => (
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

// ============ ã¡ã¤ã³ã³ã³ãã¼ãã³ã ============

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
    setToastMsg("ä¿å­ãã¾ãã");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExport = () => {
    setToastMsg("CSVã¨ã¯ã¹ãã¼ããéå§ãã¾ãã");
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
              ããã·ã¥ãã¼ã
            </button>
            <div className="pt-3 pb-2"><p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">ãã¼ã«</p></div>
            {renderSidebarTool("construction-ledger")}
            {renderSidebarTool("land-search")}
            {renderSidebarTool("subsidy")}
            <div>
              <button onClick={() => toggleGroup("estimate")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTool === "estimate" || estimateChildren.includes(activeTool || "") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#10b98130" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tools.find(t => t.id === "estimate")!.icon} /></svg>
                </div>
                <span className="flex-1 truncate text-left">è¦ç©ä½æ</span>
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
                <span className="flex-1 truncate text-left">ç®¡ç</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${managementGroupOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {managementGroupOpen && renderGroupChildren(managementChildren)}
            </div>
            {renderSidebarTool("analytics")}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
              <div className="flex-1 min-w-0"><p className="text-xs text-white truncate">{demoUser.email}</p><p className="text-[10px] text-white/50">ãã¢ã¢ã¼ã</p></div>
            </div>
            <Link href="/" className="block w-full text-xs text-white/50 hover:text-white/80 transition-colors text-left">ããããã¼ã¸ã«æ»ã</Link>
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
            <h1 className="text-lg font-bold text-text-main">{activeToolInfo ? activeToolInfo.name : "ããã·ã¥ãã¼ã"}</h1>
            {activeTool && <button onClick={() => setActiveTool(null)} className="text-xs text-text-sub hover:text-primary ml-2">â ããã·ã¥ãã¼ãã«æ»ã</button>}
          </div>
          <Link href="/" className="text-xs text-text-sub hover:text-primary transition-colors">ããããã¼ã¸</Link>
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
