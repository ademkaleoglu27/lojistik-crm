import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header"; 
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Lojistik Takip",
  description: "Saha satış ve lojistik takip uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 min-h-screen pb-20">
        
        {/* Üst Menü */}
        <Header />
        
        {/* Sayfa İçeriği */}
        <main>{children}</main>

        {/* Alt Menü */}
        <BottomNav />
        
      </body>
    </html>
  );
}