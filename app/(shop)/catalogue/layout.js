// app/(shop)/catalogue/layout.js — metadata catalogue
export const metadata = {
  title:       'Catalogue — Bazar Guyane Marketplace',
  description: 'Découvrez des milliers de produits neufs, reconditionnés et d\'occasion sur Bazar Guyane, la marketplace de la Guyane.',
  openGraph: {
    title:    'Catalogue Bazar Guyane',
    description: 'Marketplace de Bazar Guyane — Smartphones, informatique, mode et bien plus.',
    type:     'website',
    siteName: 'Bazar Guyane',
  },
};

export default function CatalogueLayout({ children }) {
  return <>{children}</>;
}
