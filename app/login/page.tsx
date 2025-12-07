'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'crm-current-user',
        JSON.stringify({
          username: username.trim(),
          loginAt: new Date().toISOString(),
        })
      );
    }

    router.push('/dashboard');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #0b1120 0, #020617 55%, #000 100%)',
        color: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          borderRadius: '22px',
          padding: '20px 20px 18px',
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))',
          border: '1px solid rgba(148,163,184,0.7)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.85)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: '16px',
        }}
      >
        {/* Sol: logo + hero metin */}
        <div
          style={{
            borderRight: '1px solid rgba(30,41,59,0.9)',
            paddingRight: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background:
                  'radial-gradient(circle at top left, #38bdf8, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px',
                color: '#0b1120',
              }}
            >
              LC
            </div>
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                Lojistik CRM
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                }}
              >
                Müşteri • Teklif • Ajanda • Kârlılık
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            Saha satışını kontrol altına alın
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: '#cbd5e1',
              marginBottom: '10px',
            }}
          >
            Tüm müşteri görüşmeleri, teklif oranları ve akaryakıt kârlılığını
            tek panelden yönetin. Filo sahipleriyle yaptığınız anlaşmaları
            kaybedip unutmadan takip edin.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '12px',
              color: '#e5e7eb',
            }}
          >
            <li>✅ Firma kartı + teklif geçmişi aynı ekranda</li>
            <li>✅ Ajanda ile ziyaret ve arama planı</li>
            <li>✅ Karlılık ekranıyla aylık / yıllık kazanç gösterimi</li>
            <li>✅ Müşteri konumu ile tek tıkla yol tarifi</li>
          </ul>
        </div>

        {/* Sağ: login formu */}
        <div>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Hesabınıza giriş yapın
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '10px',
            }}
          >
            Giriş yaptıktan sonra CRM, ajanda, teklif ve kârlılık ekranlarına
            erişebilirsiniz.
          </p>

          <form onSubmit={handleLogin} className="teklif-form">
            <div className="field">
              <label>Kullanıcı Adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: adem"
              />
            </div>

            <div className="field">
              <label>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#f97373',
                  marginTop: '4px',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                marginTop: '10px',
                width: '100%',
                borderRadius: '999px',
                border: '1px solid rgba(56,189,248,0.9)',
                background:
                  'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
