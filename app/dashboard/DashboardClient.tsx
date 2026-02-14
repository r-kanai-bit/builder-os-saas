"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Subscription = {
  plan: string;
  status: string;
  current_period_end: string;
} | null;

type User = {
  id: string;
  email: string;
  companyName: string;
};

const tools = [
  { name: "工事台帳", icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z", color: "#3b82f6" },
  { name: "見積作成", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "#10b981" },
  { name: "実行予算", icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "#f59e0b" },
  { name: "発注管理", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", color: "#ef4444" },
  { name: "工程管理", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", color: "#8b5cf6" },
  { name: "入金管理", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", color: "#06b6d4" },
  { name: "原価管理", icon: "M22 12h-4l-3 9L9 3l-3 9H2", color: "#ec4899" },
  { name: "日報管理", icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z", color: "#14b8a6" },
  { name: "写真管理", icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", color: "#f97316" },
  { name: "顧客管理", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", color: "#6366f1" },
  { name: "アフター管理", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3", color: "#84cc16" },
  { name: "書類管理", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", color: "#a855f7" },
  { name: "業者管理", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", color: "#0ea5e9" },
  { name: "経営分析", icon: "M18 20V10 M12 20V4 M6 20v-6", color: "#e11d48" },
];

const planNames: Record<string, string> = {
  starter: "スターター",
  pro: "プロ",
};

export default function DashboardClient({
  user,
  subscription,
}: {
  user: User;
  subscription: Subscription;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleUpgrade = async (planKey: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary-dark transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Builder OS</span>
            </div>
            {user.companyName && (
              <p className="text-xs text-white/50 mt-2 truncate">
                {user.companyName}
              </p>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Dashboard Home */}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              ダッシュボード
            </a>

            <div className="pt-3 pb-2">
              <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                ツール
              </p>
            </div>

            {tools.map((tool, i) => (
              <a
                key={i}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-sm transition-colors"
              >
                <div
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ backgroundColor: tool.color + "30" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tool.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={tool.icon} />
                  </svg>
                </div>
                {tool.name}
              </a>
            ))}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{user.email}</p>
                <p className="text-[10px] text-white/50">
                  {subscription
                    ? planNames[subscription.plan] ?? subscription.plan
                    : "無料トライアル"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-xs text-white/50 hover:text-white/80 transition-colors text-left"
            >
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 text-text-sub hover:text-text-main"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-text-main">ダッシュボード</h1>
          </div>
          <Link
            href="/"
            className="text-xs text-text-sub hover:text-primary transition-colors"
          >
            トップページ
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Subscription Banner */}
          {!subscription && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-amber-800 mb-1">
                    無料トライアル期間中
                  </h3>
                  <p className="text-sm text-amber-700">
                    すべての機能をお試しいただけます。トライアル終了前にプランをお選びください。
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgrade("starter")}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-800 text-sm font-bold rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    スターター ¥9,980/月
                  </button>
                  <button
                    onClick={() => handleUpgrade("pro")}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    プロ ¥24,980/月
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "進行中の工事",
                value: "12",
                change: "+2",
                color: "#3b82f6",
              },
              {
                label: "今月の売上",
                value: "¥15.2M",
                change: "+8.3%",
                color: "#10b981",
              },
              {
                label: "未回収金額",
                value: "¥2.1M",
                change: "-12%",
                color: "#f59e0b",
              },
              {
                label: "今月の粗利率",
                value: "23.5%",
                change: "+1.2%",
                color: "#8b5cf6",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-border p-4 sm:p-5"
              >
                <p className="text-xs text-text-sub mb-1">{card.label}</p>
                <p className="text-xl sm:text-2xl font-black text-text-main">
                  {card.value}
                </p>
                <p
                  className="text-xs font-medium mt-1"
                  style={{ color: card.color }}
                >
                  {card.change} 前月比
                </p>
              </div>
            ))}
          </div>

          {/* Quick Access Tools */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-text-main mb-4">
              ツール クイックアクセス
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
              {tools.map((tool, i) => (
                <button
                  key={i}
                  className="bg-white border border-border rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-transparent transition-all text-center group"
                >
                  <div
                    className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: tool.color + "15" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tool.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={tool.icon} />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-text-sub group-hover:text-text-main transition-colors">
                    {tool.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-text-main mb-4">
                最近の更新
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: "日報提出",
                    detail: "○○マンション新築工事 - 山田太郎",
                    time: "10分前",
                  },
                  {
                    action: "見積承認",
                    detail: "△△ビル改修工事 - ¥4,500,000",
                    time: "1時間前",
                  },
                  {
                    action: "工程更新",
                    detail: "□□住宅リフォーム - 完了率 75%",
                    time: "2時間前",
                  },
                  {
                    action: "入金確認",
                    detail: "●●商業施設 - ¥8,200,000",
                    time: "本日",
                  },
                  {
                    action: "写真追加",
                    detail: "○○マンション - 基礎工事 12枚",
                    time: "昨日",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mr-2">
                        {item.action}
                      </span>
                      <span className="text-sm text-text-main">
                        {item.detail}
                      </span>
                    </div>
                    <span className="text-xs text-text-sub whitespace-nowrap ml-2">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-text-main mb-4">
                工事進捗サマリー
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "○○マンション新築工事",
                    progress: 65,
                    status: "進行中",
                  },
                  {
                    name: "△△ビル改修工事",
                    progress: 30,
                    status: "進行中",
                  },
                  {
                    name: "□□住宅リフォーム",
                    progress: 75,
                    status: "進行中",
                  },
                  {
                    name: "●●商業施設外構工事",
                    progress: 90,
                    status: "完了間近",
                  },
                ].map((project, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-main font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-text-sub">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor:
                            project.progress >= 80
                              ? "#10b981"
                              : project.progress >= 50
                              ? "#3b82f6"
                              : "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
