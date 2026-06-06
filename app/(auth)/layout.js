import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Mini header */}
      <div
        className="h-14 flex items-center px-6 border-b"
        style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className=" rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'var(--primary)' }}
          ><img src="/logo.png" alt="Bazar Guyane" className="h-8 w-auto rounded-lg" /></div>
          <span className="font-black text-lg" style={{ color: 'var(--text)' }}>Bazar Guyane</span>
        </Link>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
