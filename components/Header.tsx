"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "機能", href: "#features" },
    { label: "料金", href: "#pricing" },
    { label: "導入事例", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center">
              <svg
                width="22"
                height="22"
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
            <div>
              <span className="text-lg sm:text-xl font-bold text-zinc-900">
                Builder OS
              </span>
              <span className="hidden sm:block text-[10px] text-text-sub -mt-1">
                建設業向け業務効率化システム
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-sub hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/contact"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              お問い合わせ
            </Link>
            <a
              href="#cta"
              className="inline-flex items-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-black hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              無料トライアル
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-sub hover:text-primary"
            aria-label="メニュー"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block text-base font-medium text-text-sub hover:text-primary py-2"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border space-y-3">
              <Link
                href="/contact"
                className="block text-base font-medium text-primary py-2"
              >
                お問い合わせ
              </Link>
              <a
                href="#cta"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-3 bg-zinc-900 text-white font-bold rounded-lg hover:bg-black"
              >
                無料トライアル
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
