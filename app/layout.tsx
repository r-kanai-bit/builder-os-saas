import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder OS | 建設業向け 業務効率化クラウドシステム",
  description:
    "見積・工程管理・日報・原価管理など建設業に必要な14のツールをワンストップで提供。現場の生産性を劇的に向上させるクラウドシステム。",
  keywords: "建設業,業務効率化,工事管理,見積,工程管理,日報,原価管理,クラウド,SaaS",
  openGraph: {
    title: "Builder OS | 建設業向け 業務効率化クラウドシステム",
    description:
      "見積・工程管理・日報・原価管理など建設業に必要な14のツールをワンストップで提供。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
