'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useThemeStore from '@/store/useThemeStore';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { slugify } from '@/lib/slugify';

const API = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` });

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { isDark, toggle } = useThemeStore();

  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [nbMsg, setNbMsg] = useState(0);
  const [openParent, setOpenParent] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const mobileSearchRef = useRef(null);
  const itemCount = items.reduce((s, i) => s + i.quantite, 0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchMsgCount();
      const iv = setInterval(fetchMsgCount, 30000);
      return () => clearInterval(iv);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const fetchMsgCount = async () => {
    try {
      const r = await fetch(`${API}/api/messages/non-lus/count`, { headers: auth() });
      const data = await r.json();
      if (data.success) setNbMsg(data.data.total || 0);
    } catch {}
  };

  const doSearch = () => {
    const v = searchVal.trim();
    if (!v) return;
    setSearchOpen(false);
    setSearchVal('');
    router.push(`/catalogue?search=${encodeURIComponent(v)}`);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    router.push('/');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navParents = categories.filter(c => !c.parent_id).slice(0, 6);
  const getEnfants = (id) => categories.filter(c => String(c.parent_id) === String(id));

  const isCatalogueActive = pathname === '/catalogue' && !searchParams.get('category');
  const isCategoryActive = (catSlug) => searchParams.get('category') === slugify(catSlug);

  return (
    <header
      className={`sticky top-0 z-50 ${scrolled ? 'shadow-lg-theme' : ''}`}
      style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Barre principale */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <img src="/logo.png" alt="Bazar Guyane" className="h-8 w-auto rounded-lg" />
          <span className="font-black text-xl hidden sm:block" style={{ color: 'var(--text)' }}>Bazar Guyane</span>
        </Link>

        <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full">
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher un produit, une marque..."
              className="w-full h-10 pl-4 pr-12 rounded-lg text-sm border focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit"
              className="absolute right-0 top-0 h-10 w-12 flex items-center justify-center rounded-r-lg text-white"
              style={{ backgroundColor: 'var(--primary)' }}>
              <SearchIcon />
            </button>
          </div>
        </form>

        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => { setSearchOpen(v => !v); setTimeout(() => mobileSearchRef.current?.focus(), 150); }}
            className="md:hidden p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            <SearchIcon />
          </button>

          <button onClick={toggle} className="p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {isAuthenticated && (
            <Link href="/messages" className="relative p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text)' }}>
              <MessageIcon />
              {nbMsg > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center text-white px-0.5"
                  style={{ backgroundColor: 'var(--primary)', fontSize: '10px' }}>
                  {nbMsg > 9 ? '9+' : nbMsg}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && <NotificationDropdown />}

          <Link href="/panier" className="relative p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text)' }}>
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--primary)' }}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:opacity-80">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  {user?.photo_profil ? <img src={user.photo_profil} alt="" className="w-full h-full object-cover" /> : user?.nom?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-20 truncate" style={{ color: 'var(--text)' }}>{user?.nom}</span>
                <ChevronIcon />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg-theme overflow-hidden z-20"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: 'var(--primary)' }}>
                          {user?.photo_profil ? <img src={user.photo_profil} alt="" className="w-full h-full object-cover" /> : user?.nom?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.nom} {user?.prenom}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    {[
                      { href: '/profil', label: '👤 Mon profil' },
                      { href: '/commandes', label: '📦 Mes commandes' },
                      { href: '/favoris', label: '❤️ Mes favoris' },
                      { href: '/messages', label: `💬 Messages${nbMsg > 0 ? ` (${nbMsg})` : ''}` },
                      { href: '/notifications', label: '🔔 Notifications' },
                      ...(user?.role_id === 1 ? [{ href: '/admin', label: '⚙️ Administration' }] : []),
                      ...(user?.role_id === 2 ? [{ href: '/vendeur', label: '🏪 Espace vendeur' }] : []),
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:opacity-80"
                        style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-3 text-sm font-semibold"
                      style={{ color: 'var(--primary)' }}
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login" className="px-3 py-1.5 text-sm font-medium rounded-lg border hover:opacity-80"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Connexion</Link>
              <Link href="/register" className="px-3 py-1.5 text-sm font-semibold rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>S'inscrire</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recherche mobile */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="relative">
            <input ref={mobileSearchRef} type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher..." className="w-full h-12 pl-4 pr-14 rounded-xl border focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--primary)', fontSize: '16px' }} autoFocus />
            <button type="submit" className="absolute right-0 top-0 h-12 w-14 flex items-center justify-center rounded-r-xl text-white"
              style={{ backgroundColor: 'var(--primary)' }}>
              <SearchIcon />
            </button>
          </form>
        </div>
      )}

      {/* Navigation catégories avec SLUGS */}
      <div className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-header)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-1 py-1">
            <Link href="/catalogue" className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80"
              style={{ color: isCatalogueActive ? 'var(--primary)' : 'var(--text-muted)' }}>Tout</Link>
            {navParents.map(cat => {
              const enfants = getEnfants(cat.id);
              const isOpen = openParent === cat.id;
              const hasKids = enfants.length > 0;
              const isActive = isCategoryActive(cat.nom);
              return (
                <div key={cat.id} className="relative">
                  <button onClick={() => {
                      if (hasKids) setOpenParent(isOpen ? null : cat.id);
                      else { router.push(`/catalogue?category=${slugify(cat.nom)}`); setOpenParent(null); }
                    }}
                    className="whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-80 flex items-center gap-1"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {cat.nom}
                    {hasKids && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>}
                  </button>
                  {isOpen && hasKids && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenParent(null)} />
                      <div className="absolute left-0 z-[9999] min-w-44 rounded-xl overflow-hidden py-1"
                        style={{ top: 'calc(100% + 4px)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        <button onClick={() => { router.push(`/catalogue?category=${slugify(cat.nom)}`); setOpenParent(null); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold hover:opacity-80"
                          style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)' }}>Tous — {cat.nom}</button>
                        {enfants.map(e => (
                          <button key={e.id} onClick={() => { router.push(`/catalogue?category=${slugify(e.nom)}`); setOpenParent(null); }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:opacity-80 flex items-center gap-2"
                            style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>└</span>{e.nom}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <Link href="/catalogue?promo=1" className="whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-80"
              style={{ color: 'var(--primary)' }}>🔥 Promos</Link>
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={cancelLogout} />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-11/12 max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text)' }}>Déconnexion</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex gap-3">
              <button onClick={cancelLogout} className="flex-1 h-10 rounded-lg border font-semibold text-sm"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Annuler</button>
              <button onClick={confirmLogout} className="flex-1 h-10 rounded-lg font-semibold text-sm text-white"
                style={{ backgroundColor: 'var(--primary)' }}>Déconnexion</button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

// Icônes (inchangées)
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const ChevronIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const MessageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;