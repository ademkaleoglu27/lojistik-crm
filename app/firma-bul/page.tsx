'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- TİP TANIMLAMALARI ---
type PlaceResult = {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  website: string;
  mapsUrl: string;
  lat?: number;
  lng?: number;
  isAdded?: boolean;
};

// CRM Kayıt Formu (Müşteri Ekle sayfasıyla birebir aynı yapıda)
type ModalData = {
  name: string;
  contact: string;     // Yetkili
  phone: string;
  city: string;
  segment: string;     // Sektör
  vehicleCount: string;// Araç Sayısı
  status: string;      // Durum
  note: string;        // Notlar
  address: string;     // Açık Adres
  website: string;
  nextMeetingDate: string; // Ajanda / Randevu Tarihi
  lat: number;
  lng: number;
};

// Durum Seçenekleri (Renkli)
const STATUS_OPTIONS = [
  { value: 'Yeni', label: 'Yeni Aday', color: '#38bdf8' }, // Mavi
  { value: 'Potansiyel', label: '🔥 Potansiyel', color: '#22c55e' }, // Yeşil
  { value: 'Görüşüldü', label: '👀 Görüşüldü', color: '#fbbf24' }, // Sarı
  { value: 'Teklif', label: '📄 Teklif Aşamasında', color: '#a855f7' }, // Mor
  { value: 'Olumsuz', label: '❌ Olumsuz', color: '#94a3b8' }, // Gri
];

