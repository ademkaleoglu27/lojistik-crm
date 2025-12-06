"use client"; // Hafızayı okuyacağı için bu da Client tarafında çalışmalı

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Phone, User, Building, Trash2 } from "lucide-react";

export default function FirmalarSayfasi() {
  const [firmalar, setFirmalar] = useState<any[]>([]);

  // Sayfa açılınca hafızadaki verileri oku
  useEffect(() => {
    const kayitliVeri = localStorage.getItem("firmalar");
    if (kayitliVeri) {
      setFirmalar(JSON.parse(kayitliVeri));
    }
  }, []);

  // Silme Fonksiyonu
  const sil = (id: number) => {
    if (confirm("Bu firmayı silmek istediğine emin misin?")) {
      const yeniListe = firmalar.filter(f => f.id !== id);
      setFirmalar(yeniListe);
      localStorage.setItem("firmalar", JSON.stringify(yeniListe));
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Firma Listesi ({firmalar.length})</h1>
        
        <Link href="/firmalar/yeni" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={20} />
          <span>Yeni Firma Ekle</span>
        </Link>
      </div>

      {firmalar.length === 0 ? (
        // LİSTE BOŞSA BU GÖRÜNECEK
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12 text-center text-gray-500">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-50 p-4 rounded-full">
              <Plus size={40} className="text-blue-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Henüz firma yok</h3>
          <p className="mt-1">Yukarıdaki butona basarak ilk firmanı ekle.</p>
        </div>
      ) : (
        // LİSTE DOLUYSA BU GÖRÜNECEK
        <div className="grid gap-4">
          {firmalar.map((firma) => (
            <div key={firma.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mt-1">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{firma.ad}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{firma.yetkili}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{firma.sehir}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a href={`tel:${firma.telefon}`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200">
                  <Phone size={20} />
                </a>
                
                {/* Silme Butonu */}
                <button 
                  onClick={() => sil(firma.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                >
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}