import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIOS Pro",
  description: "HIOS Intelligent Investment Research Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
