'use client';

import { useState } from 'react';

type PlaceResult = {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  website: string;
  mapsUrl: string;
};

export default function FirmaBulPage() {
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setResults([]);

    if (!city.trim()) {
      setError('Lütfen bir şehir giriniz.');
      return;
    }

    setLoading(true);

    try {
      // DÜZELTME: Artık kendi yazdığımız backend servisine istek atıyoruz.
      // API Key kontrolünü backend (route.ts) yapıyor.
      const params = new URLSearchParams({
        city: city,
        keyword: keyword || 'lojistik firma',
        // segment parametresini opsiyonel bıraktım
      });

      const res = await fetch(`/api/google-places?${params.toString()}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Sunucu hatası');
      }

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setError('Aradığınız kriterlere uygun sonuç bulunamadı.');
        setLoading(false);
        return;
      }

      // Gelen veriyi formatlıyoruz
      const formatted: PlaceResult[] = data.results.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || 'İsimsiz Firma',
        address: item.address || '',
        phone: item.phone || '',
        city: item.city || city,
        website: item.website || '',
        // Google Maps'te o firmayı açmak için güvenli link
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`
      }));

      setResults(formatted);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing')) {
        setError('Sistem Hatası: API Anahtarı sunucuda tanımlanmamış.');
      } else {
        setError('Arama sırasında bir hata oluştu: ' + err.message);
      }
    }

    setLoading(false);
  };

  const handleAddToCRM = (firma: PlaceResult) => {
    const existing = JSON.parse(
      localStorage.getItem('firms-v1') || '[]'
    );

    // Aynı firma daha önce eklenmiş mi kontrol et (Opsiyonel)
    const isExist = existing.some((f: any) => f.name === firma.name);
    if (isExist) {
        alert('Bu firma listenizde zaten mevcut!');
        return;
    }

    const newFirm = {
      id: crypto.randomUUID(),
      name: firma.name,
      contact: '', // Google'dan yetkili adı gelmez
      phone: firma.phone || '',
      city: firma.city,
      segment: 'İnternet Araması',
      note: `${firma.address} - Web: ${firma.website}`,
      createdAt: new Date().toISOString(),
      // Backend'den lat/lng çekmedik, gerekirse route.ts güncellenmeli.
      // Şimdilik 0,0 veriyoruz veya adres bazlı çalışıyoruz.
      latitude: 0, 
      longitude: 0 
    };

    const updated = [newFirm, ...existing];
    localStorage.setItem('firms-v1', JSON.stringify(updated));

    alert(`${firma.name} başarıyla CRM’e eklendi!`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '24px 14px',
        maxWidth: '900px',
        margin: '0 auto',
        color: '#e5e7eb'
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>
        🔍 İnternetten Firma Bul
      </h1>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
        Google Places üzerinden şehir + anahtar kelime ile güncel firma verisi çekin.
      </p>

      {/* Arama alanları */}
      <div
        className="teklif-form"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '12px'
        }}
      >
        <div className="field">
          <label>Şehir</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Örn: İstanbul"
          />
        </div>

        <div className="field">
          <label>Anahtar Kelime</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Örn: Lojistik, Gümrük, Tekstil..."
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={loading}
        style={{
          borderRadius: '999px',
          padding: '8px 14px',
          border: '1px solid rgba(56,189,248,0.9)',
          background: loading ? '#334155' : 'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
          color: loading ? '#94a3b8' : '#0f172a',
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '13px',
          marginBottom: '16px',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Aranıyor...' : '🔍 Firma Ara'}
      </button>

      {error && (
        <div style={{ 
            padding: '10px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '8px',
            color: '#fca5a5',
            marginBottom: '15px',
            fontSize: '14px'
        }}>
            ⚠️ {error}
        </div>
      )}

      {/* Sonuç kartları */}
      <div className="firma-result-wrapper">
        {results.map((firma, i) => (
          <div key={i} className="firma-result-card">
            <div className="firma-result-header">
              <div className="firma-result-name">{firma.name}</div>
              <div className="firma-result-city">{firma.city}</div>
            </div>

            <div className="firma-result-meta">
              <span>📍 {firma.address}</span>
              {firma.phone && <span>📞 {firma.phone}</span>}
              {firma.website && <span>🌐 <a href={firma.website} target="_blank" rel="noreferrer" style={{color:'#38bdf8'}}>Web Sitesi</a></span>}
            </div>

            <div className="firma-result-actions">
              <button
                className="primary"
                onClick={() => handleAddToCRM(firma)}
              >
                ➕ CRM'e Ekle
              </button>

              <a
                href={firma.mapsUrl}
                target="_blank"
                rel="noreferrer"
                style={{textDecoration:'none', color: '#94a3b8', fontSize: '12px', display:'flex', alignItems:'center', gap:'4px'}}
              >
                🗺 Haritada Gör
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}