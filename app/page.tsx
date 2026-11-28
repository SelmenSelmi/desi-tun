import { Fragment } from "react";
import type { SiteContent } from "../lib/site-content";
import { readSite } from "../lib/site-store";
import Visit from "./visit";
import { hasPersistentStorage } from "../lib/desi-storage";
import type { Metadata } from "next";
import Image from "next/image";
import MobileNavigation from "./mobile-navigation";
import PartnerTicker from "./partner-ticker";
import ScrollReveals from "./scroll-reveals";
import VideoPlayer from "./video-player";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Building2, CalendarDays, Layers3,
  Mail, MapPin, PackageCheck, Phone, PlayCircle, Printer, Scissors, Shirt, UsersRound,
} from "lucide-react";

function Brand({ general }: { general: SiteContent["general"] }) {
  return <a className="brand" href="#accueil">
    <Image src={general.logo} alt="" width={42} height={42} unoptimized />
    <span>{general.brandFirst}<span>{general.brandLast}</span></span>
  </a>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content: { general } } = await readSite();
  return {
    title: general.metaTitle,
    description: general.metaDescription,
    icons: { icon: general.logo },
  };
}

const statIcons = [CalendarDays, Layers3, Building2, UsersRound];
const serviceIcons = [Printer, Scissors, Shirt];
const partnershipIcons = [Scissors, Layers3, PackageCheck];

