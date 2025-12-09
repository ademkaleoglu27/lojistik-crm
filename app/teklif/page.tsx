"use client";

import { useEffect, useMemo, useState } from "react";

type CustomerStatus =
  | "gorusulmedi"
  | "gorusuldu_olumlu"
  | "gorusuldu_olumsuz"
  | "degerlendiriyor"
  | "sozlesme";

type TimelineEventType = "created" | "status" | "note" | "offer_contract";

type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  label: string;
  at: string;
};

type Customer = {
  id: string;
  name: string;
  brand: string;
  discount: string;
  source: "manual" | "firma-bul";
  createdAt: string;
  status: CustomerStatus;
  notes?: string;
  timeline: TimelineEvent[];
};

const STORAGE_KEY = "crm-customers";

function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map((c) => ({
      id: c.id,
      name: c.name || "",
      brand: c.brand || "",
      discount: c.discount || "",
      source: c.source === "firma-bul" ? "firma-bul" : "manual",
      createdAt: c.createdAt || new Date().toISOString(),
      status: (c.status as CustomerStatus) || "gorusulmedi",
      notes: c.notes || "",
      timeline: Array.isArray(c.timeline) ? c.timeline : [],
    }));
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export default function TeklifPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [unitPrice, setUnitPrice] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [extraCost, setExtraCost] = useState<string>("0");
  const [discountRate, setDiscountRate] = useState<string>("0");

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const data = loadCustomers();
    setCustomers(data);
    if (data.length > 0) {
      setSelectedId(data[0].id);
    }
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedId) || null,
    [customers, selectedId]
  );

  const numbers = useMemo(() => {
    const q = Number(quantity) || 0;
    const p = Number(unitPrice) || 0;
    const c = Number(unitCost) || 0;
    const e = Number(extraCost) || 0;
    const d = Number(discountRate) || 0;

    const rawTotal = p * q;
    const discountAmount = (rawTotal * d) / 100;
    const totalPrice = rawTotal - discountAmount;
    const totalCost = c * q + e;
    const profit = totalPrice - totalCost;
    const margin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0;

    return {
      q,
      p,
      c,
      e,
      d,
      totalPrice,
      totalCost,
      profit,
      margin,
    };
  }, [quantity, unitPrice, unitCost, extraCost, discountRate]);

  const handleMarkContract = () => {
    if (!selectedCustomer) return;

    const nowIso = new Date().toISOString();

    setCustomers((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== selectedCustomer.id) return c;

        const newTimeline: TimelineEvent[] = [
          ...c.timeline,
          {
            id: `${c.id}-offer-${nowIso}`,
            type: "offer_contract",
            label: "Teklif sözleşmeye dönüştü (Teklif modülü)",
            at: nowIso,
          },
          {
            id: `${c.id}-status-sozlesme-${nowIso}`,
            type: "status",
            label: "Durum: Sözleşme yapıldı (Teklif modülü)",
            at: nowIso,
          },
        ];

        return {
          ...c,
          status: "sozlesme" as CustomerStatus,
          timeline: newTimeline,
        };
      });

      saveCustomers(updated);
      return updated;
    });

    setMessage("Bu müşteri için durum 'Sözleşme yapıldı' olarak güncellendi.");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="page-card">
      <h1 className="crm-title">Teklif & Karlılık</h1>
      <p className="crm-subtitle">
        Müşteri bazlı teklif oluşturun, otomatik maliyet / kârlılık hesabı
        yapın. Uygun gördüğünüz teklifi &quot;Sözleşme yapıldı&quot; durumuna
        çekebilirsiniz.
      </p>

      {customers.length === 0 ? (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          Henüz CRM&apos;de kayıtlı müşteri yok. Önce CRM menüsünden müşteri
          ekleyin veya Firma Bul üzerinden müşteri kartı oluşturun.
        </div>
      ) : (
        <>
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
              gap: 12,
            }}
          >
            {/* Sol: Müşteri seçimi ve temel bilgiler */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div className="crm-form-group">
                <label>
                  Müşteri Seç
                  <select
                    className="crm-input"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || "İsimsiz"}{" "}
                        {c.brand ? ` - ${c.brand}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedCustomer && (
                <div
                  style={{
                    fontSize: 12,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.4)",
                  }}
                >
                  <div style={{ marginBottom: 2 }}>
                    <strong>Müşteri:</strong> {selectedCustomer.name}
                  </div>
                  {selectedCustomer.brand && (
                    <div style={{ marginBottom: 2 }}>
                      <strong>Marka:</strong> {selectedCustomer.brand}
                    </div>
                  )}
                  {selectedCustomer.discount && (
                    <div style={{ marginBottom: 2 }}>
                      <strong>İskonto:</strong>{" "}
                      {selectedCustomer.discount}
                    </div>
                  )}
                  <div>
                    <strong>Durum:</strong>{" "}
                    {selectedCustomer.status === "sozlesme"
                      ? "Sözleşme yapıldı"
                      : selectedCustomer.status === "degerlendiriyor"
                      ? "Değerlendiriyor"
                      : selectedCustomer.status === "gorusuldu_olumlu"
                      ? "Görüşüldü - Olumlu"
                      : selectedCustomer.status === "gorusuldu_olumsuz"
                      ? "Görüşüldü - Olumsuz"
                      : "Görüşülmedi"}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ: Hesaplama alanı */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div className="crm-form-row-2">
                <div className="crm-form-group">
                  <label>
                    Birim Satış Fiyatı
                    <input
                      className="crm-input"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="Örn: 1000"
                      inputMode="decimal"
                    />
                  </label>
                </div>
                <div className="crm-form-group">
                  <label>
                    Birim Maliyet
                    <input
                      className="crm-input"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="Örn: 700"
                      inputMode="decimal"
                    />
                  </label>
                </div>
              </div>

              <div className="crm-form-row-2">
                <div className="crm-form-group">
                  <label>
                    Adet / Sefer
                    <input
                      className="crm-input"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                      inputMode="numeric"
                    />
                  </label>
                </div>
                <div className="crm-form-group">
                  <label>
                    Ek Maliyet (toplam)
                    <input
                      className="crm-input"
                      value={extraCost}
                      onChange={(e) => setExtraCost(e.target.value)}
                      placeholder="Örn: 500"
                      inputMode="decimal"
                    />
                  </label>
                </div>
              </div>

              <div className="crm-form-group">
                <label>
                  İskonto Oranı (%)
                  <input
                    className="crm-input"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                    placeholder="Örn: 10"
                    inputMode="decimal"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Sonuçlar */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 8,
              fontSize: 12,
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div style={{ color: "#9ca3af", marginBottom: 2 }}>
                Toplam Satış
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {numbers.totalPrice.toLocaleString("tr-TR", {
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div style={{ color: "#9ca3af", marginBottom: 2 }}>
                Toplam Maliyet
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {numbers.totalCost.toLocaleString("tr-TR", {
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div style={{ color: "#9ca3af", marginBottom: 2 }}>
                Net Kâr
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: numbers.profit >= 0 ? "#4ade80" : "#f97373",
                }}
              >
                {numbers.profit.toLocaleString("tr-TR", {
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <div style={{ color: "#9ca3af", marginBottom: 2 }}>
                Kârlılık Oranı
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color:
                    numbers.margin >= 25
                      ? "#4ade80"
                      : numbers.margin >= 10
                      ? "#facc15"
                      : "#f97373",
                }}
              >
                {Number.isFinite(numbers.margin)
                  ? numbers.margin.toFixed(1)
                  : "0"}
                %
              </div>
            </div>
          </div>

          {/* Sözleşme butonu */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
            }}
          >
            <div style={{ color: "#9ca3af" }}>
              Bu hesaplama ile müşteri ile anlaştıysan aşağıdan
              &quot;Sözleşme yapıldı&quot; durumuna çekebilirsin. Bu işlem
              CRM zaman çizelgesine de işlenecektir.
            </div>
            <button
              type="button"
              className="crm-submit-btn"
              onClick={handleMarkContract}
              disabled={!selectedCustomer}
            >
              ✅ Sözleşme yapıldı olarak işaretle
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#4ade80",
              }}
            >
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
