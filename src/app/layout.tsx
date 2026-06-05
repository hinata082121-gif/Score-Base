import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Score Base | 野球観戦記録・スコアブック管理アプリ",
  description: "Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。",
  keywords: ["Score Base", "野球観戦記録", "スコアブック", "野球スコア", "草野球", "学生野球", "試合記録", "個人成績", "チーム成績"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Score Base | 野球観戦記録・スコアブック管理アプリ",
    description: "Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。",
    siteName: "Score Base",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "Score Base | 野球観戦記録・スコアブック管理アプリ",
    description: "Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。",
  },
  appleWebApp: {
    capable: true,
    title: "Score Base",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-stone-50 text-stone-950 antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
