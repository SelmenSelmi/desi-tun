import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdmin } from "../../../lib/desi-auth";
import { readSite } from "../../../lib/site-store";
import { AdminWorkspace } from "../editor";

export const metadata: Metadata = {
  title: "Administration | SubliTunis",
  robots: { index: false, follow: false },
};

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/login-desi");
  const { content, revision } = await readSite();
  return <AdminWorkspace initial={content} initialRevision={revision}>{children}</AdminWorkspace>;
}
