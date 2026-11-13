"""Generate interactive 2.5D (axonometric) SVG views of Bangkok's New CBD (Rama 9) from OpenStreetMap data.
Usage: python3 cbd_gen.py osm.json avani.json OUT_DIR
Writes OUT_DIR/cbd-0.svg .. cbd-3.svg (four camera directions).
Data © OpenStreetMap contributors (ODbL).

How to refresh the data (Overpass API), then re-run this script and copy the SVGs to app/img/cbd/:
  osm.json   = [out:json];(way["building"](13.7525,100.5600,13.7625,100.5735);way["highway"](13.7525,100.5600,13.7625,100.5735););out body geom tags;
  avani.json = [out:json];way(182002417);out body geom tags;     (the hotel outline has no building=* tag)
"""
import json, math, sys, os

osm_path, avani_path, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]

LAT0, LON0 = 13.75700, 100.56560        # around the hotel / G Tower; wide enough for the Asok-Din Daeng condos
RANGE = 355                              # metres from centre to keep
TILT = math.radians(30)                  # 90 = straight down; lower = more side-on, like a street view
LEVEL_H = 3.8                            # metres per floor
ZX = 1.45                                # height exaggeration so towers read as towers
VIEWS = [("nw", -48), ("ne", 42), ("se", 132), ("sw", 222)]   # camera looks towards north-west, north-east, south-east, south-west

KEYS = {   # OSM way id -> (key, label, colour)
    390013453: ("gtower", "G Tower", "#2f6fd0"),
    182002417: ("hotel", "Avani Hotel", "#ff9a1f"),
    176298728: ("central", "Central Rama 9", "#ff5470"),
    176298735: ("fortune", "Fortune Town", "#8a63ff"),
    1339874482: ("ninth", "The Ninth Towers", "#1fb07a"),
    1339874483: ("ninth", "The Ninth Towers", "#1fb07a"),
    # condominiums (same soft-teal glass so they read as one family)
    720474551: ("c195", "One9Five", "#25a9c9"),
    532749607: ("cmobi", "Ideo Mobi Rama 9", "#25a9c9"),
    1199961655: ("cashton", "Ashton Asoke–Rama 9", "#25a9c9"),
    1199961656: ("cashton", "Ashton Asoke–Rama 9", "#25a9c9"),
    1199961652: ("cline", "The Line Asoke–Ratchada", "#25a9c9"),
    1367263850: ("bkkcity", "Bangkok City Rama 9 Hotel", "#f2b13a"),   # OSM still marks it as under construction (26 floors)
}
LEVELS_OVERRIDE = {   # OSM has no floor count for these
    720474551: 248 / 3.8,     # One9Five: twin towers about 248 m (Wikimedia Commons description)
    390013453: 159 / 3.8,     # G Tower: 159 m (Wikimedia Commons description); OSM says 36 floors
    1199961655: 45, 1199961656: 45,   # Ashton Asoke-Rama 9: estimate
}
MRT = (13.75782, 100.56528)
WALK = [   # hotel -> MRT Exit 1 -> concourse under Ratchadaphisek -> G Tower (approx. except the OSM points)
    (13.75712, 100.56500), (13.75772, 100.56512), (13.75785, 100.56522),
    (13.75782, 100.56540), (13.75765, 100.56566), (13.75745, 100.56572),
]
ROADNAMES = [("Rama IX Rd", 13.75600, 100.56770), ("Asok–Din Daeng Rd", 13.75640, 100.56300),
             ("Ratchadaphisek Rd", 13.75930, 100.56565), ("Rama 9 Intersection", 13.75600, 100.56500, "jn")]

mx = 111320 * math.cos(math.radians(LAT0)); my = 110574
def local(lat, lon): return ((lon - LON0) * mx, (lat - LAT0) * my)

els, seen = [], set()
for path in (osm_path, avani_path):
    for e in json.load(open(path, encoding="utf-8"))["elements"]:
        k = (e["type"], e["id"])
        if k not in seen: seen.add(k); els.append(e)

def levels(t):
    for v in (t.get("building:levels", ""),):
        try: return max(1.0, float(v.split(";")[0]))
        except ValueError: pass
    try: return max(1.0, float(t.get("height", "")) / LEVEL_H)
    except ValueError: return None

