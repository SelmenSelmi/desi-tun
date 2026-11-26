import { readMediaBytes, readMediaInfo } from "../../../../../lib/site-store";

type Context = { params: Promise<{ id: string }> };

function parseRange(value: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(value);
  if (!match || (!match[1] && !match[2])) return null;

  const start = match[1] ? Number(match[1]) : Math.max(size - Number(match[2]), 0);
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start <= end ? { start, end } : null;
}

async function serve(request: Request, { params }: Context) {
  const { id } = await params;
  const media = readMediaInfo(id);
  if (!media) return new Response(null, { status: 404 });

  const headers = new Headers({
    "Content-Type": media.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  const requested = request.method === "GET" && !request.headers.has("if-range")
    ? request.headers.get("range")
    : null;
  const range = requested ? parseRange(requested, media.size) : null;
  if (requested && !range) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${media.size}`, "Accept-Ranges": "bytes" },
    });
  }

  const start = range?.start ?? 0;
  const length = range ? range.end - start + 1 : media.size;
  headers.set("Content-Length", String(length));
  if (range) headers.set("Content-Range", `bytes ${start}-${range.end}/${media.size}`);
  const body = request.method === "HEAD" ? null : readMediaBytes(id, start, length);
  return new Response(body, { status: range ? 206 : 200, headers });
}

export const GET = serve;
export const HEAD = serve;
