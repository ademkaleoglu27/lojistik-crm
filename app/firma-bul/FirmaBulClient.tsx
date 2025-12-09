"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

type PlaceResult = {
  name?: string;
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: any;
  };
};

type PlaceDetails = {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  place_id?: string;
};

type CustomerForStorage = {
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
};

const STORAGE_KEY = "crm-customers";

export default function FirmaBulClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("query") || "";

  // 🔹 Yeni alanlar: Şehir, İlçe, Sektör, Firma Adı
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);

  const [selectedDetails, setSelectedDetails] = useState<PlaceDetails | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [addMessage, setAddMessage] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Google Maps script yükleme
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      setError(
        "Google Maps API anahtarı bulunamadı. Lütfen env ayarlarını kontrol edin."
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=tr`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setError("Google Maps script yüklenirken hata oluştu.");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  // Harita ilk kurulum
  useEffect(() => {
    if (!scriptLoaded) return;
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const center = { lat: 39.0, lng: 35.0 }; // Türkiye ortalama

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
  }, [scriptLoaded]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  // Ortak: inputlardan arama metni oluştur
  const buildSearchText = () => {
    const parts: string[] = [];

    if (sector.trim()) parts.push(sector.trim());
    if (name.trim()) parts.push(name.trim());
    if (district.trim()) parts.push(district.trim());
    if (city.trim()) parts.push(city.trim());

    return parts.join(" ").trim();
  };

  // Arama fonksiyonu
  const performSearch = useCallback((searchText: string) => {
    if (!mapInstance.current || !window.google?.maps?.places) {
      setError("Harita veya Places servisi henüz hazır değil.");
      return;
    }

    const trimmed = searchText.trim();
    if (!trimmed) {
      setError("Lütfen en az bir arama kriteri girin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedDetails(null);
    setAddMessage(null);

    const service = new window.google.maps.places.PlacesService(
      mapInstance.current
    );

    const request = {
      query: trimmed,
      region: "tr",
    };

    service.textSearch(request, (places: PlaceResult[], status: string) => {
      setLoading(false);

      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        setError("Arama sırasında sonuç bulunamadı veya hata oluştu.");
        setResults([]);
        clearMarkers();
        return;
      }

      setResults(places || []);
      clearMarkers();

      const bounds = new window.google.maps.LatLngBounds();

      (places || []).forEach((place) => {
        const loc = place.geometry?.location;
        if (!loc) return;

        const marker = new window.google.maps.Marker({
          map: mapInstance.current,
          position: loc,
          title: place.name,
        });

        markersRef.current.push(marker);
        bounds.extend(loc);
      });

      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    });
  }, []);

  // Sayfa ilk açıldığında URL'den gelen query varsa (ör: üst arama çubuğundan)
  useEffect(() => {
    if (!scriptLoaded) return;
    if (!initialQuery) return;

    // initialQuery'yi sektör olarak kabul edip aramayı tetikliyoruz
    setSector(initialQuery);
    performSearch(initialQuery);
  }, [scriptLoaded, initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = buildSearchText();
    if (!text) {
      setError("Lütfen en az bir arama kriteri girin.");
      return;
    }
    performSearch(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = buildSearchText();
      if (!text) return;
      performSearch(text);
    }
  };

  // Sonuç satırına tıklayınca hem haritayı ortala hem detay çek
  const handleResultClick = (place: PlaceResult) => {
    const loc = place.geometry?.location;
    if (loc && mapInstance.current) {
      mapInstance.current.setCenter(loc);
      mapInstance.current.setZoom(14);
    }

    setAddMessage(null);

    if (!place.place_id || !window.google?.maps?.places || !mapInstance.current) {
      setSelectedDetails({
        name: place.name,
        formatted_address: place.formatted_address,
        place_id: place.place_id,
      });
      return;
    }

    setDetailsLoading(true);

    const service = new window.google.maps.places.PlacesService(
      mapInstance.current
    );

    service.getDetails(
      {
        placeId: place.place_id,
        fields: [
          "name",
          "formatted_address",
          "formatted_phone_number",
          "international_phone_number",
          "website",
          "place_id",
        ],
      },
      (details: any, status: string) => {
        setDetailsLoading(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          details
        ) {
          setSelectedDetails({
            name: details.name,
            formatted_address: details.formatted_address,
            formatted_phone_number:
              details.formatted_phone_number ||
              details.international_phone_number,
            website: details.website,
            place_id: details.place_id,
          });
        } else {
          setSelectedDetails({
            name: place.name,
            formatted_address: place.formatted_address,
            place_id: place.place_id,
          });
        }
      }
    );
  };

  const handleAddToCRM = () => {
    if (!selectedDetails) return;
    if (typeof window === "undefined") return;

    const mapsUrl = selectedDetails.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${selectedDetails.place_id}`
      : "";

    let existing: CustomerForStorage[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        existing = JSON.parse(raw);
      }
    } catch {
      existing = [];
    }

    const newCustomer: CustomerForStorage = {
      id: Date.now().toString(),
      name: selectedDetails.name || "İsimsiz Firma",
      contactName: "",
      phone: selectedDetails.formatted_phone_number || "",
      email: "",
      address: selectedDetails.formatted_address || "",
      website: selectedDetails.website || "",
      brand: "",
      discount: "",
      locationUrl: mapsUrl,
      source: "firma-bul",
      createdAt: new Date().toISOString(),
    };

    const updated = [newCustomer, ...existing];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAddMessage("Bu firma CRM müşterileri arasına eklendi.");
  };

  return (
    <div className="firma-layout">
      {/* Üst bilgi kartı */}
      <section className="page-card firma-header">
        <div>
          <h1 className="firma-title">Firma Bul</h1>
          <p className="firma-subtitle">
            Google Maps ve Places ile il, ilçe, sektör ve firma adına göre arama
            yapın. Uygun bulduğunuz firmayı tek tıkla CRM müşterisi olarak
            ekleyin.
          </p>
        </div>

        {/* 🔹 Ayrılmış arama kriterleri */}
        <form className="firma-query-box" onSubmit={handleSubmit}>
          <div className="firma-query-label">Arama kriterleri</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
              width: "100%",
            }}
          >
            <div className="crm-form-group">
              <label>
                Şehir (İl)
                <input
                  type="text"
                  className="firma-query-input"
                  placeholder="Örn: İstanbul, Ankara"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
            </div>

            <div className="crm-form-group">
              <label>
                İlçe
                <input
                  type="text"
                  className="firma-query-input"
                  placeholder="Örn: Tuzla, Çankaya"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
            </div>

            <div className="crm-form-group">
              <label>
                Sektör
                <input
                  type="text"
                  className="firma-query-input"
                  placeholder="Örn: lojistik, taşımacılık, akaryakıt"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
            </div>

            <div className="crm-form-group">
              <label>
                Firma Adı (opsiyonel)
                <input
                  type="text"
                  className="firma-query-input"
                  placeholder="Örn: ABC Lojistik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
            </div>
          </div>

          <button type="submit" className="firma-query-button">
            Ara
          </button>
        </form>
      </section>

      {/* Hata / loading mesajları */}
      {error && <div className="page-card firma-error">⚠️ {error}</div>}

      {loading && (
        <div className="page-card firma-loading">
          Arama yapılıyor, lütfen bekleyin...
        </div>
      )}

      {addMessage && (
        <div className="page-card firma-added-info">
          ✅ {addMessage}{" "}
          <button
            type="button"
            className="firma-added-link"
            onClick={() => router.push("/dashboard")}
          >
            Müşteri yönetimi ekranına git
          </button>
        </div>
      )}

      {/* Grid: sonuçlar + harita */}
      <div className="firma-grid">
        <section className="page-card firma-results">
          <h2 className="firma-section-title">Sonuçlar</h2>
          <p className="firma-section-subtitle">
            Liste üzerinden bir firma satırına tıkladığınızda harita o firmaya
            odaklanır ve iletişim bilgilerini sağda görebilirsiniz.
          </p>

          <div className="firma-results-inner">
            {results.length === 0 && !loading && !error && (
              <div className="firma-result-empty">
                Henüz bir sonuç yok. Yukarıdan arama yapabilirsiniz.
              </div>
            )}

            {results.map((place) => (
              <button
                key={place.place_id}
                type="button"
                className="firma-result-item"
                onClick={() => handleResultClick(place)}
              >
                <div className="firma-result-name">{place.name}</div>
                <div className="firma-result-meta">
                  {place.formatted_address || "Adres bilgisi yok"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="page-card firma-map">
          <h2 className="firma-section-title">Harita & İletişim</h2>
          <p className="firma-section-subtitle">
            Seçtiğiniz firmalar harita üzerinde işaretlenir ve iletişim
            detayları aşağıda gösterilir. Uygun firma ise CRM müşterisi olarak
            ekleyebilirsiniz.
          </p>

          <div className="firma-map-container">
            <div ref={mapRef} className="firma-map-canvas" />
          </div>

          {/* İLETİŞİM BLOĞU */}
          <div className="firma-contact-card">
            <div className="firma-contact-title">İletişim Bilgileri</div>

            {detailsLoading && (
              <div className="firma-contact-row">
                İletişim bilgileri yükleniyor...
              </div>
            )}

            {!detailsLoading && !selectedDetails && (
              <div className="firma-contact-empty">
                Soldan bir firma seçtiğinizde iletişim bilgileri burada
                görünecek.
              </div>
            )}

            {!detailsLoading && selectedDetails && (
              <>
                <div className="firma-contact-name">
                  {selectedDetails.name || "Firma adı yok"}
                </div>

                {selectedDetails.formatted_address && (
                  <div className="firma-contact-row">
                    📍 {selectedDetails.formatted_address}
                  </div>
                )}

                {selectedDetails.formatted_phone_number && (
                  <div className="firma-contact-row">
                    📞{" "}
                    <a
                      href={`tel:${selectedDetails.formatted_phone_number}`}
                      className="firma-contact-link"
                    >
                      {selectedDetails.formatted_phone_number}
                    </a>
                  </div>
                )}

                {selectedDetails.website && (
                  <div className="firma-contact-row">
                    🌐{" "}
                    <a
                      href={selectedDetails.website}
                      target="_blank"
                      rel="noreferrer"
                      className="firma-contact-link"
                    >
                      Web sitesini aç
                    </a>
                  </div>
                )}

                {selectedDetails.place_id && (
                  <div className="firma-contact-row">
                    🗺️{" "}
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${selectedDetails.place_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="firma-contact-link"
                    >
                      Google Maps&apos;te aç
                    </a>
                  </div>
                )}

                {!selectedDetails.formatted_phone_number &&
                  !selectedDetails.website &&
                  !selectedDetails.place_id && (
                    <div className="firma-contact-row">
                      Bu firma için ek iletişim bilgisi bulunamadı.
                    </div>
                  )}

                {/* CRM'E EKLE BUTONU */}
                <button
                  type="button"
                  className="firma-contact-add-btn"
                  onClick={handleAddToCRM}
                >
                  ➕ Bu firmayı CRM müşterisi olarak ekle
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
