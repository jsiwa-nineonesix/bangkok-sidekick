// Bangkok Sidekick feedback collector.
// POST /        {stars 1-5, comment?, name?, ver?}  -> stores one row (from the app's origin only)
// GET  /export  Authorization: Bearer <ADMIN_KEY>  -> all feedback as JSON (for the owner)
const MAX_PER_DAY = 5;   // per IP

const json = (obj, status, origin) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json", ...(origin ? cors(origin) : {}) } });
const cors = origin => ({ "access-control-allow-origin": origin, "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type", "vary": "origin" });
const clean = (v, n) => typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n) : "";
const deviceOf = ua => /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android"
  : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Other";

async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get("origin") || "";
    const okOrigin = origin === env.ALLOWED_ORIGIN;

    if (url.pathname === "/export" && req.method === "GET") {
      const auth = req.headers.get("authorization") || "";
      if (!env.ADMIN_KEY || auth !== `Bearer ${env.ADMIN_KEY}`) return json({ error: "unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT id, ts, stars, comment, name, ver, device FROM feedback ORDER BY id DESC").all();
      return json({ count: results.length, feedback: results }, 200);
    }

    if (req.method === "OPTIONS") return okOrigin ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
    if (req.method !== "POST" || url.pathname !== "/") return json({ error: "not found" }, 404, okOrigin ? origin : "");
    if (!okOrigin) return json({ error: "forbidden" }, 403);

    let body;
    try { body = await req.json(); } catch { return json({ error: "bad json" }, 400, origin); }
    if (body.website) return json({ ok: true }, 200, origin);              // honeypot: bots fill hidden fields
    const stars = Number(body.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return json({ error: "stars must be 1-5" }, 400, origin);

    const ip = req.headers.get("cf-connecting-ip") || "";
    const iph = await sha(ip + "|" + (env.ADMIN_KEY || "salt") + "|" + new Date().toISOString().slice(0, 10));
    const since = new Date(Date.now() - 864e5).toISOString();
    await env.DB.prepare("UPDATE feedback SET iph = NULL WHERE iph IS NOT NULL AND ts < ?").bind(since).run();
    const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM feedback WHERE iph = ? AND ts >= ?").bind(iph, since).first();
    if (n >= MAX_PER_DAY) return json({ error: "Thanks! You've already sent a lot today." }, 429, origin);

    await env.DB.prepare("INSERT INTO feedback (ts, stars, comment, name, ver, device, iph) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(new Date().toISOString(), stars, clean(body.comment, 1000) || null, clean(body.name, 60) || null,
        clean(body.ver, 10) || null, deviceOf(req.headers.get("user-agent") || ""), iph).run();
    return json({ ok: true }, 200, origin);
  }
};
