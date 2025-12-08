import { Suspense } from "react";
import FirmaBulClient from "./FirmaBulClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="firma-layout">
          <section className="page-card firma-loading">
            Firma verileri yükleniyor...
          </section>
        </div>
      }
    >
      <FirmaBulClient />
    </Suspense>
  );
}
