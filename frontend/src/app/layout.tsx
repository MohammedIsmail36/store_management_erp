import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal'
});

export const metadata: Metadata = {
  title: 'نظام إدارة المخزون والمحاسبة',
  description: 'نظام ERP متكامل لإدارة المخزون والمحاسبة',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={tajawal.variable}>
      <body className={`${tajawal.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          richColors
          closeButton={false}
        />
      </body>
    </html>
  );
}
