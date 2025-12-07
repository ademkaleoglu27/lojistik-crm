'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Tıklama özelliği için eklendi
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
      };

      const { error } = await supabase.from('firmalar').insert([newFirm]);

      if (error) throw error;

      // Ekleme başarılıysa listeyi güncelle ve formu temizle
      fetchFirms();
      setName('');
      setContact('');
      setPhone('');
      setCity('');
      setSegment('');
      setNote('');
    } catch (error) {
      alert('Kayıt sırasında bir hata oluştu.');
      console.log(error);
    }
  };

  // Arama filtresi
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
      <h1 className="teklif-title">Müşteri Listesi / CRM</h1>
      <p className="teklif-info">
        Müşterilerinizi buradan yönetin. Verileriniz artık güvenli bir şekilde bulutta saklanıyor.
      </p>

      {/* Arama çubuğu */}
      <div className="search-row">
        <input
          type="text"
          className="search-input"
          placeholder="Firma, yetkili, şehir, sektör veya not içinde ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Müşteri ekleme formu */}
      <div className="teklif-form">
        <div className="field">
          <label>Firma Adı</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: AC Lojistik AŞ" />
        </div>
        <div className="field">
          <label>Yetkili Adı</label>
          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Örn: Ahmet Çalışkan" />
        </div>
        <div className="field">
          <label>Telefon</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Örn: 05xx xxx xx xx" />
        </div>
        <div className="field">
          <label>Şehir</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: İstanbul" />
        </div>
        <div className="field">
          <label>Sektör / Segment</label>
          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Örn: Lojistik / Turizm" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Not (opsiyonel)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Örn: Filoda 20 araç var, yakıt tüketimi yüksek." />
        </div>
      </div>

      <button
        type="button"
        className="po-link"
        style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? 'İşleniyor...' : 'Müşteri Ekle'}
      </button>

      {/* Müşteri kartları */}
      <div className="firm-list">
        {loading && <p style={{textAlign: 'center', color: '#666'}}>Veriler yükleniyor...</p>}
        
        {!loading && filtered.length === 0 ? (
          <p className="offer-hint">
            Kayıtlı müşteri bulunamadı. Yeni ekleyerek başlayın.
          </p>
        ) : (
          filtered.map((f) => (
            // DİKKAT: Link etiketi ile sarmaladık
            <Link key={f.id} href={`/firmalar/${f.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="firm-card" style={{ cursor: 'pointer', transition: 'transform 0.1s' }}>
                <div className="firm-row">
                  <span className="firm-name">{f.name}</span>
                  <span className="firm-meta">
                    {f.created_at
                      ? new Date(f.created_at).toLocaleDateString('tr-TR')
                      : ''}
                  </span>
                </div>
                <div className="firm-row">
                  <span>
                    {f.contact || '-'} {f.phone && `• ${f.phone}`}
                  </span>
                </div>
                <div className="firm-row">
                  <span>{f.city || ''}</span>
                  <span>{f.segment || ''}</span>
                </div>
                {f.note && <p className="firm-note">Not: {f.note}</p>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}