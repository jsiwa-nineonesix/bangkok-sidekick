/* Check In tab: access-card hand-over tracking for visiting colleagues.
 * People, visitors and statuses live in a private Cloudflare database. This file holds no names:
 * the browser only receives data after a personal PIN login. */
(function () {
  const API = (DATA.checkin && DATA.checkin.api) || "";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const KEY = "bkk-checkin-token";

  const S = { token: "", data: null, err: "", loading: false, busy: false, msg: "", filter: "all", open: {}, pinErr: "" };
  try { S.token = localStorage.getItem(KEY) || ""; } catch (_) { }

  const STEP_CLASS = { 1: "s1", 2: "s2", 3: "s3", 4: "s4", 5: "s5" };
  const when = iso => { try { return new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (_) { return iso; } };
  const rerender = () => { if (window.BKK) window.BKK.rerender(); };

  async function call(path, opts = {}) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(API + path, {
        method: opts.method || "GET", signal: ctl.signal,
        headers: Object.assign({ "Content-Type": "application/json" }, S.token ? { Authorization: "Bearer " + S.token } : {}),
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
      let j = null; try { j = await res.json(); } catch (_) { }
      return { ok: res.ok, status: res.status, json: j || {} };
    } finally { clearTimeout(to); }
  }

  function signOut(note) {
    S.token = ""; S.data = null; S.err = note || ""; S.open = {}; S.filter = "all";
    try { localStorage.removeItem(KEY); } catch (_) { }
    rerender();
  }

  async function load(silent) {
    if (S.loading || !S.token) return;
    S.loading = true; if (!silent) { S.err = ""; }
    try {
      const r = await call("/state");
      if (r.status === 401) { signOut("Your session has ended. Please sign in again."); return; }
      if (!r.ok) throw new Error("bad");
      const changed = JSON.stringify(r.json.groups) !== JSON.stringify(S.data && S.data.groups) || JSON.stringify(r.json.recent) !== JSON.stringify(S.data && S.data.recent);
      S.data = r.json; S.err = "";
      if (changed || !silent) rerender();
    } catch (_) {
      S.err = "Can't reach the check-in service. Check your connection and try again.";
      if (!silent) rerender();
    } finally { S.loading = false; }
  }

  async function doLogin(pin) {
    S.pinErr = "";
    if (!navigator.onLine) { S.pinErr = "You are offline. Check In needs an internet connection."; rerender(); return; }
    try {
      const r = await call("/login", { method: "POST", body: { pin } });
      if (!r.ok) { S.pinErr = r.json.error || "Could not sign in."; rerender(); return; }
      S.token = r.json.token; try { localStorage.setItem(KEY, S.token); } catch (_) { }
      S.data = null; rerender(); load();
    } catch (_) { S.pinErr = "Can't reach the check-in service. Please try again."; rerender(); }
  }

  /* ---------- helpers on the data ---------- */
  const has = (v, n) => n === 1 || !!(v.steps && v.steps[n]);
  const furthest = v => { let f = 1; for (let n = 2; n <= 5; n++) if (v.steps && v.steps[n]) f = n; return f; };
  const allowed = (me, gid, n) => me.steps.includes(n) && (me.scope === "all" || me.groupId === gid);
  const allVisitors = () => S.data.groups.flatMap(g => g.visitors);
  const stepLabel = n => S.data.steps.find(s => s.n === n);
  const groupPct = g => { const t = g.visitors.length * 4; if (!t) return 0; let d = 0; g.visitors.forEach(v => { for (let n = 2; n <= 5; n++) if (v.steps[n]) d++; }); return Math.round(d / t * 100); };

  async function apply(visitorIds, step, done) {
    if (S.busy) return; S.busy = true; S.msg = ""; rerender();
    try {
      const r = await call("/update", { method: "POST", body: { visitorIds, step, done } });
      if (r.status === 401) { S.busy = false; signOut("Your session has ended. Please sign in again."); return; }
      if (!r.ok) { S.msg = "⚠️ " + (r.json.error || "Could not save that change."); }
      else {
        const ok = r.json.ok.length, sk = r.json.skipped.length;
        S.msg = `${done ? "✅ Marked" : "↩️ Undone"}: ${ok} visitor${ok === 1 ? "" : "s"}${sk ? ` · skipped ${sk} (${[...new Set(r.json.skipped.map(x => x.reason))].join(", ")})` : ""}.`;
      }
    } catch (_) { S.msg = "⚠️ Can't reach the check-in service. Nothing was changed."; }
    S.busy = false; S.loading = false; await load(); rerender();
    clearTimeout(apply.t); apply.t = setTimeout(() => { S.msg = ""; rerender(); }, 6000);
  }

  /* ---------- views ---------- */
  function loginView() {
    return `<h2>Check In</h2>
      <div class="card ci-login">
        <h4>🔐 Access card tracker</h4>
        <p>For buddies (Scrum Masters) and the RTEs. Sign in with the personal PIN you were given to see the visitor groups and update card hand-overs.</p>
        ${S.err ? `<div class="banner">${esc(S.err)}</div>` : ""}
        <form id="ci-form" autocomplete="off">
          <input id="ci-pin" type="text" inputmode="text" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="16" placeholder="Your PIN" aria-label="Your PIN">
          <button class="btn big" type="submit">Sign in</button>
        </form>
        ${S.pinErr ? `<p class="ci-err">${esc(S.pinErr)}</p>` : ""}
        <p class="ci-note">Names and card status are private. They are stored in a protected database and shown only after sign-in. Ask the RTE if you do not have a PIN.</p>
      </div>
      ${stepsHelp()}`;
  }

  function stepsHelp() {
    const rows = [["1", "Access card created", "Done for everyone"], ["2", "Given to buddy", "Buddy (SM) or RTE"], ["3", "Buddy returned to SPOC", "SM / SPOC or RTE"], ["4", "SPOC returned to RTE (Kevin / Wat)", "SM / SPOC or RTE"], ["5", "RTE confirmed receipt", "RTE only"]];
    return `<details class="card"><summary><strong>How the steps work</strong></summary>
      <ol class="ci-steps">${rows.map(r => `<li><strong>${esc(r[1])}</strong><br><small>Updated by: ${esc(r[2])}</small></li>`).join("")}</ol>
      <p class="ci-note">A step can only be ticked once the one before it is done, and undone only if the next one is not.</p></details>`;
  }

  function loadingView() {
    return `<h2>Check In</h2><div class="card"><p>${S.err ? esc(S.err) : "Loading the visitor groups…"}</p>
      ${S.err ? `<button class="btn" data-ci="reload">Try again</button> <button class="btn alt" data-ci="out">Sign out</button>` : ""}</div>`;
  }

  function overview(d) {
    const vs = allVisitors(), total = vs.length;
    const bars = d.steps.map(s => { const n = s.n === 1 ? total : vs.filter(v => has(v, s.n)).length; const pct = total ? Math.round(n / total * 100) : 0;
      return `<div class="ci-bar"><div class="ci-bar-top"><span>${s.n}. ${esc(s.label)}</span><strong>${n} / ${total}</strong></div><div class="ci-track"><i class="${STEP_CLASS[s.n]}" style="width:${pct}%"></i></div></div>`; }).join("");
    return `<div class="card" id="ci-summary"><h4>📊 Overview · ${total} visitors in ${d.groups.length} buddy groups</h4>${bars}</div>`;
  }

  function summaryTable(d) {
    const me = d.me;
    const rows = d.groups.map(g => { const mine = me.groupId === g.id;
      return `<div class="ci-row ${mine ? "mine" : ""}">
        <div class="ci-row-main"><strong>${esc(g.buddy.name)}</strong>${mine ? ' <span class="tag hot">You</span>' : ""}${g.buddy.spoc ? ' <span class="tag">SPOC</span>' : ""}<br><small>${esc(g.buddy.label)} · ${g.visitors.length} visitors${g.buddy.contact ? " · " + esc(g.buddy.contact) : ""}</small>
          <div class="ci-track slim"><i class="s5" style="width:${groupPct(g)}%"></i></div></div>
        <button class="btn alt small" data-ci="go" data-g="${esc(g.id)}">Go ›</button></div>`; }).join("");
    return `<div class="card"><h4>👥 Buddy groups</h4><p class="ci-note">Tap “Go ›” to jump to a group. Your buddy is the first point of contact for anything during the stay.</p>${rows}
      <div class="ci-row total"><strong>Total visitors</strong><strong>${allVisitors().length}</strong></div></div>`;
  }

  function visitorRow(g, v, me) {
    const f = furthest(v), open = !!S.open[v.id], lab = stepLabel(f);
    const dots = [1, 2, 3, 4, 5].map(n => `<i class="dot ${has(v, n) ? "on " + STEP_CLASS[n] : ""}" title="${esc(stepLabel(n).label)}"></i>`).join("");
    let detail = "";
    if (open) {
      detail = `<div class="ci-detail">` + [2, 3, 4, 5].map(n => {
        const done = has(v, n), info = v.steps[n], can = allowed(me, g.id, n);
        const canDo = !done && can && has(v, n - 1) && n !== 1;
        const canUndo = done && can && !has(v, n + 1);
        const btn = canDo ? `<button class="btn small" data-ci="mark" data-v="${esc(v.id)}" data-n="${n}" data-d="1" ${S.busy ? "disabled" : ""}>Mark done</button>`
          : canUndo ? `<button class="btn alt small" data-ci="mark" data-v="${esc(v.id)}" data-n="${n}" data-d="0" ${S.busy ? "disabled" : ""}>Undo</button>` : "";
        return `<div class="ci-step ${done ? "done" : ""}"><span class="ci-ic">${done ? "✅" : "⬜"}</span><div><strong>${n}. ${esc(stepLabel(n).label)}</strong><br><small>${done ? `${esc(when(info.at))} · ${esc(info.by)}` : (!can ? "You cannot update this step" : has(v, n - 1) ? "Waiting" : "Waiting for the previous step")}</small></div>${btn}</div>`;
      }).join("") + `</div>`;
    }
    return `<div class="ci-visitor" data-name="${esc((v.name + " " + v.company + " " + v.team).toLowerCase())}">
      <button class="ci-vhead" data-ci="toggle" data-v="${esc(v.id)}" aria-expanded="${open}">
        <span class="ci-vname"><strong>${esc(v.name)}</strong><small>${esc(v.company)} · ${esc(v.team)}${v.art && v.art !== "-" ? " · " + esc(v.art) : ""} · ${esc(v.country)}</small></span>
        <span class="ci-vstat"><span class="pill ${STEP_CLASS[f]}">${esc(lab.short)}</span><span class="dots">${dots}</span></span>
      </button>${detail}</div>`;
  }

  function groupCard(g, me) {
    const bulk = [2, 3, 4, 5].filter(n => allowed(me, g.id, n)).map(n => {
      const eligible = g.visitors.filter(v => !has(v, n) && has(v, n - 1)).length;
      return `<button class="btn alt small" data-ci="bulk" data-g="${esc(g.id)}" data-n="${n}" ${eligible && !S.busy ? "" : "disabled"}>✓ All: ${esc(stepLabel(n).short)} (${eligible})</button>`; }).join("");
    return `<section class="card ci-group" id="ci-g-${esc(g.id)}">
      <div class="ci-ghead"><div><h4>${esc(g.buddy.name)}</h4><small>${esc(g.buddy.label)} · ${g.visitors.length} visitors${g.buddy.spoc ? " · SPOC" : ""}</small></div>
        <button class="btn alt small" data-ci="top">↑ Back to summary</button></div>
      <div class="ci-track slim"><i class="s5" style="width:${groupPct(g)}%"></i></div>
      ${bulk ? `<div class="ci-bulk"><small>Update everyone in this group:</small><div class="row">${bulk}</div></div>` : ""}
      <div class="ci-visitors">${g.visitors.map(v => visitorRow(g, v, me)).join("")}</div></section>`;
  }

  function mainView() {
    const d = S.data, me = d.me;
    const chips = [["all", "All groups"]].concat(me.groupId ? [["mine", "My group"]] : []).concat([["open", "Not finished"]]);
    const groups = d.groups.filter(g => S.filter === "all" || (S.filter === "mine" && g.id === me.groupId) || (S.filter === "open" && g.visitors.some(v => !has(v, 5))));
    const role = me.role === "rte" ? "RTE · can update every step" : me.role === "viewer" ? "View only" : me.scope === "all" ? "SM / SPOC · steps 2-4, all groups" : "SM · steps 2-4 for your group";
    const recent = d.recent.length ? `<div class="card"><h4>🕒 Recent activity</h4><ul class="ci-recent">${d.recent.map(a => `<li><strong>${esc(a.by || "?")}</strong> ${a.done ? "marked" : "undid"} “${esc(stepLabel(a.step).short)}” for ${esc(a.visitor || "?")} <small>${esc(when(a.at))}</small></li>`).join("")}</ul></div>` : "";
    return `<h2>Check In</h2>
      <div class="card ci-me"><div><strong>👋 ${esc(me.name)}</strong><br><small>${esc(role)}</small></div>
        <div class="row"><button class="btn alt small" data-ci="reload">⟳ Refresh</button><button class="btn alt small" data-ci="out">Sign out</button></div></div>
      ${S.msg ? `<div class="banner ${S.msg.startsWith("⚠") ? "" : "good"}">${esc(S.msg)}</div>` : ""}
      ${S.err ? `<div class="banner">${esc(S.err)}</div>` : ""}
      ${overview(d)}${summaryTable(d)}
      <h3>Groups</h3>
      <div class="chips">${chips.map(([k, l]) => `<button class="chip ${k === S.filter ? "on" : ""}" data-ci="filter" data-k="${k}">${l}</button>`).join("")}</div>
      <input type="search" id="ci-search" placeholder="Search a visitor, company or team…" aria-label="Search visitors">
      <div id="ci-groups">${groups.map(g => groupCard(g, me)).join("") || '<div class="card"><p>Nothing to show.</p></div>'}</div>
      ${recent}${stepsHelp()}
      <p class="ci-note" style="text-align:center">Updated ${esc(when(d.now))} (Bangkok time) · refreshes by itself every 30 seconds</p>`;
  }

  function render() {
    if (!API) return `<h2>Check In</h2><div class="card"><p>The Check In service is not configured.</p></div>`;
    if (!S.token) return loginView();
    if (!S.data) { load(); return loadingView(); }
    return mainView();
  }

  /* ---------- events ---------- */
  document.addEventListener("submit", e => {
    if (e.target.id !== "ci-form") return;
    e.preventDefault(); const pin = (document.getElementById("ci-pin").value || "").trim();
    if (pin) doLogin(pin);
  });
  document.addEventListener("input", e => {
    if (e.target.id !== "ci-search") return;
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll("#ci-groups .ci-visitor").forEach(el => { el.hidden = !!q && !el.dataset.name.includes(q); });
    document.querySelectorAll("#ci-groups .ci-group").forEach(g => { g.hidden = !!q && ![...g.querySelectorAll(".ci-visitor")].some(el => !el.hidden); });
  });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-ci]"); if (!t) return;
    const d = t.dataset;
    if (d.ci === "go") { const el = document.getElementById("ci-g-" + d.g); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (d.ci === "top") { const el = document.getElementById("ci-summary"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
    else if (d.ci === "toggle") { S.open[d.v] = !S.open[d.v]; const y = window.scrollY; rerender(); window.scrollTo(0, y); }
    else if (d.ci === "filter") { S.filter = d.k; rerender(); }
    else if (d.ci === "reload") { S.err = ""; S.loading = false; if (S.data) load(); else rerender(); }
    else if (d.ci === "out") signOut("");
    else if (d.ci === "mark") apply([d.v], +d.n, d.d === "1");
    else if (d.ci === "bulk") {
      const g = S.data.groups.find(x => x.id === d.g), n = +d.n;
      const ids = g.visitors.filter(v => !has(v, n) && has(v, n - 1)).map(v => v.id);
      if (ids.length && window.confirm(`Mark ${ids.length} visitor${ids.length === 1 ? "" : "s"} in ${g.buddy.name}'s group as “${stepLabel(n).label}”?`)) apply(ids, n, true);
    }
  });
  setInterval(() => { if (location.hash === "#checkin" && document.visibilityState === "visible" && S.token && S.data && !S.busy) load(true); }, 30000);
  window.addEventListener("hashchange", () => { if (location.hash === "#checkin" && S.token && S.data) load(true); });

  window.CheckIn = { render };
  // The first screen is drawn before this file loads, so redraw if we landed straight on this tab.
  if (location.hash === "#checkin") rerender();
})();
