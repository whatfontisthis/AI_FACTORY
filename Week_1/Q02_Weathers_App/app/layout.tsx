import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/contexts/LocationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "날씨 앱",
  description: "실시간 날씨 정보 및 주간 예보",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
