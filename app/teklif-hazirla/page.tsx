'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Veritabanı bağlantısı

// Firma veri tipi
type Firm = {
  id: string;
  name: string;
  contact: string;
};

export default function TeklifHazirlaPage() {
  // Veritabanından çekilecek firmalar
  const [firms, setFirms] = useState<Firm[]>([]);
  
  // Form alanları
  const [selectedFirmId, setSelectedFirmId] = useState(''); // Dropdown seçimi
  const [firmaAdi, setFirmaAdi] = useState(''); // Esas veri
  const [yetkiliAdi, setYetkiliAdi] = useState('');
  const [discountTR, setDiscountTR] = useState('3');
  const [discountStation, setDiscountStation] = useState('7');
  const [vade, setVade] = useState('Peşin / Kredi Kartı');

  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Sayfa açılınca firmaları Supabase'den çek
  useEffect(() => {
    const fetchFirms = async () => {
      const { data } = await supabase
        .from('firmalar')
        .select('id, name, contact')
        .order('name', { ascending: true });
      
      if (data) setFirms(data);
    };
    fetchFirms();
  }, []);

  // 1. Listeden seçim yapılırsa: Bilgileri otomatik doldur
  const handleFirmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedFirmId(id);

    const found = firms.find((f) => f.id === id);
    if (found) {
      setFirmaAdi(found.name);
      setYetkiliAdi(found.contact || '');
    } else {
      // "Seçiniz"e dönerse temizlemesin, belki manuel devam edecek.
      // İsteğe bağlı burası boşaltılabilir ama kullanıcı dostu olması için bırakıyorum.
    }
  };

  // 2. Elle yazı yazılırsa: Dropdown seçimini boşa çıkar (Manuel mod)
  const handleManualInput = (val: string, type: 'name' | 'contact') => {
    setSelectedFirmId(''); // Dropdown'ı "Seçiniz" konumuna getir
    if (type === 'name') setFirmaAdi(val);
    if (type === 'contact') setYetkiliAdi(val);
  };

  // Form doğrulama
  const formValid =
    firmaAdi.trim().length > 0 &&
    discountTR.trim().length > 0 &&
    discountStation.trim().length > 0;

  const handleDownload = async () => {
    setError('');

    if (!formValid) {
      setError('Lütfen Firma Adı ve İskonto oranlarını doldurun.');
      return;
    }

    try {
      setDownloading(true);
      
      const payload = {
        firmaAdi,
        yetkiliAdi,
        iskontoOrani: parseFloat(discountTR),
        istasyonIskontoOrani: parseFloat(discountStation),
        vade,
      };

      const res = await fetch('/api/teklif-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Teklif oluşturulamadı');
      }

      // Dosyayı indir
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Teklif-${firmaAdi.replace(/[^a-zA-Z0-9-]/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error(e);
      setError('Hata: Şablon dosyası (public/teklif-sablon.docx) eksik olabilir veya sunucu hatası.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="teklif-page">
      <h1 className="teklif-title">Teklif Hazırla (Word)</h1>
      <p className="teklif-info">
        Aşağıdan kayıtlı bir firma seçebilir <b>veya</b> bilgileri elle girerek hızlıca teklif oluşturabilirsiniz.
      </p>

      <div className="teklif-form">
        
        {/* HIZLI SEÇİM DROPDOWN */}
        <div className="field">
          <label style={{ color: '#2563eb', fontWeight: 'bold' }}>⚡ Hızlı Seçim (Opsiyonel)</label>
          <select 
            value={selectedFirmId} 
            onChange={handleFirmChange}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f8fafc' }}
          >
            <option value="">-- Kayıtlı Firmalardan Seç --</option>
            {firms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <hr style={{ gridColumn: '1 / -1', margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />

        {/* MANUEL GİRİŞ ALANLARI */}
        <div className="field">
          <label>Firma Adı</label>
          <input
            type="text"
            value={firmaAdi}
            onChange={(e) => handleManualInput(e.target.value, 'name')}
            placeholder="Firma adı giriniz..."
          />
        </div>

        <div className="field">
          <label>Yetkili Adı</label>
          <input
            type="text"
            value={yetkiliAdi}
            onChange={(e) => handleManualInput(e.target.value, 'contact')}
            placeholder="Örn: Ahmet Çalışkan"
          />
        </div>

        <div className="field">
          <label>Türkiye Geneli İskonto (%)</label>
          <input
            type="number"
            value={discountTR}
            onChange={(e) => setDiscountTR(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Anlaşmalı İstasyon İskonto (%)</label>
          <input
            type="number"
            value={discountStation}
            onChange={(e) => setDiscountStation(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Vade / Ödeme Koşulu</label>
          <input
            type="text"
            value={vade}
            onChange={(e) => setVade(e.target.value)}
            placeholder="Örn: 45 Gün Vadeli"
          />
        </div>

      </div>

      {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      <button
        type="button"
        onClick={handleDownload}
        className="po-link"
        disabled={downloading}
        style={{ marginTop: '20px' }}
      >
        {downloading ? 'Word Dosyası Hazırlanıyor...' : 'Word Teklif İndir'}
      </button>
    </div>
  );
}