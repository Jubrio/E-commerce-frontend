import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShopLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
