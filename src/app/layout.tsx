import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Viewport } from 'next';
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: '#ff512f',
};

export const metadata: Metadata = {
  applicationName: 'HarnTung',
  appleWebApp: {
    capable: true,
    title: 'HarnTung',
    statusBarStyle: 'default',
  },
  metadataBase: new URL('https://harntung.pondetpuangpoo.online'),
  title: 'HarnTung (หารตังค์) - แชร์ค่าใช้จ่ายกับเพื่อนง่ายๆ แค่ปลายนิ้ว',
  description: 'แอปหารเงิน คํานวณค่าใช้จ่ายตอนไปเที่ยวหรือกินเลี้ยงกับเพื่อนแบบแฟร์ๆ สรุปยอดอัตโนมัติ พร้อม QR Code โอนเงินตรงถึงมือจ่าย ไม่ต้องทวงซ้ำซาก',
  keywords: ['หารเงิน', 'หารตังค์', 'แชร์ค่าใช้จ่าย', 'คำนวณเงิน', 'แชร์บิล', 'เที่ยวกะเพื่อน', 'สลิป', 'จ่ายเงิน', 'หารบิล', 'split bill', 'thai expense tracking', 'แอปหารค่าข้าว'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HarnTung (หารตังค์) - แชร์ค่าใช้จ่ายกับเพื่อนง่ายๆ',
    description: 'แอปหารเงิน คํานวณค่าใช้จ่ายตอนไปเที่ยวหรือกินเลี้ยงกับเพื่อนแบบแฟร์ๆ สรุปยอดอัตโนมัติ',
    url: 'https://harntung.pondetpuangpoo.online',
    siteName: 'HarnTung',
    images: [
      {
        url: '/og-image.png', // ต้องเอารูปไปใส่ในโฟลเดอร์ public
        width: 1200,
        height: 630,
        alt: 'HarnTung App Preview',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarnTung (หารตังค์) - แชร์ค่าใช้จ่ายกับเพื่อน',
    description: 'ไปปาร์ตี้หรือทริปไหนก็ไม่ปวดหัวเรื่องเงิน! แอปหารเงิน สรุปยอด โชว์ QR พร้อมโอน',
    images: ['/og-image.png'], // ใช้รูปเดียวกับ Open Graph ได้เลย
  },
  authors: [{ name: 'HarnTung Team', url: 'https://harntung.pondetpuangpoo.online' }],
  creator: 'Pondet Puangpoo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body className={`${inter.variable} antialiased`}>
          {children}
          <Toaster position="top-center" richColors theme="dark" />
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
