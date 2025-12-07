'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Veritabanındaki tablo yapımız
type Firm = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  city: string;
  segment: string;
  note: string;
  maps_url: string; // Konum alanı
  created_at: string;
};

export default function FirmalarPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Verileri
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [segment, setSegment] = useState('');
  const [note, setNote] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  
  const [search, setSearch] = useState('');

  // Sayfa açıldığında verileri ÇEK
  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const { data, error } = await supabase
        .from('firmalar')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFirms(data);
    } catch (error) {
      console.log('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- KONUM ALMA FONKSİYONU ---
  const handleGetLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum özelliğini desteklemiyor.');
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Google Maps linki oluştur
        const link = `http://maps.google.com/maps?q=${latitude},${longitude}`;
        setMapsUrl(link);
        setLocLoading(false);
      },
      (error) => {
        console.error(error);
        alert('Konum alınamadı. İzin verdiğinizden emin olun.');
        setLocLoading(false);
      }
    );
  };

  // Yeni veri EKLE
  const handleAdd = async () => {
    if (!name.trim()) return;

    try {
      const newFirm = {
        name: name.trim(),
        contact: contact.trim(),
        phone: phone.trim(),
        city: city.trim(),
        segment: segment.trim(),
        note: note.trim(),
        maps_url: mapsUrl,
      };

      const { error } = await supabase.from('firmalar').insert([newFirm]);

      if (error) throw error;

      fetchFirms();
      setName('');
      setContact('');
      setPhone('');
      setCity('');
      setSegment('');
      setNote('');
      setMapsUrl('');
    } catch (error) {
      alert('Kayıt hatası.');
    }
  };

  const filtered = firms.filter((f) => {
    if (!search.trim()) return true;
    const s = search.trim().toLowerCase();
    return (
      (f.name?.toLowerCase() || '').includes(s) ||
      (f.contact?.toLowerCase() || '').includes(s) ||
      (f.city?.toLowerCase() || '').includes(s) ||
      (f.segment?.toLowerCase() || '').includes(s) ||
      (f.note?.toLowerCase() || '').includes(s) ||
      (f.phone?.toLowerCase() || '').includes(s)
    );
  });

  return (
    <div className="teklif-page">
      {/* BAŞLIK DÜZELDİ */}
      <h1 className="teklif-title">Müşteri Listesi / CRM</h1>
      <p className="teklif-info">
        Müşterilerinizi buradan yönetin. Konum özelliği aktiftir.
      </p>

      <div className="search-row">
        <input
          type="text"
          className="search-input"
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="teklif-form">
        <div className="field">
          <label>Firma Adı</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="AC Lojistik" />
        </div>
        <div className="field">
          <label>Yetkili Adı</label>
          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Ahmet Bey" />
        </div>
        <div className="field">
          <label>Telefon</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx..." />
        </div>
        <div className="field">
          <label>Şehir</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" />
        </div>
        
        {/* KONUM BUTONU */}
        <div className="field">
          <label>Konum (GPS)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handleGetLocation}
              disabled={locLoading || mapsUrl !== ''}
              className="po-link"
              style={{
                backgroundColor: mapsUrl ? '#22c55e' : '#f1f5f9',
                color: mapsUrl ? 'white' : '#334155',
                border: '1px solid #cbd5e1',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              {locLoading ? '...' : mapsUrl ? '✅ Alındı' : '📍 Konum Ekle'}
            </button>
            
            {mapsUrl && (
              <button 
                type="button"
                onClick={() => setMapsUrl('')}
                style={{
                  padding: '0 10px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Sil
              </button>
            )}
          </div>
        </div>

        <div className="field">
          <label>Sektör</label>
          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Not</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <button type="button" className="po-link" style={{ marginTop: '0.5rem', marginBottom: '1rem' }} onClick={handleAdd} disabled={loading}>
        {loading ? '...' : 'Müşteri Ekle'}
      </button>

      <div className="firm-list">
        {loading && <p style={{textAlign: 'center'}}>Yükleniyor...</p>}
        {!loading && filtered.map((f) => (
          <div key={f.id} style={{ position: 'relative' }}> 
            <Link href={`/firmalar/${f.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="firm-card" style={{ cursor: 'pointer' }}>
                <div className="firm-row">
                  <span className="firm-name">{f.name}</span>
                  <span className="firm-meta">{f.created_at ? new Date(f.created_at).toLocaleDateString('tr-TR') : ''}</span>
                </div>
                <div className="firm-row">
                  <span>{f.contact || '-'} {f.phone && `• ${f.phone}`}</span>
                </div>
                {/* YOL TARİFİ LİNKİ */}
                {f.maps_url && (
                   <div style={{ marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                     <a 
                       href={f.maps_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}
                     >
                       🚗 Yol Tarifi Al
                     </a>
                   </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}