# Bazar Guyane — Marketplace

La marketplace de la Guyane. Achetez et vendez des produits neufs, reconditionnés et d'occasion.

 **Site en ligne** : [bazarguyane.up.railway.app](https://bazarguyane.up.railway.app)

---

## Stack technique

- **Frontend** : Next.js 14, Tailwind CSS, Zustand, Framer Motion
- **Backend** : Node.js, Express, MySQL (Railway)
- **Paiement** : Stripe
- **Stockage images** : Cloudinary
- **Email** : Mailjet
- **Auth** : JWT + Google OAuth
- **Déploiement** : Railway

---

## Fonctionnalités

- Catalogue produits avec filtres (catégorie, marque, prix, état)
- Panier et commandes avec paiement Stripe
- Espace vendeur (gestion produits, commandes, commissions)
- Espace admin (utilisateurs, catégories, promotions, livraisons)
- Notifications en temps réel
- Messagerie entre acheteurs et vendeurs
- Authentification email + Google OAuth
- PWA installable sur Android et iOS
- Mode sombre / clair

---

## Installation locale

```bash
git clone https://github.com/Jubrio/E-commerce-frontend.git
cd E-commerce-frontend
npm install
```

Crée un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PK=ta_cle_stripe
```

Lance le serveur :

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
app/
├── (auth)/          # Login, Register, Mot de passe oublié
├── (shop)/          # Catalogue, Produit, Panier, Commandes
│   ├── admin/       # Dashboard administrateur
│   └── vendeur/     # Espace vendeur
components/
├── produit/         # ProductCard, ProductDetail
├── notifications/   # NotificationDropdown
└── ui/              # Composants réutilisables
lib/
├── api.js           # Appels API centralisés
└── slugify.js
store/               # Zustand stores (auth, cart, theme)
```

---

## Auteur

**Jubrio RAZAKANIRINA** — Étudiant ENI Fianarantsoa, Madagascar  
Contact : [jubriorazaka09@gmail.com](mailto:jubriorazaka09@gmail.com)