'use client';

import { useEffect, useMemo, useState } from 'react';

type AjandaItem = {
  id: string;
  firma: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  note: string;
};

type Firm = {
  id: string;
  name: string;
};

const AJANDA_KEY = 'ajanda-items-v1';
const FIRMS_KEY = 'firms-v1';

function generateId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export default function AjandaPage() {
  const [items, setItems] = useState<AjandaItem[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);

  // Form state
  const [firma, setFirma] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  const [filterMode, setFilterMode] = useState<'today' | 'week' | 'all'>(
    'today'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(AJANDA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AjandaItem[];
        const sorted = [...parsed].sort((a, b) => {
          const aKey = `${a.date}T${a.time || '00:00'}`;
          const bKey = `${b.date}T${b.time || '00:00'}`;
          return aKey.localeCompare(bKey);
        });
        setItems(sorted);
      }
    } catch {}

    try {
      const rawF = localStorage.getItem(FIRMS_KEY);
      if (rawF) {
        const parsed = JSON.parse(rawF) as { id: string; name: string }[];
        setFirms(parsed.map((f) => ({ id: f.id, name: f.name })));
      }
    } catch {}

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
  }, []);

  const saveItems = (list: AjandaItem[]) => {
    setItems(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AJANDA_KEY, JSON.stringify(list));
    }
  };

  const handleAdd = () => {
    if (!firma.trim() || !title.trim() || !date.trim()) return;

    const newItem: AjandaItem = {
      id: generateId(),
      firma: firma.trim(),
      title: title.trim(),
      date,
      time: time.trim(),
      note: note.trim(),
    };

    const updated = [...items, newItem].sort((a, b) => {
      const aKey = `${a.date}T${a.time || '00:00'}`;
      const bKey = `${b.date}T${b.time || '00:00'}`;
      return aKey.localeCompare(bKey);
    });

    saveItems(updated);

    if (!firms.some((f) => f.name.toLowerCase() === firma.trim().toLowerCase())) {
      setFirms((prev) => [...prev, { id: generateId(), name: firma.trim() }]);
    }

    setTitle('');
    setTime('');
    setNote('');
  };

  const filteredItems = useMemo(() => {
    if (items.length === 0) return [];

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (filterMode === 'today') {
      return items.filter((it) => it.date === todayStr);
    }

    if (filterMode === 'week') {
      const start = new Date(todayStr + 'T00:00:00');
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      return items.filter((it) => {
        const dt = new Date(it.date + 'T' + (it.time || '00:00'));
        return dt >= start && dt <= end;
      });
    }

    return items;
  }, [items, filterMode]);

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
            Ajanda • Görüşme & Ziyaret Planı
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Ajanda ve Görüşme Takvimi
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9ca3af',
              maxWidth: '520px',
            }}
          >
            Müşteri görüşmelerinizi, ziyaretlerinizi ve önemli notlarınızı takvim
            üzerinde takip edin. Kayıtlar CRM paneli ile entegre çalışır.
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
                Yeni Ajanda Kaydı
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                Müşteri görüşmesi, telefon randevusu veya ziyaret planı oluşturun.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              style={{
                borderRadius: '999px',
                border: '1px solid rgba(74,222,128,0.9)',
                background:
                  'radial-gradient(circle at top, #4ade80, #22c55e)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#052e16',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Ajanda Kaydet
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
            }}
          >
            <div className="field">
              <label>Firma</label>
              <input
                list="firma-list"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                placeholder="Firma adı veya CRM'deki müşteri"
              />
              <datalist id="firma-list">
                {firms.map((f) => (
                  <option key={f.id} value={f.name} />
                ))}
              </datalist>
            </div>

            <div className="field">
              <label>Başlık</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Akaryakıt fiyat teklifi görüşmesi"
              />
            </div>

            <div className="field">
              <label>Tarih</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Saat</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Not</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn: Filo adedi, karar verici, ön bilgi..."
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
                Ajanda Kayıtları
              </h2>
              <p
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                }}
              >
                Kayıtlar CRM panelindeki özet kutucuklar ve müşteri detay kartlarıyla
                entegre çalışır.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '6px',
              }}
            >
              <button
                type="button"
                onClick={() => setFilterMode('today')}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border:
                    filterMode === 'today'
                      ? '1px solid rgba(56,189,248,0.9)'
                      : '1px solid rgba(55,65,81,0.9)',
                  backgroundColor:
                    filterMode === 'today' ? '#0f172a' : 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                }}
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('week')}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border:
                    filterMode === 'week'
                      ? '1px solid rgba(56,189,248,0.9)'
                      : '1px solid rgba(55,65,81,0.9)',
                  backgroundColor:
                    filterMode === 'week' ? '#0f172a' : 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                }}
              >
                Bu Hafta
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border:
                    filterMode === 'all'
                      ? '1px solid rgba(56,189,248,0.9)'
                      : '1px solid rgba(55,65,81,0.9)',
                  backgroundColor:
                    filterMode === 'all' ? '#0f172a' : 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                }}
              >
                Tümü
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: '420px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {filteredItems.length === 0 ? (
              <p
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                Seçilen filtreye göre ajanda kaydı bulunamadı.
              </p>
            ) : (
              filteredItems.map((it) => (
                <div
                  key={it.id}
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
                      {it.date}{' '}
                      {it.time ? `• ${it.time}` : ''}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                      }}
                    >
                      {it.firma}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#e5e7eb',
                    }}
                  >
                    {it.title}
                  </div>
                  {it.note && (
                    <p
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
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
