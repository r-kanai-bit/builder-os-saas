import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
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
              <span className="text-lg font-bold">Builder OS</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              建設業に必要な14のツールをワンストップで提供する
              <br />
              業務効率化クラウドシステム
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">
              プロダクト
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#features"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  機能一覧
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  料金プラン
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  導入事例
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  よくある質問
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">サポート</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  操作マニュアル
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  導入サポート
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white/90">法的情報</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  利用規約
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  特定商取引法に基づく表記
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Harmony Inc. All rights reserved.
          </p>
          <p className="text-xs text-white/40">Builder OS v1.0</p>
        </div>
      </div>
    </footer>
  );
}
