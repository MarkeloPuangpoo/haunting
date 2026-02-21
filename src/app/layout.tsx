import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HarnTung — หารตังค์",
  description: "แอปหารค่าใช้จ่ายกลุ่ม คำนวณอัตโนมัติ พร้อม QR PromptPay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
