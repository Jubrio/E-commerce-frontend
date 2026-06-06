'use client';
import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);

  useEffect(() => {
    // Déjà installée ?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Déjà fermé par l'utilisateur ?
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;

    if (ios) {
      setShowBanner(true);
      return;
    }

    // Android / Chrome — écoute l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', '1');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--primary)',
        color: '#fff',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '13px',
        zIndex: 9999,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/Logo.png" alt="logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Bazar Guyane</div>
          {isIOS ? (
            <div style={{ opacity: 0.9, fontSize: 12 }}>
              Appuyez sur <strong>⎙</strong> puis <strong>"Sur l'écran d'accueil"</strong>
            </div>
          ) : (
            <div style={{ opacity: 0.9, fontSize: 12 }}>
              Installez l'application pour une meilleure expérience
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              backgroundColor: '#fff',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Installer
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            opacity: 0.8,
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}