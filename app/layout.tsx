import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스테이블코인 매니저 | DSRV",
  description: "온체인 결제를 단일표준화하는 오케스트레이션 엔진",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
