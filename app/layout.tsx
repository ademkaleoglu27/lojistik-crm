import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Lojistik CRM',
  description: 'Müşteri, teklif ve ajanda yönetimi için CRM sistemi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '20px 16px 40px',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
