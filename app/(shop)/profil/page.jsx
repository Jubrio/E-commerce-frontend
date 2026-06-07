'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { adressesAPI } from '@/lib/api';
import PhoneInput from '@/components/ui/PhoneInput';
import { Camera } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;
const TABS = ['Informations', 'Adresses', 'Sécurité'];

export default function ProfilPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser, _hydrated } = useAuthStore();

  const [tab, setTab] = useState(0);
  const [adresses, setAdresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [infoForm, setInfoForm] = useState({ nom: '', prenom: '', telephone: '' });
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const photoRef = useRef(null);
  const [newAdresse, setNewAdresse] = useState({
    libelle: '', adresse: '', ville: '', code_postal: '', pays: 'Guyane française', est_defaut: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      console.log('Téléphone chargé :', user.telephone); 
      let telephoneValue = user.telephone || '';
      if (telephoneValue && !telephoneValue.startsWith('+')) {
        telephoneValue = '+594' + telephoneValue;
      }
      setInfoForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: telephoneValue,
      });
      setPhotoPreview(user.photo_profil || '');
    }
  }, [_hydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (!_hydrated) return;
    if (tab === 1 && isAuthenticated) {
      adressesAPI.getAll().then(r => setAdresses(r.data || [])).catch(() => {});
    }
  }, [tab, _hydrated, isAuthenticated]);

  if (!_hydrated) {
    return <Skeleton />;
  }
  if (!isAuthenticated) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const res = await fetch(`${API}/api/upload/profil`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setPhotoFile(null);
        setPhotoPreview(data.data.photo_profil);
        await refreshUser();
        setSuccess('Photo de profil mise à jour');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {}
    finally { setUploadingPhoto(false); }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/api/users/profil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`,
        },
        body: JSON.stringify(infoForm),
      });
      await refreshUser();
      setSuccess('Profil mis à jour');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
    finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.nouveau !== pwForm.confirm) return setPwError('Les mots de passe ne correspondent pas');
    if (pwForm.nouveau.length < 8) return setPwError('Minimum 8 caractères');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/mot-de-passe`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`,
        },
        body: JSON.stringify({ ancien: pwForm.ancien, nouveau: pwForm.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwForm({ ancien: '', nouveau: '', confirm: '' });
      setSuccess('Mot de passe modifié');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setPwError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await adressesAPI.create(newAdresse);
      const r = await adressesAPI.getAll();
      setAdresses(r.data || []);
      setShowAddressForm(false);
      setNewAdresse({
        libelle: '', adresse: '', ville: '', code_postal: '', pays: 'Guyane française', est_defaut: false,
      });
    } catch {}
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const focus = {
    onFocus: (e) => (e.target.style.borderColor = 'var(--primary)'),
    onBlur: (e) => (e.target.style.borderColor = 'var(--border)'),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Mon profil</h1>
      <div
        className="flex items-center gap-5 p-5 rounded-xl mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              user?.nom?.[0]?.toUpperCase()
            )}
          </div>
          <button
            onClick={() => photoRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow"
            style={{ backgroundColor: 'var(--primary)' }}
            title="Changer la photo"
          >
            <Camera size={13} />
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-lg" style={{ color: 'var(--text)' }}>
            {user?.nom} {user?.prenom}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {user?.nom_role || 'Client'}
          </span>
          {photoFile && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="px-4 h-8 rounded-lg text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {uploadingPhoto ? 'Upload...' : 'Enregistrer la photo'}
              </button>
              <button
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(user?.photo_profil || '');
                }}
                className="text-xs hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>

      {success && (
        <div
          className="text-sm px-4 py-3 rounded-xl mb-4"
          style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}
        >
          ✓ {success}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex rounded-xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--bg-input)', padding: '4px', gap: '4px' }}
      >
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: tab === i ? 'var(--bg-card)' : 'transparent',
              color: tab === i ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: tab === i ? 'var(--shadow)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0 : Informations (avec PhoneInput) ── */}
      {tab === 0 && (
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Nom</label>
              <input
                type="text"
                value={infoForm.nom}
                onChange={(e) => setInfoForm((x) => ({ ...x, nom: e.target.value }))}
                className={inputClass}
                style={inputStyle}
                {...focus}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Prénom</label>
              <input
                type="text"
                value={infoForm.prenom}
                onChange={(e) => setInfoForm((x) => ({ ...x, prenom: e.target.value }))}
                className={inputClass}
                style={inputStyle}
                {...focus}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={inputClass}
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              L'email ne peut pas être modifié
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>Téléphone</label>
            <PhoneInput
              value={infoForm.telephone}
              onChange={(val) => setInfoForm((x) => ({ ...x, telephone: val }))}
              countryCode="GF"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      )}

      {/* ── Tab 1 : Adresses (inchangé) ── */}
      {tab === 1 && (
        <div className="space-y-3">
          {adresses.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: `1px solid ${a.est_defaut ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {a.libelle || 'Adresse'}
                    </p>
                    {a.est_defaut && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                      >
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {a.adresse}, {a.code_postal} {a.ville}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.pays}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!a.est_defaut && (
                    <button
                      onClick={() =>
                        adressesAPI.setDefaut(a.id).then(() =>
                          adressesAPI.getAll().then((r) => setAdresses(r.data || []))
                        )
                      }
                      className="text-xs hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() =>
                      adressesAPI.delete(a.id).then(() => setAdresses((x) => x.filter((d) => d.id !== a.id)))
                    }
                    className="text-xs hover:underline"
                    style={{ color: '#dc2626' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!showAddressForm ? (
            <button
              onClick={() => setShowAddressForm(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium hover:opacity-70"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              + Ajouter une adresse
            </button>
          ) : (
            <form
              onSubmit={handleAddAddress}
              className="p-4 rounded-xl space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Nouvelle adresse</h3>
              {[
                { name: 'libelle', label: 'Libellé', placeholder: 'Domicile' },
                { name: 'adresse', label: 'Adresse', placeholder: '12 rue des Palmistes' },
                { name: 'ville', label: 'Ville', placeholder: 'Cayenne' },
                { name: 'code_postal', label: 'Code postal', placeholder: '97300' },
                { name: 'pays', label: 'Pays', placeholder: 'Guyane française' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={newAdresse[f.name]}
                    onChange={(e) => setNewAdresse((x) => ({ ...x, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none"
                    style={inputStyle}
                    {...focus}
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="checkbox"
                  checked={newAdresse.est_defaut}
                  onChange={(e) => setNewAdresse((x) => ({ ...x, est_defaut: e.target.checked }))}
                />
                Définir comme adresse par défaut
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg font-semibold text-sm text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 h-9 rounded-lg text-sm border"
                  style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Tab 2 : Sécurité (inchangé) ── */}
      {tab === 2 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Changer le mot de passe</h2>
          {[
            { name: 'ancien', label: 'Mot de passe actuel', placeholder: '••••••••' },
            { name: 'nouveau', label: 'Nouveau mot de passe', placeholder: '8 caractères minimum' },
            { name: 'confirm', label: 'Confirmer le nouveau', placeholder: '••••••••' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                {f.label}
              </label>
              <input
                type="password"
                value={pwForm[f.name]}
                onChange={(e) => setPwForm((x) => ({ ...x, [f.name]: e.target.value }))}
                placeholder={f.placeholder}
                required
                className={inputClass}
                style={inputStyle}
                {...focus}
              />
            </div>
          ))}
          {pwError && <p className="text-sm" style={{ color: '#dc2626' }}>{pwError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="mt-6 space-y-4">
        <div className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    </div>
  );
}