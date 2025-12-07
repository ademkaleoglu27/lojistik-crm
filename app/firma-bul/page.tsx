'use client';

import { useState } from 'react';

type PlaceResult = {
  name: string;
  address: string;
  phone: string;
  city: string;
  lat: number;
  lng: number;
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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        setError('Google API anahtarı bulunamadı.');
        setLoading(false);
        return;
      }

      const query = encodeURIComponent(
        `${city} ${keyword || 'lojistik firma'}`
      );

      // Google URL
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!data.results) {
        setError('Sonuç bulunamadı.');
        setLoading(false);
        return;
      }

      const formatted: PlaceResult[] = data.results.map((item: any) => ({
        name: item.name || 'Firma adı bulunamadı',
        address: item.formatted_address || '',
        phone: item.formatted_phone_number || '',
        city: city,
        lat: item.geometry?.location?.lat || 0,
        lng: item.geometry?.location?.lng || 0,
        mapsUrl: `https://www.google.com/maps?q=${item.geometry?.location?.lat},${item.geometry?.location?.lng}`
      }));

      setResults(formatted);
    } catch (err) {
      console.log(err);
      setError('Arama sırasında bir hata oluştu.');
    }

    setLoading(false);
  };

  const handleAddToCRM = (firma: PlaceResult) => {
    const existing = JSON.parse(
      localStorage.getItem('firms-v1') || '[]'
    );

    const newFirm = {
      id: crypto.randomUUID(),
      name: firma.name,
      contact: '',
      phone: firma.phone || '',
      city: firma.city,
      segment: 'Lojistik / Otomatik Kayıt',
      note: firma.address,
      createdAt: new Date().toISOString(),
      latitude: firma.lat,
      longitude: firma.lng
    };

    const updated = [newFirm, ...existing];
    localStorage.setItem('firms-v1', JSON.stringify(updated));

    alert('Firma CRM’e eklendi!');
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
        Google Places üzerinden şehir + anahtar kelime ile firma araması yapın.
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
            placeholder="Örn: lojistik, taşımacılık, turizm..."
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        style={{
          borderRadius: '999px',
          padding: '8px 14px',
          border: '1px solid rgba(56,189,248,0.9)',
          background:
            'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
          color: '#0f172a',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '16px'
        }}
      >
        🔍 Firma Ara
      </button>

      {loading && <p>Aranıyor...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {/* Sonuç kartları */}
      <div className="firma-result-wrapper">
        {results.map((firma, i) => (
          <div key={i} className="firma-result-card">
            <div className="firma-result-header">
              <div className="firma-result-name">{firma.name}</div>
              <div className="firma-result-city">{firma.city}</div>
            </div>

            <div className="firma-result-meta">
              <span>{firma.address}</span>
              {firma.phone && <span>{firma.phone}</span>}
            </div>

            <div className="firma-result-actions">
              <button
                className="primary"
                onClick={() => handleAddToCRM(firma)}
              >
                ➕ CRM&apos;e Ekle
              </button>

              <a
                href={firma.mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                🗺 Haritada Aç
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
