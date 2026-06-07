export const revalidate = 86400; // Régénérer toutes les 24h

export default async function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://guyagod.fr';

  const pages = [
    { url: BASE,                           lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/catalogue`,            lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/login`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/register`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${API}/api/produits?limit=500&page=1`, { next: { revalidate: 3600 } });
    const data = await res.json();

    const produitPages = (data.data?.rows || []).map(p => ({
      url:              `${BASE}/produit/${p.id}`,
      lastModified:     new Date(p.created_at),
      changeFrequency:  'weekly',
      priority:         0.7,
    }));

    return [...pages, ...produitPages];
  } catch {
    return pages;
  }
}
