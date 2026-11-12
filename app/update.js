/* "New version available" prompt.
 * The app checks quietly (on open, when you come back to it, and every few minutes).
 * If a newer version exists it shows an Update button at the top right. Nothing reloads until you tap it. */
(function () {
  const btn = document.getElementById("update-btn");
  if (!btn) return;
  const current = String(DATA.version);
  const CHECK_EVERY = 5 * 60 * 1000, MIN_GAP = 45 * 1000;
  let reg = null, lastCheck = 0, applying = false, shown = false;

  function show(version) {
    if (shown && btn.dataset.v === String(version)) return;
    shown = true; btn.dataset.v = String(version);
    btn.innerHTML = `<span class="u-ic" aria-hidden="true">⟳</span><span class="u-txt"><strong>Update</strong><small>${version && version !== "new" ? "v" + version + " is ready" : "New version ready"}</small></span>`;
    btn.setAttribute("aria-label", "A new version of Bangkok Sidekick is available. Tap to update now.");
    btn.hidden = false;
  }

  // The latest published version is written into sw.js (its cache name), which is tiny and always fetched fresh.
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
    if (reg && reg.waiting && navigator.serviceWorker.controller) { show((await latestVersion()) || "new"); return; }
    const v = await latestVersion();
    if (v && Number(v) > Number(current)) show(v);
  }

  async function apply() {
    if (applying) return;
    applying = true; btn.disabled = true; btn.classList.add("busy");
    btn.innerHTML = '<span class="u-ic spin" aria-hidden="true">⟳</span><span class="u-txt"><strong>Updating…</strong></span>';
    let done = false;
    const go = () => { if (!done) { done = true; location.reload(); } };
    try {
      if (reg && reg.waiting) {                        // a new version is installed and waiting: activate it, then reload
        console.info("[update] activating the waiting version");
        navigator.serviceWorker.addEventListener("controllerchange", go);
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        setTimeout(go, 3000);
        return;
      }
    } catch (_) { }
    console.info("[update] no waiting version: clearing saved copies and reloading");
    try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (_) { }   // fallback: clear saved copies
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
