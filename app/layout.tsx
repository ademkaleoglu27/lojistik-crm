import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "Lojistik CRM",
  description: "Müşteri, teklif ve ajanda yönetimi için CRM sistemi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
