import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "desi_session";
const duration = 60 * 60 * 8;

export function adminPassword() {
  const password = process.env.DESI_ADMIN_PASSWORD;
  return password && password.length >= 24 ? password : undefined;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function signature(expires: string, password: string) {
  return createHmac("sha256", password).update(`desi-session:${expires}`).digest("hex");
}

export async function isAdmin() {
  const password = adminPassword();
  const token = (await cookies()).get(cookieName)?.value;
  if (!password || !token) return false;
  const [expires, mac] = token.split(".");
  return /^\d+$/.test(expires) && Number(expires) > Date.now() && !!mac
    && timingSafeEqual(hash(mac), hash(signature(expires, password)));
}

export async function startSession(candidate: string) {
  const password = adminPassword();
  if (!password || !timingSafeEqual(hash(candidate), hash(password))) return false;
  const expires = String(Date.now() + duration * 1000);
  (await cookies()).set(cookieName, `${expires}.${signature(expires, password)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: duration,
  });
  return true;
}

export async function endSession() {
  (await cookies()).delete(cookieName);
}
