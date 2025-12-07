'use client';

import { useEffect, useState } from 'react';

type Firm = {
  id: string;
  name: string;
};

export default function TeklifHazirlaPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>('');
  const [manualFirma, setManualFirma] = useState('');
  const [yetkili, setYetkili] = useState('');
  const [iskonto, setIskonto] = useState<number | ''>('');
  const [istasyonIskonto, setIstasyonIskonto] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem('firms-v1');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { id: string; name: string }[];
      setFirms(parsed.map((f) => ({ id: f.id, name: f.name })));
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const firmFromList = firms.find((f) => f.id === selectedFirmId);
      const firmaIsmi = (manualFirma || firmFromList?.name || '').trim();

      if (!firmaIsmi) {
        setMessage('Lütfen firma ismini seçin veya manuel girin.');
        setLoading(false);
        return;
      }

      if (!yetkili.trim()) {
        setMessage('Lütfen yetkili ismini girin.');
        setLoading(false);
        return;
      }

      const payload = {
        firmaIsmi,
        yetkiliIsmi: yetkili.trim(),
        iskontoOrani: typeof iskonto === 'number' ? iskonto : 0,
        anlasmaliIstasyonIskontoOrani:
          typeof istasyonIskonto === 'number' ? istasyonIskonto : 0,
      };

      const res = await fetch('/api/teklif-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setMessage('Teklif dosyası oluşturulurken bir hata oluştu.');
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Teklif-${firmaIsmi}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage('Teklif dosyanız indirildi.');
    } catch (err) {
      console.error(err);
      setMessage('Beklenmeyen bir hata oluştu.');
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        padding: '20px 16px 80px',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: '6px',
            }}
          >
            Teklif • Word Çıktısı
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Teklif Hazırla (Word)
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              maxWidth: '520px',
            }}
          >
            Kayıtlı firmayı seçerek veya manuel firma girerek, şirket Word
            formatındaki teklif şablonunuzu otomatik doldurup indirebilirsiniz.
          </p>
        </header>

        <section
          style={{
            borderRadius: '16px',
            padding: '16px 14px 14px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))',
            border: '1px solid rgba(148,163,184,0.55)',
            boxShadow: '0 18px 40px rgba(15,23,42,0.95)',
          }}
        >
          <form onSubmit={handleSubmit} className="teklif-form">
            <div className="field">
              <label
                style={{
                  color: '#f9fafb',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                Kayıtlı firmadan seç
              </label>
              <select
                value={selectedFirmId}
                onChange={(e) => setSelectedFirmId(e.target.value)}
              >
                <option value="">(İsterseniz boş bırakabilirsiniz)</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Firma adı (manuel)</label>
              <input
                value={manualFirma}
                onChange={(e) => setManualFirma(e.target.value)}
                placeholder="Listeyi kullanmak istemezseniz buraya yazın"
              />
            </div>

            <div className="field">
              <label>Yetkili ismi</label>
              <input
                value={yetkili}
                onChange={(e) => setYetkili(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              <div className="field">
                <label>Genel iskonto (%)</label>
                <input
                  type="number"
                  value={iskonto}
                  onChange={(e) =>
                    setIskonto(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="Örn: 3.5"
                />
              </div>
              <div className="field">
                <label>Anlaşmalı istasyon iskonto (%)</label>
                <input
                  type="number"
                  value={istasyonIskonto}
                  onChange={(e) =>
                    setIstasyonIskonto(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="Örn: 5.0"
                />
              </div>
            </div>

            {message && (
              <p
                style={{
                  fontSize: '12px',
                  marginTop: '6px',
                  color: message.includes('hata') ? '#f97373' : '#bbf7d0',
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                borderRadius: '999px',
                border: '1px solid rgba(56,189,248,0.9)',
                background:
                  'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0f172a',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                width: '100%',
              }}
            >
              {loading ? 'Teklif hazırlanıyor...' : 'Word teklif dosyasını indir'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
