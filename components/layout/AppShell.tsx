"use client";

import {
  useState,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Giriş", icon: "🏠" },
  { href: "/dashboard", label: "CRM", icon: "📊" },
  { href: "/firma-bul", label: "Firma Bul", icon: "🔍" },
  { href: "/teklif", label: "Karlılık", icon: "💹" },
  { href: "/teklif-hazirla", label: "Teklif Hazırla", icon: "📝" },
  { href: "/teklif-kayit", label: "Teklif Kayıt", icon: "📁" },
  { href: "/ajanda", label: "Ajanda", icon: "📅" },
];

const dummyNotifications = [
  { id: 1, text: "Yeni teklif kaydedildi", time: "2 dk önce" },
  { id: 2, text: "Ajandada yaklaşan toplantı var", time: "1 saat sonra" },
  { id: 3, text: "Firma kartı görüntülendi", time: "bugün" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchTerm, setSearchTerm] = useState("");

  const pathname = usePathname();
  const router = useRouter();

  // İlk açılışta temayı localStorage'dan oku
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("crm-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  // Tema değişince kaydet
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("crm-theme", theme);
  }, [theme]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("crm-current-user");
    }
    setMenuOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = searchTerm.trim();
      if (!q) return;
      router.push(`/firma-bul?query=${encodeURIComponent(q)}`);
      setMenuOpen(false);
    }
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    setProfileOpen(false);
  };

  return (
    <div className={`app-root theme-${theme}`}>
      {/* ÜST BAR */}
      <header className="app-topbar">
        {/* Sol: Hamburger + Logo */}
        <div className="app-topbar-left">
          <button className="icon-btn" onClick={toggleMenu}>
            ☰
          </button>

          <div className="navbar__brand">
            <div className="navbar__logo">LC</div>
            <div className="navbar__brand-text">
              <div className="navbar__title">Lojistik CRM</div>
              <div className="navbar__subtitle">
                Müşteri, teklif ve ajanda yönetimi
              </div>
            </div>
          </div>
        </div>

        {/* Orta: Arama */}
        <div className="app-topbar-center">
          <input
            type="text"
            placeholder="Ara (firma, teklif, ajanda)..."
            className="app-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Sağ: Tema, Bildirim, Profil */}
        <div className="app-topbar-right">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <button className="icon-btn" onClick={toggleNotifications}>
            🔔
          </button>

          <button
            className="app-avatar-btn"
            type="button"
            onClick={toggleProfile}
          >
            <div className="app-avatar" />
          </button>

          {/* Profil menü */}
          {profileOpen && (
            <div className="app-profile-menu">
              <button className="app-profile-item" type="button">
                Profilim
              </button>
              <button className="app-profile-item" type="button">
                Ayarlar
              </button>
              <button className="app-profile-item" type="button">
                Destek
              </button>
              <button
                className="app-profile-item app-profile-item--danger"
                type="button"
                onClick={handleLogout}
              >
                Çıkış
              </button>
            </div>
          )}

          {/* Bildirim menü */}
          {notificationsOpen && (
            <div className="app-notif-menu">
              <div className="app-notif-header">Bildirimler</div>
              {dummyNotifications.map((n) => (
                <div key={n.id} className="app-notif-item">
                  <div className="app-notif-text">{n.text}</div>
                  <div className="app-notif-time">{n.time}</div>
                </div>
              ))}
              <button
                type="button"
                className="app-notif-footer"
                onClick={() => setNotificationsOpen(false)}
              >
                Tümünü okundu say
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HAMBURGER MENÜ (DRAWER) */}
      {menuOpen && (
        <>
          <div className="app-drawer-overlay" onClick={toggleMenu} />

          <nav className="app-drawer">
            <div className="app-drawer-header">
              <span className="app-drawer-title">Menü</span>
              <button className="icon-btn" onClick={toggleMenu}>
                ✕
              </button>
            </div>

            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={
                    "app-drawer-item" +
                    (active ? " app-drawer-item--active" : "")
                  }
                >
                  <span className="app-drawer-item-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              className="app-drawer-item app-drawer-item--danger"
              onClick={handleLogout}
            >
              <span className="app-drawer-item-icon">🚪</span>
              <span>Çıkış</span>
            </button>
          </nav>
        </>
      )}

      {/* İÇERİK */}
      <main className="app-main-content">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
