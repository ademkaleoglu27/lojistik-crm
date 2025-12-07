// app/page.tsx

'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px',
        backgroundColor: '#020617',
        color: '#f8fafc',
      }}
    >
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Lojistik CRM Uygulaması
      </h1>

      <p style={{ fontSize: '16px', opacity: 0.8 }}>
        Aşağıdaki seçeneklerden devam edebilirsiniz.
      </p>

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link href="/dashboard">
          <div style={{
            padding: '16px',
            background: '#1e293b',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            📊 CRM Paneline Git
          </div>
        </Link>

        <Link href="/firma-bul">
          <div style={{
            padding: '16px',
            background: '#1e293b',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            🔍 İnternetten Müşteri Bul
          </div>
        </Link>
      </div>
    </main>
  );
}
