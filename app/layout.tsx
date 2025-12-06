import type { Metadata } from "next";
import "./globals.css";
// Az önce yaptığımız Header dosyasını çağırıyoruz:
import { Header } from "@/components/header"; 

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
      <body className="bg-gray-50 min-h-screen">
        {/* Menüyü en tepeye koyduk */}
        <Header />
        
        {/* Sayfa içerikleri buraya gelecek */}
        <main>{children}</main>
      </body>
    </html>
  );
}
