'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Giriş', icon: '🏠' },
  { href: '/dashboard', label: 'CRM', icon: '📊' },
  { href: '/firma-bul', label: 'Firma Bul', icon: '🔍' },
  { href: '/teklif', label: 'Karlılık', icon: '💹' },
  { href: '/teklif-hazirla', label: 'Teklif Hazırla', icon: '📝' },
  { href: '/teklif-kayit', label: 'Teklif Kayıt', icon: '📄' },
  { href: '/ajanda', label: 'Ajanda', icon: '📅' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Üst sabit navbar (desktop + tablet) */}
      <div className="navbar-root">
        <div className="navbar-inner">
          <div className="navbar-left">
            <div className="navbar-logo">
              <span>LC</span>
            </div>
            <div>
              <div className="navbar-title">Lojistik CRM</div>
              <div className="navbar-subtitle">
                Müşteri, teklif, ajanda ve kârlılık yönetimi
              </div>
            </div>
          </div>

          <nav className="nav-links nav-links-desktop">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link${active ? ' active' : ''}`}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobil alt navigasyon */}
      <nav className="mobile-bottom-nav">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? 'active' : ''}
            >
              <span className="icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
