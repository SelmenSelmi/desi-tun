import Image from "next/image";
import MobileNavigation from "./mobile-navigation";
import PartnerTicker from "./partner-ticker";
import ScrollReveals from "./scroll-reveals";
import VideoPlayer from "./video-player";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Building2, CalendarDays, Layers3,
  Mail, MapPin, PackageCheck, Phone, PlayCircle, Printer, Scissors, Shirt, UsersRound,
} from "lucide-react";

const navigation: [string, string][] = [
  ["Savoir-faire", "#savoir-faire"],
  ["Vidéos", "#videos"],
  ["Produits", "#produits"],
  ["Partenariats", "#partenariats"],
];

const stats = [
  { icon: CalendarDays, value: "2018", label: "Année de création" },
  { icon: Layers3, value: "475 m²", label: "Atelier de sublimation" },
  { icon: Building2, value: "600 m²", label: "Atelier de confection" },
  { icon: UsersRound, value: "36", label: "Opératrices de production" },
];

const videos = [
  { title: "Impression textile avec ROQ Impress", description: "La ROQ Impress automatise la sérigraphie sur vêtement. Suivez le passage du textile sous les têtes d’impression jusqu’au motif final.", file: "atelier-paysage.mp4", poster: "roq-impress.webp", duration: "0:50", shape: "wide" },
  { title: "Pliage et emballage automatisés", description: "La ligne ROQ replie les manches et le corps du vêtement, puis le met sous sachet et scelle l’emballage.", file: "atelier-portrait.mp4", poster: "roq-pliage.webp", duration: "0:34", shape: "tall" },
];

const products = ["Maillots de bain", "Bavettes", "Blouses médicales", "T-shirts", "Leggings", "Lingerie"];

const services = [
  { icon: Printer, title: "Sublimation", text: "Nous personnalisons des textiles blancs composés d’au moins 75 % de polyester. Le transfert préserve la respirabilité du tissu, un atout pour les vêtements techniques et sportifs.", detail: "Trois imprimantes grand format déposent le motif sur un papier transfert absorbant à séchage rapide. Le calandrage transfère l’impression sur le tissu, puis une machine visiteuse contrôle les rouleaux imprimés." },
  { icon: Scissors, title: "Coupe", text: "Nous optimisons le placement des pièces pour réduire la consommation de tissu. Un chariot matelasseur déroule et dépose le tissu sur les tables de coupe." },
  { icon: Shirt, title: "Confection", text: "Nos deux lignes de montage fonctionnent en juste-à-temps et s’adaptent au type d’article et à la taille des séries. Le bureau de planning coordonne l’approvisionnement des lignes et suit les délais.", detail: "Le parc comprend notamment 15 piqueuses simples, 7 surjeteuses à 4 fils, 2 à 5 fils et 3 recouvreuses. Le parc réunit des machines Juki, Brother et Siruba. Sur les 36 opératrices, 27 travaillent sur machine et 9 assurent la finition, le contrôle, le repassage et l’emballage." },
];

const partnerships = [
  { icon: Scissors, title: "Sous-traitance", text: "Nous confectionnons vos articles et pouvons préparer les fiches techniques pour chiffrer vos besoins en tissu et en fournitures." },
  { icon: Layers3, title: "Co-traitance", text: "Nous prenons en charge le développement du produit et l’approvisionnement en fournitures, en plus de la confection." },
  { icon: PackageCheck, title: "Produit fini", text: "À partir d’un dessin, d’une photo ou d’un cahier des charges, nous assurons le patronage, la gradation, l’achat des matières et la fabrication." },
];

function Brand() {
  return <a className="brand" href="#accueil">
    <Image src="/images/logo.webp" alt="" width={42} height={42} unoptimized />
    <span>Subli<span>Tunis</span></span>
  </a>;
}

