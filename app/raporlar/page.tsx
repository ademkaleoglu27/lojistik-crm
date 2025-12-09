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

type RangeKey = "week" | "month" | "threeMonths" | "all";
type StatusFilter = "all" | CustomerStatus;

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: "gorusulmedi", label: "Görüşülmedi" },
  { value: "gorusuldu_olumlu", label: "Görüşüldü - Olumlu" },
  { value: "gorusuldu_olumsuz", label: "Görüşüldü - Olumsuz" },
  { value: "degerlendiriyor", label: "Değerlendiriyor" },
  { value: "sozlesme", label: "Sözleşme yapıldı" },
];

function getStatusLabel(status: CustomerStatus | undefined): string {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  return found ? found.label : "Görüşülmedi";
}

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

export default function ReportsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [range, setRange] = useState<RangeKey>("month");
  const [onlyWithNotes, setOnlyWithNotes] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const data = loadCustomers();
    setCustomers(data);
  }, []);

  const filtered = useMemo(() => {
    if (customers.length === 0) return [];

    const now = new Date();
    let fromDate: Date | null = null;

    if (range === "week") {
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 7);
    } else if (range === "month") {
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 1);
    } else if (range === "threeMonths") {
      fromDate = new Date(now);
      fromDate.setMonth(now.getMonth() - 3);
    } else {
      fromDate = null; // all
    }

    return customers
      .filter((c) => {
        if (!fromDate) return true;
        const created = new Date(c.createdAt);
        return created >= fromDate;
      })
      .filter((c) => {
        if (!onlyWithNotes) return true;
        return c.notes && c.notes.trim() !== "";
      })
      .filter((c) => {
        if (statusFilter === "all") return true;
        return c.status === statusFilter;
      })
      .sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [customers, range, onlyWithNotes, statusFilter]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    if (typeof window === "undefined") return;

    const header = [
      "Müşteri Adı",
      "Yetkili",
      "Telefon",
      "E-posta",
      "Marka",
      "İskonto",
      "Kaynak",
      "Durum",
      "Oluşturma Tarihi",
      "Notlar",
    ];

    const rows = filtered.map((c) => [
      c.name || "",
      c.contactName || "",
      c.phone || "",
      c.email || "",
      c.brand || "",
      c.discount || "",
      c.source === "firma-bul" ? "Firma Bul" : "Manuel",
      getStatusLabel(c.status),
      new Date(c.createdAt).toLocaleString("tr-TR"),
      (c.notes || "").replace(/\r?\n/g, " / "),
    ]);

    const csvContent =
      "\uFEFF" +
      [header, ...rows]
        .map((row) =>
          row.map((field) => `"${(field || "").replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const label =
      range === "week"
        ? "haftalik"
        : range === "month"
        ? "aylik"
        : range === "threeMonths"
        ? "3aylik"
        : "tum";

    a.href = url;
    a.download = `crm_gorusme_notlari_${label}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-layout">
      {/* Başlık */}
      <section className="page-card report-header">
        <div>
          <h1 className="report-title">Raporlama</h1>
          <p className="report-subtitle">
            Müşteri kartlarındaki görüşme notlarını ve durumlarını haftalık,
            aylık veya belirli dönemler için Excel (CSV) formatında dışa
            aktarın.
          </p>
        </div>
      </section>

      {/* Filtre + Özet */}
      <section className="page-card report-filters">
        <div className="report-filter-row">
          <div className="report-filter-group">
            <label className="report-filter-label">Tarih aralığı</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
              className="report-select"
            >
              <option value="week">Bu hafta (son 7 gün)</option>
              <option value="month">Bu ay (son 30 gün)</option>
              <option value="threeMonths">Son 3 ay</option>
              <option value="all">Tüm kayıtlar</option>
            </select>
          </div>

          <div className="report-filter-group">
            <label className="report-filter-label">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="report-select"
            >
              <option value="all">Tümü</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="report-filter-group">
            <label className="report-checkbox-label">
              <input
                type="checkbox"
                checked={onlyWithNotes}
                onChange={(e) => setOnlyWithNotes(e.target.checked)}
              />
              Sadece notu olan müşteriler
            </label>
          </div>

          <div className="report-actions">
            <button
              type="button"
              className="report-export-btn"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              ⬇️ Excel (CSV) olarak indir
            </button>
          </div>
        </div>

        <div className="report-summary">
          <span>
            Toplam müşteri: <strong>{customers.length}</strong>
          </span>
          <span> • </span>
          <span>
            Filtreye uyan satır: <strong>{filtered.length}</strong>
          </span>
        </div>
      </section>

      {/* Tablo */}
      <section className="page-card report-table-card">
        <h2 className="report-table-title">Görüşme Notları</h2>
        <p className="report-table-subtitle">
          Eklediğiniz müşteri notları ve durumları burada satır satır
          listelenir. Excel çıktısı aldığınızda aynı veriler CSV formatında
          indirilecektir.
        </p>

        {filtered.length === 0 ? (
          <div className="report-empty">
            Seçili tarih aralığı ve filtrelere göre gösterilecek kayıt yok.
          </div>
        ) : (
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>Yetkili</th>
                  <th>Telefon</th>
                  <th>Marka</th>
                  <th>İskonto</th>
                  <th>Kaynak</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>Not</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.contactName}</td>
                    <td>{c.phone}</td>
                    <td>{c.brand}</td>
                    <td>{c.discount}</td>
                    <td>
                      {c.source === "firma-bul" ? "Firma Bul" : "Manuel"}
                    </td>
                    <td>{getStatusLabel(c.status)}</td>
                    <td>
                      {new Date(c.createdAt).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="report-note-cell">
                      {c.notes && c.notes.trim() !== ""
                        ? c.notes
                        : "Not girilmemiş"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
