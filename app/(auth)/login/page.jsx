'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form,    setForm]    = useState({ email: '', mot_de_passe: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(form.email))
      return setError('Adresse email invalide');
    if (form.mot_de_passe.length < 6)
      return setError('Mot de passe trop court');

    setLoading(true);
    try {
      await login(form.email, form.mot_de_passe);
      const params = new URLSearchParams(window.location.search);
      router.push(params.get('redirect') || '/catalogue');
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  const inputBase = "w-full h-11 px-4 rounded-lg border text-sm focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 shadow-lg-theme"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="mb-8 text-center">
        <div className=" rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto mb-4"
          
        ><img src="/logo.png" alt="Bazar Guyane" className="h-12 w-auto rounded-lg" /></div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Connexion</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Bon retour sur Bazar Guyane</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="vous@email.com"
            required
            autoComplete="email"
            className={inputBase}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              if (e.target.value && !validateEmail(e.target.value)) {
                setError('Format email invalide');
              } else { setError(''); }
            }}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mot de passe</label>
            <Link href="/mot-de-passe-oublie" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.mot_de_passe}
              onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={`${inputBase} pr-12`}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {/* Séparateur */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ou continuer avec</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      </div>

      {/* Google OAuth */}
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border font-medium text-sm hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <GoogleIcon />
        Continuer avec Google
      </a>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
