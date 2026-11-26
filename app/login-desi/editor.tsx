"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronRight, Clapperboard, LogOut, Menu, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { defaultContent, type SiteContent } from "../../lib/site-content";
import { login, logout, publish, uploadPhoto, uploadVideo } from "./actions";
import { adminBase, adminPages, type EditorSection } from "./navigation";
import { maxVideoBytes, maxVideoMegabytes } from "../../lib/media-limits";
import styles from "./dashboard.module.css";

const labels: Record<string, string> = {
  general: "En-tête, navigation et pied de page", ticker: "Bandeau des partenaires",
  hero: "Accueil", stats: "Chiffres clés", films: "Vidéos", workshop: "Savoir-faire",
  catalog: "Produits", collaboration: "Partenariats", contact: "Contact",
  brandFirst: "Nom de marque", brandLast: "Fin du nom de marque", logo: "Logo",
  skip: "Lien d’accès au contenu", headerCta: "Bouton de l’en-tête", mobileContact: "Lien de contact sur mobile",
  footer: "Texte du pied de page", backToTop: "Lien de retour en haut",
  metaTitle: "Titre de la page (SEO)", metaDescription: "Description de la page (SEO)",
  navigation: "Liens de navigation", label: "Libellé", link: "Lien",
  title: "Titre", name: "Nom", photo: "Photo principale", image: "Photo",
  location: "Lieu", titleFirst: "Première ligne du titre", titleSecond: "Deuxième ligne du titre",
  titleAccent: "Fin du titre", description: "Description", primary: "Bouton principal",
  secondary: "Bouton secondaire", scrollLabel: "Libellé de la flèche", value: "Valeur",
  eyebrow: "Surtitre", accent: "Fin du titre", videos: "Vidéos", file: "URL de la vidéo",
  poster: "Image de couverture", duration: "Durée affichée", shape: "Orientation",
  services: "Services", detailsLabel: "Libellé des détails", text: "Texte", detail: "Détails",
  standards: "Normes", products: "Produits", partnerships: "Offres", partners: "Partenaires",
  cta: "Bouton de contact", phoneLabel: "Libellé du téléphone", emailLabel: "Libellé de l’e-mail",
  addressLabel: "Libellé de l’adresse", address: "Adresse et horaires", email: "Adresse e-mail",
  phones: "Téléphones", number: "Numéro",
};

type FieldValue = string | FieldValue[] | { [key: string]: FieldValue };
type TrackUpload = (change: number, error?: string) => void;

