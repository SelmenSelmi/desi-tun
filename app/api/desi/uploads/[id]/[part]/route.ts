import { isAdmin } from "../../../../../../lib/desi-auth";
import { mediaChunkBytes } from "../../../../../../lib/media-limits";
import { writeMediaChunk } from "../../../../../../lib/site-store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; part: string }> }) {
  if (!(await isAdmin()) || request.headers.get("sec-fetch-site") !== "same-origin") return new Response(null, { status: 403 });
  const { id, part } = await params;
  const length = Number(request.headers.get("content-length"));
  if (!/^[a-f0-9-]{36}$/.test(id) || !/^\d+$/.test(part) || !length || length > mediaChunkBytes) return new Response(null, { status: 400 });
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length !== length || !(await writeMediaChunk(id, Number(part), bytes))) return new Response(null, { status: 400 });
  return new Response(null, { status: 204 });
}
