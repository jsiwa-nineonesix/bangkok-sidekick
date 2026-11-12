/* Bangkok Sidekick chat assistant.
 *  Stage 1 (default): answers from the guide's own content (DATA) - free, offline, no key.
 *  Stage 2 (optional): if DATA.chat.endpoint is set, questions go to your AI proxy (see chat-proxy/README.md);
 *  any failure falls back to the guide-based answer. */
(function () {
  const D = DATA;
  const CFG = Object.assign({ endpoint: "", dailyLimit: 30, timeoutMs: 30000 }, D.chat || {});
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = s => esc(s).replace(/^[ \t]*[*-][ \t]+/gm, "• ").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  const gmap = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(/bangkok/i.test(q) ? q : q + " Bangkok");
  const isAndroid = /android/i.test(navigator.userAgent || "");

  /* ---------- 1. Knowledge base built from the guide ---------- */
  const docs = [];
  const add = d => docs.push(d);
  const h = D.hotel;
  add({ title: "Hotel and address", tab: "home", kw: "hotel avani ratchada where stay staying room address phone location taxi home base opposite g tower check in",
    text: `**${h.name}**\n${h.address || "Address: see your booking."}\n${h.phone ? "📞 " + h.phone + "\n" : ""}MRT Phra Ram 9 is about a 3-minute walk.`,
    actions: [{ label: "📍 Hotel on Maps", href: gmap("Avani Ratchada Bangkok Hotel") }, { label: "🚕 Show to driver", fn: "taxi" }] });
  add({ title: "Paying for trains: MRT vs BTS", tab: "go", kw: "credit card visa mastercard tap pay payment contactless train mrt bts rabbit qr coins ticket gate",
    text: `**MRT: card tap works ✓**\n${D.pay[0].note}\n\n**BTS: no direct card tap ✗**\n${D.pay[1].note}` });
  add({ title: "Emergency numbers", tab: "tips", kw: "emergency police ambulance fire sos help hospital tourist danger robbed lost accident medical 191 1155 1669 199",
    text: D.emergency.map(([n, no]) => `**${n}:** ${no}`).join("\n"), actions: [{ label: "🆘 Open emergency", fn: "sos" }] });
  D.places.forEach(p => add({ title: p.n, tab: "places", kw: `${p.cat === "near" ? "near hotel walk walking nearby close" : p.cat === "nearby" ? "near nearby mrt close" : "downtown city center sightseeing visit see attraction tourist"} things to do explore`,
    text: `${p.d}\n🚶 ${p.t}`, actions: [{ label: "📍 Map", href: gmap(p.q) }] }));
  D.food.forEach(f => add({ title: f.n, tab: "eat", kw: `eat food restaurant hungry dinner lunch breakfast meal ${f.cat === "night" ? "night market evening" : ""} ${f.cat === "mall" ? "mall air conditioned" : ""} ${f.cat === "downtown" ? "famous" : ""} ${/Rama 9|G Tower/i.test(f.q) || f.cat === "street" ? "near hotel nearby walk walking close" : ""} cheap ${f.p}`,
    text: `${f.d}\nPrice: ${f.p}`, actions: [{ label: "📍 Map", href: gmap(f.q) }] }));
  add({ title: "Thai dishes to try", tab: "eat", kw: "dish dishes food thai try order menu pad thai curry tom yum som tam spicy",
    text: D.dishes.map(([a, b]) => `**${a}:** ${b}`).join("\n") + "\n\nSay **mai phet** (ไม่เผ็ด) for not spicy." });
  D.trips.forEach(t => add({ title: `Getting to ${t.to}`, tab: "go", kw: "how get go travel route train mrt bts taxi grab reach directions way transport",
    text: `${t.route}\n⏱ ${t.time}\n💳 ${t.pay}`, actions: [{ label: "🧭 Directions", href: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(t.dest || t.to) + "&travelmode=transit" }] }));
  D.pay.forEach(p => add({ title: `Paying: ${p.sys}`, tab: "go", kw: "pay payment card cash tap", text: `${p.ok ? "Card accepted ✓" : "No card ✗"}\n${p.note}` }));
  D.apps.forEach(a => add({ title: `${a.n} app`, tab: "apps", kw: `app download install phone ${a.grp} ${/food|delivery/i.test(a.use) ? "delivery deliver order food grocery" : ""}`,
    text: `**${a.use}**\n${a.tips.map(x => "• " + x).join("\n")}`,
    actions: [{ label: "App Store", href: `https://apps.apple.com/th/app/id${a.ios}` }, { label: "Play Store", href: `https://play.google.com/store/apps/details?id=${a.android}` }] }));
  D.tips.forEach(s => add({ title: s.h, tab: "tips", kw: "tip tips advice" + (/clothing/i.test(s.h) ? " wear dress clothes outfit temple dress code modest shoes" : ""), text: s.b.map(x => "• " + x).join("\n") }));
  D.phrases.forEach(([en, th, ro]) => add({ title: `Thai for "${en}"`, tab: "tips", kw: "thai say phrase speak language word translate how to say",
    text: `${th}\n${ro}`, actions: [{ label: "🔊 Hear it", say: th }] }));
  D.stations.concat(D.btsStations).forEach(s => add({ title: `${s.n.replace(/[^\w\s\/]/g, "").trim()} station`, tab: "map", kw: "station mrt bts stop line", text: s.info,
    actions: s.ll ? [{ label: "📍 Map", href: "https://www.google.com/maps/search/?api=1&query=" + s.ll }] : [] }));
  add({ title: "Avoid scams and bad rides", tab: "apps", kw: "scam avoid cheat taxi meter tuk tuk safe safety ripoff overcharge", text: D.avoid.map(x => "• " + x).join("\n") });

  /* ---------- 2. Matching ---------- */
  const STOP = new Set("the a an is are was were do does did i im ive to in on at of for can could should would how what where when which who my me we you your it its and or there any some be been this that with from about please tell show find need want get got have has will just also up out if than then so very much many".split(" "));
  const SYN = [
    ["eat", "food", "restaurant", "hungry", "dinner", "lunch", "breakfast", "meal", "dine", "cafe", "street"],
    ["train", "mrt", "bts", "metro", "subway", "skytrain", "underground", "rail"],
    ["card", "credit", "debit", "visa", "mastercard", "tap", "contactless"],
    ["taxi", "cab", "grab", "bolt", "ride", "driver", "tuktuk", "muvmi"],
    ["airport", "suvarnabhumi", "donmueang", "flight", "plane"],
    ["hotel", "avani", "room", "stay", "accommodation", "lodging"],
    ["temple", "wat", "palace", "buddha", "pho", "arun"],
    ["cash", "money", "baht", "atm", "exchange", "currency"],
    ["emergency", "police", "ambulance", "hospital", "sos", "help", "danger", "doctor"],
    ["wifi", "internet", "sim", "esim", "data", "roaming"],
    ["weather", "rain", "hot", "humid", "umbrella", "climate", "temperature"],
    ["mall", "shopping", "shop", "buy", "market"],
    ["near", "nearby", "close", "around", "walk", "walking"],
    ["scam", "cheat", "ripoff", "overcharge", "fraud"],
    ["chat", "message", "line", "messenger", "whatsapp"],
    ["translate", "translation", "thai", "language", "say", "speak"],
    ["nightlife", "bar", "drink", "night"],
    ["cheap", "budget", "affordable"],
    ["downtown", "city", "center", "centre", "siam", "sukhumvit", "silom"],
    ["team", "teams", "microsoft", "work", "meeting"]
  ];
  const stem = w => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
  const tok = s => String(s).toLowerCase().replace(/[^a-z0-9฀-๿\s]/g, " ").split(/\s+/).filter(w => w && !STOP.has(w)).map(stem);
  const synOf = new Map();
  SYN.forEach(g => { const set = g.map(stem); set.forEach(w => { if (!synOf.has(w)) synOf.set(w, new Set()); set.forEach(x => synOf.get(w).add(x)); }); });
  docs.forEach(d => { d.t = new Set(tok(d.title)); d.b = new Set(tok(d.kw + " " + d.text)); });

  const RE_ROUTE = /\b(get|go|going|reach|travel|commute|directions?|route|way)\b/i, RE_TO = /\b(to|from)\b/i;
  const RE_MALL = /\b(mall|malls|shopping)\b/i, RE_APP = /\b(app|apps|download|install|delivery|deliver)\b/i, RE_WEAR = /\b(wear|dress|clothes|clothing|outfit|pack|packing|bring)\b/i;
  function search(q) {
    const qt = [...new Set(tok(q))];
    if (!qt.length) return [];
    const ext = new Set();
    qt.forEach(w => (synOf.get(w) || []).forEach(x => { if (!qt.includes(x)) ext.add(x); }));
    return docs.map(d => {
      let s = 0;
      qt.forEach(w => { if (d.t.has(w)) s += 3; else if (d.b.has(w)) s += 1; });
      ext.forEach(w => { if (d.t.has(w)) s += 1; else if (d.b.has(w)) s += 0.35; });
      if (s > 0) {
        if (RE_ROUTE.test(q) && RE_TO.test(q) && d.title.startsWith("Getting to")) s += 2.5;
        if (RE_APP.test(q) && d.tab === "apps" && d.title.endsWith(" app")) s += 3;
        if (RE_MALL.test(q) && (d.tab === "places" || d.tab === "eat") && /\bmall\b/i.test(d.text)) s += 3;
        if (RE_WEAR.test(q) && d.tab === "tips" && !d.title.startsWith("Thai for")) s += 2.5;
      }
      return { d, s };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  }

  const SUGGEST = ["How do I get to Siam?", "Can I use my credit card on BTS?", "Where can I eat nearby?", "Emergency numbers", "Hotel address", "How do I say thank you in Thai?"];

  function localAnswer(q) {
    const t = q.trim();
    if (/^(hi|hello|hey|yo|sawasdee|สวัสดี)\b/i.test(t) || /^สวัสดี/.test(t))
      return { text: "Sawasdee krap/ka! 👋 I'm your Bangkok Sidekick. Ask me about getting around, food, apps, tips or your hotel.", chips: SUGGEST.slice(0, 4) };
    if (/^(thanks|thank you|thx|ty|cheers|ขอบคุณ)/i.test(t)) return { text: "You're welcome! Enjoy Bangkok 😊", chips: [] };
    if (/\b(who are you|what can you do|help me|what do you know)\b/i.test(t))
      return { text: "I answer from this guide: **getting around** (MRT, BTS, airport), **food**, **places**, **apps**, **money and safety tips**, **Thai phrases** and **your hotel**.", chips: SUGGEST.slice(0, 4) };
    if (/\b(phuket|chiang ?mai|pattaya|krabi|samui|hua hin|ayutthaya|kanchanaburi)\b/i.test(t))
      return { text: "This guide covers **Bangkok and the Rama 9 area** only. For other places, try Google Maps.", chips: SUGGEST.slice(0, 4),
        actions: [{ label: "📍 Search in Google Maps", href: "https://www.google.com/maps/search/" + encodeURIComponent(t) }] };
    const live = /\b(today|tonight|tomorrow|right now|currently|live|forecast|opening hours|open now|closing time|latest)\b/i.test(t);
    const r = search(t);
    if (!r.length || r[0].s < 2) {
      return { text: "I couldn't find that in the guide. 🤔\nTry asking about getting around, food, places, apps, tips or emergencies. For live info (weather today, opening hours, prices) use Google Maps.", chips: SUGGEST.slice(0, 4),
        actions: [{ label: "📍 Search in Google Maps", href: "https://www.google.com/maps/search/" + encodeURIComponent(t + " Bangkok") }] };
    }
    const best = r[0].d;
    const related = r.slice(1).filter(x => x.s >= Math.max(2, r[0].s * 0.5) && x.d.title !== best.title).slice(0, 2).map(x => x.d.title);
    const actions = (best.actions || []).slice();
    if (best.tab) actions.push({ label: "Open in guide", tab: best.tab });
    if (live) actions.push({ label: "📍 Check live info on Maps", href: "https://www.google.com/maps/search/" + encodeURIComponent(t + " Bangkok") });
    return { title: best.title, text: (live ? "_(I can't see live info like today's weather, hours or prices. This is from the guide:)_\n" : "") + best.text, actions, chips: related };
  }

  /* ---------- 3. Optional AI proxy ---------- */
  function guideContext() {
    return docs.map(d => `## ${d.title}\n${d.text}`).join("\n\n").slice(0, 16000);
  }
  function aiBudgetOk() {
    try {
      const k = "sidekick-ai-" + new Date().toISOString().slice(0, 10);
      const n = +localStorage.getItem(k) || 0;
      if (n >= CFG.dailyLimit) return false;
      localStorage.setItem(k, String(n + 1)); return true;
    } catch (_) { return true; }
  }
  async function aiAnswer(history) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), CFG.timeoutMs);
    try {
      const res = await fetch(CFG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ messages: history.slice(-8), guide: guideContext() }) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const j = await res.json();
      if (!j.reply) throw new Error("empty");
      return String(j.reply);
    } finally { clearTimeout(to); }
  }

  /* ---------- 4. UI ---------- */
  const root = document.createElement("div");
  root.innerHTML = `
    <button id="chat-fab" type="button" aria-label="Ask Bangkok Sidekick"><span class="ic">💬</span><span>Ask</span></button>
    <section id="chat" role="dialog" aria-modal="true" aria-label="Ask Bangkok Sidekick" hidden>
      <header class="chat-head"><div><strong>Ask Sidekick</strong><small id="chat-mode"></small></div><button id="chat-close" type="button" aria-label="Close chat">✕</button></header>
      <div id="chat-log" aria-live="polite"></div>
      <div id="chat-chips" class="chat-chips"></div>
      <form id="chat-form" autocomplete="off"><input id="chat-input" type="text" inputmode="text" enterkeyhint="send" maxlength="300" placeholder="Ask anything about your trip…" aria-label="Your question"><button class="btn" type="submit">Send</button></form>
    </section>`;
  document.body.appendChild(root);
  const el = { fab: $("#chat-fab"), box: $("#chat"), log: $("#chat-log"), chips: $("#chat-chips"), form: $("#chat-form"), input: $("#chat-input"), mode: $("#chat-mode") };
  const history = [];
  let busy = false, started = false;

  const modeLabel = () => {
    const online = navigator.onLine !== false;
    el.mode.textContent = !CFG.endpoint ? (online ? "Answers from the guide" : "Offline · answers from the guide")
      : online ? "AI assistant · uses the guide" : "Offline · answers from the guide";
  };
  window.addEventListener("online", modeLabel); window.addEventListener("offline", modeLabel);

  function addMsg(who, html, extra) {
    const m = document.createElement("div"); m.className = "msg " + who; m.innerHTML = html;
    if (extra && extra.length) {
      const row = document.createElement("div"); row.className = "msg-actions";
      extra.forEach(a => {
        const b = document.createElement(a.href ? "a" : "button");
        b.className = "btn alt small"; b.textContent = a.label; b.type = "button";
        if (a.href) { b.href = a.href; b.target = "_blank"; b.rel = "noopener"; }
        if (a.tab) b.dataset.goTab = a.tab;
        if (a.fn) b.dataset.fn = a.fn;
        if (a.say) b.dataset.say = a.say;
        row.appendChild(b);
      });
      m.appendChild(row);
    }
    el.log.appendChild(m); el.log.scrollTop = el.log.scrollHeight; return m;
  }
  function setChips(list) {
    el.chips.innerHTML = (list || []).map(c => `<button type="button" class="chip" data-q="${esc(c)}">${esc(c)}</button>`).join("");
  }
  function open() {
    el.box.hidden = false; el.fab.hidden = true; modeLabel();
    if (!started) { started = true; addMsg("bot", fmt("Sawasdee! 👋 I'm your **Bangkok Sidekick**. Ask me anything about your week: getting around, food, apps, tips or your hotel.")); setChips(SUGGEST); }
    setTimeout(() => el.input.focus(), 120); fitToViewport();
  }
  function close() { el.box.hidden = true; el.fab.hidden = false; }

  async function ask(q) {
    q = q.trim(); if (!q || busy) return;
    busy = true; addMsg("user", esc(q)); history.push({ role: "user", content: q }); el.input.value = ""; setChips([]);
    const typing = addMsg("bot typing", "<span></span><span></span><span></span>");
    let out = null, note = "";
    if (CFG.endpoint && navigator.onLine !== false && aiBudgetOk()) {
      try { const reply = await aiAnswer(history); out = { text: reply, ai: true, actions: [], chips: [] }; }
      catch (_) { note = "\n\n_(AI assistant unavailable, answered from the guide.)_"; }
    }
    if (!out) { out = localAnswer(q); }
    typing.remove();
    const body = (out.title && !out.ai ? `**${out.title}**\n` : "") + out.text + note;
    addMsg("bot", fmt(body).replace(/_\((.+?)\)_/g, "<em>($1)</em>"), out.actions);
    history.push({ role: "assistant", content: out.text });
    setChips(out.chips && out.chips.length ? out.chips : []);
    busy = false;
  }

  // keep the sheet above the iOS keyboard
  function fitToViewport() {
    const vv = window.visualViewport; if (!vv) return;
    const gap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
    el.box.style.bottom = gap + "px"; el.box.style.maxHeight = Math.max(280, vv.height - 24) + "px";
  }
  if (window.visualViewport) { visualViewport.addEventListener("resize", fitToViewport); visualViewport.addEventListener("scroll", fitToViewport); }

  el.fab.addEventListener("click", open);
  $("#chat-close").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !el.box.hidden) close(); });
  el.form.addEventListener("submit", e => { e.preventDefault(); ask(el.input.value); });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-q],[data-go-tab],[data-fn],[data-say],[data-chat]");
    if (!t) return;
    if (t.dataset.chat) { open(); return; }
    if (t.dataset.q) { ask(t.dataset.q); return; }
    if (t.dataset.goTab) { close(); location.hash = t.dataset.goTab; return; }
    if (t.dataset.fn === "taxi" || t.dataset.fn === "sos") { close(); const tile = document.querySelector(`[data-${t.dataset.fn}]`); if (tile) tile.click(); else { location.hash = "home"; setTimeout(() => { const x = document.querySelector(`[data-${t.dataset.fn}]`); if (x) x.click(); }, 150); } return; }
    if (t.dataset.say && t.closest("#chat")) { try { const u = new SpeechSynthesisUtterance(t.dataset.say); u.lang = "th-TH"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (_) { } }
  });

  window.SidekickChat = { answer: localAnswer, open, close, docs: docs.length };
})();
