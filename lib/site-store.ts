import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { hasPersistentStorage } from "./desi-storage";
import { defaultContent, type SiteContent } from "./site-content";

let database: Client | undefined;
let initialization: Promise<void> | undefined;

async function db() {
  if (database && initialization) { await initialization; return database; }
  const path = resolve(/* turbopackIgnore: true */ process.env.DESI_DATABASE_PATH || ".desi/site.sqlite");
  if (!process.env.TURSO_DATABASE_URL) mkdirSync(dirname(path), { recursive: true });
  const connection = createClient({ url: process.env.TURSO_DATABASE_URL || `file:${path}`, authToken: process.env.TURSO_AUTH_TOKEN });
  database = connection;
  initialization = connection.batch([
    "CREATE TABLE IF NOT EXISTS site (id INTEGER PRIMARY KEY, content TEXT, revision INTEGER NOT NULL)",
    "INSERT OR IGNORE INTO site VALUES (1, NULL, 0)",
    "CREATE TABLE IF NOT EXISTS visits (day TEXT PRIMARY KEY, count INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes BLOB NOT NULL)",
  ], "write").then(() => {}).catch((error) => { database = undefined; initialization = undefined; throw error; });
  await initialization;
  return connection;
}

function validUrl(value: string, anchor: boolean) {
  if (anchor && /^#[\w-]+$/.test(value)) return true;
  if (/^\/(images|media)\/[\w./-]+$/.test(value) && !value.includes("..")) return true;
  if (/^\/api\/desi\/media\/[a-f0-9-]{36}$/.test(value)) return true;
  return /^https:\/\/[^\s\\]+$/i.test(value) && URL.canParse(value);
}

function matches(value: unknown, template: unknown, key = ""): boolean {
  if (typeof template === "string") {
    if (typeof value !== "string" || value.length > 3000) return false;
    if (["logo", "photo", "image", "poster", "file", "link"].includes(key)) {
      return ((key === "logo" || key === "poster") && template === "" && value === "")
        || (key === "poster" && value === "") || validUrl(value, key === "link");
    }
    if (key === "shape") return value === "wide" || value === "tall";
    if (key === "email") return /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(value);
    return true;
  }
  if (typeof template === "boolean") return typeof value === "boolean";
  if (Array.isArray(template)) {
    return Array.isArray(value) && value.length <= 50
      && value.every((item) => matches(item, template[0]));
  }
  if (!value || !template || typeof value !== "object" || typeof template !== "object" || Array.isArray(value)) return false;
  const fields = Object.entries(template);
  return Object.keys(value).length === fields.length
    && fields.every(([field, example]) => {
      const item = (value as Record<string, unknown>)[field];
      return field === "logo" && key === "" && item === "" && "name" in template
        || matches(item, example, field);
    });
}

export async function readSite() {
  if (!hasPersistentStorage()) return { content: defaultContent, revision: 0 };
  const row = (await (await db()).execute("SELECT content, revision FROM site WHERE id = 1")).rows[0];
  return { content: row.content ? JSON.parse(String(row.content)) as SiteContent : defaultContent, revision: Number(row.revision) };
}

export async function writeSite(content: SiteContent, revision: number) {
  if (!matches(content, defaultContent)) return "Vérifiez les adresses, les liens et les champs du formulaire.";
  const order = new Set(content.sections.map(({ section }) => section));
  if (content.sections.length !== defaultContent.sections.length
    || !defaultContent.sections.every(({ section }) => order.has(section))) {
    return "La liste des sections est invalide.";
  }
  const result = await (await db()).execute({ sql: "UPDATE site SET content = ?, revision = revision + 1 WHERE id = 1 AND revision = ?", args: [JSON.stringify(content), revision] });
  if (!result.rowsAffected) return "Une autre session a publié des changements. Rechargez la page avant de publier.";
}

export async function recordVisit() {
  if (!hasPersistentStorage()) return;
  await (await db()).execute(`INSERT INTO visits VALUES (date('now'), 1)
    ON CONFLICT(day) DO UPDATE SET count = count + 1`);
}

export async function readVisits() {
  const row = (await (await db()).execute(`SELECT coalesce(sum(count), 0) AS total,
    coalesce(sum(CASE WHEN day = date('now') THEN count END), 0) AS today,
    coalesce(sum(CASE WHEN day >= date('now', '-6 day') THEN count END), 0) AS week FROM visits`)).rows[0];
  return { total: Number(row.total), today: Number(row.today), week: Number(row.week) };
}

export async function insertMedia(mime: string, bytes: Uint8Array) {
  const id = randomUUID();
  await (await db()).execute({ sql: "INSERT INTO media VALUES (?, ?, ?)", args: [id, mime, Buffer.from(bytes)] });
  return `/api/desi/media/${id}`;
}

export async function readMediaInfo(id: string) {
  if (!hasPersistentStorage()) return undefined;
  const row = (await (await db()).execute({ sql: "SELECT mime, length(bytes) AS size FROM media WHERE id = ?", args: [id] })).rows[0];
  return row ? { mime: String(row.mime), size: Number(row.size) } : undefined;
}

export async function readMediaBytes(id: string, start: number, length: number) {
  const row = (await (await db()).execute({ sql: "SELECT substr(bytes, ?, ?) AS bytes FROM media WHERE id = ?", args: [start + 1, length, id] })).rows[0];
  return new Uint8Array(row.bytes as ArrayBuffer);
}
