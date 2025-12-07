'use client';

import { useEffect, useState } from 'react';

type Firm = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  city: string;
  segment: string;
  note: string;
  createdAt: string;
};

type AjandaItem = {
  id: string;
  firma: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  note: string;
};

type OfferItem = {
  id: string;
  date: string; // ISO
  vade: string;
  discountTR: number;
  discountStation: number;
  note: string;
};

const FIRMS_KEY = 'firms-v1';
const AJANDA_KEY = 'ajanda-items-v1';

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export default function DashboardPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [searchFirm, setSearchFirm] = useState('');

  // Yeni müşteri form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [segment, setSegment] = useState('');
  const [note, setNote] = useState('');

  // Özet alanları
  const [todayMeetCount, setTodayMeetCount] = useState(0);
  const [totalOfferCount, setTotalOfferCount] = useState(0);

  // Seçilen müşteri (detay paneli için)
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [selectedAjanda, setSelectedAjanda] = useState<AjandaItem[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<OfferItem[]>([]);

  // İlk yüklemede firmalar + özetleri çek
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Firmalar
    try {
      const raw = localStorage.getItem(FIRMS_KEY);
      if (raw) {
        const list = JSON.parse(raw) as Firm[];
        const sorted = [...list].sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        setFirms(sorted);
        if (sorted.length > 0) {
          setSelectedFirm(sorted[0]); // ilk müşteriyi otomatik seç
        }
      }
    } catch {
      // ignore
    }

    // Ajanda (bugünkü görüşme sayısı)
    try {
      const raw = localStorage.getItem(AJANDA_KEY);
      if (raw) {
        const items = JSON.parse(raw) as AjandaItem[];
        const todayStr = new Date().toISOString().slice(0, 10);
        const today = items.filter((x) => x.date === todayStr);
        setTodayMeetCount(today.length);
      }
    } catch {
      // ignore
    }

    // Teklif sayısı
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('offers-')) {
          const rawOffers = localStorage.getItem(key);
          if (rawOffers) {
            const list = JSON.parse(rawOffers) as OfferItem[];
            total += list.length;
          }
        }
      }
      setTotalOfferCount(total);
    } catch {
      // ignore
    }
  }, []);

  // Seçilen müşteri değişince: ajanda + tekliflerini çek
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedFirm) {
      setSelectedAjanda([]);
      setSelectedOffers([]);
      return;
    }

    try {
      // Ajanda
      const rawA = localStorage.getItem(AJANDA_KEY);
      if (rawA) {
        const all = JSON.parse(rawA) as AjandaItem[];
        const filtered = all.filter(
          (it) =>
            it.firma.trim().toLowerCase() ===
            selectedFirm.name.trim().toLowerCase()
        );
        setSelectedAjanda(filtered);
      } else {
        setSelectedAjanda([]);
      }

      // Teklifler
      const offerKey = `offers-${slugify(selectedFirm.name)}`;
      const rawO = localStorage.getItem(offerKey);
      if (rawO) {
        const arr = JSON.parse(rawO) as OfferItem[];
        arr.sort((a, b) => b.date.localeCompare(a.date));
        setSelectedOffers(arr);
      } else {
        setSelectedOffers([]);
      }
    } catch {
      setSelectedAjanda([]);
      setSelectedOffers([]);
    }
  }, [selectedFirm]);

  const saveFirms = (list: Firm[]) => {
    setFirms(list);
    localStorage.setItem(FIRMS_KEY, JSON.stringify(list));
  };

  const handleAddFirm = () => {
    if (!name.trim()) return;

    const newFirm: Firm = {
      id: crypto.randomUUID(),
      name: name.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      city: city.trim(),
      segment: segment.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newFirm, ...firms];
    saveFirms(updated);

    setName('');
    setContact('');
    setPhone('');
    setCity('');
    setSegment('');
    setNote('');
    setSelectedFirm(newFirm);
  };

  const filteredFirms = firms.filter((f) => {
    if (!searchFirm.trim()) return true;
    const s = searchFirm.trim().toLowerCase();
    return (
      f.name.toLowerCase().includes(s) ||
      f.contact.toLowerCase().includes(s) ||
      f.city.toLowerCase().includes(s) ||
      f.segment.toLowerCase().includes(s) ||
      f.note.toLowerCase().includes(s) ||
      f.phone.toLowerCase().includes(s)
    );
  });

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
          maxWidth: '1120px',
          margin: '0 auto',
        }}
      >
        {/* Başlık */}
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
            CRM • Müşteri Yönetimi
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Müşteri CRM Paneli
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              maxWidth: '520px',
            }}
          >
            Müşteri kartlarını yönet, yeni müşteri kaydı oluştur, seçili müşteri için
            ajanda kayıtları ve teklif geçmişini tek ekranda görüntüle.
          </p>
        </header>

        {/* Özet kartlar */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              borderRadius: '14px',
              padding: '12px 12px',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
              border: '1px solid rgba(148,163,184,0.45)',
              boxShadow: '0 12px 30px rgba(15,23,42,0.9)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '4px',
              }}
            >
              Toplam Müşteri
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {firms.length}
            </div>
          </div>

          <div
            style={{
              borderRadius: '14px',
              padding: '12px 12px',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
              border: '1px solid rgba(148,163,184,0.45)',
              boxShadow: '0 12px 30px rgba(15,23,42,0.9)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '4px',
              }}
            >
              Bugünkü Görüşme
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {todayMeetCount}
            </div>
          </div>

          <div
            style={{
              borderRadius: '14px',
              padding: '12px 12px',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
              border: '1px solid rgba(148,163,184,0.45)',
              boxShadow: '0 12px 30px rgba(15,23,42,0.9)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '4px',
              }}
            >
              Toplam Teklif
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {totalOfferCount}
            </div>
          </div>
        </section>

        {/* Yeni müşteri kartı */}
        <section
          style={{
            borderRadius: '16px',
            padding: '16px 14px 14px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))',
            border: '1px solid rgba(148,163,184,0.55)',
            boxShadow: '0 18px 40px rgba(15,23,42,0.95)',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  marginBottom: '2px',
                }}
              >
                Yeni Müşteri Kaydı
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                CRM’e hızlı müşteri eklemek için temel bilgileri doldurun.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFirm}
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(56,189,248,0.8)',
                background:
                  'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#0f172a',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Müşteri Ekle
            </button>
          </div>

          <div
            className="teklif-form"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
            }}
          >
            <div className="field">
              <label>Firma Adı</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: ABC Lojistik"
              />
            </div>

            <div className="field">
              <label>Yetkili</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div className="field">
              <label>Telefon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn: 05xx xxx xx xx"
              />
            </div>

            <div className="field">
              <label>Şehir</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Örn: İstanbul"
              />
            </div>

            <div className="field">
              <label>Sektör</label>
              <input
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Örn: Akaryakıt, Turizm..."
              />
            </div>

            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Not</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn: Filo adedi, araç tipi, özel not..."
              />
            </div>
          </div>
        </section>

        {/* Alt layout: sol liste / sağ detay */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.4fr)',
            gap: '16px',
          }}
        >
          {/* Sol: Müşteri listesi */}
          <div
            style={{
              borderRadius: '16px',
              padding: '14px 12px 12px',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))',
              border: '1px solid rgba(148,163,184,0.55)',
              boxShadow: '0 16px 36px rgba(15,23,42,0.95)',
              minHeight: '260px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '2px',
                  }}
                >
                  Mevcut Müşteriler
                </h2>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                  }}
                >
                  Soldan müşteri seçtiğinizde sağda detayları görebilirsiniz.
                </p>
              </div>
            </div>

            <div className="search-row" style={{ marginBottom: '8px' }}>
              <input
                className="search-input"
                placeholder="Müşteri ara (isim, şehir, telefon...)"
                value={searchFirm}
                onChange={(e) => setSearchFirm(e.target.value)}
              />
            </div>

            <div
              className="firm-list"
              style={{
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {filteredFirms.length === 0 ? (
                <p
                  className="offer-hint"
                  style={{ fontSize: '12px', color: '#9ca3af' }}
                >
                  Hiç müşteri bulunamadı. Yukarıdan yeni müşteri ekleyebilir veya
                  İnternetten Müşteri Bul ekranından CRM’e aktarabilirsiniz.
                </p>
              ) : (
                filteredFirms.map((f) => (
                  <div
                    key={f.id}
                    className="firm-card"
                    onClick={() => setSelectedFirm(f)}
                    style={{
                      cursor: 'pointer',
                      marginBottom: '8px',
                      borderRadius: '12px',
                      border:
                        selectedFirm && selectedFirm.id === f.id
                          ? '1px solid rgba(56,189,248,0.9)'
                          : '1px solid rgba(51,65,85,0.9)',
                      background:
                        selectedFirm && selectedFirm.id === f.id
                          ? 'radial-gradient(circle at top left, rgba(56,189,248,0.18), rgba(15,23,42,0.9))'
                          : 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.94))',
                      padding: '8px 9px',
                    }}
                  >
                    <div
                      className="firm-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2px',
                      }}
                    >
                      <span
                        className="firm-name"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {f.name}
                      </span>
                      <span
                        className="firm-meta"
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                        }}
                      >
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString('tr-TR')
                          : ''}
                      </span>
                    </div>

                    <div
                      className="firm-row"
                      style={{
                        fontSize: '12px',
                        marginBottom: '2px',
                        color: '#e5e7eb',
                      }}
                    >
                      <span>
                        {f.contact || '-'}
                        {f.phone && ` • ${f.phone}`}
                      </span>
                    </div>

                    <div
                      className="firm-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: '#9ca3af',
                      }}
                    >
                      <span>{f.city || ''}</span>
                      <span>{f.segment || ''}</span>
                    </div>

                    {f.note && (
                      <p
                        className="firm-note"
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginTop: '3px',
                        }}
                      >
                        Not: {f.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sağ: Seçili müşterinin detayı + ajanda + teklifler */}
          <div
            style={{
              borderRadius: '16px',
              padding: '14px 12px 12px',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))',
              border: '1px solid rgba(148,163,184,0.55)',
              boxShadow: '0 16px 36px rgba(15,23,42,0.95)',
              minHeight: '260px',
            }}
          >
            {selectedFirm ? (
              <>
                {/* Firma üst kart */}
                <div
                  style={{
                    marginBottom: '10px',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(51,65,85,0.9)',
                    background:
                      'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '3px',
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          marginBottom: '1px',
                        }}
                      >
                        {selectedFirm.name}
                      </h2>
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                        }}
                      >
                        {selectedFirm.city || 'Şehir belirtilmemiş'}{' '}
                        {selectedFirm.segment && `• ${selectedFirm.segment}`}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#9ca3af',
                        borderRadius: '999px',
                        border: '1px solid rgba(55,65,81,0.9)',
                        padding: '4px 8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      CRM kaydı:{' '}
                      {selectedFirm.createdAt
                        ? new Date(
                            selectedFirm.createdAt
                          ).toLocaleDateString('tr-TR')
                        : '-'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '6px',
                      fontSize: '11px',
                      color: '#e5e7eb',
                    }}
                  >
                    <span>
                      {selectedFirm.contact || '-'}
                      {selectedFirm.phone && ` • ${selectedFirm.phone}`}
                    </span>
                  </div>

                  {selectedFirm.note && (
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginTop: '4px',
                      }}
                    >
                      Not: {selectedFirm.note}
                    </p>
                  )}
                </div>

                {/* Ajanda + Teklif bölümleri */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '10px',
                  }}
                >
                  {/* Ajanda */}
                  <div
                    style={{
                      borderRadius: '12px',
                      padding: '8px 9px',
                      border: '1px solid rgba(51,65,85,0.9)',
                      background:
                        'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))',
                      minHeight: '120px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '4px',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Ajanda Kayıtları
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                        }}
                      >
                        {selectedAjanda.length} kayıt
                      </span>
                    </div>

                    {selectedAjanda.length === 0 ? (
                      <p
                        className="offer-hint"
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                        }}
                      >
                        Bu firmaya ait ajanda kaydı yok. Ajanda ekranından yeni
                        kayıt ekleyebilirsiniz.
                      </p>
                    ) : (
                      <div
                        className="ajanda-list"
                        style={{
                          maxHeight: '180px',
                          overflowY: 'auto',
                          paddingRight: '4px',
                        }}
                      >
                        {selectedAjanda.map((it) => (
                          <div
                            key={it.id}
                            className="ajanda-item"
                            style={{
                              borderBottom:
                                '1px dashed rgba(55,65,81,0.9)',
                              paddingBottom: '4px',
                              marginBottom: '4px',
                            }}
                          >
                            <div
                              className="ajanda-row"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#e5e7eb',
                                marginBottom: '1px',
                              }}
                            >
                              <span className="ajanda-date">
                                {it.date}{' '}
                                {it.time ? `• ${it.time}` : ''}
                              </span>
                            </div>
                            <div
                              className="ajanda-row"
                              style={{
                                fontSize: '11px',
                                color: '#e5e7eb',
                              }}
                            >
                              <span>{it.title}</span>
                            </div>
                            {it.note && (
                              <p
                                className="ajanda-note"
                                style={{
                                  fontSize: '10px',
                                  color: '#9ca3af',
                                  marginTop: '2px',
                                }}
                              >
                                Not: {it.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Teklif geçmişi */}
                  <div
                    style={{
                      borderRadius: '12px',
                      padding: '8px 9px',
                      border: '1px solid rgba(51,65,85,0.9)',
                      background:
                        'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))',
                      minHeight: '120px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '4px',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Teklif Geçmişi
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                        }}
                      >
                        {selectedOffers.length} kayıt
                      </span>
                    </div>

                    {selectedOffers.length === 0 ? (
                      <p
                        className="offer-hint"
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                        }}
                      >
                        Bu firmaya ait kayıtlı teklif yok. Teklif Kayıt ekranından
                        oluşturduğunuz teklifleri buraya bağlayabilirsiniz.
                      </p>
                    ) : (
                      <div
                        className="offer-list"
                        style={{
                          maxHeight: '180px',
                          overflowY: 'auto',
                          paddingRight: '4px',
                        }}
                      >
                        {selectedOffers.map((o) => (
                          <div
                            key={o.id}
                            className="offer-item"
                            style={{
                              borderBottom:
                                '1px dashed rgba(55,65,81,0.9)',
                              paddingBottom: '4px',
                              marginBottom: '4px',
                            }}
                          >
                            <div
                              className="offer-row"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#e5e7eb',
                                marginBottom: '1px',
                              }}
                            >
                              <span className="offer-date">
                                {new Date(o.date).toLocaleString('tr-TR')}
                              </span>
                              <span className="offer-vade">
                                {o.vade}
                              </span>
                            </div>
                            <div
                              className="offer-row"
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#e5e7eb',
                              }}
                            >
                              <span>
                                % TR iskonto:{' '}
                                {o.discountTR.toFixed(2)}
                              </span>
                              <span>
                                % Anlaşmalı iskonto:{' '}
                                {o.discountStation.toFixed(2)}
                              </span>
                            </div>
                            {o.note && (
                              <p
                                className="offer-note"
                                style={{
                                  fontSize: '10px',
                                  color: '#9ca3af',
                                  marginTop: '2px',
                                }}
                              >
                                Not: {o.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p
                className="offer-hint"
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '6px',
                }}
              >
                Detay görmek için soldan bir müşteri seçin ya da yukarıdan yeni
                müşteri ekleyin.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
