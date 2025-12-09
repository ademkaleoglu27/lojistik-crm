import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "Lojistik CRM",
  description: "Müşteri, teklif ve ajanda yönetimi için CRM sistemi.",
  manifest: "/manifest.webmanifest",
  themeColor: "#020617",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png"
  }
};

// Mobil için viewport – zoom kapalı, tam ekran
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
