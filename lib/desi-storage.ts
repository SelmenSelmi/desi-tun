export function hasPersistentStorage() {
  // Vercel Functions cannot share a writable SQLite file across instances.
  return process.env.VERCEL !== "1" || Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}
