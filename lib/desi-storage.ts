export function hasPersistentStorage() {
  // Vercel Functions cannot share a writable SQLite file across instances.
  return process.env.VERCEL !== "1";
}
