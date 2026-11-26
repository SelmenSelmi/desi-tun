import { ChartNoAxesColumn, Clapperboard, Gauge, Handshake, House, Layers, Mail, Package, Settings, Tags, Wrench } from "lucide-react";
import type { SiteContent } from "../../lib/site-content";

export const adminBase = "/login-desi";
export type EditorSection = keyof SiteContent;

export const adminPages = [
  { slug: "tableau-de-bord", title: "Tableau de bord", section: null, icon: Gauge, group: "Espace de travail" },
  { slug: "sections", title: "Sections", section: "sections", icon: Layers, group: "Espace de travail" },
  { slug: "accueil", title: "Accueil", section: "hero", icon: House, group: "Contenu du site" },
  { slug: "chiffres-cles", title: "Chiffres clés", section: "stats", icon: ChartNoAxesColumn, group: "Contenu du site" },
  { slug: "videos", title: "Vidéos", section: "films", icon: Clapperboard, group: "Contenu du site" },
  { slug: "savoir-faire", title: "Savoir-faire", section: "workshop", icon: Wrench, group: "Contenu du site" },
  { slug: "produits", title: "Produits", section: "catalog", icon: Package, group: "Contenu du site" },
  { slug: "partenariats", title: "Partenariats", section: "collaboration", icon: Handshake, group: "Contenu du site" },
  { slug: "bandeau-partenaires", title: "Bandeau des partenaires", section: "ticker", icon: Tags, group: "Contenu du site" },
  { slug: "contact", title: "Contact", section: "contact", icon: Mail, group: "Contenu du site" },
  { slug: "parametres", title: "Paramètres", section: "general", icon: Settings, group: "Configuration" },
] as const satisfies readonly { slug: string; title: string; section: EditorSection | null; icon: typeof Gauge; group: string }[];
