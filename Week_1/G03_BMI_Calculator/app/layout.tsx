import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMI 계산기",
  description: "키와 몸무게를 입력하여 BMI를 계산합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
