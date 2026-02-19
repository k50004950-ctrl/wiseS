import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WISE 수임동의",
  description: "WISE 내부 수임동의 트래킹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
