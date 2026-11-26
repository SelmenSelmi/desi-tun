import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, Eye, TrendingUp } from "lucide-react";
import { isAdmin } from "../../../../lib/desi-auth";
import { readVisits } from "../../../../lib/site-store";
import { SectionEditor } from "../../editor";
import { adminBase, adminPages } from "../../navigation";
import styles from "../../dashboard.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = adminPages.find((item) => item.slug === slug);
  return page ? { title: `${page.title} | SubliTunis` } : {};
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = adminPages.find((item) => item.slug === slug);
  if (!page) notFound();
  if (!(await isAdmin())) redirect(adminBase);

  if (page.section) return <SectionEditor section={page.section} />;

  const { today, week, total } = readVisits();
  const metrics = [
    { label: "Aujourd’hui (UTC)", value: today, icon: Eye },
    { label: "7 derniers jours", value: week, icon: CalendarDays },
    { label: "Depuis le début", value: total, icon: TrendingUp },
  ];
  return (
    <>
      <h2 className={styles.sectionHeading}>Pages vues</h2>
      <dl className={styles.metrics}>
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <span className={styles.metricIcon}><Icon size={19} aria-hidden="true" /></span>
            <dt>{label}</dt>
            <dd>{value.toLocaleString("fr-FR")}</dd>
          </div>
        ))}
      </dl>
      <h2 className={styles.sectionHeading}>Accès rapides</h2>
      <div className={styles.quickLinks}>
        {adminPages.filter(({ slug }) => ["sections", "videos", "produits"].includes(slug)).map(({ slug, title, icon: Icon }) => (
          <Link key={slug} href={`${adminBase}/${slug}`}>
            <Icon size={19} aria-hidden="true" /> {title} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </>
  );
}
