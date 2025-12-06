import Link from "next/link";
import { Plus, MapPin, Phone, User, Building } from "lucide-react";

export default function FirmalarSayfasi() {
  // ÖRNEK VERİLER (Veritabanı bağlanana kadar bunlar görünecek)
  const firmalar = [
    {
      id: 1,
      ad: "Aras Lojistik A.Ş.",
      sehir: "İstanbul",
      yetkili: "Ahmet Yılmaz",
      telefon: "0532 100 20 30",
    },
    {
      id: 2,
      ad: "Öz Diyarbakır Nakliyat",
      sehir: "Diyarbakır",
      yetkili: "Mehmet Demir",
      telefon: "0544 500 60 70",
    },
    {
      id: 3,
      ad: "Ege Turizm ve Taşıma",
      sehir: "İzmir",
      yetkili: "Ayşe Kaya",
      telefon: "0555 900 80 90",
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Üst Kısım */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Firma Listesi ({firmalar.length})</h1>
        
        <Link href="/firmalar/yeni" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={20} />
          <span>Yeni Firma Ekle</span>
        </Link>
      </div>

      {/* LİSTELEME ALANI */}
      <div className="grid gap-4">
        {firmalar.map((firma) => (
          <div key={firma.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Sol Taraf: İkon ve İsim */}
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

            {/* Sağ Taraf: Telefon ve Detay Butonu */}
            <div className="flex items-center gap-3">
               {/* Telefonu arama butonu */}
              <a href={`tel:${firma.telefon}`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200">
                <Phone size={20} />
              </a>
              
              {/* Detay butonu */}
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Detaylar
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}