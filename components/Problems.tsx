export default function Problems() {
  const problems = [
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      title: "書類が多すぎて管理しきれない",
      description:
        "見積書・請求書・工程表・日報...紙とExcelが混在し、どこに何があるかわからない状態に。",
      stat: "年間 約2,000時間",
      statLabel: "書類探しに費やす時間",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "現場と事務所の情報共有が困難",
      description:
        "電話やFAXでのやりとりでは、伝達ミスや対応の遅れが頻発。リアルタイムの情報共有ができない。",
      stat: "月平均 15件",
      statLabel: "伝達ミスによるトラブル",
    },
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      title: "原価管理が曖昧で利益が見えない",
      description:
        "工事ごとの収支が不明確。赤字工事に気づくのが完工後では手遅れに。",
      stat: "約30%",
      statLabel: "原価超過に気づかない工事の割合",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-bg-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wider uppercase mb-3">
            PROBLEMS
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main mb-4">
            建設業が抱える
            <span className="text-primary">3つの課題</span>
          </h2>
          <p className="text-text-sub text-base sm:text-lg max-w-2xl mx-auto">
            多くの建設会社が直面するこれらの課題を、Builder
            OSはワンストップで解決します。
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <div className="w-14 h-14 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-5">
                {problem.icon}
              </div>
              <h3 className="text-lg font-bold text-text-main mb-3">
                {problem.title}
              </h3>
              <p className="text-sm text-text-sub leading-relaxed mb-5">
                {problem.description}
              </p>
              <div className="bg-zinc-100 rounded-lg px-4 py-3">
                <p className="text-xl font-black text-zinc-900">
                  {problem.stat}
                </p>
                <p className="text-xs text-zinc-500">{problem.statLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Arrow */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary font-bold text-sm sm:text-base px-6 py-3 rounded-full">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            これらの課題をBuilder OSがすべて解決
          </div>
        </div>
      </div>
    </section>
  );
}
