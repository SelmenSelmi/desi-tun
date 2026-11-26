import { recordVisit } from "../../../../lib/site-store";

export function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") !== "same-origin") {
    return new Response(null, { status: 403 });
  }
  recordVisit();
  return new Response(null, { status: 204 });
}
