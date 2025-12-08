'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/', label: 'Giriş' },
  { href: '/dashboard', label: 'CRM' },
  { href: '/firma-bul', label: 'Firma Bul' },
  { href: '/teklif', label: 'Karlılık' },
  { href: '/teklif-hazirla', label: 'Teklif Hazırla' },
  { href: '/teklif-kayit', label: 'Teklif Kayıt' },
  { href: '/ajanda', label: 'Ajanda' },
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
    <header className="navbar">
      <div className="navbar__inner">
        {/* Sol: logo + başlık */}
        <div className="navbar__brand">
          <div className="navbar__logo">LC</div>
          <div className="navbar__brand-text">
            <div className="navbar__title">Lojistik CRM</div>
            <div className="navbar__subtitle">
              Müşteri, teklif ve ajanda yönetimi
            </div>
          </div>
        </div>

        {/* Sağ: menüler + çıkış */}
        <div className="navbar__right">
          <nav className="navbar__links">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    'navbar__link' + (active ? ' navbar__link--active' : '')
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button type="button" className="navbar__logout" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
