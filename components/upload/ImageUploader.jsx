'use client';
import { useState, useRef, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUploader({ produitId, images = [], onImagesChange }) {
  const [dragOver,    setDragOver]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));

      // Première image = principale si aucune image existante
      if (images.length === 0) {
        formData.append('est_principale', 'true');
      }

      const res = await fetch(`${API}/api/upload/produit/${produitId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      onImagesChange([...images, ...data.data]);
    } catch (err) {
      setUploadError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }, [produitId, images, onImagesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const handleFileInput = (e) => uploadFiles(e.target.files);

  const handleSetPrincipale = async (imageId) => {
    // Reset local
    const updated = images.map(img => ({ ...img, est_principale: img.id === imageId }));
    onImagesChange(updated);

    // Sync API — mise à jour en base
    await fetch(`${API}/api/produits/${produitId}`, {
      method: 'PUT',
      headers: {
        Authorization:  `Bearer ${localStorage.getItem('guyagod_token')}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      await fetch(`${API}/api/upload/produit/image/${imageId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` },
      });
      onImagesChange(images.filter(img => img.id !== imageId));
    } catch {}
  };

  return (
    <div className="space-y-4">

      {/* Zone de drop */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all"
        style={{
          borderColor:     dragOver ? 'var(--primary)' : 'var(--border)',
          backgroundColor: dragOver ? 'var(--primary-light)' : 'var(--bg-input)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Upload en cours...
            </p>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text)' }}>
              Glissez vos images ici
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              ou cliquez pour sélectionner — JPG, PNG, WebP — 5 Mo max
            </p>
          </>
        )}
      </div>

      {/* Erreur */}
      {uploadError && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          {uploadError}
        </p>
      )}

      {/* Grille images uploadées */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden aspect-square"
              style={{
                border: `2px solid ${img.est_principale ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: 'var(--bg-input)',
              }}
            >
              <img
                src={img.image}
                alt=""
                className="w-full h-full object-contain p-1"
              />

              {/* Badge principale */}
              {img.est_principale && (
                <div
                  className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-bold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  ★
                </div>
              )}

              {/* Actions au hover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
              >
                {!img.est_principale && (
                  <button
                    onClick={() => handleSetPrincipale(img.id)}
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                  >
                    Principale
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="text-xs px-2 py-1 rounded-lg font-semibold"
                  style={{ backgroundColor: '#dc2626', color: '#fff' }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ★ = image principale affichée dans le catalogue. Cliquez sur une image pour la définir.
        </p>
      )}
    </div>
  );
}

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
