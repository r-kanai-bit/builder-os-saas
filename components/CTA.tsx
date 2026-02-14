import Link from "next/link";

export default function CTA() {
  return (
    <section
      id="cta"
      className="py-16 sm:py-24 bg-zinc-950 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6">
          まずは30日間、無料で体験してみませんか？
        </h2>
        <p className="text-base sm:text-lg text-white/60 mb-8 sm:mb-10 max-w-2xl mx-auto">
          初期費用ゼロ・クレジットカード登録不要。
          今すぐアカウントを作成して、Builder OSの全機能をお試しください。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href="#"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white hover:bg-zinc-100 text-zinc-900 text-lg font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            無料トライアルを始める
          </a>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-white/20 text-white text-lg font-bold rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            資料請求・お問い合わせ
          </Link>
        </div>

        {/* Trust elements */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            30日間完全無料
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            クレジットカード不要
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            いつでも解約OK
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            導入サポート付き
          </div>
        </div>
      </div>
    </section>
  );
}
