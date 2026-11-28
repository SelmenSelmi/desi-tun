import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { hasPersistentStorage } from "./desi-storage";
import { defaultContent, type SiteContent } from "./site-content";
import { mediaChunkBytes } from "./media-limits";

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
    "CREATE TABLE IF NOT EXISTS media_uploads (id TEXT PRIMARY KEY, mime TEXT NOT NULL, size INTEGER NOT NULL, complete INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)",
    "CREATE TABLE IF NOT EXISTS media_chunks (id TEXT NOT NULL, part INTEGER NOT NULL, bytes BLOB NOT NULL, PRIMARY KEY(id, part))",
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
  if (row) return { mime: String(row.mime), size: Number(row.size), chunked: false };
  const upload = (await (await db()).execute({ sql: "SELECT mime, size FROM media_uploads WHERE id = ? AND complete = 1", args: [id] })).rows[0];
  return upload ? { mime: String(upload.mime), size: Number(upload.size), chunked: true } : undefined;
}

export async function beginMediaUpload(mime: string, size: number) {
  const connection = await db();
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  await connection.batch([
    { sql: "DELETE FROM media_chunks WHERE id IN (SELECT id FROM media_uploads WHERE complete = 0 AND created < ?)", args: [cutoff] },
    { sql: "DELETE FROM media_uploads WHERE complete = 0 AND created < ?", args: [cutoff] },
  ], "write");
  const id = randomUUID();
  await connection.execute({ sql: "INSERT INTO media_uploads (id, mime, size, created) VALUES (?, ?, ?, ?)", args: [id, mime, size, Math.floor(Date.now() / 1000)] });
  return id;
}

export async function writeMediaChunk(id: string, part: number, bytes: Uint8Array) {
  const connection = await db();
  const upload = (await connection.execute({ sql: "SELECT size, mime FROM media_uploads WHERE id = ? AND complete = 0", args: [id] })).rows[0];
  if (!upload) return false;
  const size = Number(upload.size);
  const expected = Math.min(mediaChunkBytes, size - part * mediaChunkBytes);
  if (!Number.isSafeInteger(part) || part < 0 || expected <= 0 || bytes.length !== expected) return false;
  if (part === 0) {
    const header = Buffer.from(bytes.subarray(0, 16));
    const valid = upload.mime === "video/mp4"
      ? header.toString("ascii", 4, 8) === "ftyp" && header.toString("ascii", 8, 12) !== "qt  "
      : header.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (!valid) return false;
  }
  await connection.execute({ sql: "INSERT OR REPLACE INTO media_chunks (id, part, bytes) VALUES (?, ?, ?)", args: [id, part, Buffer.from(bytes)] });
  return true;
}

export async function finishMediaUpload(id: string) {
  const result = await (await db()).execute({
    sql: `UPDATE media_uploads SET complete = 1 WHERE id = ? AND complete = 0
      AND (SELECT COUNT(*) FROM media_chunks WHERE media_chunks.id = media_uploads.id) = CAST((size + ? - 1) / ? AS INTEGER)
      AND (SELECT COALESCE(SUM(length(bytes)), 0) FROM media_chunks WHERE media_chunks.id = media_uploads.id) = size`,
    args: [id, mediaChunkBytes, mediaChunkBytes],
  });
  return result.rowsAffected === 1;
}

export async function readChunkedMediaBytes(id: string, start: number, length: number) {
  const first = Math.floor(start / mediaChunkBytes);
  const last = Math.floor((start + length - 1) / mediaChunkBytes);
  const rows = (await (await db()).execute({
    sql: "SELECT bytes FROM media_chunks WHERE id = ? AND part BETWEEN ? AND ? ORDER BY part",
    args: [id, first, last],
  })).rows;
  if (rows.length !== last - first + 1) throw new Error("Missing media chunk");
  const data = Buffer.concat(rows.map((row) => Buffer.from(row.bytes as ArrayBuffer)));
  return new Uint8Array(data.subarray(start - first * mediaChunkBytes, start - first * mediaChunkBytes + length));
}

export async function readMediaBytes(id: string, start: number, length: number) {
  const row = (await (await db()).execute({ sql: "SELECT substr(bytes, ?, ?) AS bytes FROM media WHERE id = ?", args: [start + 1, length, id] })).rows[0];
  return new Uint8Array(row.bytes as ArrayBuffer);
}
