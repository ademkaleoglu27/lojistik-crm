'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
        color: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
        }}
      >
        {/* Üst başlık */}
        <div
          style={{
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(148,163,184,0.35)',
              fontSize: '12px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '999px',
                background:
                  'radial-gradient(circle at center, #22c55e 0, #166534 100%)',
              }}
            />
            Lojistik & Akaryakıt Müşteri Yönetimi
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '16px',
              marginBottom: '8px',
            }}
          >
            Lojistik CRM Ana Paneli
          </h1>
          <p
            style={{
              fontSize: '14px',
              opacity: 0.8,
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            Mevcut müşterilerini yönet, internetten yeni firmalar bul, ajanda ve
            teklif süreçlerini tek panelden takip et.
          </p>
        </div>

        {/* Kartlar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
          }}
        >
          {/* CRM Kartı */}
          <Link href="/dashboard">
            <div
              style={{
                position: 'relative',
                padding: '18px 18px 16px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
                border: '1px solid rgba(148,163,184,0.5)',
                boxShadow:
                  '0 18px 45px rgba(15,23,42,0.9), 0 0 1px rgba(148,163,184,0.6)',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 22px 55px rgba(15,23,42,0.95), 0 0 1px rgba(248,250,252,0.6)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 18px 45px rgba(15,23,42,0.9), 0 0 1px rgba(148,163,184,0.6)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at top left, rgba(56,189,248,0.10), transparent 60%)',
                  opacity: 0.9,
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'radial-gradient(circle at top, #38bdf8, #0ea5e9)',
                    boxShadow: '0 0 18px rgba(56,189,248,0.8)',
                    fontSize: '20px',
                  }}
                >
                  📊
                </div>

                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    CRM Paneline Git
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      opacity: 0.8,
                      marginBottom: '12px',
                    }}
                  >
                    Mevcut müşterilerini yönet, ajanda kayıtlarını ve teklif
                    geçmişini tek ekrandan takip et. Yeni müşteri ekle, detay
                    kartlarını görüntüle.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      opacity: 0.85,
                    }}
                  >
                    <span>Mevcut Müşteriler & Ajanda & Teklifler</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '999px',
                          backgroundColor: '#22c55e',
                        }}
                      />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* İnternetten Müşteri Bul Kartı */}
          <Link href="/firma-bul">
            <div
              style={{
                position: 'relative',
                padding: '18px 18px 16px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))',
                border: '1px solid rgba(148,163,184,0.45)',
                boxShadow:
                  '0 18px 45px rgba(15,23,42,0.9), 0 0 1px rgba(148,163,184,0.6)',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 22px 55px rgba(15,23,42,0.95), 0 0 1px rgba(248,250,252,0.6)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 18px 45px rgba(15,23,42,0.9), 0 0 1px rgba(148,163,184,0.6)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at top right, rgba(74,222,128,0.10), transparent 60%)',
                  opacity: 0.9,
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'radial-gradient(circle at top, #4ade80, #22c55e)',
                    boxShadow: '0 0 18px rgba(34,197,94,0.8)',
                    fontSize: '20px',
                  }}
                >
                  🔍
                </div>

                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    İnternetten Müşteri Bul
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      opacity: 0.8,
                      marginBottom: '12px',
                    }}
                  >
                    Google üzerinden lojistik / turizm firmalarını şehir ve
                    anahtar kelimeye göre listele. Beğendiğin firmaları tek
                    tıkla CRM müşteri listene ekle.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      opacity: 0.85,
                    }}
                  >
                    <span>Google Places API ile hızlı arama</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '999px',
                          backgroundColor: '#22c55e',
                        }}
                      />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