export default async function Home() {
  const { content } = await readSite();
  const { general, hero, stats, films, workshop, catalog, collaboration, contact, ticker } = content;
  const visibleSections = content.sections.filter(({ visible }) => visible);
  const hidden = new Set(content.sections.filter(({ visible }) => !visible).map(({ section }) => section));
  const anchors = new Map([
    ["#savoir-faire", "workshop"], ["#videos", "films"], ["#produits", "catalog"],
    ["#partenariats", "collaboration"], ["#contact", "contact"],
  ] as const);
  const hiddenLinks = new Set<string>([...anchors].filter(([, section]) => hidden.has(section)).map(([link]) => link));
  const navigation: [string, string][] = general.navigation
    .filter(({ link }) => !hiddenLinks.has(link))
    .map(({ label, link }) => [label, link]);
  const emailHref = `mailto:${contact.email}`;

  const sections: Record<string, React.ReactNode> = {
    ticker: (
        <PartnerTicker title={ticker.title} partners={ticker.partners} />
    ),
    hero: (
        <section className="hero" aria-labelledby="hero-title">
          <Image className="hero-image" src={hero.photo} alt="" fill preload sizes="100vw" unoptimized />
          <div className="wrap hero-body">
            <div className="eyebrow hero-eyebrow"><MapPin size={15} aria-hidden="true" /> {hero.location}</div>
            <h1 id="hero-title">{hero.titleFirst}<br /> {hero.titleSecond} <em>{hero.titleAccent}</em></h1>
            <p>{hero.description}</p>
            <div className="hero-actions">
              {!hidden.has("workshop") && <a className="button primary" href="#savoir-faire">{hero.primary} <ArrowRight size={19} aria-hidden="true" /></a>}
              {!hidden.has("films") && <a className="button outline" href="#videos"><PlayCircle size={19} aria-hidden="true" /> {hero.secondary}</a>}
            </div>
          </div>
          {!hidden.has("films") && <a className="scroll-link" href="#videos" aria-label={hero.scrollLabel}><ArrowDown size={19} aria-hidden="true" /></a>}
        </section>
    ),
    stats: (
        <div className="wrap stats" aria-label="SubliTunis en chiffres">
          {stats.map(({ value, label }, index) => {
            const Icon = statIcons[index % statIcons.length];
            return (
            <div className="stat" key={index}><span className="stat-icon"><Icon size={22} aria-hidden="true" /></span><div><strong>{value}</strong><span>{label}</span></div></div>
            );
          })}
        </div>
    ),
    films: (
        <section className="section films" id="videos" aria-labelledby="films-title">
          <div className="wrap">
            <div className="section-heading film-heading">
              <div>
                <div className="eyebrow"><PlayCircle size={17} aria-hidden="true" /> {films.eyebrow}</div>
                <h2 id="films-title">{films.title} <em>{films.accent}</em></h2>
              </div>
              <p>{films.description}</p>
            </div>
            <div className="video-features">
              {films.videos.map(({ title, description, file, poster, duration, shape }, index) => (
                <article className="video-card" data-reveal key={index}>
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
    ),
    workshop: (
        <section className="section soft" id="savoir-faire">
          <div className="wrap">
            <div className="section-heading split">
              <div><div className="eyebrow">{workshop.eyebrow}</div><h2>{workshop.titleFirst}<br /> {workshop.titleSecond}</h2></div>
              <p>{workshop.description}</p>
            </div>
            <div className="service-grid">
              {workshop.services.map(({ title, text, detail }, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return (
                <article className="service" key={index}>
                  <span className="stat-icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3><p>{text}</p>
                  {detail && <details><summary>{workshop.detailsLabel}</summary><p>{detail}</p></details>}
                </article>
                );
              })}
            </div>
            <p className="standards">{workshop.standards}</p>
          </div>
        </section>
    ),
    catalog: (
        <section className="wrap section" id="produits">
          <div className="section-heading"><div className="eyebrow">{catalog.eyebrow}</div><h2>{catalog.title}</h2></div>
          <div className="product-grid">
            {catalog.products.map(({ name, image }) => (
              <article className="product" data-reveal key={name}>
                <Image src={image} alt="" width={720} height={720} unoptimized />
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </section>
    ),
    collaboration: (
        <section className="section soft" id="partenariats">
          <div className="wrap">
            <div className="section-heading"><div className="eyebrow">{collaboration.eyebrow}</div><h2>{collaboration.title}</h2></div>
            <div className="service-grid">
              {collaboration.partnerships.map(({ title, text }, index) => {
                const Icon = partnershipIcons[index % partnershipIcons.length];
                return (
                <article className="service" key={index}><span className="stat-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>
                );
              })}
            </div>
          </div>
        </section>
    ),
    contact: (
        <section className="contact" id="contact">
          <div className="wrap contact-grid">
            <div>
              <div className="eyebrow">{contact.eyebrow}</div>
              <h2>{contact.titleFirst}<br /> {contact.titleSecond}</h2>
              <p>{contact.description}</p>
              <a className="button primary" href={emailHref}>{contact.cta} <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
            <address>
              <div><Phone size={20} aria-hidden="true" /><span><strong>{contact.phoneLabel}</strong>{contact.phones.map(({ number }, index) => <a key={index} href={`tel:${number.replace(/[^+\d]/g, "")}`}>{number}</a>)}</span></div>
              <div><Mail size={20} aria-hidden="true" /><span><strong>{contact.emailLabel}</strong><a href={emailHref}>{contact.email}</a></span></div>
              <div><MapPin size={20} aria-hidden="true" /><span><strong>{contact.addressLabel}</strong><span className="address-lines">{contact.address}</span></span></div>
            </address>
          </div>
        </section>
    ),
  };
  return (
    <>
      <ScrollReveals />
      {hasPersistentStorage() && <Visit />}
      <a className="skip" href="#contenu">{general.skip}</a>
      <header>
        <div className="wrap topbar">
          <Brand general={general} />
          <nav className="desktop-nav" aria-label="Navigation principale">
            {navigation.map(([name, link]) => <a key={name + link} href={link}>{name}</a>)}
          </nav>
          {!hidden.has("contact") && <a className="button header-cta" href="#contact">{general.headerCta} <ArrowUpRight size={17} aria-hidden="true" /></a>}
          <MobileNavigation links={hidden.has("contact") ? navigation : [...navigation, [general.mobileContact, "#contact"]]} />
        </div>
      </header>

      <main id="contenu">
        {visibleSections.map(({ section }) => (
          <Fragment key={section}>{sections[section]}</Fragment>
        ))}
      </main>

      <footer><div className="wrap footer-content"><Brand general={general} /><small>{general.footer}</small><a href="#accueil">{general.backToTop}</a></div></footer>
    </>
  );
}
