"use client";

import { useState } from "react";
import { ExternalLink, Fuel, Map, Store, Calculator, TrendingDown } from "lucide-react";

export default function TeklifSayfasi() {
  const [tabelaFiyati, setTabelaFiyati] = useState<number | string>("");
  
  // 1. Senaryo: Türkiye Geneli
  const [iskontoTR, setIskontoTR] = useState(4.0);
  
  // 2. Senaryo: Anlaşmalı İstasyon
  const [iskontoIstasyon, setIskontoIstasyon] = useState(6.0);

  // Hesaplamalar
  const fiyat = Number(tabelaFiyati) || 0;
  
  // TR Geneli Hesap
  const indirimTR = (fiyat * iskontoTR) / 100;
  const netTR = fiyat - indirimTR;

  // İstasyon Hesap
  const indirimIstasyon = (fiyat * iskontoIstasyon) / 100;
  const netIstasyon = fiyat - indirimIstasyon;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      
      {/* BAŞLIK */}
      <div className="mb-6 mt-2 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Fiyat Karşılaştırma</h1>
        <p className="text-gray-500 text-sm">İki farklı modeli müşteriye sun.</p>
      </div>

      {/* 1. PETROL OFİSİ LİNKİ (Kırmızı Kart) */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-red-600 shadow-sm">
            <Fuel size={20} />
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-sm">Güncel Fiyatlar</h3>
            <p className="text-[10px] text-red-600">PO listesini kontrol et</p>
          </div>
        </div>
        <a 
          href="https://www.petrolofisi.com.tr/akaryakit-fiyatlari" 
          target="_blank" 
          className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-700 transition"
        >
          Listeyi Aç <ExternalLink size={14} />
        </a>
      </div>

      {/* 2. TABELA FİYATI GİRİŞİ */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-100 w-16 h-16 rounded-bl-full -mr-8 -mt-8"></div>
        
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
          <Calculator size={14} />
          Tabela Fiyatı (TL)
        </label>
        <input 
          type="number" 
          placeholder="Örn: 45.00" 
          className="w-full p-3 text-3xl font-bold text-center text-gray-800 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:bg-white outline-none transition"
          value={tabelaFiyati}
          onChange={(e) => setTabelaFiyati(e.target.value)}
        />
        <p className="text-center text-xs text-gray-400 mt-2">Şehir bazlı pompa fiyatını giriniz.</p>
      </div>

      {/* 3. KARŞILAŞTIRMA KARTLARI */}
      <div className="grid gap-4">

        {/* SENARYO A: TÜRKİYE GENELİ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 relative">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <Map size={20} />
            <h3 className="font-bold">Türkiye Geneli</h3>
          </div>

          {/* İskonto Ayarı A */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>İskonto</span>
              <span className="text-blue-600">%{iskontoTR}</span>
            </div>
            <input 
              type="range" min="0" max="15" step="0.5" 
              value={iskontoTR} onChange={(e) => setIskontoTR(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Sonuç A */}
          <div className="bg-blue-50 p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs text-blue-400 font-medium">Net Fiyat</span>
            <span className="text-xl font-bold text-blue-700">{netTR.toFixed(2)} ₺</span>
          </div>
        </div>

        {/* SENARYO B: ANLAŞMALI İSTASYON */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 relative">
          <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full">
            AVANTAJLI
          </div>
          <div className="flex items-center gap-2 mb-4 text-purple-700">
            <Store size={20} />
            <h3 className="font-bold">Anlaşmalı İstasyon</h3>
          </div>

          {/* İskonto Ayarı B */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>İskonto</span>
              <span className="text-purple-600">%{iskontoIstasyon}</span>
            </div>
            <input 
              type="range" min="0" max="15" step="0.5" 
              value={iskontoIstasyon} onChange={(e) => setIskontoIstasyon(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Sonuç B */}
          <div className="bg-purple-50 p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs text-purple-400 font-medium">Net Fiyat</span>
            <span className="text-xl font-bold text-purple-700">{netIstasyon.toFixed(2)} ₺</span>
          </div>
        </div>

      </div>

      {/* KARŞILAŞTIRMA ÖZETİ */}
      {fiyat > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-xl text-white text-center shadow-lg">
          <p className="text-sm text-gray-400 mb-1">Anlaşmalı İstasyon Farkı</p>
          <div className="text-2xl font-bold text-green-400 flex justify-center items-center gap-2">
            <TrendingDown size={24} />
            {(netTR - netIstasyon).toFixed(2)} TL
          </div>
          <p className="text-xs text-gray-500 mt-1">Litre başına daha fazla kazanç</p>
        </div>
      )}

    </div>
  );
}