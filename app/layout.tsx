import type { Metadata } from "next";

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
      <body
        style={{
          margin: 0,
          background: "#eef3f8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
