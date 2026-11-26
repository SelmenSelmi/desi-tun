import type { Metadata } from "next";
import { adminPassword, isAdmin } from "../../lib/desi-auth";
import { readSite, readVisits } from "../../lib/site-store";
import { logout } from "./actions";
import { LoginForm, SiteEditor } from "./editor";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration | SubliTunis",
  robots: { index: false, follow: false },
};

export default async function DesiDashboard() {
  const authenticated = await isAdmin();
  if (!authenticated) {
    return (
      <main className={styles.login}>
        <a href="/">← Retour au site</a>
        <h1>Administration</h1>
        {adminPassword() ? <LoginForm /> : <p>L’accès administrateur doit être configuré sur le serveur.</p>}
      </main>
    );
  }

  const { total, today, week } = readVisits();
  const { content, revision } = readSite();
  return (
    <main className={styles.dashboard}>
      <div className={styles.top}>
        <div><a href="/">← Voir le site</a><h1>Administration</h1></div>
        <form action={logout}><button>Se déconnecter</button></form>
      </div>
      <h2>Pages vues</h2>
      <dl className={styles.metrics}>
        {[["Aujourd’hui (UTC)", today], ["7 derniers jours", week], ["Total", total]].map(([label, count]) => (
          <div key={label}><dt>{label}</dt><dd>{Number(count).toLocaleString("fr-FR")}</dd></div>
        ))}
      </dl>
      <SiteEditor initial={content} initialRevision={revision} />
    </main>
  );
}