function editable(value: unknown): FieldValue {
  return value as FieldValue;
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

function reorderButtons(index: number, length: number, onMove: (to: number) => void) {
  return (
    <>
      <button type="button" className={styles.iconButton} aria-label="Monter" title="Monter" disabled={index === 0} onClick={() => onMove(index - 1)}><ArrowUp size={17} /></button>
      <button type="button" className={styles.iconButton} aria-label="Descendre" title="Descendre" disabled={index === length - 1} onClick={() => onMove(index + 1)}><ArrowDown size={17} /></button>
    </>
  );
}

function mediaSource(value: FieldValue | undefined) {
  return typeof value === "string" && /^(https:\/\/|\/(images|media|api\/desi\/media)\/)/.test(value) ? value : undefined;
}

export function LoginForm() {
  const [error, action, pending] = useActionState(login, "");
  return (
    <form action={action}>
      <label>Mot de passe<input type="password" name="password" autoComplete="current-password" required /></label>
      <button disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

function MediaField({ label, value, onChange, markUpload, video }: {
  label: string; value: string; onChange: (value: string) => void; markUpload: TrackUpload; video: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    if (video && file.size > maxVideoBytes) {
      setError(`Choisissez une vidéo de ${maxVideoMegabytes} Mo maximum.`);
      return;
    }
    setUploading(true);
    markUpload(1);
    setError("");
    const data = new FormData();
    data.set(video ? "video" : "photo", file);
    let failure: string | undefined;
    try {
      const result = await (video ? uploadVideo(data) : uploadPhoto(data));
      if (result.url) onChange(result.url);
      else failure = result.error ?? "Le téléversement a échoué.";
    } catch {
      failure = "Le téléversement a échoué.";
    } finally {
      markUpload(-1, failure);
      setUploading(false);
    }
  }

  return (
    <div className={styles.photo}>
      <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={video ? "https://… ou /media/…" : "https://… ou /images/…"} /></label>
      {!video && mediaSource(value) && <img src={value} alt="" />}
      <label>{video ? `Téléverser une vidéo (MP4 ou WebM, ${maxVideoMegabytes} Mo maximum)` : "Téléverser une image"}
        <input type="file" accept={video ? ".mp4,.webm,video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} disabled={uploading} onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }} />
      </label>
      {uploading && <p role="status">Téléversement…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

type FieldProps = {
  name: string; value: FieldValue; template: FieldValue;
  onChange: (value: FieldValue) => void; markUpload: TrackUpload;
};

function Fields({ name, value, template, onChange, markUpload }: FieldProps) {
  const label = labels[name];
  if (typeof value === "string") {
    if (["logo", "photo", "image", "poster", "file"].includes(name)) {
      return <MediaField video={name === "file"} label={label} value={value} onChange={onChange} markUpload={markUpload} />;
    }
    if (name === "shape") {
      return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="wide">Paysage</option><option value="tall">Portrait</option>
      </select></label>;
    }
    if (["description", "metaDescription", "text", "detail", "standards", "address"].includes(name)) {
      return <label>{label}<textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
    }
    return <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
  }

  if (Array.isArray(value) && Array.isArray(template)) {
    return <EntryList name={name} value={value} template={template[0]} onChange={onChange} markUpload={markUpload} />;
  }

  return Object.entries(value).map(([key, item]) => (
    <Fields key={key} name={key} value={item} template={(template as Record<string, FieldValue>)[key]}
      markUpload={markUpload} onChange={(next) => onChange({ ...value, [key]: next })} />
  ));
}

function EntryList({ name, value, template, onChange, markUpload }: Omit<FieldProps, "value"> & { value: FieldValue[] }) {
  const [expanded, setExpanded] = useState<{ index: number; mode: "edit" | "preview" } | null>(null);
  const video = name === "videos";
  const panel = useRef<HTMLDivElement>(null);
  const focusNew = useRef(false);

  useEffect(() => {
    if (focusNew.current) {
      panel.current?.querySelector("input")?.focus();
      focusNew.current = false;
    }
  }, [value.length]);

  function toggle(index: number, mode: "edit" | "preview") {
    setExpanded(expanded?.index === index && expanded.mode === mode ? null : { index, mode });
  }

  return (
    <section className={styles.collection} aria-label={labels[name]}>
      <div className={video ? styles.videoToolbar : styles.collectionHeader}>
        {!video && <h2>{labels[name] ?? "Éléments"}</h2>}
        <button type="button" className={styles.primary} disabled={value.length >= 50} onClick={() => {
          focusNew.current = true;
          setExpanded({ index: value.length, mode: "edit" });
          onChange([...value, structuredClone(template)]);
        }}><Plus size={18} />{video ? "Ajouter une vidéo" : "Ajouter"}</button>
      </div>
      <div className={video ? styles.videoGrid : undefined}>
        <div className={styles.entries}>
          {value.length === 0 && <p className={styles.empty}>{video ? "Aucune vidéo pour le moment." : "Aucun élément pour le moment."}</p>}
          {value.map((item, index) => {
            const entry = typeof item === "object" && !Array.isArray(item) ? item : {};
            const title = entry.title || entry.name || entry.label || entry.number || (typeof item === "string" ? item : `Élément ${index + 1}`);
            const poster = mediaSource(entry.poster ?? entry.image ?? entry.logo);
            const source = mediaSource(entry.file);
            const editing = expanded?.index === index && expanded.mode === "edit";
            const previewing = expanded?.index === index && expanded.mode === "preview";
            return (
              <div className={styles.item} key={index}>
                <div className={styles.itemRow}>
                  {(video || poster) && <div className={styles.thumbnail}>
                    {poster ? <img src={poster} alt="" /> : <Clapperboard size={22} aria-hidden="true" />}
                  </div>}
                  <div className={styles.itemTitle}>
                    <strong>{typeof title === "string" ? title : `Élément ${index + 1}`}</strong>
                    {video && <span>{typeof entry.duration === "string" && entry.duration ? `${entry.duration} · ` : ""}{entry.shape === "tall" ? "Portrait" : "Paysage"}</span>}
                  </div>
                  <div className={styles.actions}>
                    {video && <button type="button" className={styles.iconButton} aria-label="Prévisualiser" title="Prévisualiser" aria-expanded={previewing} disabled={!source} onClick={() => toggle(index, "preview")}><Play size={17} /></button>}
                    <button type="button" className={styles.iconButton} aria-label="Modifier" title="Modifier" aria-expanded={editing} onClick={() => toggle(index, "edit")}><Pencil size={17} /></button>
                    {reorderButtons(index, value.length, (to) => {
                      if (expanded) {
                        if (expanded.index === index) setExpanded({ ...expanded, index: to });
                        else if (expanded.index === to) setExpanded({ ...expanded, index });
                      }
                      onChange(move(value, index, to));
                    })}
                    <button type="button" className={`${styles.iconButton} ${styles.danger}`} aria-label="Supprimer" title="Supprimer" onClick={() => {
                      if (expanded?.index === index) setExpanded(null);
                      else if (expanded && expanded.index > index) setExpanded({ ...expanded, index: expanded.index - 1 });
                      onChange(value.filter((_, position) => position !== index));
                    }}><Trash2 size={17} /></button>
                  </div>
                </div>
                {previewing && source && <div className={styles.itemBody}><video controls preload="metadata" src={source} poster={poster} aria-label={typeof title === "string" ? title : "Vidéo"} /></div>}
                {editing && <div ref={panel} className={styles.itemBody}>
                  <Fields name="entry" value={item} template={template} markUpload={markUpload} onChange={(next) =>
                    onChange(value.map((other, position) => position === index ? next : other))} />
                </div>}
              </div>
            );
          })}
        </div>
        {video && <aside className={styles.summary}>
          <h3>Bibliothèque vidéo</h3>
          <p><strong>{value.length}</strong> {value.length === 1 ? "vidéo" : "vidéos"}</p>
        </aside>}
      </div>
    </section>
  );
}

const EditorContext = createContext<{
  content: SiteContent;
  update: (key: EditorSection, value: FieldValue | SiteContent["sections"]) => void;
  markUpload: TrackUpload;
  busy: boolean;
} | null>(null);

export function AdminWorkspace({ initial, initialRevision, children }: { initial: SiteContent; initialRevision: number; children: ReactNode }) {
  const [content, setContent] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [published, setPublished] = useState(initial);
  const [pending, setPending] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const path = usePathname();
  const currentPage = adminPages.find(({ slug }) => path === `${adminBase}/${slug}`);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const dirty = content !== published;
  const busy = pending || uploads > 0;
  const markUpload: TrackUpload = (change, error) => {
    setUploads((current) => current + change);
    if (error) setMessage({ text: error, error: true });
    else if (change > 0) setMessage(null);
  };

  useEffect(() => {
    if (!dirty && !busy) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  function update(key: EditorSection, value: FieldValue | SiteContent["sections"]) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      const result = await publish(content, revision);
      if (result.error) setMessage({ text: result.error, error: true });
      else if (result.revision !== undefined) {
        setRevision(result.revision);
        setPublished(content);
        setMessage({ text: "Modifications publiées.", error: false });
      }
    } catch {
      setMessage({ text: "La publication a échoué. Réessayez.", error: true });
    } finally {
      setPending(false);
    }
  }

  const navigation = (
    <nav aria-label="Administration" className={styles.navigation}>
      {Array.from(new Set(adminPages.map(({ group }) => group))).map((group) => (
        <div key={group}>
          <p>{group}</p>
          {adminPages.filter((page) => page.group === group).map(({ slug, title, icon: Icon }) => (
            <Link key={slug} href={`${adminBase}/${slug}`} aria-current={currentPage?.slug === slug ? "page" : undefined}
              onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}>
              <Icon size={18} aria-hidden="true" />{title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <EditorContext.Provider value={{ content, update, markUpload, busy }}>
      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <Link className={styles.brand} href={`${adminBase}/tableau-de-bord`}>
            <span className={styles.brandMark}>ST</span><span>SubliTunis<small>Administration</small></span>
          </Link>
          {navigation}
        </aside>
        <div className={styles.workspace}>
          <header className={styles.top}>
            <details className={styles.mobileMenu} ref={mobileMenu} onKeyDown={(event) => {
              if (event.key === "Escape" && mobileMenu.current?.open) {
                mobileMenu.current.open = false;
                mobileMenu.current.querySelector("summary")?.focus();
              }
            }}>
              <summary aria-label="Menu d’administration"><Menu size={22} /></summary>
              {navigation}
            </details>
            <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}>
              <Link href={`${adminBase}/tableau-de-bord`}>Administration</Link><ChevronRight size={14} aria-hidden="true" />
              <span aria-current="page">{currentPage?.title}</span>
            </nav>
            <div className={styles.actions}>
              <a className={styles.siteLink} href="/" aria-label="Voir le site"><span>Voir le site</span><ArrowUpRight size={16} aria-hidden="true" /></a>
              <form action={logout} onSubmit={(event) => {
                if ((dirty || busy) && !window.confirm("Quitter sans publier les modifications ?")) event.preventDefault();
              }}>
                <button type="submit" className={styles.iconButton} aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={18} /></button>
              </form>
            </div>
          </header>
          <main className={styles.main}>
            <div className={styles.pageHeading}><h1>{currentPage?.title}</h1></div>
            {children}
          </main>
          <div className={styles.save}>
            <span role={message?.error ? "alert" : "status"} className={message?.error ? styles.error : undefined}>
              {pending ? "Publication…" : uploads > 0 ? "Téléversement en cours…" : message?.text || (dirty ? "Modifications non publiées" : "Contenu publié")}
            </span>
            <button type="button" className={styles.primary} disabled={busy || !dirty} onClick={save}>
              <Check size={18} aria-hidden="true" />{pending ? "Publication…" : "Publier les modifications"}
            </button>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
}

export function SectionEditor({ section }: { section: EditorSection }) {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error("SectionEditor requires AdminWorkspace");
  const { content, update, markUpload, busy } = editor;
  if (section === "sections") {
    return (
      <fieldset className={styles.editor} disabled={busy}>
        <legend>Ordre et visibilité</legend>
        {content.sections.map(({ section, visible }, index) => (
          <div className={styles.sectionRow} key={section}>
            <label><input type="checkbox" checked={visible} onChange={(event) => {
              const checked = event.target.checked;
              update("sections", content.sections.map((entry) =>
                entry.section === section ? { ...entry, visible: checked } : entry));
            }} /> {labels[section]}</label>
            <div className={styles.actions}>{reorderButtons(index, content.sections.length, (to) =>
              update("sections", move(content.sections, index, to)))}</div>
          </div>
        ))}
      </fieldset>
    );
  }

  if (section === "films") {
    const { videos, ...headings } = content.films;
    return (
      <fieldset className={styles.editor} aria-label="Gestion des vidéos" disabled={busy}>
        <EntryList name="videos" value={editable(videos) as FieldValue[]} template={editable(defaultContent.films.videos[0])}
          markUpload={markUpload} onChange={(next) => update("films", { ...headings, videos: next })} />
        <details className={styles.videoHeadings}>
          <summary>Texte de la section publique</summary>
          <Fields name="films" value={headings} template={editable(defaultContent.films)} markUpload={markUpload}
            onChange={(next) => update("films", { ...(next as typeof headings), videos })} />
        </details>
      </fieldset>
    );
  }

  return (
    <fieldset className={styles.editor} aria-label={labels[section]} disabled={busy}>
      <Fields key={section} name={section} value={editable(content[section])} template={editable(defaultContent[section])}
        markUpload={markUpload} onChange={(next) => update(section, next)} />
    </fieldset>
  );
}
