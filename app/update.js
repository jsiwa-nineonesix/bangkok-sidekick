/* "New version" experience.
 *  - Checks quietly: shortly after opening, when you come back to the app, and every few minutes.
 *  - Up to date  -> a small “You're on the latest version” note (once per visit).
 *  - Behind      -> an Update button at the top right AND a message listing what changed, with Update now / Later.
 * Nothing reloads until you tap Update. The change list comes from changelog.json, published with each release. */
(function () {
  const btn = document.getElementById("update-btn");
  if (!btn) return;
  const current = String(DATA.version);
  const CHECK_EVERY = 5 * 60 * 1000, MIN_GAP = 45 * 1000, MAX_NOTES = 8;
  let reg = null, lastCheck = 0, applying = false, shown = false, toastDone = false, dialog = null;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) { } } };

  /* ---------- top-right button ---------- */
  function showButton(version) {
    if (shown && btn.dataset.v === String(version)) return;
    shown = true; btn.dataset.v = String(version);
    btn.innerHTML = `<span class="u-ic" aria-hidden="true">⟳</span><span class="u-txt"><strong>Update</strong><small>${version && version !== "new" ? "v" + esc(version) + " is ready" : "New version ready"}</small></span>`;
    btn.setAttribute("aria-label", "A new version of Bangkok Sidekick is available. Tap to update now.");
    btn.hidden = false;
  }

  /* ---------- what changed ---------- */
  async function notesBetween(latest) {
    try {
      const r = await fetch("changelog.json", { cache: "no-store" });
      if (!r.ok) return [];
      const j = await r.json();
      return (j.releases || []).filter(x => Number(x.v) > Number(current) && (latest === "new" || Number(x.v) <= Number(latest))).sort((a, b) => Number(b.v) - Number(a.v));
    } catch (_) { return []; }
  }

  async function openDialog(latest) {
    if (dialog || store.get("sidekick-upd-dismissed") === String(latest)) return;
    const releases = await notesBetween(latest);
    if (dialog) return;
    let left = MAX_NOTES, hidden = 0;
    const sections = releases.map(rel => {
      const items = (rel.notes || []).filter(Boolean);
      const take = items.slice(0, Math.max(left, 0)); left -= take.length; hidden += items.length - take.length;
      return take.length ? `<h5>v${esc(rel.v)}</h5><ul>${take.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : "";
    }).join("");
    const body = sections || `<ul><li>Improvements and fixes.</li></ul>`;
    const where = latest && latest !== "new" ? `You have <b>v${esc(current)}</b> · the latest is <b>v${esc(latest)}</b>` : `You have <b>v${esc(current)}</b> · a newer version is ready`;
    dialog = document.createElement("div");
    dialog.className = "upd-overlay";
    dialog.innerHTML = `<div class="upd-box" role="dialog" aria-modal="true" aria-labelledby="upd-title">
        <div class="upd-head"><span class="upd-emoji" aria-hidden="true">🎉</span><div><h3 id="upd-title">A new version is ready</h3><p>${where}</p></div></div>
        <div class="upd-notes"><h4>What's new</h4>${body}${hidden > 0 ? `<p class="upd-more">…and ${hidden} more improvement${hidden === 1 ? "" : "s"}.</p>` : ""}</div>
        <div class="upd-actions"><button class="btn big" id="upd-go" type="button">⟳ Update now</button><button class="btn alt big" id="upd-later" type="button">Later</button></div>
        <p class="upd-foot">The app reloads once with the new version.</p></div>`;
    document.body.appendChild(dialog);
    const later = () => { store.set("sidekick-upd-dismissed", String(latest)); closeDialog(); };
    dialog.querySelector("#upd-go").addEventListener("click", () => apply());
    dialog.querySelector("#upd-later").addEventListener("click", later);
    dialog.addEventListener("click", e => { if (e.target === dialog) later(); });
    dialog.addEventListener("keydown", e => { if (e.key === "Escape") later(); });
    setTimeout(() => { const g = dialog && dialog.querySelector("#upd-go"); if (g) g.focus(); }, 60);
  }
  function closeDialog() { if (dialog) { dialog.remove(); dialog = null; } }

  /* ---------- “you're up to date” note ---------- */
  function toast(text) {
    const t = document.createElement("div");
    t.className = "upd-toast"; t.setAttribute("role", "status"); t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("out"), 3200);
    setTimeout(() => t.remove(), 3800);
  }

  /* ---------- version check ---------- */
  // The latest published version is the number in sw.js (its cache name): tiny, and always fetched fresh.
  async function latestVersion() {
    try {
      const r = await fetch("sw.js?cb=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return null;
      const m = /bangkok-sidekick-v(\d+)/.exec(await r.text());
      return m ? m[1] : null;
    } catch (_) { return null; }
  }

  async function check(force) {
    if (applying || (!force && Date.now() - lastCheck < MIN_GAP)) return;
    lastCheck = Date.now();
    if (reg) { try { await reg.update(); } catch (_) { } }
    const v = await latestVersion();
    const waiting = !!(reg && reg.waiting && navigator.serviceWorker.controller);
    if (waiting || (v && Number(v) > Number(current))) {
      const latest = v || "new";
      showButton(latest);
      openDialog(latest);
    } else if (v && !toastDone && document.visibilityState === "visible") {
      toastDone = true;                                   // once per visit, and only when we really could check
      toast("✓ You're on the latest version · v" + current);
    }
  }

  /* ---------- apply ---------- */
  async function apply() {
    if (applying) return;
    applying = true; btn.disabled = true; btn.classList.add("busy");
    btn.innerHTML = '<span class="u-ic spin" aria-hidden="true">⟳</span><span class="u-txt"><strong>Updating…</strong></span>';
    const go2 = dialog && dialog.querySelector("#upd-go");
    if (go2) { go2.disabled = true; go2.textContent = "Updating…"; const l = dialog.querySelector("#upd-later"); if (l) l.disabled = true; }
    let done = false;
    const go = () => { if (!done) { done = true; location.reload(); } };
    try {
      if (reg && reg.waiting) {                           // a new version is installed and waiting: activate it, then reload
        console.info("[update] activating the waiting version");
        navigator.serviceWorker.addEventListener("controllerchange", go);
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        setTimeout(go, 3000);
        return;
      }
    } catch (_) { }
    console.info("[update] no waiting version: clearing saved copies and reloading");
    try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (_) { }
    try { if (reg) await reg.unregister(); } catch (_) { }
    go();
  }

  btn.addEventListener("click", apply);

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").then(r => {
      reg = r;
      r.addEventListener("updatefound", () => {
        const w = r.installing; if (!w) return;
        w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) check(true); });
      });
      if (r.waiting && navigator.serviceWorker.controller) check(true);
    }).catch(() => { });
  }

  setTimeout(() => check(true), 2500);                                    // soon after opening
  setInterval(() => check(false), CHECK_EVERY);                           // while the app stays open
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(false); });   // when you come back to it
  window.addEventListener("online", () => check(true));
  window.SidekickUpdate = { check: () => check(true) };
})();