export default function Home() {
  return (
    <>
      <ScrollReveals />
      <a className="skip" href="#contenu">Aller au contenu</a>
      <header>
        <div className="wrap topbar">
          <Brand />
          <nav className="desktop-nav" aria-label="Navigation principale">
            {navigation.map(([name, link]) => <a key={link} href={link}>{name}</a>)}
          </nav>
          <a className="button header-cta" href="#contact">Parlons de votre projet <ArrowUpRight size={17} aria-hidden="true" /></a>
          <MobileNavigation links={[...navigation, ["Contact", "#contact"]]} />
        </div>
      </header>

      <main id="contenu">
        <PartnerTicker />
        <section className="hero" aria-labelledby="hero-title">
          <Image className="hero-image" src="/images/production.webp" alt="" fill preload sizes="100vw" unoptimized />
          <div className="wrap hero-body">
            <div className="eyebrow hero-eyebrow"><MapPin size={15} aria-hidden="true" /> Sousse, Tunisie</div>
            <h1 id="hero-title">Sublimation et<br /> confection <em>textile.</em></h1>
            <p>Depuis 2018, SubliTunis accompagne les marques dans la fabrication de leurs collections, de l’impression à la confection.</p>
            <div className="hero-actions">
              <a className="button primary" href="#savoir-faire">Découvrir notre savoir-faire <ArrowRight size={19} aria-hidden="true" /></a>
              <a className="button outline" href="#videos"><PlayCircle size={19} aria-hidden="true" /> Voir les vidéos</a>
            </div>
          </div>
          <a className="scroll-link" href="#videos" aria-label="Descendre aux vidéos"><ArrowDown size={19} aria-hidden="true" /></a>
        </section>

        <div className="wrap stats" aria-label="SubliTunis en chiffres">
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="stat" key={label}><span className="stat-icon"><Icon size={22} aria-hidden="true" /></span><div><strong>{value}</strong><span>{label}</span></div></div>
          ))}
        </div>

        <section className="section films" id="videos" aria-labelledby="films-title">
          <div className="wrap">
            <div className="section-heading film-heading">
              <div>
                <div className="eyebrow"><PlayCircle size={17} aria-hidden="true" /> Démonstrations vidéo</div>
                <h2 id="films-title">Les machines <em>en action.</em></h2>
              </div>
              <p>Découvrez les équipements ROQ, de l’impression textile au pliage et à la mise sous sachet.</p>
            </div>
            <div className="video-features">
              {videos.map(({ title, description, file, poster, duration, shape }, index) => (
                <article className="video-card" data-reveal key={file}>
                  <div className="film-art">
                    <VideoPlayer file={file} poster={poster} labelId={`video-${index}`} title={title} shape={shape} />
                  </div>
                  <div className="video-copy">
                    <span className="duration"><PlayCircle size={15} aria-hidden="true" /> {duration}</span>
                    <h3 id={`video-${index}`}>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft" id="savoir-faire">
          <div className="wrap">
            <div className="section-heading split">
              <div><div className="eyebrow">Notre savoir-faire</div><h2>De l’impression<br /> à l’assemblage.</h2></div>
              <p>Entreprise tunisienne tournée vers l’export, SubliTunis réalise à Sousse des vêtements en maille et en chaîne et trame pour le sport, le travail et le prêt-à-porter.</p>
            </div>
            <div className="service-grid">
              {services.map(({icon: Icon, title, text, detail}) => (
                <article className="service" key={title}>
                  <span className="stat-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3><p>{text}</p>
                  {detail && <details><summary>Équipements et procédés</summary><p>{detail}</p></details>}
                </article>
              ))}
            </div>
            <p className="standards">Nous appliquons les normes sociales tunisiennes et les exigences de nos clients en matière de santé, de sécurité et de droits des travailleurs.</p>
          </div>
        </section>

        <section className="wrap section" id="produits">
          <div className="section-heading"><div className="eyebrow">Nos produits</div><h2>Du sport au vêtement professionnel.</h2></div>
          <div className="product-grid">
            {products.map((name, index) => (
              <article className="product" data-reveal key={name}>
                <Image src={`/images/produit-${index + 1}.webp`} alt="" width={720} height={720} unoptimized />
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft" id="partenariats">
          <div className="wrap">
            <div className="section-heading"><div className="eyebrow">Partenariats</div><h2>Trois façons de collaborer.</h2></div>
            <div className="service-grid">
              {partnerships.map(({icon: Icon, title, text}) => (
                <article className="service" key={title}><span className="stat-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap contact-grid">
            <div>
              <div className="eyebrow">Contact</div>
              <h2>Parlons de votre<br /> prochain projet.</h2>
              <p>Notre équipe vous conseille gratuitement, 7 jours sur 7.</p>
              <a className="button primary" href="mailto:info@desitunis.com">Écrire à SubliTunis <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
            <address>
              <div><Phone size={20} aria-hidden="true" /><span><strong>Téléphone</strong><a href="tel:+21629366900">+216 29 366 900</a><a href="tel:+21629366903">+216 29 366 903</a></span></div>
              <div><Mail size={20} aria-hidden="true" /><span><strong>E-mail</strong><a href="mailto:info@desitunis.com">info@desitunis.com</a></span></div>
              <div><MapPin size={20} aria-hidden="true" /><span><strong>Ateliers</strong>Zone industrielle Sidi Abdelhamid<br />4000 Sousse, Tunisie<br />En semaine, de 10 h à 16 h</span></div>
            </address>
          </div>
        </section>
      </main>

      <footer><div className="wrap footer-content"><Brand /><small>SubliTunis · Sousse, Tunisie</small><a href="#accueil">Haut de page ↑</a></div></footer>
    </>
  );
}
