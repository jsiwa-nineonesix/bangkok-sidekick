(function () {
  const D = DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const gmap = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(/bangkok/i.test(q) ? q : q + " Bangkok");
  const mapBtn = q => `<a class="btn alt" target="_blank" rel="noopener" href="${gmap(q)}">📍 Map</a>`;

  const isAndroid = /android/i.test(navigator.userAgent || "");
  const storeBtns = a => {
    const ios = `<a class="badge" target="_blank" rel="noopener" aria-label="Download ${esc(a.n)} on the App Store" href="https://apps.apple.com/th/app/id${esc(a.ios)}"><img src="img/app-store-badge.png" alt="Download on the App Store" width="132" height="42"></a>`;
    const gp = `<a class="badge" target="_blank" rel="noopener" aria-label="Get ${esc(a.n)} on Google Play" href="https://play.google.com/store/apps/details?id=${esc(a.android)}"><img src="img/google-play-badge.png" alt="Get it on Google Play" width="132" height="42"></a>`;
    return isAndroid ? gp + ios : ios + gp;
  };


  const lm = D.apps.find(a => a.n === "LINE MAN");
  const lmStore = isAndroid ? `https://play.google.com/store/apps/details?id=${lm.android}` : `https://apps.apple.com/th/app/id${lm.ios}`;

  const TABS = [
    ["home", "Home", "🏠"], ["map", "Map", "🗺️"], ["places", "Explore", "📸"], ["eat", "Eat", "🍜"],
    ["go", "Transit", "🚇"], ["apps", "Apps", "📱"], ["tips", "Tips", "💡"]
  ];

  const filterChips = (opts, cur, attr) =>
    `<div class="chips">${opts.map(([k, l]) => `<button class="chip ${k === cur ? "on" : ""}" data-${attr}="${k}">${l}</button>`).join("")}</div>`;

  const state = { places: "all", food: "all", q: "", trip: 0, explore: "near", sort: {} };
  const DEFAULT_SORT = { near: "close", nearby: "close", downtown: "rating", malls: "close", night: "rating" };
  const sortOf = key => state.sort[key] || DEFAULT_SORT[key];

  // ---- Explore: one card format for Walkable / Near (MRT) / Downtown / Popular Malls / Night Out ----
  const EXPLORE = [["near", "🚶 Walkable"], ["nearby", "🚇 Near (MRT)"], ["downtown", "🏙️ Downtown"], ["malls", "🛍️ Popular Malls"], ["night", "🌙 BKK Night Out"]];
  const EXPLORE_KEYS = EXPLORE.map(e => e[0]);
  const INTRO = {
    near: "🚶 <strong>Within a few minutes' walk of the hotel.</strong>",
    nearby: "🚇 <strong>A short MRT or Grab ride away</strong> (about 5-25 minutes).",
    downtown: "🏙️ <strong>Bangkok's big sights.</strong> Plan 20-60 minutes each way by MRT/BTS and set aside half a day.",
    malls: "🛍️ <strong>Popular malls</strong>, from the ones beside the hotel to the big Siam and riverside ones."
  };
  const weighted = v => (v.rating * v.reviews + 4.3 * 100) / (v.reviews + 100); // stars adjusted for how many reviews back them
  const minsOf = v => (v.min != null ? v.min : v.walk ? 4 : v.taxi != null ? v.taxi : 999);
  const distOf = v => (v.km != null ? v.km : minsOf(v) / 10); // straight-line km from the hotel (fallback: rough estimate from minutes)
  const venueSorts = {
    rating: (x, y) => (y.rating ? weighted(y) : 0) - (x.rating ? weighted(x) : 0) || distOf(x) - distOf(y),
    reviews: (x, y) => (y.reviews || 0) - (x.reviews || 0) || distOf(x) - distOf(y),
    close: (x, y) => distOf(x) - distOf(y) || (y.rating ? weighted(y) : 0) - (x.rating ? weighted(x) : 0)
  };
  const sortChips = cur => filterChips([["rating", "⭐ Top rated"], ["reviews", "🔥 Most reviewed"], ["close", "📍 Closest"]], cur, "ns");
  // ---- photo cards: every card has the same 16:10 picture area; places without a free photo get a matching tile ----
  const TONES = ["warm", "cool", "green", "rose", "violet"];
  const toneOf = s => TONES[[...String(s)].reduce((n, c) => n + c.charCodeAt(0), 0) % TONES.length];
  const photoOf = v => (v.photo && D.photos && D.photos[v.photo] ? { src: D.photoDir + v.photo + ".jpg", c: D.photos[v.photo] } : null);
  const creditHtml = c => `Photo: ${esc(c.by)} · <a target="_blank" rel="noopener" href="${esc(c.licUrl)}">${esc(c.lic)}</a> · <a target="_blank" rel="noopener" href="${esc(c.page)}">Wikimedia Commons</a>`;
  const vcard = (v, labels, mapQuery) => {
    const ph = photoOf(v);
    const media = ph
      ? `<img src="${esc(ph.src)}" alt="${esc(v.n)}" width="800" height="500" decoding="async">`
      : `<div class="vph tone-${toneOf(v.n)}" role="img" aria-label="${esc(v.n)}"><span aria-hidden="true">${v.ph || "📍"}</span></div>`;
    const meta = [esc(v.type), v.km != null ? v.km.toFixed(1) + " km away" : "", v.rating ? v.reviews.toLocaleString() + " Google reviews" : ""].filter(Boolean).join(" · ");
    return `<article class="vc"><div class="vmedia">${media}
        ${v.rating ? `<span class="vchip r">⭐ ${v.rating.toFixed(1)}</span>` : ""}
        ${labels.length ? `<div class="vlabels">${labels.map(l => `<span class="vchip">${l}</span>`).join("")}</div>` : ""}
        </div>
      <div class="vbody"><h4>${esc(v.n)}</h4><p class="vmeta">${meta}</p>
        ${v.d ? `<p class="vdesc">${esc(v.d)}</p>` : ""}<p class="vgo">🧭 ${esc(v.go)}</p>
        <div class="vfoot"><span class="vbudget"><b>${esc(v.budget)}</b><small>per person · estimate</small></span>
          <span class="vlinks">${v.rating ? "" : `<a class="vlink soft" target="_blank" rel="noopener" href="${gmap(mapQuery)}">Google rating</a>`}<a class="vlink" target="_blank" rel="noopener" href="${gmap(mapQuery)}">Map ›</a></span></div></div></article>`;
  };
  const badgeFor = (list, v) => {
    const rated = list.filter(x => x.rating);
    const best = rated.length ? rated.reduce((m, x) => (weighted(x) > weighted(m) ? x : m), rated[0]) : null;
    const most = rated.length ? rated.reduce((m, x) => (x.reviews > m.reviews ? x : m), rated[0]) : null;
    return [v === best ? "🏆 Top rated" : "", v === most ? "🔥 Most reviewed" : ""].filter(Boolean);
  };
  const creditsList = () => "";
  const venueView = key => {
    const list = D.places.filter(p => p.cats.includes(key));
    const sorted = list.slice().sort(venueSorts[sortOf(key)]);
    return `<p class="vnote">${INTRO[key]} <span>Google ratings, ${esc(D.explore.asOf)} · budgets are estimates · straight-line distances</span></p>
      ${sortChips(sortOf(key))}
      <div class="vgrid">${sorted.map(v => vcard(v, badgeFor(list, v), v.q)).join("")}</div>${creditsList(sorted)}`;
  };
  const nightOut = () => {
    const N = D.nightout, near = N.hotelQuery;
    const list = N.top.slice().sort(venueSorts[sortOf("night")]);
    const areas = N.districts.map(x => ({ n: x.n, type: "Night-out area", d: x.note, go: x.how, budget: x.budget, photo: x.photo, ph: x.icon, q: x.n.split(" / ")[0] + " Bangkok" }));
    return `<p class="vnote"><strong>🌙 Dinner and drinks near the hotel.</strong> <span>Google ratings, ${esc(N.asOf)} · budgets are my estimates</span></p>
      <h3>Top-rated spots nearby</h3>
      ${sortChips(sortOf("night"))}
      <div class="vgrid">${list.map(v => vcard(v, badgeFor(N.top, v), (v.q || v.n) + " near " + near)).join("")}</div>
      <h3>Find chill bars and cafés</h3>
      <p class="vnote"><span>Google's bar and café ratings change daily, so these open Google Maps around the hotel with current stars, photos and hours.</span></p>
      <div class="grid">${N.find.map(f => `<a class="tile" target="_blank" rel="noopener" style="text-decoration:none" href="${gmap(f.q + " " + near)}"><span class="ic">${f.icon}</span>${esc(f.n)}<br><small style="color:var(--muted);font-weight:400">~${esc(f.budget)} / person</small></a>`).join("")}</div>
      <h3>Bigger night-out areas</h3>
      <div class="vgrid">${areas.map(x => vcard(x, [], x.q)).join("")}</div>
      <h3>Night-out tips</h3>
      <div class="card"><ul>${N.tips.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>${creditsList(areas)}`;
  };

  const views = {
    home() {
      return `
      <div class="hero">
        <h1>Welcome to Bangkok 👋</h1>
        <p style="opacity:.85;margin-top:0"><em>${esc(D.appName)} · ${esc(D.tagline)}</em></p>
        <p><span class="base-chip">📍 ${esc(D.edition)} edition</span></p>
        <p>Your base: <strong>${esc(D.hotel.name)}</strong></p>
        <p>Nearest MRT: <strong>Phra Ram 9 (BL20)</strong> · New CBD</p>
      </div>
      <div class="banner good"><strong>💳 Card tip:</strong> MRT gates accept contactless Visa/Mastercard directly. <strong>BTS does not</strong>, so use a Rabbit card, QR ticket or coins.</div>
      <div class="grid">
        ${TABS.slice(1).map(([k, l, i]) => `<div class="tile" data-go="${k}"><span class="ic">${i}</span>${l}</div>`).join("")}
        <div class="tile" data-chat="1"><span class="ic">💬</span>Ask Sidekick</div>
        <div class="tile" data-taxi="1"><span class="ic">🚕</span>Show to taxi driver</div>
        <div class="tile" data-sos="1"><span class="ic">🆘</span>Emergency</div>
      </div>
      <h3>Quick facts</h3>
      <div class="card"><ul>
        <li>Downtown: MRT to <strong>Sukhumvit (BL22)</strong> for BTS Asok, or <strong>Silom (BL26)</strong> for Lumphini Park / Sala Daeng. About 10–25 min.</li>
        <li>Rides: <strong>Grab</strong> for cars, <strong>LINE MAN</strong> for food, <strong>MuvMI</strong> for short tuk-tuk hops where available.</li>
        <li>Hot and humid. Carry water, bring a layer for cold A/C.</li>
        <li>Street food and taxis are mostly cash. Keep small notes.</li>
      </ul></div>
      <p class="banner info base-note"><strong>📍 ${esc(D.edition)} edition.</strong> ${esc(D.editionNote)}</p>
      <details class="trust">
        <summary><span class="t-ic">🧭</span><span><strong>Built with AI, verified where it counts</strong><small>Last reviewed ${esc(D.trust.reviewed)} · tap for details</small></span></summary>
        <div class="t-body">
          <p><strong>✅ Checked against official and map sources</strong></p>
          <ul>${D.trust.verified.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <p><strong>🔎 Worth a quick live check</strong> (these change)</p>
          <ul>${D.trust.recheck.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          ${D.analytics && D.analytics.cfToken ? `<p class="t-note">📊 We count anonymous visits (no cookies, no personal data) to see if the guide is useful.</p>` : ""}
          <p class="t-note">Use the 📍 buttons to confirm in Google Maps, or ask Sidekick. AI can make mistakes, so for anything important, confirm before you rely on it.</p>
          <button type="button" class="btn alt small" data-chat="1">💬 Ask Sidekick</button>
        </div>
      </details>`;
    },

    map() {
      const L = (pts, col, w, dash) => `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
      const st = (s, type) => `<g data-st="${type}:${s.id}" tabindex="0"><circle class="hit" cx="${s.x}" cy="${s.y}" r="17"/><circle class="${s.home ? "home" : s.ix ? "ix" : "st"}" cx="${s.x}" cy="${s.y}" r="${s.home ? 10 : s.ix ? 8 : 6}"/>${s.nolabel ? "" : s.left ? `<text x="${s.x - 12}" y="${s.y + 4}" text-anchor="end">${esc(s.n)}</text>` : `<text x="${s.x + 12}" y="${s.y + 4}">${esc(s.n)}</text>`}</g>`;
      return `
      <h2>Minimap</h2>
      <p style="color:var(--muted);margin-top:0">Schematic, not to scale. North is up. Tap a station.</p>
      <div class="map-wrap">
      <svg viewBox="0 0 900 700" role="img" aria-label="Bangkok transit map">
        <path d="M120 40 C60 200 160 330 230 440 C290 540 250 620 310 690" stroke="#9fd0f0" stroke-width="22" fill="none" opacity=".7"/>
        ${L("360,70 420,120 480,165 520,205 550,240 570,268 590,300 570,355 530,405 500,445 470,495 430,530 395,560 360,595 330,625 300,655", "#1565c0", 7)}
        ${L("300,60 300,200 300,280 300,350 330,400 390,405 470,425 530,405 640,430 720,450", "#2e9a4a", 6)}
        ${L("190,370 300,350 395,520 330,590", "#1b5e20", 5, "10 4")}
        ${L("310,300 420,330 560,360 700,370 800,375", "#c62828", 5)}
        <text x="720" y="360" style="font-size:10px">✈ Suvarnabhumi</text>
        <circle class="home pulse" cx="590" cy="300" r="10" opacity=".4"/>
        ${D.stations.map(s => st(s, "mrt")).join("")}
        ${D.btsStations.map(s => st(s, "bts")).join("")}
      </svg></div>
      <div class="legend">
        <span><i class="sw" style="background:#1565c0"></i>MRT Blue (card tap ✓)</span>
        <span><i class="sw" style="background:#2e9a4a"></i>BTS Sukhumvit</span>
        <span><i class="sw" style="background:#1b5e20"></i>BTS Silom</span>
        <span><i class="sw" style="background:#c62828"></i>Airport Link</span>
        <span><i class="sw" style="background:#ff3b3b;height:10px;width:10px;border-radius:50%"></i>You (hotel area)</span>
      </div>
      <div id="stinfo" class="card"><p>Tap a station for details.</p></div>`;
    },

    places() {
      const seg = filterChips(EXPLORE, state.explore, "ev");
      return `<h2>Explore</h2>${seg}${state.explore === "night" ? nightOut() : venueView(state.explore)}`;
    },

    eat() {
      const cats = [["all", "All"], ["mall", "In the mall"], ["street", "Quick"], ["night", "Night markets"], ["downtown", "Downtown"], ["dishes", "Dishes to try"]];
      let body;
      if (state.food === "dishes") {
        body = `<div class="card"><table>${D.dishes.map(([a, b]) => `<tr><td><strong>${esc(a)}</strong></td><td>${esc(b)}</td></tr>`).join("")}</table></div>
        <div class="banner"><strong>Order smart:</strong> “mai phet” = not spicy · “check bin” = bill · Tipping isn't expected; rounding up is appreciated. Drink bottled water.</div>`;
      } else {
        body = D.food.filter(f => state.food === "all" || f.cat === state.food).map(f => `
          <div class="card"><h4>${esc(f.n)} <span class="tag">${esc(f.p)}</span></h4><p>${esc(f.d)}</p>
          <div class="row">${mapBtn(f.q)}<a class="btn alt" target="_blank" rel="noopener" href="${lmStore}">Get LINE MAN</a></div></div>`).join("");
      }
      return `<h2>Eat</h2><p style="color:var(--muted);margin-top:0">Places and types; check current hours & reviews in Maps. 🔎</p>${filterChips(cats, state.food, "ff")}${body}`;
    },

    go() {
      const t = D.trips[state.trip];
      return `<h2>Getting around</h2>
      <div class="banner good"><strong>Home station:</strong> MRT Phra Ram 9 (BL20), Blue Line.</div>
      <h3>Trip planner (from Phra Ram 9)</h3>
      <select id="tripsel">${D.trips.map((x, i) => `<option value="${i}" ${i === state.trip ? "selected" : ""}>${esc(x.to)}</option>`).join("")}</select>
      <div class="card"><h4>${esc(t.to)}</h4><p>${esc(t.route)}</p>
        <div class="row"><span class="tag">⏱ ${esc(t.time)}</span><span class="tag">💳 ${esc(t.pay)}</span><a class="btn alt" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(t.dest || t.to)}&travelmode=transit">Open in Maps</a></div></div>
      <h3>How to pay</h3>
      <div class="card"><table>${D.pay.map(p => `<tr><td><strong>${esc(p.sys)}</strong></td><td class="${p.ok ? "yes" : "no"}">${p.ok ? "Card ✓" : "No card"}</td><td>${esc(p.note)}</td></tr>`).join("")}</table></div>
      <h3>MRT vs BTS</h3>
      <div class="card"><ul>
        <li><strong>MRT</strong>: underground/elevated, runs through Rama 9 and old town.</li>
        <li><strong>BTS</strong>: elevated, covers Sukhumvit, Siam, Silom. Separate operator and ticket.</li>
        <li>Interchange = exit one system and tap into the other (two fares): Sukhumvit–Asok, Silom–Sala Daeng, Chatuchak Park–Mo Chit.</li>
        <li>Trains run roughly 05:30–00:00. Avoid 07:30–09:30 and 17:00–19:30 if you can. 🔎</li>
      </ul></div>
      <h3>Blue Line stations</h3>
      <div class="card"><table>${D.stations.map(s => `<tr><td><strong>${s.id}</strong></td><td>${esc(s.n)}</td><td>${esc(s.info)}</td></tr>`).join("")}</table></div>`;
    },

    apps() {
      const groups = [];
      D.apps.forEach(x => { let g = groups.find(y => y.n === x.grp); if (!g) groups.push(g = { n: x.grp, items: [] }); g.items.push(x); });
      return `<h2>Apps</h2><p style="color:var(--muted);margin-top:0">Install and add your payment method before you land.</p>
      ${groups.map(g => `<h3>${esc(g.n)}</h3>${g.items.map(a => `<div class="card"><h4>${esc(a.n)}</h4><p><strong>${esc(a.use)}</strong></p><ul>${a.tips.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="row">${storeBtns(a)}</div></div>`).join("")}`).join("")}
      <h3>Avoid</h3><div class="card"><ul>${D.avoid.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    },

    tips() {
      return `<h2>Tips</h2>
      ${D.tips.map((s, i) => `<details ${i === 0 ? "open" : ""}><summary>${esc(s.h)}</summary><ul>${s.b.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>`).join("")}
      <h3>Handy Thai phrases <small style="color:var(--muted)">(tap 🔊 to hear)</small></h3>
      ${D.phrases.map(([en, th, ro]) => `<div class="card phrase"><div><strong>${esc(en)}</strong><br><span class="th">${esc(th)}</span><br><small style="color:var(--muted)">${esc(ro)}</small></div><button class="btn alt" data-say="${esc(th)}">🔊</button></div>`).join("")}
      <h3>Emergency</h3>
      <div class="card"><table>${D.emergency.map(([n, no]) => `<tr><td>${esc(n)}</td><td><a href="tel:${no}"><strong>${no}</strong></a></td></tr>`).join("")}</table></div>`;
    }
  };

  function render(tab) {
    if (EXPLORE_KEYS.includes(tab)) { state.explore = tab; tab = "places"; }
    tab = views[tab] ? tab : "home";
    location.hash = tab;
    $("#view").innerHTML = views[tab]();
    document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    window.scrollTo(0, 0);
  }

  function modal(html) {
    const m = $("#modal");
    m.innerHTML = `<div class="box">${html}<p><button class="btn big" data-close="1">Close</button></p></div>`;
    m.hidden = false;
  }

  function taxi() {
    modal(`<div class="taxi"><h2>Show to driver 🚕</h2>${D.taxiCards.map(c => `<div class="card"><p>${esc(c.en)}</p><div class="big-th">${esc(c.th)}</div></div>`).join("")}
      ${D.hotel.address ? `<p>${esc(D.hotel.address)}</p>` : ""}${D.hotel.phone ? `<p>📞 ${esc(D.hotel.phone)}</p>` : ""}</div>`);
  }
  function sos() {
    modal(`<h2>🆘 Emergency</h2><div class="sticky-emerg">${D.emergency.map(([n, no]) => `<a class="btn big" href="tel:${no}">${esc(n)}: ${no}</a>`).join("")}</div>`);
  }

  // Events
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-credit],[data-tab],[data-go],[data-pf],[data-ff],[data-ev],[data-ns],[data-say],[data-taxi],[data-sos],[data-close],[data-st]");
    if (!t) return;
    const d = t.dataset;
    if (d.credit) { t.closest(".vc").classList.toggle("show-credit"); }
    else if (d.tab || d.go) { render(d.tab || d.go); }
    else if (d.ev) { state.explore = d.ev; render("places"); }
    else if (d.ns) { state.sort[state.explore] = d.ns; render("places"); }
    else if (d.ff) { state.food = d.ff; render("eat"); }
    else if (d.say) { try { const u = new SpeechSynthesisUtterance(d.say); u.lang = "th-TH"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (_) { } }
    else if (d.taxi) taxi();
    else if (d.sos) sos();
    else if (d.close) $("#modal").hidden = true;
    else if (d.st) {
      const [type, id] = d.st.split(":");
      const s = (type === "mrt" ? D.stations : D.btsStations).find(x => x.id === id);
      $("#stinfo").innerHTML = `<h4>${esc(s.n)} <span class="tag">${type.toUpperCase()} ${esc(s.id)}</span></h4><p>${esc(s.info)}</p>
        <a class="btn alt" target="_blank" rel="noopener" href="${s.ll ? "https://www.google.com/maps/search/?api=1&query=" + s.ll : gmap(s.n.replace(/[^\w\s\/]/g, "").trim() + " station")}">📍 Open in Maps</a>`;
    }
  });
  document.addEventListener("change", e => { if (e.target.id === "tripsel") { state.trip = +e.target.value; render("go"); } });
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") e.target.hidden = true; });
  window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (views[h] || EXPLORE_KEYS.includes(h)) render(h); });

  // After the first visit, quietly save the place photos for offline use (skipped on data-saver / very slow connections).
  const warmPhotos = () => {
    const c = navigator.connection || {};
    if (c.saveData || /2g/.test(c.effectiveType || "")) return;
    const urls = Object.keys(D.photos || {}).map(k => D.photoDir + k + ".jpg"); let i = 0;
    const next = () => { if (i >= urls.length || navigator.onLine === false) return; fetch(urls[i++]).catch(() => { }).finally(() => setTimeout(next, 250)); };
    next();
  };
  if ("requestIdleCallback" in window) requestIdleCallback(() => setTimeout(warmPhotos, 4000)); else setTimeout(warmPhotos, 6000);
  try { localStorage.removeItem("bkk-checkin-token"); } catch (_) { } // tidy up after the removed Check In tab
  $("#nav").innerHTML = TABS.map(([k, l, i]) => `<button data-tab="${k}"><span class="ic">${i}</span>${l}</button>`).join("");
  render(location.hash.slice(1) || "home");

  const ver = $("#ver"); if (ver) ver.textContent = "v" + D.version;
  const ed = $("#edition"); if (ed) ed.textContent = D.edition;

  // Optional anonymous analytics (Cloudflare Web Analytics, no cookies). Off unless a token is set in data.js.
  if (D.analytics && D.analytics.cfToken && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) {
    const s = document.createElement("script");
    s.defer = true; s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: D.analytics.cfToken }));
    document.head.appendChild(s);
  }

})();
