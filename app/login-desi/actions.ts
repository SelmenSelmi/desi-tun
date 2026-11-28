"use server";

import { redirect } from "next/navigation";
import { endSession, isAdmin, startSession } from "../../lib/desi-auth";
import { insertMedia, writeSite } from "../../lib/site-store";
import type { SiteContent } from "../../lib/site-content";
import { maxVideoBytes, maxVideoMegabytes } from "../../lib/media-limits";

export async function login(_state: string, data: FormData) {
  const password = data.get("password");
  if (typeof password !== "string" || !(await startSession(password))) return "Mot de passe incorrect.";
  redirect("/login-desi/tableau-de-bord");
}

export async function logout() {
  await endSession();
  redirect("/login-desi");
}

export async function publish(content: SiteContent, revision: number) {
  if (!(await isAdmin())) return { error: "Session expirée. Reconnectez-vous." };
  const error = await writeSite(content, revision);
  return error ? { error } : { revision: revision + 1 };
}

export async function uploadPhoto(data: FormData) {
  if (!(await isAdmin())) return { error: "Session expirée. Reconnectez-vous." };
  const file = data.get("photo");
  if (!(file instanceof File) || file.size < 12 || file.size > 5 * 1024 * 1024) {
    return { error: "Choisissez une image de 5 Mo maximum." };
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const format = bytes.subarray(0, 12);
  const mime = format.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? "image/jpeg"
    : format.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
    : format.toString("ascii", 0, 4) === "RIFF" && format.toString("ascii", 8) === "WEBP" ? "image/webp"
    : null;
  if (!mime) return { error: "Formats acceptés : JPEG, PNG et WebP." };
  return { url: await insertMedia(mime, bytes) };
}

export async function uploadVideo(data: FormData) {
  if (!(await isAdmin())) return { error: "Session expirée. Reconnectez-vous." };
  const file = data.get("video");
  if (!(file instanceof File) || file.size < 16 || file.size > maxVideoBytes) {
    return { error: `Choisissez une vidéo de ${maxVideoMegabytes} Mo maximum.` };
  }

  const header = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const mime = header.toString("ascii", 4, 8) === "ftyp"
    && header.toString("ascii", 8, 12) !== "qt  " && /\.mp4$/i.test(file.name)
    ? "video/mp4"
    : header.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) && /\.webm$/i.test(file.name)
      ? "video/webm"
      : null;
  if (!mime) return { error: "Formats acceptés : MP4 et WebM." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  return { url: await insertMedia(mime, bytes) };
}
