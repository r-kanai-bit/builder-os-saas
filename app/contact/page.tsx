"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type FormData = {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  employees: string;
  inquiryType: string;
  message: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    employees: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API endpoint
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="pt-20 sm:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-dark to-primary py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3">
              お問い合わせ・資料請求
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              ご質問・ご相談はお気軽にどうぞ。1営業日以内にご返信いたします。
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 sm:py-16 bg-bg-light">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {submitted ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-text-main mb-3">
                  お問い合わせありがとうございます
                </h2>
                <p className="text-text-sub mb-6">
                  内容を確認の上、1営業日以内にご連絡いたします。
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  トップページに戻る
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-10"
              >
                <h2 className="text-lg font-bold text-text-main mb-6">
                  お問い合わせフォーム
                </h2>

                <div className="space-y-5">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      会社名
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="例: 株式会社○○建設"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      ご担当者名
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="例: 山田 太郎"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      メールアドレス
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="例: info@example.com"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="例: 03-1234-5678"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Employees */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      従業員数
                    </label>
                    <select
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                    >
                      <option value="">選択してください</option>
                      <option value="1-5">1〜5名</option>
                      <option value="6-20">6〜20名</option>
                      <option value="21-50">21〜50名</option>
                      <option value="51-100">51〜100名</option>
                      <option value="101+">101名以上</option>
                    </select>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      お問い合わせ種別
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="inquiryType"
                      required
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                    >
                      <option value="">選択してください</option>
                      <option value="trial">無料トライアルのお申し込み</option>
                      <option value="document">資料請求</option>
                      <option value="demo">デモのご依頼</option>
                      <option value="price">料金のご相談</option>
                      <option value="other">その他のご質問</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1.5">
                      お問い合わせ内容
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="ご質問・ご要望をお書きください"
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Privacy Notice */}
                <p className="text-xs text-text-sub mt-5 mb-6">
                  ご記入いただいた個人情報は、お問い合わせへの対応およびサービスのご案内のために利用いたします。
                  詳しくは
                  <a href="#" className="text-primary hover:underline">
                    プライバシーポリシー
                  </a>
                  をご確認ください。
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-light text-white font-bold text-base rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  送信する
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
