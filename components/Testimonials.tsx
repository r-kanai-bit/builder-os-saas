const testimonials = [
  {
    name: "株式会社 丸和建設",
    role: "代表取締役 松本 宏樹",
    location: "東京都世田谷区",
    employees: "従業員 42名",
    quote:
      "導入前はExcelで見積書を作るのに半日かかっていましたが、今は30分で完成します。月末の請求処理も劇的に楽になりました。",
    metric: "業務時間 60%削減",
    avatar: "M",
  },
  {
    name: "中村住建株式会社",
    role: "工事部長 中村 誠一",
    location: "大阪府堺市",
    employees: "従業員 18名",
    quote:
      "現場の日報が紙からスマホに変わり、事務所との情報共有がリアルタイムに。伝達ミスがほぼゼロになりました。",
    metric: "伝達ミス 95%減少",
    avatar: "N",
  },
  {
    name: "渡辺ホーム株式会社",
    role: "経営管理部 渡辺 裕子",
    location: "愛知県名古屋市",
    employees: "従業員 75名",
    quote:
      "工事ごとの原価がリアルタイムで見えるようになり、赤字工事を未然に防げるようになりました。経営判断のスピードが格段に上がっています。",
    metric: "粗利率 8%改善",
    avatar: "W",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wider uppercase mb-3">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main mb-4">
            導入企業の
            <span className="text-primary">声</span>
          </h2>
          <p className="text-text-sub text-base sm:text-lg max-w-2xl mx-auto">
            全国の建設会社様にご利用いただき、業務改善を実感いただいています。
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-bg-light rounded-2xl p-6 sm:p-8 border border-border"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#18181b"
                    stroke="#18181b"
                    strokeWidth="1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-text-main leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric */}
              <div
                className="rounded-lg px-4 py-3 mb-6"
                style={{ backgroundColor: "#18181b10" }}
              >
                <p
                  className="text-lg font-black"
                  style={{ color: "#18181b" }}
                >
                  {t.metric}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: "#18181b" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-text-main">{t.name}</p>
                  <p className="text-xs text-text-sub">
                    {t.role} / {t.location} / {t.employees}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-12 sm:mt-16 bg-zinc-900 rounded-2xl p-8 sm:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center text-white">
            {[
              { value: "500+", label: "導入企業数" },
              { value: "98%", label: "継続利用率" },
              { value: "60%", label: "平均業務時間削減" },
              { value: "4.8", label: "顧客満足度（5点満点）" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
