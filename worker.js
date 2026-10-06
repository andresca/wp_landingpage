// Cloudflare Worker entry: /api/contact runs the contact function,
// everything else is served from the static assets.
import { onRequestPost } from "./functions/api/contact.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
      return onRequestPost({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
