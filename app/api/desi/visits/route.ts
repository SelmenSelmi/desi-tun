import { recordVisit } from "../../../../lib/site-store";

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") !== "same-origin") {
    return new Response(null, { status: 403 });
  }
  await recordVisit();
  return new Response(null, { status: 204 });
}
