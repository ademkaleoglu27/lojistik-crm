"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type CustomerStatus =
  | "gorusulmedi"
  | "gorusuldu_olumlu"
  | "gorusuldu_olumsuz"
  | "degerlendiriyor"
  | "sozlesme";

/** Timeline event tipi çok katı olmasın diye type: string bıraktık */
type TimelineEvent = {
  id: string;
  type: string;
  label: string;
  at: string;
};

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
  paymentTerm?: string;
  locationUrl: string;
  source: "manual" | "firma-bul";
  createdAt: string;
  notes?: string;
  status?: CustomerStatus;
  timeline?: TimelineEvent[];
};

const STORAGE_KEY = "crm-customers";

const STATUS_OPTIONS: { value: CustomerStatus; label: string; color: string }[] =
  [
    { value: "gorusulmedi", label: "Potansiyel", color: "#f97316" },
    {
      value: "degerlendiriyor",
      label: "Sıcak / Değerlendiriyor",
      color: "#22c55e",
    },
    { value: "gorusuldu_olumlu", label: "Olumlu", color: "#0ea5e9" },
    { value: "gorusuldu_olumsuz", label: "Olumsuz", color: "#ef4444" },
    { value: "sozlesme", label: "Sözleşme Yapıldı", color: "#22c55e" },
  ];

function getStatusLabel(status: CustomerStatus | undefined): string {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  if (!found) return "Potansiyel";
  return found.label;
}

