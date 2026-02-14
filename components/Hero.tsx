export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 sm:pt-40 pb-16 sm:pb-24">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2318181b' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0h40v1H0zM0 40h40v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-zinc-900 rounded-full" />
          住宅会社のための業務OS
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-black text-zinc-900 leading-[1.2] mb-6 tracking-tight whitespace-nowrap">
          住宅会社の<span className="text-zinc-400">&ldquo;</span>利益構造<span className="text-zinc-400">&rdquo;</span>を、再設計する。
        </h1>

        <p className="text-base sm:text-lg text-zinc-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          見積・工程管理・日報・原価管理など、建設業に必要な
          <strong className="text-zinc-900">14のツール</strong>
          をワンストップで提供。
          紙やExcelでの煩雑な業務から解放されます。
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <a
            href="#cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-zinc-900 hover:bg-black text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            30日間 無料トライアル
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-zinc-200 text-zinc-700 text-base font-bold rounded-xl hover:bg-zinc-50 transition-all duration-200"
          >
            機能を見る
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-6 mt-10 justify-center text-zinc-400 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SSL暗号化
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            クレジットカード不要
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            即日利用可能
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-14 sm:mt-20 relative">
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-zinc-200">
            {/* Window Chrome */}
            <div className="bg-zinc-100 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-300" />
              <div className="w-3 h-3 rounded-full bg-zinc-300" />
              <div className="w-3 h-3 rounded-full bg-zinc-300" />
              <div className="flex-1 ml-3 bg-white rounded-md px-3 py-1 text-xs text-zinc-400">
                app.builder-os.jp/dashboard
              </div>
            </div>
            {/* Dashboard Image */}
            <img
              src="/dashboard-preview.png"
              alt="Builder OS ダッシュボード画面"
              className="w-full block"
            />
          </div>
          {/* Floating Badge */}
          <div className="absolute -bottom-4 left-4 sm:-left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border border-zinc-100">
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500">導入企業数</p>
              <p className="text-lg font-black text-zinc-900">500社以上</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
