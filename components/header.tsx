import { Truck, Bell } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <div className="sticky top-0 z-40 bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      {/* Sol: Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-1.5 rounded-lg">
          <Truck size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight">LojistikCRM</span>
      </div>

      {/* Sağ: Bildirimler */}
      <Link href="/bildirimler" className="relative p-2 hover:bg-white/10 rounded-full transition">
        <Bell size={22} />
        {/* Kırmızı Bildirim Noktası (Süs) */}
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-blue-600 rounded-full"></span>
      </Link>
    </div>
  );
}