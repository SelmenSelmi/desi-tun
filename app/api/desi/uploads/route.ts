import { isAdmin } from "../../../../lib/desi-auth";
import { maxVideoBytes } from "../../../../lib/media-limits";
import { beginMediaUpload, finishMediaUpload } from "../../../../lib/site-store";

export async function POST(request: Request) {
  if (!(await isAdmin()) || request.headers.get("sec-fetch-site") !== "same-origin") return new Response(null, { status: 403 });
  const data = await request.json().catch(() => null);
  if (!data || !Number.isSafeInteger(data.size) || data.size < 16 || data.size > maxVideoBytes ||
    !["video/mp4", "video/webm"].includes(data.mime)) return new Response(null, { status: 400 });
  const id = await beginMediaUpload(data.mime, data.size);
  return Response.json({ id });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin()) || request.headers.get("sec-fetch-site") !== "same-origin") return new Response(null, { status: 403 });
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== "string" || !/^[a-f0-9-]{36}$/.test(data.id)) return new Response(null, { status: 400 });
  if (!(await finishMediaUpload(data.id))) return new Response(null, { status: 400 });
  return Response.json({ url: `/api/desi/media/${data.id}` });
}
