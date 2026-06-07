'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/produit/ProductCard';
import { produitsAPI, categoriesAPI } from '@/lib/api';
import { slugify } from '@/lib/slugify';

//------------ Variants d'animation --------------------
const fromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fromBottom = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function HomePage() {
  const [produits,     setProduits]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      produitsAPI.getAll({ limit: 8, page: 1 }),
      categoriesAPI.getAll(),
    ])
      .then(([rp, rc]) => {
        setProduits(rp.data?.rows || []);
        setCategories(rc.data     || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (produits.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.min(produits.length, 8));
    }, 3500);
    return () => clearInterval(interval);
  }, [produits]);

  const slides = produits.slice(0, 8);

  return (
    <div>
      {/* ── Section Hero ── */}
      <section
        className="py-16 px-4 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg) 100%)' }}
      >
        <motion.h1
          className="text-4xl font-black mb-4"
          style={{ color: 'var(--text)' }}
          variants={fromLeft}
          initial="hidden"
          animate="visible"
        >
          BIENVENUE sur BAZAR <span style={{ color: 'var(--primary)' }}>Guyane</span>
        </motion.h1>

        <motion.h2
          className="text-2xl font-black mb-4"
          style={{ color: 'var(--text)' }}
          variants={fromRight}
          initial="hidden"
          animate="visible"
        >
          La marketplace de la{' '}
          <span style={{ color: 'var(--primary)' }}>Guyane</span>
        </motion.h2>

        <motion.p
          className="text-lg mb-8 max-w-xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
          variants={fromLeft}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          Achetez en toute confiance. Des milliers de produits neufs, reconditionnés et d'occasion.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          variants={fromBottom}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
        >
          <Link
            href="/catalogue"
            className="px-8 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Découvrir le catalogue
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 rounded-xl font-bold border hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            Nous contacter
          </Link>
        </motion.div>
      </section>

      {/* ── Section Catégories Populaires ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 overflow-hidden">
          <motion.h2
            className="text-xl font-black mb-5"
            style={{ color: 'var(--text)' }}
            variants={fromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Catégories populaires
          </motion.h2>

          <motion.div
            className="flex gap-3 overflow-x-auto pb-2"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categories.slice(0, 8).map(c => (
              <motion.div key={c.id} variants={staggerItem}>
                <Link
                  href={`/catalogue?category=${slugify(c.nom)}`}
                  className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold border hover:opacity-80 transition-opacity text-center block"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color:           'var(--text)',
                    borderColor:     'var(--border)',
                    minWidth:        '120px',
                  }}
                >
                  {c.image && <div className="text-2xl mb-1">{c.image}</div>}
                  {c.nom}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ── Section Carrousel produits Vedette ── */}
      {slides.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 overflow-hidden">
          <motion.h2
            className="text-2xl font-black mb-6 text-left"
            style={{ color: 'var(--text)' }}
            variants={fromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Nos produits à la une
          </motion.h2>

          <motion.div
            className="relative"
            variants={fromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map(produit => (
                  <Link key={produit.id} href={`/produit/${produit.id}`} className="w-full flex-shrink-0">
                    <div
                      className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <div className="md:w-1/2 aspect-square rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                        {produit.image_principale ? (
                          <img src={produit.image_principale} alt={produit.nom} className="w-full h-full object-contain p-4" />
                        ) : (
                          <span className="text-6xl">📦</span>
                        )}
                      </div>
                      <div className="md:w-1/2 flex flex-col justify-center space-y-3">
                        <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{produit.nom}</h3>
                        <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                          {Number(produit.prix).toFixed(2)} €
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {produit.description?.slice(0, 120)}
                        </p>
                        <span className="inline-block mt-2 px-4 py-2 rounded-lg text-white font-semibold w-fit" style={{ backgroundColor: 'var(--primary)' }}>
                          Voir le produit
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-105 transition-all z-10 flex items-center justify-center"
              aria-label="Produit précédent"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-105 transition-all z-10 flex items-center justify-center"
              aria-label="Produit suivant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width:           currentSlide === idx ? '24px' : '8px',
                    backgroundColor: currentSlide === idx ? 'var(--primary)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Section Produits Récents ── */}
      <section className="max-w-7xl mx-auto px-4 py-6 overflow-hidden">
        <motion.div
          className="flex items-center justify-between mb-5"
          variants={fromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>Nouveaux produits</h2>
          <Link href="/catalogue" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Voir tout →
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-xl animate-pulse aspect-square" style={{ backgroundColor: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : produits.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {produits.map(p => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProductCard produit={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            variants={fromBottom}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-4xl mb-3">🛍️</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun produit pour l'instant. Soyez le premier à vendre !
            </p>
            <Link
              href="/vendeur/produits/nouveau"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Ajouter un produit
            </Link>
          </motion.div>
        )}
      </section>

      {/* ── Section Avantages ── */}
      <section className="max-w-7xl mx-auto px-4 py-10 overflow-hidden">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { emoji: '🚚', title: 'Livraison rapide',  desc: 'En Guyane et DOM-TOM' },
            { emoji: '🔒', title: 'Paiement sécurisé', desc: 'Via Stripe SSL' },
            { emoji: '↩️', title: 'Retour facile',      desc: '14 jours pour changer' },
            { emoji: '🌟', title: 'Vendeurs vérifiés', desc: 'Qualité garantie' },
          ].map(a => (
            <motion.div
              key={a.title}
              className="text-center p-5 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              variants={staggerItem}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
            >
              <div className="text-3xl mb-2">{a.emoji}</div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{a.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Section Livraison Guyane ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="space-y-6"
            variants={fromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex justify-center md:justify-start">
              <img src="/logo.png" alt="Bazar de Guyane" className="max-w-xs h-auto rounded-xl shadow-lg" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-3" style={{ color: 'var(--text)' }}>
                LIVRAISON LIMITÉE À LA GUYANE
              </h3>
              <div className="flex flex-wrap gap-3">
                {['Saint-Laurent-du-Maroni','Kourou','Cayenne','Matoury','Saint-Georges'].map(ville => (
                  <span
                    key={ville}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                  >
                    {ville}
                  </span>
                ))}
              </div>
              <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
                • Livraison Guyane <br />
                • Livraison Martinique <br />
                • Livraison Guadeloupe <br />
                • Livraison Saint-Martin
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex justify-center"
            variants={fromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <img src="/livraison.png" alt="Livraison Guyane" className="max-w-full h-auto rounded-xl shadow-lg" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}