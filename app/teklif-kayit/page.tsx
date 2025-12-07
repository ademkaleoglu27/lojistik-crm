'use client';

import { useEffect, useMemo, useState } from 'react';

type Firm = {
  id: string;
  name: string;
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

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

function generateId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export default function TeklifKayitPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirmName, setSelectedFirmName] = useState('');
  const [offers, setOffers] = useState<OfferItem[]>([]);

  const [vade, setVade] = useState('');
  const [discountTR, setDiscountTR] = useState<number | ''>('');
  const [discountStation, setDiscountStation] = useState<number | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawF = localStorage.getItem(FIRMS_KEY);
      if (rawF) {
        const parsed = JSON.parse(rawF) as { id: string; name: string }[];
        setFirms(parsed.map((f) => ({ id: f.id, name: f.name })));

        if (parsed.length > 0) {
          setSelectedFirmName(parsed[0].name);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedFirmName) {
      setOffers([]);
      return;
    }

    try {
      const key = `offers-${slugify(selectedFirmName)}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as OfferItem[];
        arr.sort((a, b) => b.date.localeCompare(a.date));
        setOffers(arr);
      } else {
        setOffers([]);
      }
    } catch {
      setOffers([]);
    }
  }, [selectedFirmName]);

  const saveOffers = (firmName: string, list: OfferItem[]) => {
    setOffers(list);
    if (typeof window !== 'undefined') {
      const key = `offers-${slugify(firmName)}`;
      localStorage.setItem(key, JSON.stringify(list));
    }
  };

  const handleSaveOffer = () => {
    if (!selectedFirmName.trim()) return;

    const now = new Date().toISOString();
    const newOffer: OfferItem = {
      id: generateId(),
      date: now,
      vade: vade.trim() || 'Standart',
      discountTR: typeof discountTR === 'number' ? discountTR : 0,
      discountStation:
        typeof discountStation === 'number' ? discountStation : 0,
      note: note.trim(),
    };

    const updated = [newOffer, ...offers].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    saveOffers(selectedFirmName, updated);

    setVade('');
    setDiscountTR('');
    setDiscountStation('');
    setNote('');
  };

  const selectedFirm = useMemo(
    () => firms.find((f) => f.name === selectedFirmName) || null,
    [firms, selectedFirmName]
  );

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
            Teklif Kayıt • İskonto & Vade
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Teklif Kayıt ve Takip
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              maxWidth: '520px',
            }}
          >
            Firmalara verdiğiniz iskonto oranlarını ve vadeleri kayıt altına alın.
            CRM panelinde ilgili müşteri kartından teklif geçmişini görüntüleyin.
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
                Yeni Teklif Kaydı
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                İlgili firmayı seçin, vade ve iskonto oranlarını girerek teklifi
                kayıt altına alın.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveOffer}
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(56,189,248,0.9)',
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
              + Teklif Kaydet
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            <div className="field">
              <label>Firma</label>
              <select
                value={selectedFirmName}
                onChange={(e) => setSelectedFirmName(e.target.value)}
              >
                {firms.length === 0 ? (
                  <option value="">Önce CRM&apos;e müşteri ekleyin</option>
                ) : (
                  firms.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="field">
              <label>Vade</label>
              <input
                value={vade}
                onChange={(e) => setVade(e.target.value)}
                placeholder="Örn: 30 gün, 45 gün..."
              />
            </div>

            <div className="field">
              <label>TR Geneli İskonto (%)</label>
              <input
                type="number"
                value={discountTR}
                onChange={(e) =>
                  setDiscountTR(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder="Örn: 3.5"
              />
            </div>

            <div className="field">
              <label>Anlaşmalı İstasyon İskonto (%)</label>
              <input
                type="number"
                value={discountStation}
                onChange={(e) =>
                  setDiscountStation(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder="Örn: 5.0"
              />
            </div>

            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Not</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn: Pompa fiyatı, litre taahhüdü, özel şartlar..."
              />
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: '16px',
            padding: '14px 12px 12px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))',
            border: '1px solid rgba(148,163,184,0.55)',
            boxShadow: '0 16px 36px rgba(15,23,42,0.95)',
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
                {selectedFirm ? selectedFirm.name : 'Firma seçilmedi'}
              </h2>
              <p
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                }}
              >
                Seçili firmaya ait geçmiş teklifler. CRM panelindeki müşteri
                kartından da görüntülenir.
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
              Toplam teklif: {offers.length}
            </span>
          </div>

          <div
            style={{
              maxHeight: '420px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {selectedFirmName && offers.length === 0 ? (
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                {selectedFirmName} için kayıtlı teklif bulunmuyor. Yukarıdan yeni
                teklif kaydı ekleyebilirsiniz.
              </p>
            ) : null}

            {!selectedFirmName && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                Teklif geçmişini görmek için önce bir firma seçin.
              </p>
            )}

            {offers.map((o) => (
              <div
                key={o.id}
                style={{
                  borderBottom: '1px dashed rgba(55,65,81,0.9)',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#e5e7eb',
                    marginBottom: '2px',
                  }}
                >
                  <span>
                    {new Date(o.date).toLocaleDateString('tr-TR')}{' '}
                    {new Date(o.date).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>{o.vade}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#e5e7eb',
                  }}
                >
                  <span>TR iskonto: %{o.discountTR.toFixed(2)}</span>
                  <span>
                    Anlaşmalı istasyon: %{o.discountStation.toFixed(2)}
                  </span>
                </div>
                {o.note && (
                  <p
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
        </section>
      </div>
    </main>
  );
}
