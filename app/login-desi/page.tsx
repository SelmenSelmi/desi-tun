import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminPassword, isAdmin } from "../../lib/desi-auth";
import { LoginForm } from "./editor";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration | SubliTunis",
  robots: { index: false, follow: false },
};

export default async function DesiDashboard() {
  if (await isAdmin()) redirect("/login-desi/tableau-de-bord");
  return (
    <main className={styles.login}>
      <div className={styles.loginCard}>
        <Link href="/">← Retour au site</Link>
        <h1>SubliTunis</h1>
        <p>Connectez-vous à votre espace d’administration.</p>
        {adminPassword() ? <LoginForm /> : <p>L’accès administrateur doit être configuré sur le serveur.</p>}
      </div>
    </main>
  );
}
