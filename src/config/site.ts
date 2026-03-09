export const siteConfig = {
    // ─── IDENTITÉ ─────────────────────────────────────────────────────
    name: 'E-Commerce CD',
    description: 'Votre boutique en ligne à Kinshasa',
  
    // ─── META TAGS (SEO) ──────────────────────────────────────────────
    meta: {
      title: 'E-Commerce CD — Boutique en ligne Kinshasa',
      description: 'Achetez vos produits en ligne et faites-vous livrer à Kinshasa',
      keywords: 'ecommerce, kinshasa, livraison, shopping',
      ogImage: '/og-image.jpg',
    },
  
    // ─── NAVIGATION BOUTIQUE ──────────────────────────────────────────
    nav: [
      { label: 'Accueil', href: '/' },
      { label: 'Produits', href: '/products' },
      { label: 'Catégories', href: '/categories' },
    ],
  
    // ─── NAVIGATION DASHBOARD ─────────────────────────────────────────
  adminNav: [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '📦 Produits', href: '/admin/dashboard/products' },
    { label: '🗂️ Catégories', href: '/admin/dashboard/categories' },
  ],
  
    // ─── FOOTER ───────────────────────────────────────────────────────
    footer: {
      tagline: 'Livraison rapide à Kinshasa',
      links: [
        { label: 'À propos', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'CGV', href: '/cgv' },
      ],
      social: {
        whatsapp: '+243XXXXXXXXX',
        facebook: 'https://facebook.com/...',
        instagram: 'https://instagram.com/...',
      },
    },
  
    // ─── CONTACT ──────────────────────────────────────────────────────
    contact: {
      whatsapp: '+243XXXXXXXXX',
      email: 'contact@ecommerce.cd',
      address: 'Kinshasa, RDC',
    },
  } as const;
  