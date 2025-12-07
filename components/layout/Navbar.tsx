'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const allLinks = [
  { href: '/', label: 'Giriş', icon: '🏠' },
  { href: '/dashboard', label: 'CRM', icon: '📊' },
  { href: '/firma-bul', label: 'Firma Bul', icon: '🔍' },
  { href: '/teklif', label: 'Karlılık', icon: '💹' },
  { href: '/teklif-hazirla', label: 'Teklif Hazırla', icon: '📝' },
  { href: '/teklif-kayit', label: 'Teklif Kayıt', icon: '📄' },
  { href: '/ajanda', label: 'Ajanda', icon: '📅' },
];

// Mobilde hepsi sığmasın diye sadeleştirilmiş alt menü
const mobileLinks = [
  { href: '/', label: 'Giriş', icon: '🏠' },
  { href: '/dashboard', label: 'CRM', icon: '📊' },
  { href: '/firma-bul', label: 'Firma', icon: '🔍' },
  { href: '/ajanda', label: 'Ajanda', icon: '📅' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm-current-user');
    }
    router.push('/login');
  };

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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <nav className="nav-links nav-links-desktop">
              {allLinks.map((link) => {
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

            {/* Menüden bağımsız ÇIKIŞ butonu */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                fontSize: '11px',
                borderRadius: '999px',
                padding: '6px 10px',
                border: '1px solid rgba(248,113,113,0.9)',
                background:
                  'radial-gradient(circle at top, #fca5a5, #b91c1c)',
                color: '#111827',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🚪 Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Mobil alt navigasyon – sade 4 menü */}
      <nav className="mobile-bottom-nav">
        {mobileLinks.map((link) => {
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