blds = []
for e in els:
    t = e.get("tags", {})
    if e["type"] != "way" or not e.get("geometry"): continue
    if not (t.get("building") or e["id"] in KEYS): continue
    if t.get("building") in ("roof", "construction") and e["id"] not in KEYS: continue
    pts = [local(p["lat"], p["lon"]) for p in e["geometry"]]
    if pts[0] != pts[-1] or len(pts) < 4: continue
    pts = pts[:-1]
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    if math.hypot(cx, cy) > RANGE: continue
    lv = LEVELS_OVERRIDE.get(e["id"]) or levels(t); h = (lv if lv else 2) * LEVEL_H
    if not (e["id"] in KEYS or h > 9 or math.hypot(cx, cy) < 260): continue
    area = sum(pts[i][0] * pts[(i+1) % len(pts)][1] - pts[(i+1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    if area < 0: pts = pts[::-1]
    blds.append({"ring": pts, "h": h, "lv": lv or 2, "key": KEYS.get(e["id"]), "c": (cx, cy)})

# ---- custom massing on the real OSM footprints -------------------------------------------------------------
def frame(b):
    """oriented box of a footprint: centre, long axis u (pointing north), short axis v, extents"""
    r = b["ring"]
    edges = [(r[i], r[(i + 1) % len(r)]) for i in range(len(r))]
    (p1, p2) = max(edges, key=lambda e: math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]))
    ux, uy = p2[0] - p1[0], p2[1] - p1[1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
    if uy < 0: ux, uy = -ux, -uy
    vx, vy = -uy, ux
    cx, cy = b["c"]
    us = [(x - cx) * ux + (y - cy) * uy for x, y in r]; vs = [(x - cx) * vx + (y - cy) * vy for x, y in r]
    return cx, cy, ux, uy, vx, vy, min(us), max(us), min(vs), max(vs)

def boxes(b, spec):
    """spec: list of (s0, s1, t0, t1, z0, z1, extra) in 0..1 of the footprint's long/short extents and height"""
    cx, cy, ux, uy, vx, vy, S0, S1, T0, T1 = frame(b); H = b["h"]
    out = []
    for s0, s1, t0, t1, z0, z1, extra in spec:
        a, c = S0 + (S1 - S0) * s0, S0 + (S1 - S0) * s1
        d, e = T0 + (T1 - T0) * t0, T0 + (T1 - T0) * t1
        ring = [(cx + ux * a + vx * d, cy + uy * a + vy * d), (cx + ux * c + vx * d, cy + uy * c + vy * d),
                (cx + ux * c + vx * e, cy + uy * c + vy * e), (cx + ux * a + vx * e, cy + uy * a + vy * e)]
        area = sum(ring[i][0] * ring[(i + 1) % 4][1] - ring[(i + 1) % 4][0] * ring[i][1] for i in range(4))
        if area < 0: ring = ring[::-1]
        part = {"ring": ring, "z0": H * z0, "h": H * z1, "lv": H * (z1 - z0) / LEVEL_H, "key": b["key"],
                "c": (sum(p[0] for p in ring) / 4, sum(p[1] for p in ring) / 4)}
        part.update(extra or {})
        part["gc"], part["gid"] = b["c"], id(b)          # draw the whole building as one group
        part["rank"] = 0 if part.get("podium") else (2 if z0 >= 0.5 else 1)   # podium, then wings, then the arm
        if part.get("lean"):     # lean the top along the long axis (fraction of footprint length)
            d_ = part.pop("lean") * (S1 - S0); part["shift"] = (ux * d_, uy * d_)
        out.append(part)
    return out

def g_tower(b):
    # G Tower, modelled from a street photo: a long low podium; a slim full-height north tower; a thick arm jutting
    # out at the top; a narrow recessed fin under the arm; a slit of sky; and a shorter south tower that leans
    # outward. Seen from the side the pieces read as a giant "G".
    return boxes(b, [
        (0.00, 1.00, 0.00, 1.00, 0.00, 0.10, {"podium": True}),               # podium (both towers stand on it)
        (0.62, 0.95, 0.20, 0.80, 0.10, 1.00, {"mull": True}),                 # tall north tower, same setback as the south one
        (0.55, 0.62, 0.34, 0.66, 0.10, 0.72, {"mull": True}),                 # narrow fin under the arm
        (0.30, 0.62, 0.20, 0.80, 0.72, 1.00, {"mull": True}),                 # the big arm jutting out at the top
        (0.05, 0.47, 0.20, 0.80, 0.10, 0.63, {"mull": True, "lean": -0.07}),  # shorter south tower, leaning out
    ])

def twin(b, gap=0.24):
    # twin towers on a low podium (One9Five)
    return boxes(b, [(0.00, 1.00, 0.00, 1.00, 0.00, 0.05, {"podium": True}),
                     (0.00, 0.5 - gap / 2, 0.08, 0.92, 0.05, 1.00, {"mull": True}),
                     (0.5 + gap / 2, 1.00, 0.08, 0.92, 0.05, 1.00, {"mull": True})])

def massing(b):
    k = b["key"][0] if b["key"] else None
    if k == "gtower": return g_tower(b)
    if k == "c195": return twin(b)
    if b["key"] and b["lv"] >= 20: b["mull"] = True
    return [b]
blds = [p for b in blds for p in massing(b)]

W = {"motorway": 16, "trunk": 22, "primary": 20, "secondary": 11, "tertiary": 9, "motorway_link": 8, "primary_link": 8, "trunk_link": 8}
ORDER = ["tertiary", "secondary", "primary_link", "trunk_link", "motorway_link", "primary", "trunk", "motorway"]
roads = []
for e in els:
    t = e.get("tags", {}); hw = t.get("highway")
    if e["type"] != "way" or hw not in W or not e.get("geometry") or t.get("tunnel") == "yes": continue
    pts = [local(p["lat"], p["lon"]) for p in e["geometry"]]
    if all(math.hypot(x, y) > RANGE + 80 for x, y in pts): continue
    roads.append({"hw": hw, "pts": pts, "elev": hw == "motorway"})

def shade(hexcol, f):
    h = hexcol.lstrip("#"); r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    r, g, b = ((round(c + (255 - c) * f) for c in (r, g, b)) if f >= 0 else (round(c * (1 + f)) for c in (r, g, b)))
    return f"#{r:02x}{g:02x}{b:02x}"

def render(name, deg):
    th = math.radians(deg); c, s = math.cos(th), math.sin(th)
    rot = lambda x, y: (x * c - y * s, x * s + y * c)
    def P(x, y, z=0.0):
        xr, yr = rot(x, y)
        return (xr, -yr * math.sin(TILT) - z * ZX * math.cos(TILT))
    ps = lambda pts: " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    ll = lambda lat, lon, z=0: P(*local(lat, lon), z)

    R = RANGE
    ground = [P(*p) for p in [(-R, -R), (R, -R), (R, R), (-R, R)]]
    # circular-ish ground clip looks nicer: use an octagon
    octo = [P(R * math.cos(a), R * math.sin(a)) for a in [i * math.pi / 4 + math.pi / 8 for i in range(8)]]
    xs = [p[0] for p in octo]; ys = [p[1] for p in octo]
    tall = max(b["h"] for b in blds) * ZX * math.cos(TILT)
    vb = (min(xs) - 6, min(ys) - tall - 20, max(xs) - min(xs) + 12, max(ys) - min(ys) + tall + 30)

    out_roads = []
    for rd in sorted(roads, key=lambda r: ORDER.index(r["hw"])):
        pts = [P(x, y) for x, y in rd["pts"]]
        w = W[rd["hw"]] * (0.6 + 0.4 * math.sin(TILT))
        cls = "rd-x" if rd["elev"] else ("rd-m" if rd["hw"] in ("primary", "trunk") else "rd")
        out_roads.append(f'<polyline class="{cls}" points="{ps(pts)}" stroke-width="{w:.1f}"/>')
        if rd["hw"] in ("primary", "trunk") and not rd["elev"]:
            out_roads.append(f'<polyline class="rd-c" points="{ps(pts)}"/>')

    out_b = []
    depth = lambda p: rot(*p)[1]
    # painter's order: whole buildings far-to-near. Inside a multi-part building: the podium first; a piece that
    # rests on top of another (e.g. the arm above the south tower) after it; otherwise far-to-near, so the arm and
    # the north tower it belongs to are layered correctly from every side.
    from functools import cmp_to_key
    def bbox(p_):
        xs_ = [q[0] for q in p_["ring"]]; ys_ = [q[1] for q in p_["ring"]]
        return min(xs_), max(xs_), min(ys_), max(ys_)
    def overlap(a, b):
        ax0, ax1, ay0, ay1 = bbox(a); bx0, bx1, by0, by1 = bbox(b)
        return ax0 < bx1 - 0.5 and bx0 < ax1 - 0.5 and ay0 < by1 - 0.5 and by0 < ay1 - 0.5
    def cmp(a, b):
        if a.get("podium") != b.get("podium"): return -1 if a.get("podium") else 1
        if a.get("z0", 0) >= b["h"] - 0.01 and overlap(a, b): return 1      # a sits on top of b
        if b.get("z0", 0) >= a["h"] - 0.01 and overlap(a, b): return -1
        da, db = depth(a["c"]), depth(b["c"])
        return -1 if da > db else (1 if da < db else 0)
    groups = {}
    for b in blds: groups.setdefault(b.get("gid", id(b)), []).append(b)
    order = []
    for g_ in sorted(groups.values(), key=lambda g_: -depth(g_[0].get("gc", g_[0]["c"]))):
        if len(g_) == 1: order += g_; continue
        rest = sorted(g_, key=lambda p_: -depth(p_["c"]))
        while rest:          # pick the next part that nothing remaining must come before (stable, cycle-safe)
            for i_, cand in enumerate(rest):
                if all(cmp(cand, o) <= 0 for o in rest if o is not cand): break
            else: i_ = 0
            order.append(rest.pop(i_))
    ggrads, gref = "", {}
    for gid_, g_ in groups.items():
        if len(g_) < 2 or not g_[0]["key"]: continue
        top = min(P(x, y, p_["h"])[1] for p_ in g_ for x, y in p_["ring"])
        bot = max(P(x, y, 0)[1] for p_ in g_ for x, y in p_["ring"])
        col = g_[0]["key"][2]; n_ = len(gref)
        for tag, f in (("a", 0.10), ("b", -0.08), ("c", -0.26)):
            ggrads += (f'<linearGradient id="gu{n_}-{tag}" gradientUnits="userSpaceOnUse" x1="0" y1="{top:.1f}" x2="0" y2="{bot:.1f}">'
                       f'<stop offset="0" stop-color="{shade(col, min(0.6, f + 0.38))}"/><stop offset=".55" stop-color="{shade(col, f)}"/>'
                       f'<stop offset="1" stop-color="{shade(col, f - 0.06)}"/></linearGradient>')
        gref[gid_] = f"gu{n_}"
    for b in order:
        r, h, key, z0 = b["ring"], b["h"], b["key"], b.get("z0", 0)
        sh = b.get("shift", (0.0, 0.0)); span = max(1e-6, h - z0)
        Q = lambda x, y, z: P(x + sh[0] * (z - z0) / span, y + sh[1] * (z - z0) / span, z)
        faces = []
        for i in range(len(r)):
            (x1, y1), (x2, y2) = r[i], r[(i + 1) % len(r)]
            nxr, nyr = rot(y2 - y1, -(x2 - x1))
            if nyr >= 0: continue
            L = math.hypot(nxr, nyr) or 1
            lit = -nxr / L                      # +1 = faces left (lit), -1 = faces right
            quad = [Q(x1, y1, z0), Q(x2, y2, z0), Q(x2, y2, h), Q(x1, y1, h)]
            d = rot((x1 + x2) / 2, (y1 + y2) / 2)[1]
            if b.get("glow"):
                faces.append((d - 0.01, f'<polygon class="glow" points="{ps(quad)}"/>')); continue
            if key:
                tg = 'a' if lit > 0.35 else ('b' if lit > -0.35 else 'c')
                if b.get("gid") in gref and not b.get("podium"): col = f"url(#{gref[b['gid']]}-{tg})"
                else: col = f"url(#gk-{key[0]}-{'p' if b.get('podium') else ''}{tg})"
                lines = ""
                step = 3 if b["lv"] > 12 else 2
                for f in range(step, int(b["lv"]), step):
                    z = z0 + f * LEVEL_H
                    a1, a2 = Q(x1, y1, z), Q(x2, y2, z)
                    lines += f"M{a1[0]:.1f},{a1[1]:.1f}L{a2[0]:.1f},{a2[1]:.1f}"
                if b.get("mull"):    # vertical mullions every ~7 m for a curtain-wall look
                    seg = math.hypot(x2 - x1, y2 - y1); n = int(seg // 7)
                    for m in range(1, n + 1):
                        f_ = m / (n + 1); xa, ya = x1 + (x2 - x1) * f_, y1 + (y2 - y1) * f_
                        a1, a2 = Q(xa, ya, z0), Q(xa, ya, h)
                        lines += f"M{a1[0]:.1f},{a1[1]:.1f}L{a2[0]:.1f},{a2[1]:.1f}"
                faces.append((d, f'<polygon points="{ps(quad)}" fill="{col}"/>' + (f'<path class="fl" d="{lines}"/>' if lines else "")))
            else:
                cls = "w1" if lit > 0.35 else ("w2" if lit > -0.35 else "w3")
                faces.append((d, f'<polygon class="{cls}" points="{ps(quad)}"/>'))
        faces.sort(key=lambda f: -f[0])
        roof = [Q(x, y, h) for x, y in r]
        if b.get("glow"): roof_svg = ""
        else: roof_svg = f'<polygon class="roof" points="{ps(roof)}"' + (f' style="fill:{shade(key[2], 0.78 if b.get("podium") else 0.5)}"' if key else "") + "/>"
        attr = f' class="bld key" data-k="{key[0]}"' if key else ' class="bld"'
        out_b.append(f"<g{attr}>" + "".join(f for _, f in faces) + roof_svg + "</g>")

    walk = [ll(a, b, -3) for a, b in WALK]
    mx_, my_ = ll(*MRT, -3)
    under = (f'<polyline class="walk-glow" points="{ps(walk)}"/><polyline class="walk" points="{ps(walk)}"/>'
             f'<g class="mrt-tag" data-k="mrt" transform="translate({mx_:.1f},{my_:.1f})"><circle r="11"/><text y="4.5">M</text></g>')

    # numbered step pins along the walk (shown with the X-ray route)
    pins = [(0, "1"), (1, "2"), (4, "3"), (5, "4")]
    steps = "".join(f'<g class="pin" transform="translate({walk[i][0]:.1f},{walk[i][1]:.1f})"><circle r="8"/><text y="3.5">{t}</text></g>' for i, t in pins)
    names = []
    for item in ROADNAMES:
        nm, lat, lon = item[:3]
        X, Y = ll(lat, lon)
        names.append(f'<text class="rdname{" jn" if len(item) > 3 else ""}" x="{X:.1f}" y="{Y:.1f}">{nm}</text>')

    labels, done = [], set()
    for b in sorted(blds, key=lambda b: -b["h"]):
        if not b["key"] or b["key"][0] in done: continue
        done.add(b["key"][0])
        X, Y = P(*b["c"], b["h"])
        sm = " sm" if b["key"][0] in ("c195", "cmobi", "cashton", "cline", "bkkcity") else (" hl" if b["key"][0] in ("gtower", "hotel") else "")
        labels.append(f'<g class="lbl{sm}" data-k="{b["key"][0]}" transform="translate({X:.1f},{Y - 6:.1f})"><text>{b["key"][1]}</text></g>')

    grads = ""
    for k, col in {v[0]: v[2] for v in KEYS.values()}.items():
        for tag, f in (("a", 0.10), ("b", -0.08), ("c", -0.26)):
            top, bot = shade(col, min(0.6, f + 0.38)), shade(col, f - 0.06)
            grads += (f'<linearGradient id="gk-{k}-{tag}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="{top}"/>'
                      f'<stop offset=".55" stop-color="{shade(col, f)}"/><stop offset="1" stop-color="{bot}"/></linearGradient>')
            pc = shade(col, 0.55 + f * 0.5)   # pale podium glass
            grads += (f'<linearGradient id="gk-{k}-p{tag}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{shade(pc, 0.25)}"/>'
                      f'<stop offset="1" stop-color="{shade(pc, -0.12)}"/></linearGradient>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f"{v:.0f}" for v in vb)}" class="cbd3d" data-view="{name}">'
           f'<defs>{grads}{ggrads}<linearGradient id="gk-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#ffc56b"/></linearGradient></defs>'
           f'<polygon class="ground" points="{ps(octo)}"/>'
           f'<g class="roads">{"".join(out_roads)}</g><g class="under">{under}</g>'
           f'<g class="blds">{"".join(out_b)}</g><g class="rdnames">{"".join(names)}</g><g class="lbls">{"".join(labels)}</g>'
           f'<g class="under-top">{under}{steps}</g>'
           f'<text class="osm" x="{vb[0] + vb[2] - 6:.0f}" y="{vb[1] + vb[3] - 6:.0f}" text-anchor="end">© OpenStreetMap contributors</text></svg>')
    return svg

os.makedirs(out_dir, exist_ok=True)
for i, (name, deg) in enumerate(VIEWS):
    svg = render(name, deg)
    open(os.path.join(out_dir, f"cbd-{i}.svg"), "w", encoding="utf-8").write(svg)
    print(name, len(svg), "bytes")
print("buildings", len(blds), "roads", len(roads))
