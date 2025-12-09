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
  { href: "/dashboard", label: "Müşteri Yönetimi", icon: "📊" },
  { href: "/firma-bul", label: "Firma Bul", icon: "🔍" },
  { href: "/fiyat-hesaplama", label: "Fiyat Hesaplama", icon: "⛽" },
  { href: "/teklifler", label: "Teklifler", icon: "📑" },
  { href: "/haftalik-plan", label: "Bir Haftalık Plan", icon: "🗓️" },
  { href: "/ajanda", label: "Ajanda", icon: "📅" },
  { href: "/raporlar", label: "Raporlama", icon: "📄" },
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

  // Tema yükle
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

  // 🔹 PWA için service worker kaydı
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          console.warn("Service worker kaydedilemedi:", err);
        });
    }
  }, []);

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

  const handleHome = () => {
    router.push("/");
    setMenuOpen(false);
  };

  const canGoBack = pathname !== "/";

  return (
    <div className={`app-root theme-${theme}`}>
      {/* ÜST BAR */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          {canGoBack && (
            <button
              className="icon-btn"
              onClick={() => router.back()}
              type="button"
            >
              ←
            </button>
          )}

          <button className="icon-btn" onClick={toggleMenu} type="button">
            ☰
          </button>

          {/* LOGO / ANA SAYFA BUTONU */}
          <button
            type="button"
            onClick={handleHome}
            className="navbar__brand"
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <div className="navbar__logo">LC</div>
            <div className="navbar__brand-text">
              <div className="navbar__title">Lojistik CRM</div>
              <div className="navbar__subtitle">
                Müşteri, teklif ve ajanda yönetimi
              </div>
            </div>
          </button>
        </div>

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

        <div className="app-topbar-right">
          <button className="icon-btn" onClick={toggleTheme} type="button">
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <button
            className="icon-btn"
            onClick={toggleNotifications}
            type="button"
          >
            🔔
          </button>

          <button
            className="app-avatar-btn"
            type="button"
            onClick={toggleProfile}
          >
            <div className="app-avatar" />
          </button>

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

      {/* HAMBURGER MENÜ */}
      {menuOpen && (
        <>
          <div
            className="app-drawer-overlay"
            onClick={toggleMenu}
            role="button"
            aria-hidden="true"
          />

          <nav className="app-drawer">
            <div className="app-drawer-header">
              {/* Soldaki menülerin üstüne logo / başlık */}
              <button
                type="button"
                onClick={handleHome}
                className="app-drawer-title"
                style={{
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  Lojistik CRM
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  Müşteri ve saha takibi
                </div>
              </button>

              <button className="icon-btn" onClick={toggleMenu} type="button">
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
