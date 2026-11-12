// Bangkok Sidekick: private access-card check-in service (Cloudflare Worker + D1).
// Nothing about people or cards is stored in the public site; the browser only gets data after a PIN login.

interface D1Stmt {
  bind(...v: unknown[]): D1Stmt;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1 {
  prepare(q: string): D1Stmt;
  batch(s: D1Stmt[]): Promise<unknown[]>;
}
interface Env {
  DB: D1;
  ALLOWED_ORIGIN: string; // comma-separated list of allowed site origins
  TOKEN_SECRET: string; // secret
  PIN_PEPPER: string; // secret
}
interface Person {
  id: string;
  name: string;
  label: string | null;
  contact: string | null;
  role: "rte" | "sm" | "viewer";
  spoc: number;
  group_id: string | null;
  pin_hash: string;
}

// Step 1 is implicit ("created", done for everyone). Steps 2-5 are tracked.
const STEPS = [
  { n: 1, label: "Access card created", short: "Created", who: "Done for everyone" },
  { n: 2, label: "Access card given to buddy", short: "With buddy", who: "Buddy (SM) or RTE" },
  { n: 3, label: "Buddy returned card to SPOC", short: "At SPOC", who: "SM / SPOC or RTE" },
  { n: 4, label: "SPOC returned card to RTE", short: "Back to RTE", who: "SM / SPOC or RTE" },
  { n: 5, label: "RTE confirmed receipt", short: "Received", who: "RTE only" },
];

const TOKEN_HOURS = 12;
const MAX_FAILS = 8; // wrong PINs per IP per 10 minutes
const MAX_BODY = 20000;
const MAX_IDS = 200;

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const b64u = (b: ArrayBuffer | string) => {
  const bytes = typeof b === "string" ? enc.encode(b) : new Uint8Array(b);
  let s = "";
  bytes.forEach((c) => (s += String.fromCharCode(c)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const sha256 = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const hmac = async (secret: string, data: string) => {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
};
const safeEq = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

function allowedOrigin(req: Request, env: Env): string | null {
  const o = req.headers.get("Origin");
  if (!o) return null;
  return env.ALLOWED_ORIGIN.split(",").map((s) => s.trim()).includes(o) ? o : null;
}
function respond(origin: string | null, body: unknown, status = 200): Response {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
  if (origin) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  }
  return new Response(body === null ? null : JSON.stringify(body), { status, headers: h });
}

async function pinHash(env: Env, personId: string, pin: string) {
  return sha256(`${env.PIN_PEPPER}:${personId}:${pin}`);
}
async function makeToken(env: Env, personId: string) {
  const payload = b64u(JSON.stringify({ sub: personId, exp: Date.now() + TOKEN_HOURS * 3600_000 }));
  return `${payload}.${await hmac(env.TOKEN_SECRET, payload)}`;
}
async function authed(req: Request, env: Env): Promise<Person | null> {
  const m = /^Bearer ([\w-]+)\.([\w-]+)$/.exec(req.headers.get("Authorization") ?? "");
  if (!m) return null;
  if (!safeEq(await hmac(env.TOKEN_SECRET, m[1]), m[2])) return null;
  try {
    const p = JSON.parse(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))) as { sub: string; exp: number };
    if (!p.sub || p.exp < Date.now()) return null;
    return await env.DB.prepare("SELECT * FROM people WHERE id = ?").bind(p.sub).first<Person>();
  } catch {
    return null;
  }
}

// Who may change which step. RTE: steps 2-5 anywhere. SPOC (an SM with the SPOC flag): steps 2-4 anywhere.
// Other SMs: steps 2-4 for their own group only. Viewers: nothing.
function canEdit(p: Person, groupId: string, step: number): boolean {
  if (step < 2 || step > 5) return false;
  if (p.role === "rte") return true;
  if (p.role === "sm" && step <= 4) return p.spoc === 1 || p.group_id === groupId;
  return false;
}
const mySteps = (p: Person) => [2, 3, 4, 5].filter((s) => p.role === "rte" || (p.role === "sm" && s <= 4));

function publicMe(p: Person) {
  return { id: p.id, name: p.name, label: p.label, role: p.role, spoc: p.spoc === 1, groupId: p.group_id, steps: mySteps(p), scope: p.role === "rte" || p.spoc === 1 ? "all" : p.role === "sm" ? "group" : "none" };
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return null;
  try {
    const j = JSON.parse(raw);
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function login(req: Request, env: Env, origin: string | null): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
  const since = Date.now() - 10 * 60_000;
  await env.DB.prepare("DELETE FROM login_attempts WHERE at < ?").bind(since).run();
  const c = await env.DB.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND at > ?").bind(ip, since).first<{ n: number }>();
  if ((c?.n ?? 0) >= MAX_FAILS) return respond(origin, { error: "Too many wrong PINs. Please wait 10 minutes." }, 429);

  const body = await readJson(req);
  const pin = String(body?.pin ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  let found: Person | null = null;
  if (pin.length >= 4 && pin.length <= 16) {
    const people = (await env.DB.prepare("SELECT * FROM people").all<Person>()).results;
    for (const p of people) if (safeEq(await pinHash(env, p.id, pin), p.pin_hash)) found = p;
  }
  if (!found) {
    await env.DB.prepare("INSERT INTO login_attempts (ip, at) VALUES (?, ?)").bind(ip, Date.now()).run();
    return respond(origin, { error: "That PIN was not recognised." }, 401);
  }
  return respond(origin, { token: await makeToken(env, found.id), me: publicMe(found) });
}

async function state(env: Env, me: Person, origin: string | null): Promise<Response> {
  const [groups, visitors, steps, people, audit] = await Promise.all([
    env.DB.prepare("SELECT g.id AS gid, p.id AS pid, p.name, p.label, p.contact, p.role, p.spoc FROM groups g JOIN people p ON p.id = g.buddy_id ORDER BY g.sort").all<{ gid: string; pid: string; name: string; label: string | null; contact: string | null; role: string; spoc: number }>(),
    env.DB.prepare("SELECT id, group_id, name, company, team, art, country FROM visitors ORDER BY group_id, sort").all<{ id: string; group_id: string; name: string; company: string; team: string; art: string; country: string }>(),
    env.DB.prepare("SELECT visitor_id, step, at, by_id FROM steps").all<{ visitor_id: string; step: number; at: string; by_id: string }>(),
    env.DB.prepare("SELECT id, name FROM people").all<{ id: string; name: string }>(),
    env.DB.prepare("SELECT a.at, a.step, a.done, v.name AS visitor, p.name AS by_name FROM audit a LEFT JOIN visitors v ON v.id = a.visitor_id LEFT JOIN people p ON p.id = a.by_id ORDER BY a.id DESC LIMIT 15").all<{ at: string; step: number; done: number; visitor: string; by_name: string }>(),
  ]);
  const names = new Map(people.results.map((p) => [p.id, p.name]));
  const byVisitor = new Map<string, Record<number, { at: string; by: string }>>();
  for (const s of steps.results) {
    const m = byVisitor.get(s.visitor_id) ?? {};
    m[s.step] = { at: s.at, by: names.get(s.by_id) ?? "?" };
    byVisitor.set(s.visitor_id, m);
  }
  return respond(origin, {
    me: publicMe(me),
    steps: STEPS,
    now: new Date().toISOString(),
    groups: groups.results.map((g) => ({
      id: g.gid,
      buddy: { id: g.pid, name: g.name, label: g.label, contact: g.contact, role: g.role, spoc: g.spoc === 1 },
      visitors: visitors.results.filter((v) => v.group_id === g.gid).map((v) => ({ id: v.id, name: v.name, company: v.company, team: v.team, art: v.art, country: v.country, steps: byVisitor.get(v.id) ?? {} })),
    })),
    recent: audit.results.map((a) => ({ at: a.at, step: a.step, done: a.done === 1, visitor: a.visitor, by: a.by_name })),
  });
}

async function update(req: Request, env: Env, me: Person, origin: string | null): Promise<Response> {
  const body = await readJson(req);
  const step = Number(body?.step);
  const done = body?.done === true;
  const ids = Array.isArray(body?.visitorIds) ? [...new Set((body!.visitorIds as unknown[]).filter((x): x is string => typeof x === "string"))] : [];
  if (!Number.isInteger(step) || step < 2 || step > 5 || ids.length === 0 || ids.length > MAX_IDS) return respond(origin, { error: "Bad request." }, 400);

  const ph = ids.map(() => "?").join(",");
  const vrows = (await env.DB.prepare(`SELECT id, group_id FROM visitors WHERE id IN (${ph})`).bind(...ids).all<{ id: string; group_id: string }>()).results;
  const srows = (await env.DB.prepare(`SELECT visitor_id, step FROM steps WHERE visitor_id IN (${ph})`).bind(...ids).all<{ visitor_id: string; step: number }>()).results;
  const have = new Map<string, Set<number>>();
  for (const s of srows) (have.get(s.visitor_id) ?? have.set(s.visitor_id, new Set()).get(s.visitor_id)!).add(s.step);
  const group = new Map(vrows.map((v) => [v.id, v.group_id]));

  const now = new Date().toISOString();
  const stmts: D1Stmt[] = [];
  const ok: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const id of ids) {
    const g = group.get(id);
    const set = have.get(id) ?? new Set<number>();
    if (!g) { skipped.push({ id, reason: "unknown" }); continue; }
    if (!canEdit(me, g, step)) { skipped.push({ id, reason: "not allowed" }); continue; }
    if (done) {
      if (set.has(step)) { skipped.push({ id, reason: "already done" }); continue; }
      if (step > 2 && !set.has(step - 1)) { skipped.push({ id, reason: "previous step not done" }); continue; }
      stmts.push(env.DB.prepare("INSERT OR REPLACE INTO steps (visitor_id, step, at, by_id) VALUES (?, ?, ?, ?)").bind(id, step, now, me.id));
    } else {
      if (!set.has(step)) { skipped.push({ id, reason: "not marked" }); continue; }
      if (set.has(step + 1)) { skipped.push({ id, reason: "a later step is already done" }); continue; }
      stmts.push(env.DB.prepare("DELETE FROM steps WHERE visitor_id = ? AND step = ?").bind(id, step));
    }
    stmts.push(env.DB.prepare("INSERT INTO audit (at, by_id, visitor_id, step, done) VALUES (?, ?, ?, ?, ?)").bind(now, me.id, id, step, done ? 1 : 0));
    ok.push(id);
  }
  if (stmts.length) await env.DB.batch(stmts);
  return respond(origin, { ok, skipped });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(req, env);
    if (req.method === "OPTIONS") return origin ? respond(origin, null, 204) : respond(null, { error: "forbidden" }, 403);
    if (!origin) return respond(null, { error: "forbidden" }, 403);

    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    try {
      if (path === "/login" && req.method === "POST") return await login(req, env, origin);
      const me = await authed(req, env);
      if (!me) return respond(origin, { error: "Please sign in." }, 401);
      if (path === "/state" && req.method === "GET") return await state(env, me, origin);
      if (path === "/update" && req.method === "POST") return await update(req, env, me, origin);
      return respond(origin, { error: "Not found." }, 404);
    } catch (err) {
      console.error("checkin error", err instanceof Error ? err.message : err);
      return respond(origin, { error: "Something went wrong." }, 500);
    }
  },
};
