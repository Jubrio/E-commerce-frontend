'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo & desc */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div
              className=" rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'var(--primary)' }}
            ><img src="/logo.png" alt="Bazar Guyane" className="h-8 w-auto rounded-lg" /></div>
            <span className="font-black text-lg" style={{ color: 'var(--text)' }}>Bazar Guyane</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            La marketplace de référence en Guyane française. Achetez vos produits en toute confiance.
          </p>
        </div>

        {/* Acheter */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Acheter
          </h4>
          <ul className="space-y-2">
            <li><Link href="/catalogue" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Catalogue</Link></li>
            <li><Link href="/catalogue?promo=1" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Promotions</Link></li>
            <li><Link href="/favoris" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Mes favoris</Link></li>
            <li><Link href="/commandes" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Mes commandes</Link></li>
          </ul>
        </div>

        {/* Aide */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Aide
          </h4>
          <ul className="space-y-2">
            <li><Link href="/contact" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Contact</Link></li>
            <li><Link href="/faq" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>FAQ</Link></li>
            <li><Link href="/cgu" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Conditions générales</Link></li>
            <li><Link href="/retours" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Politique de remboursement</Link></li>
            <li><Link href="/confidentialite" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Politique de confidentialité</Link></li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Réseaux sociaux
          </h4>
          <ul className="space-y-2">
            <li>
              <a
                href="https://facebook.com/guyagod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <FacebookIcon />
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/guyagod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <InstagramIcon />
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/guyagod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <XIcon />
                X (Twitter)
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@guyagod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <TikTokIcon />
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="border-t py-4 text-center text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-light)' }}
      >
        © {new Date().getFullYear()} Bazar Guyane. Tous droits réservés.
      </div>
    </footer>
  );
}

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);