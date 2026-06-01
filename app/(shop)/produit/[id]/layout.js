// app/(shop)/produit/[id]/layout.js
// Metadata dynamique pour le SEO des pages produit

export async function generateMetadata({ params }) {
  try {
    const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produits/${params.id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const p    = data.data;

    if (!p) return { title: 'Produit — Bazar Guyane' };

    const image = p.images?.find(i => i.est_principale)?.image || p.images?.[0]?.image;

    return {
      title:       `${p.nom} — Bazar Guyane`,
      description: p.description
        ? p.description.slice(0, 155)
        : `Achetez ${p.nom} sur Bazar Guyane — la marketplace de la Guyane. ${p.prix} €.`,
      keywords:    [p.nom, p.marque, p.categorie, 'Bazar Guyane', 'marketplace Guyane'].filter(Boolean).join(', '),
      openGraph: {
        title:       `${p.nom} — ${p.prix} €`,
        description: p.description?.slice(0, 155) || `Achetez ${p.nom} sur Bazar Guyane.`,
        images:      image ? [{ url: image, width: 800, height: 800, alt: p.nom }] : [],
        type:        'website',
        siteName:    'Bazar Guyane',
      },
      twitter: {
        card:        'summary_large_image',
        title:       `${p.nom} — ${p.prix} €`,
        description: p.description?.slice(0, 155) || '',
        images:      image ? [image] : [],
      },
      // Données structurées JSON-LD pour Google
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type':    'Product',
          name:       p.nom,
          description:p.description,
          image:      image,
          brand:      p.marque ? { '@type': 'Brand', name: p.marque } : undefined,
          sku:        p.sku,
          offers: {
            '@type':       'Offer',
            price:         p.prix,
            priceCurrency: 'EUR',
            availability:  p.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name:    'Bazar Guyane',
            },
          },
          ...(p.note_moyenne ? {
            aggregateRating: {
              '@type':       'AggregateRating',
              ratingValue:   p.note_moyenne,
              reviewCount:   p.nb_avis,
              bestRating:    5,
              worstRating:   1,
            }
          } : {}),
        }),
      },
    };
  } catch {
    return { title: 'Produit — Bazar Guyane' };
  }
}

export default function ProduitLayout({ children }) {
  return <>{children}</>;
}
