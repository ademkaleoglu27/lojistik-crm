import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">Hoş Geldiniz</h1>
      </div>
      <Link href="/firmalar" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center gap-3 hover:border-blue-500 hover:shadow-xl transition cursor-pointer w-64">
        <div className="bg-blue-100 p-4 rounded-full text-blue-600">
          <Building2 size={40} />
        </div>
        <span className="font-semibold text-lg text-gray-800">Firmaları Yönet</span>
      </Link>
    </div>
  );
}