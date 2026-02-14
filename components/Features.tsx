const features = [
  {
    name: "工事台帳",
    desc: "全工事の情報を一元管理。進捗・契約・担当者を一目で把握。",
    icon: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
  },
  {
    name: "見積作成",
    desc: "テンプレートで素早く見積書を作成。PDF出力にも対応。",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  },
  {
    name: "実行予算",
    desc: "工事別の予算を科目ごとに管理。予実差異をリアルタイムで把握。",
    icon: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    name: "発注管理",
    desc: "協力業者への発注を一括管理。発注書の作成から承認まで。",
    icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  },
  {
    name: "工程管理",
    desc: "ガントチャートで工程を可視化。遅延を即座に検知。",
    icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  },
  {
    name: "入金管理",
    desc: "請求・入金状況を一覧管理。未回収を自動アラート。",
    icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22",
  },
  {
    name: "原価管理",
    desc: "工事別の原価をリアルタイムで集計。粗利率を自動計算。",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    name: "日報管理",
    desc: "現場からスマホで日報提出。写真添付・天候記録に対応。",
    icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  },
  {
    name: "写真管理",
    desc: "工事写真をクラウドで一元管理。台帳自動生成にも対応。",
    icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    name: "顧客管理",
    desc: "顧客情報と過去の工事履歴を紐付けて管理。リピート受注を促進。",
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  {
    name: "アフター管理",
    desc: "引渡し後の定期点検・クレーム対応を漏れなく管理。",
    icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  },
  {
    name: "書類管理",
    desc: "契約書・図面・許可書等をクラウドで安全に保管・共有。",
    icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  },
  {
    name: "業者管理",
    desc: "協力業者の情報・評価・取引履歴を一元管理。",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    name: "経営分析",
    desc: "売上・利益・受注状況をダッシュボードで可視化。経営判断を支援。",
    icon: "M18 20V10 M12 20V4 M6 20v-6",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wider uppercase mb-3">
            FEATURES
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main mb-4">
            建設業に必要な
            <span className="text-primary">14のツール</span>を
            <br className="sm:hidden" />
            ワンストップで
          </h2>
          <p className="text-text-sub text-base sm:text-lg max-w-2xl mx-auto">
            すべてのツールが連携し、データの二重入力を排除。
            業務全体の効率を最大化します。
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative bg-white border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-transparent hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: "#18181b10" }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-text-main mb-1.5">
                {f.name}
              </h3>
              <p className="text-xs sm:text-sm text-text-sub leading-relaxed">
                {f.desc}
              </p>
              {/* Hover border accent */}
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "#18181b" }}
              />
            </div>
          ))}
        </div>

        {/* Integration Note */}
        <div className="mt-10 sm:mt-14 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-2xl p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm sm:text-base mb-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            すべてのツールがシームレスに連携
          </div>
          <p className="text-sm text-text-sub max-w-xl mx-auto">
            工事台帳に登録した情報は、見積・発注・原価・日報すべてのツールに自動反映。
            データの二重入力をゼロにします。
          </p>
        </div>
      </div>
    </section>
  );
}
