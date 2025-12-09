"use client";

import { useMemo, useState } from "react";

// ✔ Petrol Ofisi fiyat linki
const PETROL_OFISI_URL =
  "https://www.petrolofisi.com.tr/akaryakit-fiyatlari";

// ✔ Anlaşmalı istasyon harita linki
const STATION_MAP_URL =
  "https://www.google.com/maps/d/viewer?mid=14c4OJZjE21s2YcUwUscRmvw9ZrVJ0SM&hl=tr&femb=1&ll=39.22031605810408%2C33.79921619999998&z=7";

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
    const g = Number(turkiyeIskonto) || 0;

    const istasyonNet = t * (1 - i / 100);
    const musteriFiyat = istasyonNet * (1 - m / 100);
    const turkiyeNet = t * (1 - g / 100);

    const tabelaIndirimTl = t - musteriFiyat;
    const tabelaIndirimYuzde = t > 0 ? (tabelaIndirimTl / t) * 100 : 0;

    const aylikTasarruf = tabelaIndirimTl * l;

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

      {/* Üst grid */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: 12,
        }}
      >
        {/* Sol taraf */}
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
        </div>

        {/* Sağ taraf - Linkler */}
        <div
          style={{
            padding: "10px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.4)",
            height: "fit-content",
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Harici Kaynaklar
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            Güncel fiyatlar ve anlaşmalı istasyonların konumları:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <a
              href={PETROL_OFISI_URL}
              target="_blank"
              rel="noreferrer"
              className="crm-link"
            >
              ⛽ Petrol Ofisi fiyatları
            </a>

            <a
              href={STATION_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="crm-link"
            >
              🗺️ Anlaşmalı istasyon haritası
            </a>
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
        <div className="result-card">
          <div className="result-title">İstasyon Net Fiyatı</div>
          <div className="result-value">
            {hesap.istasyonNet.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
        </div>

        <div className="result-card">
          <div className="result-title">Müşteriye Litre Fiyatı</div>
          <div className="result-value">
            {hesap.musteriFiyat.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
        </div>

        <div className="result-card">
          <div className="result-title">Tabela’ya Göre İndirim</div>
          <div className="result-value">
            {hesap.tabelaIndirimTl.toLocaleString("tr-TR", {
              maximumFractionDigits: 3,
            })}{" "}
            ₺ / L
          </div>
        </div>

        <div className="result-card">
          <div className="result-title">Aylık Tasarruf</div>
          <div className="result-value">
            {hesap.aylikTasarruf.toLocaleString("tr-TR", {
              maximumFractionDigits: 2,
            })}{" "}
            ₺ / ay
          </div>
        </div>
      </div>

      {/* Türkiye geneli karşılaştırma */}
      <div style={{ marginTop: 14, fontSize: 11, color: "#9ca3af" }}>
        Türkiye geneli litre fiyatı:{" "}
        <strong>
          {hesap.turkiyeNet.toLocaleString("tr-TR", {
            maximumFractionDigits: 3,
          })}
        </strong>{" "}
        TL — sizin sunduğunuz fiyat:{" "}
        <strong>
          {hesap.musteriFiyat.toLocaleString("tr-TR", {
            maximumFractionDigits: 3,
          })}
        </strong>{" "}
        TL.
        <br />
        Aradaki avantaj:{" "}
        <strong>
          {hesap.ekstraKarlilikLitre.toLocaleString("tr-TR", {
            maximumFractionDigits: 3,
          })}{" "}
          TL / L
        </strong>{" "}
        (aylık{" "}
        <strong>
          {hesap.ekstraKarlilikAylik.toLocaleString("tr-TR", {
            maximumFractionDigits: 2,
          })}{" "}
          TL
        </strong>
        ).
      </div>
    </div>
  );
}
