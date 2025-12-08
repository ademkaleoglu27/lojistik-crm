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
          'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
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
          maxWidth: '380px',
          borderRadius: '18px',
          padding: '20px 18px 16px',
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.95))',
          border: '1px solid rgba(148,163,184,0.7)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.85)',
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          Lojistik CRM Giriş
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '14px',
          }}
        >
          Kullanıcı adınız ve şifrenizle sisteme giriş yapın.
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
    </main>
  );
}
