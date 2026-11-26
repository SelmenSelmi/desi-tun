const navigation = [
  { label: "Savoir-faire", link: "#savoir-faire" },
  { label: "Vidéos", link: "#videos" },
  { label: "Produits", link: "#produits" },
  { label: "Partenariats", link: "#partenariats" },
];

const stats = [
  { value: "2018", label: "Année de création" },
  { value: "475 m²", label: "Atelier de sublimation" },
  { value: "600 m²", label: "Atelier de confection" },
  { value: "36", label: "Opératrices de production" },
];

const videos = [
  { title: "Impression textile avec ROQ Impress", description: "La ROQ Impress automatise la sérigraphie sur vêtement. Suivez le passage du textile sous les têtes d’impression jusqu’au motif final.", file: "/media/atelier-paysage.mp4", poster: "/media/roq-impress.webp", duration: "0:50", shape: "wide" },
  { title: "Pliage et emballage automatisés", description: "La ligne ROQ replie les manches et le corps du vêtement, puis le met sous sachet et scelle l’emballage.", file: "/media/atelier-portrait.mp4", poster: "/media/roq-pliage.webp", duration: "0:34", shape: "tall" },
];

const products = ["Maillots de bain", "Bavettes", "Blouses médicales", "T-shirts", "Leggings", "Lingerie"]
  .map((name, index) => ({ name, image: `/images/produit-${index + 1}.webp` }));

const services = [
  { title: "Sublimation", text: "Nous personnalisons des textiles blancs composés d’au moins 75 % de polyester. Le transfert préserve la respirabilité du tissu, un atout pour les vêtements techniques et sportifs.", detail: "Trois imprimantes grand format déposent le motif sur un papier transfert absorbant à séchage rapide. Le calandrage transfère l’impression sur le tissu, puis une machine visiteuse contrôle les rouleaux imprimés." },
  { title: "Coupe", text: "Nous optimisons le placement des pièces pour réduire la consommation de tissu. Un chariot matelasseur déroule et dépose le tissu sur les tables de coupe.", detail: "" },
  { title: "Confection", text: "Nos deux lignes de montage fonctionnent en juste-à-temps et s’adaptent au type d’article et à la taille des séries. Le bureau de planning coordonne l’approvisionnement des lignes et suit les délais.", detail: "Le parc comprend notamment 15 piqueuses simples, 7 surjeteuses à 4 fils, 2 à 5 fils et 3 recouvreuses. Le parc réunit des machines Juki, Brother et Siruba. Sur les 36 opératrices, 27 travaillent sur machine et 9 assurent la finition, le contrôle, le repassage et l’emballage." },
];

const partnerships = [
  { title: "Sous-traitance", text: "Nous confectionnons vos articles et pouvons préparer les fiches techniques pour chiffrer vos besoins en tissu et en fournitures." },
  { title: "Co-traitance", text: "Nous prenons en charge le développement du produit et l’approvisionnement en fournitures, en plus de la confection." },
  { title: "Produit fini", text: "À partir d’un dessin, d’une photo ou d’un cahier des charges, nous assurons le patronage, la gradation, l’achat des matières et la fabrication." },
];

const partners = [
  { name: "Decathlon", logo: "/images/partners/decathlon.webp" },
  { name: "Banana Moon", logo: "/images/partners/banana-moon.webp" },
  { name: "Odeclas", logo: "/images/partners/odeclas.webp" },
  { name: "Newsport", logo: "" },
  { name: "Active Sport", logo: "" },
  { name: "Quick Send", logo: "" },
];

export const defaultContent = {
  general: {
    brandFirst: "Subli",
    brandLast: "Tunis",
    logo: "/images/logo.webp",
    skip: "Aller au contenu",
    headerCta: "Parlons de votre projet",
    mobileContact: "Contact",
    footer: "SubliTunis · Sousse, Tunisie",
    backToTop: "Haut de page ↑",
    metaTitle: "SubliTunis | Sublimation et confection textile à Sousse",
    metaDescription: "Partenaire textile à Sousse depuis 2018. Sublimation, coupe et confection pour les marques et les donneurs d’ordre.",
    navigation,
  },
  hero: {
    photo: "/images/production.webp",
    location: "Sousse, Tunisie",
    titleFirst: "Sublimation et",
    titleSecond: "confection",
    titleAccent: "textile.",
    description: "Depuis 2018, SubliTunis accompagne les marques dans la fabrication de leurs collections, de l’impression à la confection.",
    primary: "Découvrir notre savoir-faire",
    secondary: "Voir les vidéos",
    scrollLabel: "Descendre aux vidéos"
  },
  films: {
    eyebrow: "Démonstrations vidéo",
    title: "Les machines",
    accent: "en action.",
    description: "Découvrez les équipements ROQ, de l’impression textile au pliage et à la mise sous sachet.",
    videos,
  },
  workshop: {
    eyebrow: "Notre savoir-faire",
    titleFirst: "De l’impression",
    titleSecond: "à l’assemblage.",
    description: "Entreprise tunisienne tournée vers l’export, SubliTunis réalise à Sousse des vêtements en maille et en chaîne et trame pour le sport, le travail et le prêt-à-porter.",
    detailsLabel: "Équipements et procédés",
    standards: "Nous appliquons les normes sociales tunisiennes et les exigences de nos clients en matière de santé, de sécurité et de droits des travailleurs.",
    services,
  },
  catalog: {
    eyebrow: "Nos produits",
    title: "Du sport au vêtement professionnel.",
    products,
  },
  collaboration: {
    eyebrow: "Partenariats",
    title: "Trois façons de collaborer.",
    partnerships,
  },
  contact: {
    eyebrow: "Contact",
    titleFirst: "Parlons de votre",
    titleSecond: "prochain projet.",
    description: "Notre équipe vous conseille gratuitement, 7 jours sur 7.",
    cta: "Écrire à SubliTunis",
    phoneLabel: "Téléphone",
    emailLabel: "E-mail",
    addressLabel: "Ateliers",
    address: "Zone industrielle Sidi Abdelhamid\n4000 Sousse, Tunisie\nEn semaine, de 10 h à 16 h",
    email: "info@desitunis.com",
    phones: [
      {
        "number": "+216 29 366 900"
      },
      {
        "number": "+216 29 366 903"
      }
    ]
  },
  ticker: {
    title: "Nos partenaires",
    partners,
  },
  sections: (["ticker", "hero", "stats", "films", "workshop", "catalog", "collaboration", "contact"] as const)
    .map((section) => ({ section, visible: true })),
  stats,
};

export type SiteContent = typeof defaultContent;
