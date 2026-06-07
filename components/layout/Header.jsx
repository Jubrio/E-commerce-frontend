'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useThemeStore from '@/store/useThemeStore';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { slugify } from '@/lib/slugify';
import {
  User, Package, Heart, MessageCircle, Bell,
  Settings, Store, LogOut, Search, Moon, Sun,
  ShoppingCart, ChevronDown, MessageSquare,
} from 'lucide-react';

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

  const menuItems = [
    { href: '/profil',        label: 'Mon profil',      icon: <User size={15} /> },
    { href: '/commandes',     label: 'Mes commandes',   icon: <Package size={15} /> },
    { href: '/favoris',       label: 'Mes favoris',     icon: <Heart size={15} /> },
    { href: '/messages',      label: `Messages${nbMsg > 0 ? ` (${nbMsg})` : ''}`, icon: <MessageCircle size={15} /> },
    { href: '/notifications', label: 'Notifications',   icon: <Bell size={15} /> },
    ...(user?.role_id === 1 ? [{ href: '/admin',   label: 'Administration', icon: <Settings size={15} /> }] : []),
    ...(user?.role_id === 2 ? [{ href: '/vendeur', label: 'Espace vendeur', icon: <Store size={15} /> }] : []),
  ];

  return (
    <header
      className={`sticky top-0 z-50 ${scrolled ? 'shadow-lg-theme' : ''}`}
      style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <img src="/Logo.png" alt="Bazar Guyane" className="h-8 w-auto rounded-lg" />
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
              <Search size={16} />
            </button>
          </div>
        </form>

        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => { setSearchOpen(v => !v); setTimeout(() => mobileSearchRef.current?.focus(), 150); }}
            className="md:hidden p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            <Search size={16} />
          </button>

          <button onClick={toggle} className="p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && (
            <Link href="/messages" className="relative p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text)' }}>
              <MessageSquare size={22} />
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
            <ShoppingCart size={22} />
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
                <ChevronDown size={14} />
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
                    {menuItems.map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-80"
                        style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold"
                      style={{ color: 'var(--primary)' }}
                    >
                      <LogOut size={15} />
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

      {searchOpen && (
        <div className="md:hidden px-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="relative">
            <input ref={mobileSearchRef} type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher..." className="w-full h-12 pl-4 pr-14 rounded-xl border focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--primary)', fontSize: '16px' }} autoFocus />
            <button type="submit" className="absolute right-0 top-0 h-12 w-14 flex items-center justify-center rounded-r-xl text-white"
              style={{ backgroundColor: 'var(--primary)' }}>
              <Search size={16} />
            </button>
          </form>
        </div>
      )}

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
                    {hasKids && <ChevronDown size={10} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />}
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
              style={{ color: 'var(--primary)' }}>Promos</Link>
          </div>
        </div>
      </div>

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