"use client";

import { useMemo, useState } from "react";

const PETROL_OFISI_URL =
  "https://SEN_BURAYI_PETROL_OFISI_FIYAT_LINKIN_ILE_DEGISTIR"; // <- burayı kendi linkinle değiştir
const STATION_MAP_URL =
  "https://SEN_BURAYI_ISTASYON_HARITA_LINKIN_ILE_DEGISTIR"; // <- burayı kendi linkinle değiştir

export default function FiyatHesaplamaPage() {
  const [tabelaFiyat, setTabelaFiyat] = useState<string>("");
  const [istasyonIskonto, setIstasyonIskonto] = useState<string>("");
  const [musteriIskonto, setMusteriIskonto] = useState<string>("");
  const [aylikLitre, setAylikLitre] = useState<string>("");
  const [turkiyeIskonto, setTurkiyeIskonto] = useState<string>("");

  const hesap = useMemo(() => {
    const t = Number(tabelaFiyat) || 0;
    const i = Number(istasyonIskonto) || 0;
    const m = Number(musteriIskonto) || 0;
    const l = Number(aylikLitre) || 0;
    const g = Number(turkiyeIskonto) || 0; // Türkiye geneli iskonto

    // İstasyon net fiyatı: tabela - istasyon iskonto
    const istasyonNet = t * (1 - i / 100);

    // Müşteriye verdiğin ek iskonto istasyon net fiyatı üzerinden
    const musteriFiyat = istasyonNet * (1 - m / 100);

    // Türkiye geneli net fiyat (tabela - TR geneli iskonto)
    const turkiyeNet = t * (1 - g / 100);

    // Tabela'ya göre indirim
    const tabelaIndirimTl = t - musteriFiyat;
    const tabelaIndirimYuzde = t > 0 ? (tabelaIndirimTl / t) * 100 : 0;

    // Aylık tasarruf (tabela'ya göre)
    const aylikTasarruf = tabelaIndirimTl * l;

    // Türkiye geneline göre ekstra avantaj (litre başı)
    const ekstraKarlilikLitre = turkiyeNet - musteriFiyat;
    const ekstraKarlilikAylik = ekstraKarlilikLitre * l;

    return {
      t,
      i,
      m,
      l,
      g,
      istasyonNet,
      musteriFiyat,
      turkiyeNet,
      tabelaIndirimTl,
      tabelaIndirimYuzde,
      aylikTasarruf,
      ekstraKarlilikLitre,
      ekstraKarlilikAylik,
    };
  }, [tabelaFiyat, istasyonIskonto, musteriIskonto, aylikLitre, turkiyeIskonto]);

  return (
    <div className="page-card">
      <h1 className="crm-title">Fiyat Hesaplama (Tabela / İskonto)</h1>
      <p className="crm-subtitle">
        Tabela fiyatı üzerinden istasyon iskonto + müşteriye tanımlanan ek
        iskonto ve Türkiye geneli ortalama iskonto ile litre başı net fiyatı ve
        yaklaşık aylık tasarrufu hesaplayın.
      </p>

      {/* Üst grid: girişler + linkler */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: 12,
        }}
      >
        {/* Sol taraf: Giriş alanları */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="crm-form-row-2">
            <div className="crm-form-group">
              <label>
                Tabela Fiyatı (TL / Litre)
                <input
                  className="crm-input"
                  value={tabelaFiyat}
                  onChange={(e) => setTabelaFiyat(e.target.value)}
                  placeholder="Örn: 45.50"
                  inputMode="decimal"
                />
              </label>
            </div>
            <div className="crm-form-group">
              <label>
                Aylık Tüketim (Litre)
                <input
                  className="crm-input"
                  value={aylikLitre}
                  onChange={(e) => setAylikLitre(e.target.value)}
                  placeholder="Örn: 10.000"
                  inputMode="decimal"
                />
              </label>
            </div>
          </div>

          <div className="crm-form-row-2">
            <div className="crm-form-group">
              <label>
                Anlaşmalı İstasyon İskonto Oranı (%)
                <input
                  className="crm-input"
                  value={istasyonIskonto}
                  onChange={(e) => setIstasyonIskonto(e.target.value)}
                  placeholder="Örn: 10"
                  inputMode="decimal"
                />
              </label>
            </div>
            <div className="crm-form-group">
              <label>
                Müşteriye Verilen Ek İskonto (%)
                <input
                  className="crm-input"
                  value={musteriIskonto}
                  onChange={(e) => setMusteriIskonto(e.target.value)}
                  placeholder="Örn: 3"
                  inputMode="decimal"
                />
              </label>
            </div>
          </div>

          <div className="crm-form-group">
            <label>
              Türkiye Geneli Ortalama İskonto (%)
              <input
                className="crm-input"
                value={turkiyeIskonto}
                onChange={(e) => setTurkiyeIskonto(e.target.value)}
                placeholder="Örn: 8"
                inputMode="decimal"
              />
            </label>
          </div>

          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            Örnek senaryo: Tabela 45,50 TL, Türkiye geneli iskonto %8, anlaşmalı
            istasyon iskonto %10, müşteriye ek iskonto %3 ise; Türkiye geneline
            göre litre başı ne kadar avantaj sunduğunuzu aşağıdan
            gösterebilirsiniz.
          </p>
        </div>

        {/* Sağ taraf: Dış linkler */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Harici Kaynaklar
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
              Güncel pompa fiyatlarını ve anlaşmalı istasyonları hızlıca
              kontrol etmek için aşağıdaki linkleri kullanabilirsin.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a
                href={PETROL_OFISI_URL}
                target="_blank"
                rel="noreferrer"
                className="crm-link"
              >
                ⛽ Petrol Ofisi güncel fiyatlar
              </a>
              <a
                href={STATION_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="crm-link"
              >
                🗺️ Anlaşmalı istasyonları haritada gör
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sonuç kartları */}
      <div
        style={{
          marginTop: 16,
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
            İstasyon Net Fiyatı
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {hesap.istasyonNet.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            Tabela - istasyon iskontosu
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
            Müşteriye Litre Fiyatı
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {hesap.musteriFiyat.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            İstasyon net fiyatı - müşteri iskonto
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
            Tabela&apos;ya Göre İndirim
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {hesap.tabelaIndirimTl.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            Yaklaşık %{hesap.tabelaIndirimYuzde.toFixed(2)} iskonto
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
            Aylık Tasarruf (Tabela&apos;ya Göre)
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {hesap.aylikTasarruf.toLocaleString("tr-TR", {
              maximumFractionDigits: 2,
            })}{" "}
            ₺ / ay
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            {hesap.l.toLocaleString("tr-TR")} L / ay varsayımıyla
          </div>
        </div>
      </div>

      {/* Türkiye geneli vs sizin avantajınız */}
      {hesap.t > 0 && hesap.g > 0 && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: "#9ca3af",
            lineHeight: 1.5,
          }}
        >
          Türkiye geneli ortalama iskonto %{hesap.g.toFixed(2)} ile litre
          fiyatı yaklaşık{" "}
          <strong>
            {hesap.turkiyeNet.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}
          </strong>{" "}
          TL / L olur.
          <br />
          Anlaşmalı istasyon + müşteriye verdiğiniz iskonto ile sunduğunuz
          fiyat ise{" "}
          <strong>
            {hesap.musteriFiyat.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}
          </strong>{" "}
          TL / L.
          <br />
          Aradaki fark litre başına{" "}
          <strong>
            {hesap.ekstraKarlilikLitre.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}
          </strong>{" "}
          TL, bu da aylık yaklaşık{" "}
          <strong>
            {hesap.ekstraKarlilikAylik.toLocaleString("tr-TR", {
              maximumFractionDigits: 2,
            })}
          </strong>{" "}
          TL ek avantaj anlamına gelir.
        </div>
      )}

      <p style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
        Bu ekranı müşteriyle karşı karşıya otururken hızlıca kullanıp
        &quot;Bakın, Türkiye geneli ortalama iskonto ile litre fiyatı yaklaşık{" "}
        {hesap.turkiyeNet
          ? hesap.turkiyeNet.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })
          : "..."}{" "}
        TL, bizim anlaşmalı istasyonla size sunduğumuz fiyat ise yaklaşık{" "}
        {hesap.musteriFiyat
          ? hesap.musteriFiyat.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })
          : "..."}{" "}
        TL; aradaki fark litre başına{" "}
        {hesap.ekstraKarlilikLitre
          ? hesap.ekstraKarlilikLitre.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })
          : "..."}{" "}
        TL&quot; diye net göstermek için kullanabilirsin.
      </p>
    </div>
  );
}
