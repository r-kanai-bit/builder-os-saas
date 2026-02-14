const features = [
  "14ツールすべて利用可能",
  "クラウドストレージ無制限",
  "電話・チャットサポート",
  "API連携（会計ソフト等）",
  "リアルタイムバックアップ",
  "モバイル完全対応",
  "カスタムレポート",
  "権限管理（部門別）",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-bg-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wider uppercase mb-3">
            PRICING
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main mb-4">
            シンプルで
            <span className="text-primary">わかりやすい</span>
            料金体系
          </h2>
          <p className="text-text-sub text-base sm:text-lg max-w-2xl mx-auto">
            全機能が使えるワンプラン。30日間の無料トライアル付き。初期費用・解約違約金は一切不要です。
          </p>
        </div>

        {/* Single Plan Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-2xl p-8 sm:p-10 bg-white shadow-xl border-2 border-zinc-900">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-zinc-900 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                全機能利用可能
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-1 text-primary">
                Builder OS
              </h3>
              <p className="text-sm text-text-sub mb-6">
                すべての住宅会社のために
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-text-sub">¥</span>
                <span className="text-5xl sm:text-6xl font-black text-text-main">
                  5,000
                </span>
                <span className="text-sm text-text-sub">/月（税別）</span>
              </div>
              <p className="text-xs text-text-sub mt-2">ユーザー数無制限</p>
            </div>

            {/* CTA */}
            <a
              href="#cta"
              className="block w-full text-center py-4 rounded-lg font-bold text-base transition-all duration-200 mb-8 bg-zinc-900 text-white hover:bg-black hover:shadow-lg"
            >
              30日間 無料で試す
            </a>

            {/* Features - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="2.5"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm text-text-main">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-text-sub mt-8">
          ※ 表示価格は税別です。初期費用・解約違約金は一切不要です。
        </p>
      </div>
    </section>
  );
}
