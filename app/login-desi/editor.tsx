"use client";

import { useActionState, useState } from "react";
import { defaultContent, type SiteContent } from "../../lib/site-content";
import { login, publish, uploadPhoto, uploadVideo } from "./actions";
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
      <button type="button" disabled={index === 0} onClick={() => onMove(index - 1)}>Monter</button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(index + 1)}>Descendre</button>
    </>
  );
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
  label: string; value: string; onChange: (value: string) => void; markUpload: (change: number) => void; video: boolean;
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
    try {
      const result = await (video ? uploadVideo(data) : uploadPhoto(data));
      if (result.url) onChange(result.url);
      else setError(result.error ?? "Le téléversement a échoué.");
    } catch {
      setError("Le téléversement a échoué.");
    } finally {
      markUpload(-1);
      setUploading(false);
    }
  }

  return (
    <div className={styles.photo}>
      <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={video ? "https://… ou /media/…" : "https://… ou /images/…"} /></label>
      {!video && /^(https:\/\/|\/(images|media|api\/desi\/media)\/)/.test(value) && <img src={value} alt="" />}
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

function Fields({ name, value, template, onChange, markUpload }: {
  name: string; value: FieldValue; template: FieldValue;
  onChange: (value: FieldValue) => void; markUpload: (change: number) => void;
}) {
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
    return (
      <fieldset>
        <legend>{label}</legend>
        {value.map((item, index) => (
          <div className={styles.item} key={index}>
            <Fields name="" value={item} template={template[0]} markUpload={markUpload} onChange={(next) => {
              onChange(value.map((entry, position) => position === index ? next : entry));
            }} />
            <div className={styles.actions}>
              {reorderButtons(index, value.length, (to) => onChange(move(value, index, to)))}
              <button type="button" onClick={() => onChange(value.filter((_, position) => position !== index))}>Supprimer</button>
            </div>
          </div>
        ))}
        <button type="button" disabled={value.length >= 50} onClick={() => onChange([...value, structuredClone(template[0])])}>Ajouter</button>
      </fieldset>
    );
  }

  return Object.entries(value).map(([key, item]) => (
    <Fields key={key} name={key} value={item} template={(template as Record<string, FieldValue>)[key]}
      markUpload={markUpload} onChange={(next) => onChange({ ...value, [key]: next })} />
  ));
}

export function SiteEditor({ initial, initialRevision }: { initial: SiteContent; initialRevision: number }) {
  const [content, setContent] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [published, setPublished] = useState(initial);
  const [active, setActive] = useState<keyof Omit<SiteContent, "sections">>("general");
  const [pending, setPending] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState("");
  const markUpload = (change: number) => setUploads((current) => current + change);

  async function save() {
    setPending(true);
    setMessage("");
    try {
      const result = await publish(content, revision);
      if (result.error) setMessage(result.error);
      else if (result.revision !== undefined) {
        setRevision(result.revision);
        setPublished(content);
        setMessage("Modifications publiées.");
      }
    } catch {
      setMessage("La publication a échoué. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h2>Contenu du site</h2>
      <fieldset className={styles.editor} disabled={pending || uploads > 0}>
        <legend>Ordre et visibilité des sections</legend>
        {content.sections.map(({ section, visible }, index) => (
          <div className={styles.sectionRow} key={section}>
            <label><input type="checkbox" checked={visible} onChange={(event) => {
              const checked = event.target.checked;
              setContent((current) => ({ ...current, sections: current.sections.map((entry) =>
                entry.section === section ? { ...entry, visible: checked } : entry) }));
            }} /> {labels[section]}</label>
            <div className={styles.actions}>{reorderButtons(index, content.sections.length, (to) =>
              setContent((current) => ({ ...current, sections: move(current.sections, index, to) })))}</div>
          </div>
        ))}
      </fieldset>
      <fieldset className={styles.editor} disabled={pending || uploads > 0}>
        <legend>Modifier le contenu</legend>
        <label>Section<select value={active} onChange={(event) => setActive(event.target.value as typeof active)}>
          <option value="general">{labels.general}</option>
          {content.sections.map(({ section }) => <option key={section} value={section}>{labels[section]}</option>)}
        </select></label>
        <Fields key={active} name={active} value={editable(content[active])} template={editable(defaultContent[active])}
          markUpload={markUpload} onChange={(next) => setContent((current) => ({ ...current, [active]: next }))} />
      </fieldset>
      <div className={styles.save}>
        <button type="button" disabled={pending || uploads > 0 || content === published} onClick={save}>
          {pending ? "Publication…" : "Publier les modifications"}
        </button>
        <span role="status">{message || (content !== published ? "Modifications non publiées" : "")}</span>
      </div>
    </>
  );
}
