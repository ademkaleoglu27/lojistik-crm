"use client";

import Link from "next/link";

export default function TekliflerPage() {
  return (
    <div className="page-card">
      <h1 className="crm-title">Teklifler</h1>
      <p className="crm-subtitle">
        Teklif oluşturma ve teklif kayıtlarını tek ekranda topladık. Aşağıdan
        yapmak istediğin işlemi seçebilirsin.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <Link href="/teklif-hazirla" className="page-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>📝</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Teklif Oluştur
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Yeni bir müşteri için sıfırdan teklif hazırlayın. Fiyat, iskonto ve
            koşulları kaydedin.
          </div>
        </Link>

        <Link href="/teklif-kayit" className="page-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Teklif Kayıtları
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Daha önce verilen teklifleri, durumlarını ve tarihlerini buradan
            görüntüleyin.
          </div>
        </Link>
      </div>

      <p style={{ marginTop: 14, fontSize: 11, color: "#9ca3af" }}>
        İstersen bir sonraki adımda, teklifleri CRM müşteri kartına bağlayarak
        &quot;Bu müşteriye şu tarihte teklif verildi&quot; şeklinde zaman
        çizelgesinde de gösterebiliriz.
      </p>
    </div>
  );
}
