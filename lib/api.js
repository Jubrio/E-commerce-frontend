const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('guyagod_token');
};

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erreur ${res.status}`);
  }

  return data;
}

// ── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  register: (body)  => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body)  => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()      => request('/api/auth/me'),
};

// ── PRODUITS ────────────────────────────────────────────────
export const produitsAPI = {
  getAll:  (params) => request(`/api/produits?${new URLSearchParams(params)}`),
  getOne:  (id)     => request(`/api/produits/${id}`),
  create:  (body)   => request('/api/produits', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id, b)  => request(`/api/produits/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  remove:  (id)     => request(`/api/produits/${id}`, { method: 'DELETE' }),
};

// ── CATEGORIES ──────────────────────────────────────────────
export const categoriesAPI = {
  getAll:  ()       => request('/api/categories'),
  create:  (body)   => request('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
};

// ── MARQUES ─────────────────────────────────────────────────
export const marquesAPI = {
  getAll:  ()       => request('/api/marques'),
};

// ── PANIER ──────────────────────────────────────────────────
export const panierAPI = {
  get:     ()       => request('/api/panier'),
  add:     (body)   => request('/api/panier', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id, q)  => request(`/api/panier/${id}`, { method: 'PUT', body: JSON.stringify({ quantite: q }) }),
  remove:  (id)     => request(`/api/panier/${id}`, { method: 'DELETE' }),
  vider:   ()       => request('/api/panier/vider', { method: 'DELETE' }),
};

// ── COMMANDES ───────────────────────────────────────────────
export const commandesAPI = {
  create:         (body) => request('/api/commandes', { method: 'POST', body: JSON.stringify(body) }),
  getMesCommandes:()     => request('/api/commandes/mes-commandes'),
  getOne:         (id)   => request(`/api/commandes/${id}`),
  getAll:         (p)    => request(`/api/commandes/all?${new URLSearchParams(p)}`),
  updateStatut:   (id,s) => request(`/api/commandes/${id}/statut`, { method: 'PUT', body: JSON.stringify({ statut: s }) }),
};

// ── ADRESSES ────────────────────────────────────────────────
export const adressesAPI = {
  getAll:   ()      => request('/api/adresses'),
  create:   (body)  => request('/api/adresses', { method: 'POST', body: JSON.stringify(body) }),
  update:   (id, b) => request(`/api/adresses/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  delete:   (id)    => request(`/api/adresses/${id}`, { method: 'DELETE' }),
  setDefaut:(id)    => request(`/api/adresses/${id}/defaut`, { method: 'PUT' }),
};

// ── FAVORIS ─────────────────────────────────────────────────
export const favorisAPI = {
  getAll:  ()    => request('/api/favoris'),
  add:     (id)  => request('/api/favoris', { method: 'POST', body: JSON.stringify({ produit_id: id }) }),
  remove:  (id)  => request(`/api/favoris/${id}`, { method: 'DELETE' }),
};

// ── AVIS ────────────────────────────────────────────────────
export const avisAPI = {
  getByProduit: (id)   => request(`/api/avis?produit_id=${id}`),
  create:       (body) => request('/api/avis', { method: 'POST', body: JSON.stringify(body) }),
};

// ── NOTIFICATIONS ───────────────────────────────────────────
export const notificationsAPI = {
  getAll:     ()   => request('/api/notifications'),
  marquerLu:  (id) => request(`/api/notifications/${id}/lire`, { method: 'PUT' }),
  toutLire:   ()   => request('/api/notifications/lire-tout', { method: 'PUT' }),
};

// ── COUPONS ─────────────────────────────────────────────────
export const couponsAPI = {
  verifier: (code, total) => request('/api/coupons/verifier', {
    method: 'POST', body: JSON.stringify({ code, total })
  }),
};

// ── PAIEMENTS ───────────────────────────────────────────────
export const paiementsAPI = {
  stripeCheckout: (body) => request('/api/paiements/stripe/checkout', {
    method: 'POST', body: JSON.stringify(body)
  }),
};
