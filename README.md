# desi-tun

SubliTunis public website and content dashboard.

## Run locally

Use Node.js 24 or later. Install dependencies with `bun install --frozen-lockfile` and run `bun run dev`. The Next.js server runs on Node.js.

On Windows without Bun, run `npm.cmd install` followed by `npm.cmd run dev` in PowerShell, then open http://localhost:3000. The `.cmd` form also works when PowerShell script execution is disabled.

Add these variables in `.env.local` for local development or in the production server environment.

| Variable | Purpose |
| --- | --- |
| `DESI_ADMIN_PASSWORD` | Dashboard password. Use a random secret of at least 24 characters. Generate one with `openssl rand -hex 32`. |
| `DESI_DATABASE_PATH` | SQLite file path. Defaults to `.desi/site.sqlite` locally. Set an absolute path on a persistent writable volume in production. |

## Dashboard

Open `/login-desi` and sign in. The dashboard shows page views today (UTC), over the last seven days, and since tracking began. It counts browser page loads on the public landing page and its French alias, including reloads.

Use the dashboard to edit text, navigation, contact details, SEO, photos and logos, video sources and posters, and lists such as products and services. Upload JPEG, PNG, or WebP images up to 5 MB or use an HTTPS media URL. Upload MP4 or WebM videos up to 200 MiB on a compatible server or use an HTTPS video URL. You can reorder or hide existing sections and add, remove, or reorder their list entries. Click **Publier les modifications** to apply edits.

For production, run `bun run build` and `bun run start` behind HTTPS on a Node.js server with one persistent local volume. SQLite stores the published content, media uploads, and aggregated views. Include the database in backups using SQLite's backup mechanism. This storage setup requires a persistent server filesystem. Set any reverse proxy request body limit to at least 201 MiB to allow video uploads.

Vercel Functions impose a smaller request limit, so the current upload flow cannot accept large files there. Use an HTTPS video URL on Vercel until direct-to-object-storage uploads are configured.

On Vercel, the public site serves the bundled content and assets. Dashboard publishing, uploaded media, and visit tracking require persistent storage and are disabled there. Keep Vercel's system environment variables exposed so the application can detect `VERCEL=1`. A SQLite file in `/tmp` cannot preserve dashboard changes between instances or deployments.
