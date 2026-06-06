'use client';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/produit/ProductCard';
import { produitsAPI, categoriesAPI, marquesAPI } from '@/lib/api';
import { slugify } from '@/lib/slugify';
import useAuthStore from '@/store/useAuthStore';

// ── Variants ─────────────────────────────────────────────────
const fromLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const fromRight = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const fromBottom = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const staggerContainer = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.07 } },
};
const staggerItem = {
  hidden:  { opacity: 0, x: -25 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const TRIS = [
  { val: 'recent',    label: 'Plus récents' },
  { val: 'ancien',    label: 'Plus anciens' },
  { val: 'prix_asc',  label: 'Prix croissant' },
  { val: 'prix_desc', label: 'Prix décroissant' },
  { val: 'note',      label: 'Mieux notés' },
];

// ─── Composants auxiliaires ──────────────────────────────────
const FilterBlock = ({ title, children }) => (
  <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{title}</h3>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const FilterOption = ({ val, current, onClick, label, level = 0 }) => (
  <button onClick={onClick}
    className="w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors"
    style={{
      paddingLeft: level === 1 ? '20px' : '8px',
      color: current === val ? 'var(--primary)' : 'var(--text-muted)',
      backgroundColor: current === val ? 'var(--primary-light)' : 'transparent',
      fontWeight: current === val ? 600 : 400,
    }}>
    {level === 1 && <span style={{ color: 'var(--border)', marginRight: 4 }}>└</span>}
    {label}
  </button>
);

const FilterPill = ({ label, onRemove }) => (
  <motion.span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
  >
    {label}
    <button onClick={onRemove} className="hover:opacity-70">✕</button>
  </motion.span>
);

const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    <div className="aspect-square" style={{ backgroundColor: 'var(--bg-input)' }} />
    <div className="p-3 space-y-2">
      <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-input)', width: '60%' }} />
      <div className="h-4 rounded" style={{ backgroundColor: 'var(--bg-input)' }} />
      <div className="h-9 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }} />
    </div>
  </div>
);

const EmptyState = ({ onReset }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 text-center"
    variants={fromBottom}
    initial="hidden"
    animate="visible"
  >
    <div className="text-5xl mb-4">🔍</div>
    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Aucun produit trouvé</h3>
    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Modifiez vos filtres</p>
    <button onClick={onReset} className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>
      Voir tous les produits
    </button>
  </motion.div>
);

const SidebarContent = ({
  filters, categories, marques, expandedParents,
  localMin, localMax, prixMaxProduits,
  toggleParent, updateFilter, handlePriceChange, resetFilters, setSidebarOpen,
}) => (
  <motion.div
    className="space-y-4"
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
    <motion.div variants={staggerItem}>
      <FilterBlock title="Catégorie">
        <FilterOption val="" current={filters.category_id} onClick={() => updateFilter('category_id', '')} label="Toutes" level={0} />
        {categories.filter(c => !c.parent_id).map(parent => {
          const isExpanded = expandedParents.has(parent.id);
          const enfants = categories.filter(c => c.parent_id === parent.id);
          const hasKids = enfants.length > 0;
          return (
            <div key={parent.id} className="mb-1">
              <div className="flex items-center justify-between w-full">
                <FilterOption
                  val={String(parent.id)} current={filters.category_id}
                  onClick={() => { updateFilter('category_id', String(parent.id)); setSidebarOpen(false); }}
                  label={parent.nom} level={0}
                />
                {hasKids && (
                  <button onClick={() => toggleParent(parent.id)} className="p-1 ml-1 text-xs hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>
              {hasKids && isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l pl-2" style={{ borderColor: 'var(--border)' }}>
                  {enfants.map(child => (
                    <FilterOption key={child.id} val={String(child.id)} current={filters.category_id}
                      onClick={() => { updateFilter('category_id', String(child.id)); setSidebarOpen(false); }}
                      label={child.nom} level={1} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </FilterBlock>
    </motion.div>

    {marques.length > 0 && (
      <motion.div variants={staggerItem}>
        <FilterBlock title="Marque">
          <FilterOption val="" current={filters.marque_id} onClick={() => updateFilter('marque_id', '')} label="Toutes" level={0} />
          {marques.slice(0, 10).map(m => (
            <FilterOption key={m.id} val={String(m.id)} current={filters.marque_id}
              onClick={() => { updateFilter('marque_id', String(m.id)); setSidebarOpen(false); }}
              label={m.nom} level={0} />
          ))}
        </FilterBlock>
      </motion.div>
    )}

    <motion.div variants={staggerItem}>
      <FilterBlock title="État">
        {[
          { val: '', label: 'Tous' },
          { val: 'neuf', label: 'Neuf' },
          { val: 'occasion', label: 'Occasion' },
          { val: 'reconditionne', label: 'Reconditionné' },
        ].map(o => (
          <FilterOption key={o.val} val={o.val} current={filters.etat}
            onClick={() => updateFilter('etat', o.val)} label={o.label} level={0} />
        ))}
      </FilterBlock>
    </motion.div>

    <motion.div variants={staggerItem}>
      <FilterBlock title="Prix (€)">
        <div className="space-y-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
              Min : <span className="font-bold">{localMin} €</span>
            </label>
            <input type="range" min={0} max={prixMaxProduits} step={1} value={localMin}
              onChange={e => handlePriceChange('prix_min', e.target.value)}
              className="w-full" style={{ accentColor: 'var(--primary)' }} />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
              Max : <span className="font-bold">{localMax} €</span>
              {localMax >= prixMaxProduits && <span className="ml-1 text-xs" style={{ color: 'var(--primary)' }}></span>}
            </label>
            <input type="range" min={0} max={prixMaxProduits} step={1} value={localMax}
              onChange={e => handlePriceChange('prix_max', e.target.value)}
              className="w-full" style={{ accentColor: 'var(--primary)' }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>0 €</span><span>{prixMaxProduits} €</span>
            </div>
          </div>
        </div>
      </FilterBlock>
    </motion.div>

    <motion.div variants={staggerItem}>
      <button onClick={() => { resetFilters(); setSidebarOpen(false); }}
        className="w-full text-xs font-medium py-2 rounded-lg border hover:opacity-70"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        Réinitialiser les filtres
      </button>
    </motion.div>
  </motion.div>
);

// ─── Composant principal ─────────────────────────────────────
function CatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [produits,       setProduits]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [marques,        setMarques]        = useState([]);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState(1);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [prixMaxProduits,setPrixMaxProduits]= useState(500);
  const [expandedParents,setExpandedParents]= useState(new Set());
  const [slugToId,       setSlugToId]       = useState({});
  const LIMIT = 20;

  const toggleParent = (parentId) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) newSet.delete(parentId); else newSet.add(parentId);
      return newSet;
    });
  };

  const initializedRef = useRef(false);
  const getInitialFilters = () => ({
    search:      searchParams.get('search')    || '',
    category_id: slugToId[searchParams.get('category') || ''] || '',
    marque_id:   searchParams.get('marque_id') || '',
    etat:        searchParams.get('etat')      || '',
    prix_min:    searchParams.get('prix_min')  || '',
    prix_max:    searchParams.get('prix_max')  || '',
    promo:       searchParams.get('promo') === '1' ? 'true' : '',
    tri:         searchParams.get('tri')       || 'recent',
  });

  const [filters,  setFilters]  = useState(getInitialFilters);
  const [localMin, setLocalMin] = useState(() => Number(searchParams.get('prix_min') || 0));
  const [localMax, setLocalMax] = useState(() => Number(searchParams.get('prix_max') || 500));

  const priceDebounceRef = useRef(null);
  const searchTimer      = useRef(null);
  const filtersRef       = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  useEffect(() => {
    produitsAPI.getAll({ limit: 1, sort: 'prix', order: 'DESC' })
      .then(res => {
        const rows = res.data?.rows || [];
        if (rows.length > 0 && rows[0].prix) {
          const maxReel = Math.ceil(Number(rows[0].prix)) + 2;
          setPrixMaxProduits(maxReel);
          if (!searchParams.get('prix_max')) setLocalMax(maxReel);
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    categoriesAPI.getAll().then(r => {
      const cats = r.data || [];
      setCategories(cats);
      const mapping = {};
      cats.forEach(cat => { mapping[slugify(cat.nom)] = cat.id; });
      setSlugToId(mapping);
    }).catch(() => {});
    marquesAPI.getAll().then(r => setMarques(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!initializedRef.current) { initializedRef.current = true; return; }
    const categorySlug = searchParams.get('category') || '';
    const categoryId   = slugToId[categorySlug] || '';
    const newFilters = {
      search:      searchParams.get('search')    || '',
      category_id: categoryId,
      marque_id:   searchParams.get('marque_id') || '',
      etat:        searchParams.get('etat')      || '',
      prix_min:    searchParams.get('prix_min')  || '',
      prix_max:    searchParams.get('prix_max')  || '',
      promo:       searchParams.get('promo') === '1' ? 'true' : '',
      tri:         searchParams.get('tri')       || 'recent',
    };
    setFilters(newFilters);
    setLocalMin(newFilters.prix_min ? Number(newFilters.prix_min) : 0);
    setLocalMax(newFilters.prix_max ? Number(newFilters.prix_max) : prixMaxProduits);
  }, [searchParams, slugToId, prixMaxProduits]);

  const isInternalChange = useRef(false);
  useEffect(() => {
    if (!isInternalChange.current) return;
    isInternalChange.current = false;
    const params = new URLSearchParams();
    if (filters.search)      params.set('search', filters.search);
    if (filters.category_id) {
      const cat = categories.find(c => c.id === Number(filters.category_id));
      if (cat) params.set('category', slugify(cat.nom));
    }
    if (filters.marque_id)        params.set('marque_id', filters.marque_id);
    if (filters.etat)             params.set('etat', filters.etat);
    if (filters.prix_min)         params.set('prix_min', filters.prix_min);
    if (filters.prix_max)         params.set('prix_max', filters.prix_max);
    if (filters.promo === 'true') params.set('promo', '1');
    if (filters.tri !== 'recent') params.set('tri', filters.tri);
    const query = params.toString();
    router.replace(query ? `/catalogue?${query}` : '/catalogue', { scroll: false });
  }, [filters, router, categories]);

  const fetchProduits = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (filters.search)      params.search      = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.marque_id)   params.marque_id   = filters.marque_id;
      if (filters.etat)        params.etat        = filters.etat;
      if (filters.prix_min)    params.prix_min    = filters.prix_min;
      if (filters.prix_max)    params.prix_max    = filters.prix_max;
      if (filters.promo === 'true') params.promo  = '1';
      if (user && user.role_id === 2) params.public = true;
      switch (filters.tri) {
        case 'ancien':    params.sort = 'created_at'; params.order = 'ASC';  break;
        case 'prix_asc':  params.sort = 'prix';       params.order = 'ASC';  break;
        case 'prix_desc': params.sort = 'prix';       params.order = 'DESC'; break;
        case 'note':      params.sort = 'note';       params.order = 'DESC'; break;
        default:          params.sort = 'created_at'; params.order = 'DESC'; break;
      }
      const res = await produitsAPI.getAll(params);
      let rows = res.data?.rows || [];
      if (filters.promo === 'true') rows = rows.filter(p => p.promo && Number(p.promo) > 0);
      setProduits(rows);
      setTotal(res.data?.total || 0);
      setPage(p);
    } catch (err) {
      console.error('fetchProduits error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => { fetchProduits(1); }, [fetchProduits]);

  const setFilterInternal = useCallback((updater) => {
    isInternalChange.current = true;
    setFilters(updater);
  }, []);

  const handlePriceChange = useCallback((key, val) => {
    const numericVal = Number(val);
    if (key === 'prix_min') setLocalMin(numericVal); else setLocalMax(numericVal);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      if (key === 'prix_min') {
        setFilterInternal(f => ({ ...f, prix_min: numericVal > 0 ? String(numericVal) : '' }));
      } else {
        setFilterInternal(f => ({ ...f, prix_max: numericVal < prixMaxProduits ? String(numericVal) : '' }));
      }
    }, 500);
  }, [setFilterInternal, prixMaxProduits]);

  const updateFilter = useCallback((key, val) => {
    if (key === 'search') {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setFilterInternal(f => ({ ...f, [key]: val })), 500);
    } else {
      setFilterInternal(f => ({ ...f, [key]: val }));
    }
  }, [setFilterInternal]);

  const resetFilters = useCallback(() => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    setLocalMin(0);
    setLocalMax(prixMaxProduits);
    setFilterInternal(() => ({ search: '', category_id: '', marque_id: '', etat: '', prix_min: '', prix_max: '', promo: '', tri: 'recent' }));
  }, [setFilterInternal, prixMaxProduits]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = Object.entries(filters).some(([k, v]) => k !== 'tri' && v);

  const sidebarProps = { filters, categories, marques, expandedParents, localMin, localMax, prixMaxProduits, toggleParent, updateFilter, handlePriceChange, resetFilters, setSidebarOpen };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-5 gap-3 flex-wrap"
        variants={fromLeft}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>
            {filters.search ? `Résultats pour "${filters.search}"` : 'Tous les produits'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {loading ? '...' : `${total} produit${total > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
            Filtres {hasFilters && <span className="w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>!</span>}
          </button>
          <select value={filters.tri} onChange={e => updateFilter('tri', e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)', borderColor: 'var(--border)' }}>
            {TRIS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-50 w-72 overflow-y-auto p-5 md:hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold" style={{ color: 'var(--text)' }}>Filtres</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-xl" style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <SidebarContent {...sidebarProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <motion.aside
          className="hidden md:block w-56 flex-shrink-0"
          variants={fromLeft}
          initial="hidden"
          animate="visible"
        >
          <SidebarContent {...sidebarProps} />
        </motion.aside>

        {/* Contenu principal */}
        <motion.div
          className="flex-1 min-w-0"
          variants={fromRight}
          initial="hidden"
          animate="visible"
        >
          {/* Pills filtres actifs */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {filters.search      && <FilterPill label={`"${filters.search}"`}       onRemove={() => updateFilter('search', '')} />}
                {filters.etat        && <FilterPill label={filters.etat}               onRemove={() => updateFilter('etat', '')} />}
                {filters.prix_min    && <FilterPill label={`Min ${filters.prix_min} €`} onRemove={() => { if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current); setLocalMin(0); setFilterInternal(f => ({ ...f, prix_min: '' })); }} />}
                {filters.prix_max    && <FilterPill label={`Max ${filters.prix_max} €`} onRemove={() => { if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current); setLocalMax(prixMaxProduits); setFilterInternal(f => ({ ...f, prix_max: '' })); }} />}
                {filters.promo === 'true' && <FilterPill label="Promotions" onRemove={() => updateFilter('promo', '')} />}
                {filters.category_id && categories.length > 0 && (
  <FilterPill 
    label={categories.find(c => String(c.id) === filters.category_id)?.nom || ''}
    onRemove={() => updateFilter('category_id', '')} 
  />
)}
                {filters.marque_id   && <FilterPill label={marques.find(m => String(m.id) === filters.marque_id)?.nom || 'Marque'} onRemove={() => updateFilter('marque_id', '')} />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grille produits */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : produits.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                key={`${filters.category_id}-${filters.tri}-${page}`}
              >
                {produits.map(p => (
                  <motion.div key={p.id} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <ProductCard produit={p} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex items-center justify-center gap-2 mt-8 flex-wrap"
                  variants={fromBottom}
                  initial="hidden"
                  animate="visible"
                >
                  <button onClick={() => fetchProduits(page - 1)} disabled={page === 1}
                    className="h-9 px-4 rounded-lg text-sm font-medium border disabled:opacity-40 hover:opacity-80"
                    style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                    ← Précédent
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => fetchProduits(p)}
                        className="h-9 w-9 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: page === p ? 'var(--primary)' : 'var(--bg-card)',
                          color: page === p ? '#fff' : 'var(--text)',
                          border: `1px solid ${page === p ? 'var(--primary)' : 'var(--border)'}`,
                        }}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => fetchProduits(page + 1)} disabled={page === totalPages}
                    className="h-9 px-4 rounded-lg text-sm font-medium border disabled:opacity-40 hover:opacity-80"
                    style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                    Suivant →
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6">Chargement...</div>}>
      <CatalogueContent />
    </Suspense>
  );
}