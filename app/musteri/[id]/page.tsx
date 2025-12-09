"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  paymentTerm?: string; // 🔹 Mevcut vade
  locationUrl: string;
  source: "manual" | "firma-bul";
  createdAt: string;
  notes?: string;
  status?: CustomerStatus;
};

const STORAGE_KEY = "crm-customers";

const statusOptions: { value: CustomerStatus; label: string; color: string }[] =
  [
    { value: "gorusulmedi", label: "Potansiyel", color: "#f97316" },
    { value: "degerlendiriyor", label: "Sıcak / Değerlendiriyor", color: "#22c55e" },
    { value: "gorusuldu_olumlu", label: "Olumlu", color: "#0ea5e9" },
    { value: "gorusuldu_olumsuz", label: "Olumsuz", color: "#ef4444" },
    { value: "sozlesme", label: "Sözleşme Yapıldı", color: "#22c55e" },
  ];

export default function MusteriDetayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setError("Kayıtlı müşteri bulunamadı.");
        setLoading(false);
        return;
      }
      const list = JSON.parse(raw) as Customer[];

      const found = list.find((c) => c.id === String(id));
      if (!found) {
        setError("Bu ID ile müşteri bulunamadı.");
        setLoading(false);
        return;
      }

      setCustomer({
        notes: "",
        status: "gorusulmedi",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        brand: "",
        discount: "",
        paymentTerm: "",
        locationUrl: "",
        ...found,
      });
      setLoading(false);
    } catch {
      setError("Müşteri verisi okunurken hata oluştu.");
      setLoading(false);
    }
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

  const handleChange = (field: keyof Customer, value: string) => {
    setCustomer((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleStatusChange = (value: CustomerStatus) => {
    setCustomer((prev) => (prev ? { ...prev, status: value } : prev));
  };

  const handleSave = () => {
    if (!customer) return;
    if (typeof window === "undefined") return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list: Customer[] = raw ? JSON.parse(raw) : [];

      const updatedList = list.map((c) =>
        c.id === customer.id ? customer : c
      );

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      setSaving(false);
      setMessage("Müşteri kartı başarıyla kaydedildi.");
    } catch {
      setSaving(false);
      setError("Müşteri kaydedilirken bir hata oluştu.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <div className="page-card">Müşteri kartı yükleniyor...</div>;
  }

  if (error || !customer) {
    return (
      <div className="page-card">
        <div style={{ marginBottom: 8, color: "#ef4444", fontSize: 13 }}>
          {error || "Müşteri bulunamadı."}
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

  return (
    <div className="page-card">
      {/* ÜST BAR + GERİ TUŞU */}
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
          {statusOptions.map((s) => {
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
              {"  "} (Tarayıcı, telefon uygulamasını açar.)
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
          <textarea
            className="crm-textarea"
            rows={3}
            value={customer.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Görüşme notları, rakip bilgisi, özel şartlar..."
          />
        </label>
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
