'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({
  Authorization:  `Bearer ${localStorage.getItem('guyagod_token')}`,
  'Content-Type': 'application/json',
});

export default function MessagesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { isAuthenticated, _hydrated, user } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [activeUser,    setActiveUser]    = useState(null);
  const [texte,         setTexte]         = useState('');
  const [loadingConv,   setLoadingConv]   = useState(true);
  const [loadingMsg,    setLoadingMsg]    = useState(false);
  const [sending,       setSending]       = useState(false);
  // Mobile : 'list' | 'chat'
  const [mobileView,    setMobileView]    = useState('list');

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(() => {
    // ⬅️ Attendre la fin de l'hydratation avant toute décision
    if (!_hydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchConversations();

    const uid = searchParams.get('user_id');
    if (uid) {
      openConversation({ interlocuteur_id: parseInt(uid) });
      setMobileView('chat');
    }

    return () => clearInterval(pollRef.current);
  }, [_hydrated, isAuthenticated, router, searchParams]);

  const fetchConversations = async () => {
    try {
      const r    = await fetch(`${API}/api/messages/conversations`, { headers: auth() });
      const data = await r.json();
      setConversations(data.data || []);
    } catch {}
    finally { setLoadingConv(false); }
  };

  const openConversation = useCallback(async (conv) => {
    setActiveUser(conv);
    setLoadingMsg(true);
    setMobileView('chat');
    clearInterval(pollRef.current);

    const load = async () => {
      try {
        const r    = await fetch(`${API}/api/messages/${conv.interlocuteur_id}`, { headers: auth() });
        const data = await r.json();
        setMessages(data.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } catch {}
    };

    await load();
    setLoadingMsg(false);
    pollRef.current = setInterval(load, 5000);
    fetchConversations();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!texte.trim() || !activeUser || sending) return;
    setSending(true);
    try {
      await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify({ destinataire_id: activeUser.interlocuteur_id, message: texte }),
      });
      setTexte('');
      const r    = await fetch(`${API}/api/messages/${activeUser.interlocuteur_id}`, { headers: auth() });
      const data = await r.json();
      setMessages(data.data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      fetchConversations();
    } catch {}
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
      <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--text)' }}>Messages</h1>

      <div
        className="flex rounded-2xl overflow-hidden"
        style={{
          border:          '1px solid var(--border)',
          // Hauteur adaptée : mobile prend tout l'écran restant
          height:          'calc(100vh - 200px)',
          minHeight:       '400px',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* ── Sidebar conversations ── */}
        {/* Desktop : toujours visible. Mobile : visible seulement si mobileView='list' */}
        <div
          className={`flex-shrink-0 flex flex-col
            ${mobileView === 'list' ? 'flex' : 'hidden'}
            md:flex
            w-full md:w-72`}
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConv ? (
              <ConvSkeleton />
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-2xl mb-2">💬</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune conversation</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.interlocuteur_id}
                  onClick={() => openConversation(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    backgroundColor: activeUser?.interlocuteur_id === conv.interlocuteur_id
                      ? 'var(--primary-light)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {conv.nom?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {conv.nom} {conv.prenom}
                      </p>
                      {conv.non_lus > 0 && (
                        <span
                          className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0 ml-1"
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          {conv.non_lus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(conv.derniere_activite).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short',
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Zone messages ── */}
        {/* Desktop : toujours visible. Mobile : visible seulement si mobileView='chat' */}
        <div
          className={`flex-1 flex-col min-w-0
            ${mobileView === 'chat' ? 'flex' : 'hidden'}
            md:flex`}
        >
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">💬</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Sélectionnez une conversation
              </p>
            </div>
          ) : (
            <>
              {/* Header avec bouton retour sur mobile */}
              <div
                className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {/* Bouton retour mobile */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1 rounded-lg hover:opacity-70 flex-shrink-0"
                  style={{ color: 'var(--primary)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {activeUser.nom?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {activeUser.nom} {activeUser.prenom}
                  </p>
                </div>
              </div>

              {/* Messages scrollable */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMsg ? (
                  <MsgSkeleton />
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
                    Aucun message. Envoyez le premier !
                  </p>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.expediteur_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-xs lg:max-w-md px-4 py-2.5 text-sm leading-relaxed break-words"
                          style={{
                            backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-input)',
                            color:           isMine ? '#ffffff' : 'var(--text)',
                            borderRadius:    isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          }}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70" style={{ textAlign: isMine ? 'right' : 'left' }}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone saisie — FIX responsive */}
              <form
                onSubmit={handleSend}
                className="px-3 py-3 flex items-end gap-2 flex-shrink-0"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <textarea
                  ref={textareaRef}
                  value={texte}
                  onChange={e => setTexte(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  rows={1}
                  className="flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color:           'var(--text)',
                    borderColor:     'var(--border)',
                    maxHeight:       '100px',
                    minHeight:       '44px',
                    // FIX mobile : empêche le zoom iOS
                    fontSize:        '16px',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="submit"
                  disabled={!texte.trim() || sending}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <SendIcon />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ConvSkeleton = () => (
  <div className="p-4 space-y-3 animate-pulse">
    {[1,2,3].map(i => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-input)', width: '70%' }} />
          <div className="h-2.5 rounded" style={{ backgroundColor: 'var(--bg-input)', width: '40%' }} />
        </div>
      </div>
    ))}
  </div>
);

const MsgSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1,2,3].map(i => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className="h-10 w-48 rounded-2xl" style={{ backgroundColor: 'var(--bg-input)' }} />
      </div>
    ))}
  </div>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