function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Customer[];
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export default function MusteriDetayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteEditMode, setNoteEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // İlk yükleme: müşteri listesi + seçilen müşteri
  useEffect(() => {
    if (!id) return;
    const data = loadCustomers();
    setCustomers(data);
    const found = data.find((c) => String(c.id) === String(id));
    if (!found) {
      setError("Bu ID ile müşteri bulunamadı.");
      return;
    }

    const baseTimeline: TimelineEvent[] = Array.isArray(found.timeline)
      ? (found.timeline as TimelineEvent[])
      : [];

    const safeTimeline: TimelineEvent[] =
      baseTimeline.length === 0
        ? [
            {
              id: `${found.id}-init`,
              type: "created",
              label:
                found.source === "firma-bul"
                  ? "Müşteri kartı oluşturuldu (Kaynak: Firma Bul)"
                  : "Müşteri kartı oluşturuldu (Manuel)",
              at: found.createdAt || new Date().toISOString(),
            },
          ]
        : baseTimeline;

    const safeCustomer: Customer = {
      ...found,
      name: found.name || "",
      contactName: found.contactName || "",
      phone: found.phone || "",
      email: found.email || "",
      address: found.address || "",
      website: found.website || "",
      brand: found.brand || "",
      discount: found.discount || "",
      paymentTerm: found.paymentTerm || "",
      locationUrl: found.locationUrl || "",
      createdAt: found.createdAt || new Date().toISOString(),
      notes: found.notes || "",
      status: found.status || "gorusulmedi",
      timeline: safeTimeline,
    };

    setCustomer(safeCustomer);
    setNoteDraft(safeCustomer.notes || "");
  }, [id]);

  const createdAtText = useMemo(() => {
    if (!customer?.createdAt) return "-";
    try {
      return new Date(customer.createdAt).toLocaleString("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
      });
    } catch {
      return customer.createdAt;
    }
  }, [customer?.createdAt]);

  const sortedTimeline: TimelineEvent[] = useMemo(() => {
    if (!customer?.timeline) return [];
    return [...customer.timeline].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }, [customer?.timeline]);

  const handleChange = (field: keyof Customer, value: string) => {
    if (!customer) return;
    setCustomer({ ...customer, [field]: value });
  };

  const handleStatusChange = (status: CustomerStatus) => {
    if (!customer) return;
    const nowIso = new Date().toISOString();
    const newTimeline: TimelineEvent[] = [
      ...(customer.timeline || []),
      {
        id: `${customer.id}-status-${nowIso}`,
        type: "status",
        label: `Durum: ${getStatusLabel(status)}`,
        at: nowIso,
      },
    ];
    setCustomer({ ...customer, status, timeline: newTimeline });
  };

  const handleSaveNote = () => {
    if (!customer) return;
    const nowIso = new Date().toISOString();
    const newNotes = noteDraft.trim();
    const newTimeline: TimelineEvent[] = [
      ...(customer.timeline || []),
      {
        id: `${customer.id}-note-${nowIso}`,
        type: "note",
        label: "Not güncellendi",
        at: nowIso,
      },
    ];
    setCustomer({ ...customer, notes: newNotes, timeline: newTimeline });
    setNoteEditMode(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (!customer) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updatedList = customers.map((c) =>
        String(c.id) === String(customer.id) ? customer : c
      );
      setCustomers(updatedList);
      saveCustomers(updatedList);
      setSaving(false);
      setMessage("Müşteri kartı kaydedildi.");
    } catch (e) {
      setSaving(false);
      setError("Müşteri kaydedilirken bir hata oluştu.");
    }
  };

  if (error && !customer) {
    return (
      <div className="page-card">
        <div style={{ marginBottom: 8, color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
        <button
          type="button"
          className="crm-submit-btn"
          onClick={() => router.push("/dashboard")}
        >
          Müşteri yönetimine dön
        </button>
      </div>
    );
  }

  if (!customer) {
    return <div className="page-card">Müşteri kartı yükleniyor...</div>;
  }

  return (
    <div className="page-card">
      {/* ÜST BAR + GERİ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="crm-submit-btn crm-submit-btn--ghost"
            style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={handleBack}
          >
            ← Geri
          </button>
          <div>
            <h1 className="crm-title">
              {customer.name || "Müşteri Kartı"}
            </h1>
            <p className="crm-subtitle">
              Firma Bul veya manuel eklediğiniz müşteriyi burada detaylı
              olarak düzenleyebilirsiniz.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div>Oluşturma Tarihi</div>
          <div style={{ fontWeight: 600 }}>{createdAtText}</div>
          <div style={{ marginTop: 4 }}>
            Kaynak:{" "}
            <strong>
              {customer.source === "firma-bul" ? "Firma Bul" : "Manuel"}
            </strong>
          </div>
        </div>
      </div>

      {/* DURUM SEÇİMİ */}
      <section
        style={{
          marginBottom: 14,
          padding: 8,
          borderRadius: 10,
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Müşteri Durumu
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            fontSize: 11,
          }}
        >
          {STATUS_OPTIONS.map((s) => {
            const active = customer.status === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => handleStatusChange(s.value)}
                style={{
                  borderRadius: 999,
                  padding: "4px 10px",
                  border: active
                    ? `1px solid ${s.color}`
                    : "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: active ? `${s.color}22` : "transparent",
                  color: active ? s.color : "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* FORM ALANLARI */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div className="crm-form-group">
          <label>
            Firma Adı
            <input
              className="crm-input"
              value={customer.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Örn: ABC Lojistik"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            Yetkili İsim
            <input
              className="crm-input"
              value={customer.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
              placeholder="Örn: Mehmet Bey"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            Telefon
            <input
              type="tel"
              className="crm-input"
              value={customer.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Örn: 05xx xxx xx xx"
            />
          </label>
          {customer.phone && (
            <div style={{ marginTop: 4, fontSize: 11 }}>
              📞{" "}
              <a
                href={`tel:${customer.phone}`}
                className="firma-contact-link"
              >
                Bu numarayı ara
              </a>
            </div>
          )}
        </div>

        <div className="crm-form-group">
          <label>
            E-posta
            <input
              className="crm-input"
              value={customer.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Örn: info@firma.com"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            Web Sitesi
            <input
              className="crm-input"
              value={customer.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            Konum Linki (Google Maps)
            <input
              className="crm-input"
              value={customer.locationUrl}
              onChange={(e) => handleChange("locationUrl", e.target.value)}
              placeholder="Google Maps URL yapıştır"
            />
          </label>
          {customer.locationUrl && (
            <div style={{ marginTop: 4, fontSize: 11 }}>
              🗺️{" "}
              <a
                href={customer.locationUrl}
                target="_blank"
                rel="noreferrer"
                className="firma-contact-link"
              >
                Haritada yolu aç
              </a>
            </div>
          )}
        </div>

        <div className="crm-form-group">
          <label>
            Çalıştığı Marka
            <input
              className="crm-input"
              value={customer.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              placeholder="Örn: Petrol Ofisi"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            İskonto Oranı (%)
            <input
              className="crm-input"
              value={customer.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
              placeholder="Örn: 8"
            />
          </label>
        </div>

        <div className="crm-form-group">
          <label>
            Mevcut Vade
            <input
              className="crm-input"
              value={customer.paymentTerm || ""}
              onChange={(e) => handleChange("paymentTerm", e.target.value)}
              placeholder="Örn: 30 gün, 45 gün"
            />
          </label>
        </div>
      </section>

      {/* NOT ALANI */}
      <section className="crm-form-group" style={{ marginBottom: 12 }}>
        <label>
          Notlar
          {noteEditMode ? (
            <textarea
              className="crm-textarea"
              rows={3}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Görüşme notları, rakip bilgisi, özel şartlar..."
            />
          ) : (
            <pre className="crm-detail-notes-text">
              {customer.notes && customer.notes.trim() !== ""
                ? customer.notes
                : "Bu müşteri için henüz not eklenmemiş."}
            </pre>
          )}
        </label>
        <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
          {!noteEditMode && (
            <button
              type="button"
              className="crm-note-edit-btn"
              onClick={() => setNoteEditMode(true)}
            >
              ✏️ Not Ekle / Düzenle
            </button>
          )}
          {noteEditMode && (
            <>
              <button
                type="button"
                className="crm-note-save-btn"
                onClick={handleSaveNote}
              >
                Notu Kaydet
              </button>
              <button
                type="button"
                className="crm-note-cancel-btn"
                onClick={() => {
                  setNoteEditMode(false);
                  setNoteDraft(customer.notes || "");
                }}
              >
                İptal
              </button>
            </>
          )}
        </div>
      </section>

      {/* ZAMAN ÇİZELGESİ */}
      <section className="crm-detail-timeline" style={{ marginBottom: 12 }}>
        <div className="crm-detail-timeline-header">
          <span className="crm-detail-timeline-title">Zaman Çizelgesi</span>
        </div>
        {sortedTimeline.length === 0 ? (
          <div className="crm-detail-timeline-empty">
            Bu müşteri için henüz hareket kaydı yok.
          </div>
        ) : (
          <ul className="crm-timeline-list">
            {sortedTimeline.map((ev) => (
              <li key={ev.id} className="crm-timeline-item">
                <div className="crm-timeline-dot" />
                <div className="crm-timeline-content">
                  <div className="crm-timeline-label">{ev.label}</div>
                  <div className="crm-timeline-date">
                    {new Date(ev.at).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MESAJLAR + BUTONLAR */}
      {message && (
        <div style={{ fontSize: 11, color: "#22c55e", marginBottom: 8 }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="crm-submit-btn crm-submit-btn--ghost"
          onClick={handleBack}
          disabled={saving}
        >
          Geri
        </button>
        <button
          type="button"
          className="crm-submit-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
