"use client";

import { useEffect, useMemo, useState } from "react";

type CustomerStatus =
  | "gorusulmedi"
  | "gorusuldu_olumlu"
  | "gorusuldu_olumsuz"
  | "degerlendiriyor"
  | "sozlesme";

type Customer = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  brand: string;
  discount: string;
  locationUrl: string;
  source: "manual" | "firma-bul";
  createdAt: string;
  notes?: string;
  status: CustomerStatus;
};

const STORAGE_KEY = "crm-customers";

function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map((c) => ({
      notes: "",
      status: "gorusulmedi" as CustomerStatus,
      ...c,
    }));
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const data = loadCustomers();
    setCustomers(data);
  }, []);

  const stats = useMemo(() => {
    const total = customers.length;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    let thisWeek = 0;
    let thisMonth = 0;
    let withNotes = 0;
    let withNotesThisWeek = 0;
    let firmaBulCount = 0;
    let manualCount = 0;

    let notContacted = 0;
    let positive = 0;
    let negative = 0;
    let evaluating = 0;
    let contract = 0;

    customers.forEach((c) => {
      const created = new Date(c.createdAt);
      const hasNote = !!(c.notes && c.notes.trim() !== "");

      if (created >= weekAgo) {
        thisWeek += 1;
        if (hasNote) withNotesThisWeek += 1;
      }

      if (created >= monthAgo) {
        thisMonth += 1;
      }

      if (hasNote) withNotes += 1;

      if (c.source === "firma-bul") {
        firmaBulCount += 1;
      } else {
        manualCount += 1;
      }

      switch (c.status) {
        case "gorusulmedi":
          notContacted += 1;
          break;
        case "gorusuldu_olumlu":
          positive += 1;
          break;
        case "gorusuldu_olumsuz":
          negative += 1;
          break;
        case "degerlendiriyor":
          evaluating += 1;
          break;
        case "sozlesme":
          contract += 1;
          break;
        default:
          notContacted += 1;
      }
    });

    return {
      total,
      thisWeek,
      thisMonth,
      withNotes,
      withNotesThisWeek,
      firmaBulCount,
      manualCount,
      notContacted,
      positive,
      negative,
      evaluating,
      contract,
    };
  }, [customers]);

  const latestCustomers = useMemo(() => {
    return [...customers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [customers]);

  return (
    <div className="home-layout">
      {/* ÜST BÖLÜM - Hoş geldin */}
      <section className="page-card home-header">
        <div>
          <h1 className="home-title">Hoş geldin, Adem 👋</h1>
          <p className="home-subtitle">
            Lojistik CRM&apos;de bugünün özetini ve son aktiviteleri buradan
            takip edebilirsin.
          </p>
        </div>
        <div className="home-header-pill">
          <span className="home-header-pill-label">Genel Durum</span>
          <span className="home-header-pill-value">
            Toplam müşteri: <strong>{stats.total}</strong>
          </span>
        </div>
      </section>

      {/* ÖZET KARTLAR */}
      <section className="home-stat-grid">
        <div className="page-card home-stat-card">
          <div className="home-stat-label">Toplam Müşteri</div>
          <div className="home-stat-value">{stats.total}</div>
          <div className="home-stat-meta">
            Firma Bul + manuel eklenen tüm müşteri kartları
          </div>
        </div>

        <div className="page-card home-stat-card">
          <div className="home-stat-label">Bu Hafta Eklenen</div>
          <div className="home-stat-value">{stats.thisWeek}</div>
          <div className="home-stat-meta">
            Son 7 günde oluşturulan müşteri kartları
          </div>
        </div>

        <div className="page-card home-stat-card">
          <div className="home-stat-label">Not Girilen Müşteriler</div>
          <div className="home-stat-value">{stats.withNotes}</div>
          <div className="home-stat-meta">
            Görüşme / not kaydı bulunan müşteri sayısı
          </div>
        </div>

        <div className="page-card home-stat-card">
          <div className="home-stat-label">Firma Bul Kaynaklı</div>
          <div className="home-stat-value">
            {stats.firmaBulCount}/{stats.total || 1}
          </div>
          <div className="home-stat-meta">
            Firma Bul ekranından CRM&apos;e alınan müşteriler
          </div>
        </div>

        {/* ÖZEL KART: SÖZLEŞME YAPILDI */}
        <div className="page-card home-stat-card home-stat-card--contract">
          <div className="home-stat-contract-icon">🏆</div>
          <div>
            <div className="home-stat-label">Sözleşme Yapıldı</div>
            <div className="home-stat-value">{stats.contract}</div>
            <div className="home-stat-meta">
              Bu statüye taşınan müşteri sayısı – tebrikler! 🎉
            </div>
          </div>
        </div>
      </section>

      {/* ALT GRID: Aktivite Özeti + Son Eklenenler */}
      <section className="home-bottom-grid">
        {/* Aktivite özeti */}
        <div className="page-card home-activity-card">
          <h2 className="home-section-title">Aktivite Özeti</h2>
          <p className="home-section-subtitle">
            Müşteri kartı, not ve durum hareketlerinin kısa özeti.
          </p>

          <div className="home-activity-grid">
            <div className="home-activity-block">
              <div className="home-activity-label">Bu Hafta</div>
              <div className="home-activity-row">
                <span>Yeni müşteri</span>
                <span className="home-activity-value">
                  {stats.thisWeek}
                </span>
              </div>
              <div className="home-activity-row">
                <span>Not girilen</span>
                <span className="home-activity-value">
                  {stats.withNotesThisWeek}
                </span>
              </div>
              <div className="home-activity-row">
                <span>Sözleşme yapılan toplam</span>
                <span className="home-activity-value">
                  {stats.contract}
                </span>
              </div>
            </div>

            <div className="home-activity-block">
              <div className="home-activity-label">Durum Dağılımı</div>
              <div className="home-activity-row">
                <span>Görüşülmedi</span>
                <span className="home-activity-value">
                  {stats.notContacted}
                </span>
              </div>
              <div className="home-activity-row">
                <span>Olumlu</span>
                <span className="home-activity-value">
                  {stats.positive}
                </span>
              </div>
              <div className="home-activity-row">
                <span>Değerlendiriyor</span>
                <span className="home-activity-value">
                  {stats.evaluating}
                </span>
              </div>
              <div className="home-activity-row">
                <span>Olumsuz</span>
                <span className="home-activity-value">
                  {stats.negative}
                </span>
              </div>
            </div>
          </div>

          <div className="home-activity-hint">
            Detaylı raporlar ve Excel çıktısı için{" "}
            <strong>Raporlama</strong> menüsünü kullanabilirsin.
          </div>
        </div>

        {/* Son eklenen müşteriler */}
        <div className="page-card home-latest-card">
          <h2 className="home-section-title">Son Eklenen Müşteriler</h2>
          <p className="home-section-subtitle">
            CRM&apos;e en son eklediğin müşteri kartlarının hızlı görünümü.
          </p>

          {latestCustomers.length === 0 ? (
            <div className="home-latest-empty">
              Henüz müşteri kartı eklenmemiş. CRM menüsünden yeni müşteri
              oluşturabilir veya Firma Bul üzerinden ekleyebilirsin.
            </div>
          ) : (
            <div className="home-latest-list">
              {latestCustomers.map((c) => (
                <div key={c.id} className="home-latest-item">
                  <div className="home-latest-main">
                    <div className="home-latest-name">
                      {c.name || "İsimsiz müşteri"}
                    </div>
                    <div className="home-latest-meta">
                      {c.brand ? c.brand : "Marka belirtilmemiş"}
                      {c.discount && (
                        <span className="home-latest-discount">
                          • İskonto: {c.discount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="home-latest-side">
                    <span
                      className={
                        "home-latest-badge " +
                        (c.source === "firma-bul"
                          ? "home-latest-badge--auto"
                          : "home-latest-badge--manual")
                      }
                    >
                      {c.source === "firma-bul" ? "Firma Bul" : "Manuel"}
                    </span>
                    <div className="home-latest-date">
                      {new Date(c.createdAt).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
