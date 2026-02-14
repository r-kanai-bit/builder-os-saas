"use client";

import { useState } from "react";

const faqs = [
  {
    q: "無料トライアル中に機能制限はありますか？",
    a: "いいえ、30日間の無料トライアル期間中はプロプランの全機能をご利用いただけます。トライアル終了後は自動的にご請求が開始されますが、いつでもキャンセル可能です。",
  },
  {
    q: "建設業以外でも利用できますか？",
    a: "Builder OSは建設業に特化して設計されています。工事管理・見積・原価管理などの機能は建設業界の業務フローに最適化されています。設備工事・電気工事・リフォームなど建設関連の幅広い業種でご利用いただけます。",
  },
  {
    q: "導入にどのくらい時間がかかりますか？",
    a: "アカウント作成から利用開始まで最短即日です。クラウドサービスのため、ソフトのインストールは不要。初期設定（会社情報の登録等）は約10分で完了します。データ移行が必要な場合は、サポートチームがお手伝いいたします。",
  },
  {
    q: "スマートフォンから利用できますか？",
    a: "はい、すべての機能がスマートフォン・タブレットに対応しています。現場からの日報提出・写真アップロード・工程確認など、外出先でもすべての操作が可能です。",
  },
  {
    q: "データのセキュリティは大丈夫ですか？",
    a: "SSL/TLS暗号化通信、データの日次自動バックアップ、AWS上での冗長化構成など、エンタープライズレベルのセキュリティを標準装備しています。ISMS認証の取得も予定しています。",
  },
  {
    q: "既存のExcelデータを移行できますか？",
    a: "はい、CSVインポート機能により、既存のExcelデータ（顧客情報・業者情報・工事データ等）をスムーズに移行できます。プロプラン以上では、サポートチームによる移行支援も無料で提供しています。",
  },
  {
    q: "契約の縛りや解約違約金はありますか？",
    a: "月額プランには契約の縛りや解約違約金は一切ありません。いつでもお好きなタイミングで解約可能です。年間契約をお選びいただくと20%の割引が適用されます。",
  },
  {
    q: "他の会計ソフトとの連携は可能ですか？",
    a: "プロプラン以上でAPI連携機能をご利用いただけます。弥生会計・freee・マネーフォワードなど主要な会計ソフトとの連携に対応しています。",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-bg-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wider uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main mb-4">
            よくある
            <span className="text-primary">ご質問</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
              >
                <span className="font-bold text-sm sm:text-base text-text-main">
                  {faq.q}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`flex-shrink-0 text-text-sub transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                  <p className="text-sm text-text-sub leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