export default function FirmaBulPage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [error, setError] = useState('');

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFirmIndex, setCurrentFirmIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ModalData | null>(null);

  // Arama Fonksiyonu
  const handleSearch = async () => {
    setError('');
    setResults([]);

    if (!city.trim()) {
      setError('Lütfen bir şehir giriniz.');
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        city: city,
        keyword: keyword || 'lojistik firma',
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

      // Mevcut listedekileri kontrol et
      const existingCRM = JSON.parse(localStorage.getItem('firms-v1') || '[]');
      const existingNames = existingCRM.map((f: any) => f.name);

      const formatted: PlaceResult[] = data.results.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || 'İsimsiz Firma',
        address: item.address || '',
        phone: item.phone || '',
        city: item.city || city,
        website: item.website || '',
        mapsUrl: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(item.name + ' ' + item.address)}`,
        lat: item.lat || 0, // Backend'den geliyorsa al, yoksa 0
        lng: item.lng || 0,
        isAdded: existingNames.includes(item.name),
      }));

      setResults(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Arama sırasında bir hata oluştu: ' + err.message);
    }

    setLoading(false);
  };

  // 1. ADIM: Ekle butonuna basınca Modalı Aç
  const openAddModal = (firma: PlaceResult, index: number) => {
    const existing = JSON.parse(localStorage.getItem('firms-v1') || '[]');
    if (existing.some((f: any) => f.name === firma.name)) {
        alert('Bu firma zaten listenizde var.');
        return;
    }

    // Modal formunu Google verileriyle başlat
    setFormData({
      name: firma.name,
      contact: '', 
      phone: firma.phone,
      city: firma.city,
      segment: 'Lojistik', // Varsayılan sektör
      vehicleCount: '',    // Boş gelsin
      status: 'Yeni',
      note: `Google Araması: ${firma.address}`, 
      address: firma.address,
      website: firma.website,
      nextMeetingDate: '', // Boş gelsin
      lat: firma.lat || 0,
      lng: firma.lng || 0
    });

    setCurrentFirmIndex(index);
    setIsModalOpen(true);
  };

  // 2. ADIM: Verileri Kaydet
  const saveFromModal = () => {
    if (!formData || currentFirmIndex === null) return;

    const existing = JSON.parse(localStorage.getItem('firms-v1') || '[]');

    const newFirm = {
      id: crypto.randomUUID(),
      ...formData, // Tüm form verileri (araç sayısı, ajanda dahil)
      createdAt: new Date().toISOString(),
    };

    const updated = [newFirm, ...existing];
    localStorage.setItem('firms-v1', JSON.stringify(updated));

    // UI Güncelle
    const newResults = [...results];
    newResults[currentFirmIndex].isAdded = true;
    setResults(newResults);

    setIsModalOpen(false);
    setFormData(null);
    setCurrentFirmIndex(null);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '24px 14px',
        maxWidth: '900px',
        margin: '0 auto',
        color: '#e5e7eb',
        position: 'relative'
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>
        🔍 Akıllı Firma Bulucu
      </h1>

      {/* Arama Kutuları */}
      <div className="teklif-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <div className="field">
          <label>Şehir</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: İstanbul" />
        </div>
        <div className="field">
          <label>Sektör / Kelime</label>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Örn: Lojistik..." />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={loading}
        style={{
          borderRadius: '999px',
          padding: '10px',
          border: '1px solid rgba(56,189,248,0.9)',
          background: loading ? '#334155' : 'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
          color: loading ? '#94a3b8' : '#0f172a',
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          width: '100%',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Aranıyor...' : '🔍 Firmaları Getir'}
      </button>

      {error && <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', marginBottom: '15px' }}>⚠️ {error}</div>}

      {/* Sonuç Listesi */}
      <div className="firma-result-wrapper">
        {results.map((firma, i) => (
          <div key={i} className="firma-result-card" style={{ border: firma.isAdded ? '1px solid #22c55e' : '' }}>
            <div className="firma-result-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="firma-result-name">{firma.name}</div>
                <div className="firma-result-city">{firma.city}</div>
              </div>
              {firma.isAdded && <span style={{ fontSize: '10px', background: '#22c55e', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>EKLENDİ</span>}
            </div>

            <div className="firma-result-meta">
              <span>📍 {firma.address}</span>
              {firma.phone && <span>📞 {firma.phone}</span>}
              {firma.website && <span>🌐 <a href={firma.website} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Web</a></span>}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              {!firma.isAdded ? (
                <button
                  className="primary"
                  onClick={() => openAddModal(firma, i)}
                  style={{ flex: 1, padding: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                >
                  ➕ Detaylı Ekle
                </button>
              ) : (
                <button
                  disabled
                  style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'default' }}
                >
                  ✅ Kayıtlı
                </button>
              )}
              
              <a href={firma.mapsUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', background: '#334155', borderRadius: '6px', textDecoration: 'none', color: '#cbd5e1' }}>
                🗺
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* --- TAM DETAYLI EKLEME MODALI --- */}
      {isModalOpen && formData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px'
        }}>
          <div style={{
            backgroundColor: '#0f172a', width: '100%', maxWidth: '600px', // Biraz daha geniş
            borderRadius: '12px', border: '1px solid #334155', padding: '24px',
            maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#38bdf8', borderBottom:'1px solid #334155', paddingBottom:'10px' }}>
              📝 Müşteri Kartı Oluştur
            </h2>

            <div className="teklif-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Satır 1: Firma Adı */}
              <div className="field">
                <label>Firma Adı</label>
                <input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  style={{fontWeight:'bold'}}
                />
              </div>

              {/* Satır 2: Yetkili ve Telefon */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div className="field">
                  <label style={{color:'#fbbf24'}}>Yetkili Kişi</label>
                  <input 
                    placeholder="Ad Soyad"
                    value={formData.contact} 
                    onChange={(e) => setFormData({...formData, contact: e.target.value})} 
                    style={{borderColor: '#fbbf24'}}
                  />
                </div>
                <div className="field">
                  <label>Telefon</label>
                  <input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>

              {/* Satır 3: Şehir ve Sektör */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                 <div className="field">
                  <label>Şehir</label>
                  <input 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  />
                </div>
                <div className="field">
                  <label>Sektör</label>
                  <input 
                    value={formData.segment} 
                    onChange={(e) => setFormData({...formData, segment: e.target.value})} 
                  />
                </div>
              </div>

              {/* Satır 4: Araç Sayısı ve Durum */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div className="field">
                  <label>Araç Sayısı</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.vehicleCount} 
                    onChange={(e) => setFormData({...formData, vehicleCount: e.target.value})} 
                  />
                </div>
                <div className="field">
                    <label>Durum</label>
                    <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        style={{
                            background:'#1e293b', color:'white', border:'1px solid #334155', 
                            padding:'12px', borderRadius:'8px', cursor:'pointer'
                        }}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
              </div>

              {/* Satır 5: Ajanda / Randevu */}
              <div className="field">
                <label style={{display:'flex', alignItems:'center', gap:'5px'}}>
                   📅 Ajandaya Kaydet (Randevu Tarihi)
                </label>
                <input 
                  type="datetime-local"
                  value={formData.nextMeetingDate}
                  onChange={(e) => setFormData({...formData, nextMeetingDate: e.target.value})}
                  style={{background:'#0f172a', borderColor:'#38bdf8'}}
                />
              </div>

              {/* Satır 6: Notlar */}
              <div className="field">
                <label>Görüşme Notları</label>
                <textarea 
                  rows={3}
                  placeholder="Detaylar, teklif durumu vb..."
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  style={{
                    width:'100%', background:'#1e293b', border:'1px solid #334155', 
                    borderRadius:'8px', padding:'10px', color:'white', fontSize:'14px'
                  }}
                />
              </div>

              {/* Satır 7: Adres (Otomatik ama düzenlenebilir) */}
              <div className="field">
                <label>Konum / Adres</label>
                <textarea 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{fontSize:'12px', color:'#94a3b8', background:'#0f172a'}}
                />
              </div>

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', borderTop:'1px solid #334155', paddingTop:'20px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ 
                    flex: 1, padding: '14px', background: '#334155', color: '#cbd5e1', 
                    borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight:'600'
                  }}
                >
                  İptal
                </button>
                <button 
                  onClick={saveFromModal}
                  style={{ 
                    flex: 2, padding: '14px', 
                    background: 'radial-gradient(circle at top, #22c55e, #16a34a)', 
                    color: '#fff', borderRadius: '8px', border: 'none', 
                    fontWeight: 'bold', cursor: 'pointer', fontSize:'15px'
                  }}
                >
                  💾 Müşteriyi ve Ajandayı Kaydet
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}