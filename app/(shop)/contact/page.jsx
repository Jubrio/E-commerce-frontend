'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ nom: '', email: '', message: '' });
        setTimeout(() => setSent(false), 5000);
      } else {
        setError(data.message || 'Erreur lors de l’envoi');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm hover:underline mb-4 inline-block" style={{ color: 'var(--primary)' }}>
        ← Retour à l’accueil
      </Link>

      <div
        className="rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Contactez-nous</h1>

        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>
            📞 WhatsApp :{' '}
            <a href="https://wa.me/594694154108" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--primary)' }}>
              06 94 15 41 08
            </a>
          </p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            ✉️ Email :{' '}
            <a href="mailto:support.bazarguyane@gmail.com" className="hover:underline" style={{ color: 'var(--primary)' }}>
              support.bazarguyane@gmail.com
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Nom</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Message</label>
            <textarea
              rows={5}
              required
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-10 rounded-lg font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
          {sent && <p className="text-sm text-green-600">✓ Message envoyé !</p>}
        </form>
      </div>
    </div>
  );
}