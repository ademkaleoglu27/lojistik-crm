"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Users, FileText, Calendar } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname(); // Hangi sayfadayız onu anlar

  // Menü Elemanları
  const menuItems = [
    { name: "Pano", href: "/", icon: LayoutDashboard },
    { name: "Firma Bul", href: "/firma-bul", icon: Globe },
    { name: "Müşteriler", href: "/firmalar", icon: Users },
    { name: "Teklif/Hesap", href: "/teklifler", icon: FileText },
    { name: "Ajanda", href: "/ajanda", icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50 h-16 pb-safe">
      <div className="flex justify-around items-center h-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Eğer o sayfadaysak ikon mavi olsun, değilse gri olsun
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}