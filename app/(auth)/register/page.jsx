'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/ui/PhoneInput';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', confirm: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.mot_de_passe !== form.confirm)
      return setError('Les mots de passe ne correspondent pas');
    if (form.mot_de_passe.length < 8)
      return setError('Le mot de passe doit contenir au moins 8 caractères');
    if (!phoneNumber)
      return setError('Veuillez saisir un numéro de téléphone valide');

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: phoneNumber,
          mot_de_passe: form.mot_de_passe,
        }),
      });
      const data = await res.json();
      if (data.success) setStep('verify');
      else setError(data.message || 'Erreur');
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!code || code.length !== 6)
      return setError('Code à 6 chiffres requis');

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('✅ Compte vérifié avec succès ! Redirection...');
        setTimeout(() => router.push('/login?verified=1'), 1000);
      } else {
        setError(data.message || 'Code invalide ou expiré');
        setLoading(false);
      }
    } catch {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: phoneNumber,
          mot_de_passe: form.mot_de_passe,
        }),
      });
      const data = await res.json();
      if (!data.success) setError(data.message || 'Erreur lors du renvoi');
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text)',
    borderColor: 'var(--border)',
  };
  const inputClass = "w-full h-11 px-4 rounded-lg border text-sm focus:outline-none transition-colors";

  // ── Étape vérification email ──────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="w-full max-w-md rounded-2xl p-8 shadow-lg-theme"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Vérifiez votre email</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Un code à 6 chiffres a été envoyé à <strong>{form.email}</strong>
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Code de vérification
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full h-11 px-4 rounded-lg border text-sm focus:outline-none text-center text-xl font-mono"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {error      && <div className="text-sm text-red-500">{error}</div>}
          {successMsg && <div className="text-sm text-green-600 bg-green-50 p-2 rounded">{successMsg}</div>}
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}>
            {loading ? 'Vérification...' : 'Vérifier mon compte'}
          </button>
          <button type="button" onClick={resendCode} disabled={loading}
            className="w-full text-sm text-center hover:underline mt-2"
            style={{ color: 'var(--primary)' }}>
            Renvoyer le code
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  // ── Formulaire inscription ────────────────────────────────────
  return (
    <div className="w-full max-w-lg rounded-2xl p-8 shadow-lg-theme"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Créer un compte</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Rejoignez la marketplace Bazar Guyane</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom / Prénom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Nom *</label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange}
              placeholder="Dupont" required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Prénom</label>
            <input type="text" name="prenom" value={form.prenom} onChange={handleChange}
              placeholder="Jean" className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="vous@email.com" required className={inputClass} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Téléphone *</label>
          <PhoneInput value={phoneNumber} onChange={setPhoneNumber} countryCode="GF" required />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          </p>
        </div>

        {/* Mot de passe / Confirmation */}
        <div className="grid grid-cols-2 gap-3">
          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Mot de passe *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                name="mot_de_passe"
                value={form.mot_de_passe}
                onChange={handleChange}
                placeholder="8 caractères min."
                required
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
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

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Confirmation *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Répétez"
                required
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-lg font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}>
          {loading ? 'Envoi...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}