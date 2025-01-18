import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AntdRegistry from "@/lib/antd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "秋林的博客",
    template: "%s - 秋林的博客",
  },
  description: "个人博客系统",
  keywords: ["博客", "技术博客", "个人博客"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
