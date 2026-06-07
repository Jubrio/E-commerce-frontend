'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputBase = "w-full h-11 px-4 rounded-lg border text-sm focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/mot-de-passe-oublie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
        let timer = 60;
        setResendTimer(timer);
        const interval = setInterval(() => {
          timer--;
          setResendTimer(timer);
          if (timer <= 0) clearInterval(interval);
        }, 1000);
      } else {
        setError(data.message || 'Erreur');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    if (password.length < 8) return setError('Minimum 8 caractères');
    if (!code || code.length !== 6) return setError('Code à 6 chiffres requis');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, nouveau_mot_de_passe: password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.message || 'Code invalide ou expiré');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>✓</div>
        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Mot de passe modifié !</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Redirection vers la connexion...</p>
        <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Se connecter maintenant</Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto mb-4"
        ><img src="/logo.png" alt="Bazar Guyane" className="h-12 w-auto rounded-lg" /></div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
          {step === 'email' ? 'Mot de passe oublié' : 'Code de vérification'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {step === 'email'
            ? 'Entrez votre email pour recevoir un code'
            : `Un code à 6 chiffres a été envoyé à ${email} Regardez dans les spams si l'e-mail n'est pas dans la boîte principale`}
        </p>
      </div>

      {/* Étape 1 : demande d'email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
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
            {loading ? 'Envoi...' : 'Envoyer le code'}
          </button>
        </form>
      )}

      {/* Étape 2 : saisie du code et nouveau mot de passe */}
      {step === 'code' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Code à 6 chiffres</label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              className={`${inputBase} text-center text-xl font-mono`}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputBase} pr-12`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className={`${inputBase} pr-12`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                {showConfirm ? '🙈' : '👁️'}
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
            {loading ? 'Vérification...' : 'Réinitialiser le mot de passe'}
          </button>

          {resendTimer === 0 ? (
            <button
              type="button"
              onClick={handleSendCode}
              className="w-full text-sm text-center hover:underline mt-2"
              style={{ color: 'var(--primary)' }}
            >
              Renvoyer le code
            </button>
          ) : (
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
              Renvoyer dans {resendTimer} secondes
            </p>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          ← Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 shadow-lg-theme"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <Suspense fallback={<div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>Chargement...</div>}>
        <ResetPasswordFlow />
      </Suspense>
    </div>
  );
}