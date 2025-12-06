"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Phone, Save, Clock } from "lucide-react";

export default function FirmaDetaySayfasi() {
  const params = useParams(); // URL'deki ID'yi (köşeli parantez içini) okur
  const router = useRouter();
  
  const [firma, setFirma] = useState<any>(null);
  const [yeniNot, setYeniNot] = useState("");

  // Sayfa açılınca ID'ye göre firmayı bul
  useEffect(() => {
    const kayitliVeri = localStorage.getItem("firmalar");
    if (kayitliVeri && params.id) {
      const liste = JSON.parse(kayitliVeri);
      // URL'deki ID ile eşleşen firmayı bul
      const bulunanFirma = liste.find((f: any) => f.id.toString() === params.id);
      
      if (bulunanFirma) {
        // Eğer firmanın notları yoksa boş liste başlat
        if (!bulunanFirma.notlar) bulunanFirma.notlar = [];
        setFirma(bulunanFirma);
      }
    }
  }, [params.id]);

  // Not Kaydetme Fonksiyonu
  const notEkle = () => {
    if (!yeniNot.trim()) return;

    // 1. Yeni notu oluştur
    const notObjesi = {
      id: Date.now(),
      tarih: new Date().toLocaleDateString("tr-TR") + " " + new Date().toLocaleTimeString("tr-TR").slice(0,5),
      metin: yeniNot
    };

    // 2. Firmanın not listesine ekle
    const guncelFirma = { ...firma, notlar: [notObjesi, ...firma.notlar] };
    setFirma(guncelFirma); // Ekranda güncelle
    setYeniNot(""); // Kutuyu temizle

    // 3. Ana hafızayı (LocalStorage) güncelle
    const tumFirmalar = JSON.parse(localStorage.getItem("firmalar") || "[]");
    const yeniListe = tumFirmalar.map((f: any) => f.id === firma.id ? guncelFirma : f);
    localStorage.setItem("firmalar", JSON.stringify(yeniListe));
  };

  if (!firma) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      {/* Geri Dön */}
      <Link href="/firmalar" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600">
        <ArrowLeft size={20} />
        <span>Listeye Dön</span>
      </Link>

      {/* Firma Başlık Kartı */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{firma.ad}</h1>
        <div className="flex flex-col gap-2 text-gray-600">
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            <span>{firma.yetkili}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />
            <span>{firma.sehir}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-green-500" />
            <a href={`tel:${firma.telefon}`} className="underline">{firma.telefon}</a>
          </div>
        </div>
      </div>

      {/* Not Ekleme Alanı */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Clock size={18} />
          Görüşme Notu Ekle
        </h3>
        <textarea 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
          placeholder="Bugünkü görüşmede neler konuşuldu?"
          value={yeniNot}
          onChange={(e) => setYeniNot(e.target.value)}
        ></textarea>
        <button 
          onClick={notEkle}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 w-full hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <Save size={18} />
          Notu Kaydet
        </button>
      </div>

      {/* Geçmiş Notlar Listesi */}
      <h3 className="font-bold text-lg mb-4 text-gray-800">Geçmiş Görüşmeler</h3>
      <div className="space-y-3">
        {firma.notlar.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Henüz not eklenmemiş.</p>
        ) : (
          firma.notlar.map((not: any) => (
            <div key={not.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-xs text-gray-400 mb-1">{not.tarih}</div>
              <p className="text-gray-700">{not.metin}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}