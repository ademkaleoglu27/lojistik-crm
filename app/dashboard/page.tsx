"use client";

import { useEffect, useState, useMemo } from "react";

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
  timeline: TimelineEvent[];
};

const STORAGE_KEY = "crm-customers";

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
    return parsed.map((c) => {
      const base: Customer = {
        id: c.id,
        name: c.name || "",
        contactName: c.contactName || "",
        phone: c.phone || "",
        email: c.email || "",
        address: c.address || "",
        website: c.website || "",
        brand: c.brand || "",
        discount: c.discount || "",
        locationUrl: c.locationUrl || "",
        source: c.source === "firma-bul" ? "firma-bul" : "manual",
        createdAt: c.createdAt || new Date().toISOString(),
        notes: c.notes || "",
        status: (c.status as CustomerStatus) || "gorusulmedi",
        timeline: Array.isArray(c.timeline) ? c.timeline : [],
      };

      // Eğer hiç timeline yoksa, en azından bir "kart oluşturuldu" eventi ekleyelim
      if (!base.timeline || base.timeline.length === 0) {
        base.timeline = [
          {
            id: `${base.id}-init`,
            type: "created",
            label:
              base.source === "firma-bul"
                ? "Müşteri kartı oluşturuldu (Kaynak: Firma Bul)"
                : "Müşteri kartı oluşturuldu (Manuel)",
            at: base.createdAt,
          },
        ];
      }

      return base;
    });
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    brand: "",
    discount: "",
    locationUrl: "",
    notes: "",
  });

  const [noteEditMode, setNoteEditMode] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const data = loadCustomers();
    setCustomers(data);
    if (data.length > 0) {
      setSelectedId(data[0].id);
    }
  }, []);

  const selectedCustomer =
    customers.find((c) => c.id === selectedId) || null;

  // Müşteri arama (isimle filtre)
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.toLowerCase();
    return customers.filter((c) =>
      (c.name || "").toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  // Seçilen müşteri değişince not alanını güncelle
  useEffect(() => {
    if (selectedCustomer) {
      setNoteEditMode(false);
      setNoteDraft(selectedCustomer.notes || "");
    } else {
      setNoteEditMode(false);
      setNoteDraft("");
    }
  }, [selectedCustomer?.id, selectedCustomer?.notes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const nowIso = new Date().toISOString();
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      website: form.website.trim(),
      brand: form.brand.trim(),
      discount: form.discount.trim(),
      locationUrl: form.locationUrl.trim(),
      source: "manual",
      createdAt: nowIso,
      notes: form.notes.trim(),
      status: "gorusulmedi",
      timeline: [
        {
          id: `${nowIso}-created`,
          type: "created",
          label: "Müşteri kartı oluşturuldu (Manuel)",
          at: nowIso,
        },
      ],
    };

    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    saveCustomers(updated);
    setSelectedId(newCustomer.id);

    setForm({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      brand: "",
      discount: "",
      locationUrl: "",
      notes: "",
    });
  };

  const handleStartEditNote = () => {
    if (!selectedCustomer) return;
    setNoteDraft(selectedCustomer.notes || "");
    setNoteEditMode(true);
  };

  const handleSaveNote = () => {
    if (!selectedCustomer) return;
    const newNotes = noteDraft.trim();
    const nowIso = new Date().toISOString();

    setCustomers((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== selectedCustomer.id) return c;
        const newTimeline: TimelineEvent[] = [
          ...c.timeline,
          {
            id: `${c.id}-note-${nowIso}`,
            type: "note",
            label: "Not güncellendi",
            at: nowIso,
          },
        ];
        return { ...c, notes: newNotes, timeline: newTimeline };
      });
      saveCustomers(updated);
      return updated;
    });
    setNoteEditMode(false);
  };

  const handleCancelNote = () => {
    setNoteEditMode(false);
    setNoteDraft(selectedCustomer?.notes || "");
  };

  const handleStatusChange = (status: CustomerStatus) => {
    if (!selectedCustomer) return;
    const nowIso = new Date().toISOString();

    setCustomers((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== selectedCustomer.id) return c;
        const label = `Durum: ${getStatusLabel(status)}`;
        const newTimeline: TimelineEvent[] = [
          ...c.timeline,
          {
            id: `${c.id}-status-${nowIso}`,
            type: "status",
            label,
            at: nowIso,
          },
        ];
        return { ...c, status, timeline: newTimeline };
      });
      saveCustomers(updated);
      return updated;
    });
  };

  const sortedTimeline: TimelineEvent[] = useMemo(() => {
    if (!selectedCustomer) return [];
    return [...(selectedCustomer.timeline || [])].sort(
      (a, b) =>
        new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }, [selectedCustomer?.timeline, selectedCustomer?.id]);

  return (
    <div className="crm-layout">
      {/* BAŞLIK */}
      <section className="page-card crm-header">
        <div>
          <h1 className="crm-title">Müşteri Yönetimi</h1>
          <p className="crm-subtitle">
            Mevcut müşterileri görüntüleyin, yeni müşteri kartları oluşturun ve
            indirim / marka bilgilerini yönetin. Müşteri kartlarına not ve
            durum ekleyebilir, zaman çizelgesinden geçmişi takip edebilirsiniz.
          </p>
        </div>
        <div className="crm-header-meta">
          <div className="crm-header-count">
            Toplam müşteri: <strong>{customers.length}</strong>
          </div>
          <div className="crm-header-note">
            Firma Bul sayfasından eklenenler otomatik burada listelenir.
          </div>
        </div>
      </section>

      <div className="crm-grid">
        {/* SOL: MEVCUT MÜŞTERİLER */}
        <section className="page-card crm-list-card">
          <h2 className="crm-section-title">Mevcut Müşteriler</h2>
          <p className="crm-section-subtitle">
            Soldan bir kart seçtiğinizde sağda detaylarını, durumunu, notlarını
            ve zaman çizelgesini görebilirsiniz. Aşağıdan müşteri adına göre
            filtreleyebilirsiniz.
          </p>

          {/* ARAMA ALANI */}
          <div className="crm-list-search">
            <input
              type="text"
              className="crm-input"
              placeholder="Müşteri adına göre ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-list">
            {customers.length === 0 && (
              <div className="crm-list-empty">
                Henüz kayıtlı müşteri yok. Sağ taraftan yeni müşteri
                oluşturabilir veya Firma Bul sayfasından ekleyebilirsiniz.
              </div>
            )}

            {customers.length > 0 && filteredCustomers.length === 0 && (
              <div className="crm-list-empty">
                Arama kriterinize uygun müşteri bulunamadı.
              </div>
            )}

            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                className={
                  "crm-card" +
                  (c.id === selectedId ? " crm-card--active" : "")
                }
                onClick={() => setSelectedId(c.id)}
              >
                <div className="crm-card-header">
                  <div className="crm-card-name">{c.name || "İsimsiz"}</div>
                  <span
                    className={
                      "crm-card-badge " +
                      (c.source === "firma-bul"
                        ? "crm-card-badge--auto"
                        : "crm-card-badge--manual")
                    }
                  >
                    {c.source === "firma-bul" ? "Firma Bul" : "Manuel"}
                  </span>
                </div>
                <div className="crm-card-row">
                  👤 {c.contactName || "Yetkili kişi girilmedi"}
                </div>
                <div className="crm-card-row">
                  📞 {c.phone || "Telefon yok"}
                </div>
                <div className="crm-card-row">
                  🏷️ {c.brand || "Marka bilgisi yok"}{" "}
                  {c.discount && (
                    <span className="crm-card-discount">
                      • İskonto: {c.discount}
                    </span>
                  )}
                </div>
                <div className="crm-card-row crm-card-row-status">
                  📌{" "}
                  <span className="crm-status-pill crm-status-pill--small">
                    {getStatusLabel(c.status)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* SEÇİLEN MÜŞTERİ DETAY KARTI */}
          {selectedCustomer && (
            <div className="crm-detail-card">
              <div className="crm-detail-title">
                {selectedCustomer.name || "Müşteri"}
              </div>

              <div className="crm-detail-row">
                👤 Yetkili:{" "}
                <span>
                  {selectedCustomer.contactName || "Belirtilmemiş"}
                </span>
              </div>
              <div className="crm-detail-row">
                📞 Telefon:{" "}
                <span>
                  {selectedCustomer.phone ? (
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="crm-link"
                    >
                      {selectedCustomer.phone}
                    </a>
                  ) : (
                    "Belirtilmemiş"
                  )}
                </span>
              </div>
              <div className="crm-detail-row">
                ✉️ E-posta:{" "}
                <span>
                  {selectedCustomer.email ? (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="crm-link"
                    >
                      {selectedCustomer.email}
                    </a>
                  ) : (
                    "Belirtilmemiş"
                  )}
                </span>
              </div>
              <div className="crm-detail-row">
                🏷️ Marka:{" "}
                <span>{selectedCustomer.brand || "Belirtilmemiş"}</span>
              </div>
              <div className="crm-detail-row">
                💸 İskonto:{" "}
                <span>{selectedCustomer.discount || "Belirtilmemiş"}</span>
              </div>
              <div className="crm-detail-row">
                📍 Adres:{" "}
                <span>{selectedCustomer.address || "Belirtilmemiş"}</span>
              </div>
              <div className="crm-detail-row">
                🌐 Web:{" "}
                <span>
                  {selectedCustomer.website ? (
                    <a
                      href={selectedCustomer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="crm-link"
                    >
                      Siteyi aç
                    </a>
                  ) : (
                    "Belirtilmemiş"
                  )}
                </span>
              </div>
              <div className="crm-detail-row">
                🗺️ Konum:{" "}
                <span>
                  {selectedCustomer.locationUrl ? (
                    <a
                      href={selectedCustomer.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="crm-link"
                    >
                      Google Maps&apos;te aç
                    </a>
                  ) : (
                    "Konum linki yok"
                  )}
                </span>
              </div>

              {/* DURUM */}
              <div className="crm-detail-status-block">
                <div className="crm-detail-row crm-detail-status-row">
                  📌 Durum:{" "}
                  <span className="crm-status-pill">
                    {getStatusLabel(selectedCustomer.status)}
                  </span>
                </div>
                <div className="crm-status-chips">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = selectedCustomer.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={
                          "crm-status-chip crm-status-chip--" +
                          opt.value +
                          (active ? " crm-status-chip--active" : "")
                        }
                        onClick={() => handleStatusChange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NOTLAR */}
              <div className="crm-detail-notes">
                <div className="crm-detail-notes-header">
                  <span className="crm-detail-notes-title">Notlar</span>
                  {!noteEditMode && (
                    <button
                      type="button"
                      className="crm-note-edit-btn"
                      onClick={handleStartEditNote}
                    >
                      ✏️ Not Ekle / Düzenle
                    </button>
                  )}
                </div>

                {!noteEditMode && (
                  <div className="crm-detail-notes-body">
                    {selectedCustomer.notes &&
                    selectedCustomer.notes.trim() !== "" ? (
                      <pre className="crm-detail-notes-text">
                        {selectedCustomer.notes}
                      </pre>
                    ) : (
                      <span className="crm-detail-notes-empty">
                        Bu müşteri için henüz not eklenmemiş.
                      </span>
                    )}
                  </div>
                )}

                {noteEditMode && (
                  <div className="crm-detail-notes-edit">
                    <textarea
                      className="crm-note-textarea"
                      rows={4}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Bu müşteriyle ilgili önemli notlar (ödeme alışkanlığı, özel fiyat anlaşmaları, sevkiyat tercihleri vb.)"
                    />
                    <div className="crm-note-actions">
                      <button
                        type="button"
                        className="crm-note-save-btn"
                        onClick={handleSaveNote}
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        className="crm-note-cancel-btn"
                        onClick={handleCancelNote}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ZAMAN ÇİZELGESİ */}
              <div className="crm-detail-timeline">
                <div className="crm-detail-timeline-header">
                  <span className="crm-detail-timeline-title">
                    Zaman Çizelgesi
                  </span>
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
                          <div className="crm-timeline-label">
                            {ev.label}
                          </div>
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
              </div>
            </div>
          )}
        </section>

        {/* SAĞ: YENİ MÜŞTERİ EKLE */}
        <section className="page-card crm-form-card">
          <h2 className="crm-section-title">Yeni Müşteri Ekle</h2>
          <p className="crm-section-subtitle">
            Firma adı, yetkili, marka ve iskonto gibi CRM bilgilerini buradan
            kaydedebilirsiniz. İsterseniz ilk notunuzu da ekleyebilirsiniz.
          </p>

          <form className="crm-form" onSubmit={handleCreateCustomer}>
            <div className="crm-form-group">
              <label>
                Firma Adı *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="crm-input"
                  placeholder="Örn: ABC Lojistik AŞ"
                  required
                />
              </label>
            </div>

            <div className="crm-form-row-2">
              <div className="crm-form-group">
                <label>
                  Yetkili İsim
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </label>
              </div>
              <div className="crm-form-group">
                <label>
                  İrtibat Telefon
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="+90 ..."
                  />
                </label>
              </div>
            </div>

            <div className="crm-form-group">
              <label>
                E-posta
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="crm-input"
                  placeholder="ornek@firma.com"
                />
              </label>
            </div>

            <div className="crm-form-group">
              <label>
                Adres
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="crm-textarea"
                  rows={2}
                  placeholder="Firma adresi"
                />
              </label>
            </div>

            <div className="crm-form-row-2">
              <div className="crm-form-group">
                <label>
                  Web Sitesi
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="https://..."
                  />
                </label>
              </div>
              <div className="crm-form-group">
                <label>
                  Marka
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="Örn: X Markası"
                  />
                </label>
              </div>
            </div>

            <div className="crm-form-row-2">
              <div className="crm-form-group">
                <label>
                  İskonto Oranı
                  <input
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="%15, %20..."
                  />
                </label>
              </div>
              <div className="crm-form-group">
                <label>
                  Konum Linki (Google Maps)
                  <input
                    name="locationUrl"
                    value={form.locationUrl}
                    onChange={handleChange}
                    className="crm-input"
                    placeholder="https://maps..."
                  />
                </label>
              </div>
            </div>

            <div className="crm-form-group">
              <label>
                Not (opsiyonel)
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="crm-textarea"
                  rows={3}
                  placeholder="Bu müşteriyle ilgili başlangıç notları"
                />
              </label>
            </div>

            <button type="submit" className="crm-submit-btn">
              Yeni Müşteri Kartı Oluştur
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
