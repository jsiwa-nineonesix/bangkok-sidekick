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

LAT0, LON0 = 13.75770, 100.56640        # between the hotel, G Tower and The Ninth Towers
RANGE = 300                              # metres from centre to keep
TILT = math.radians(40)                  # 90 = straight down
LEVEL_H = 3.8                            # metres per floor
ZX = 1.45                                # height exaggeration so towers read as towers
VIEWS = [("north", 32), ("east", 122), ("south", 212), ("west", 302)]   # camera looks towards ...

KEYS = {   # OSM way id -> (key, label, colour)
    390013453: ("gtower", "G Tower", "#2f86ff"),
    182002417: ("hotel", "Avani Hotel", "#ff9a1f"),
    176298728: ("central", "Central Rama 9", "#ff5470"),
    176298735: ("fortune", "Fortune Town", "#8a63ff"),
    1339874482: ("ninth", "The Ninth Towers", "#1fb07a"),
    1339874483: ("ninth", "The Ninth Towers", "#1fb07a"),
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
    lv = levels(t); h = (lv if lv else 2) * LEVEL_H
    if not (e["id"] in KEYS or h > 9 or math.hypot(cx, cy) < 260): continue
    area = sum(pts[i][0] * pts[(i+1) % len(pts)][1] - pts[(i+1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    if area < 0: pts = pts[::-1]
    blds.append({"ring": pts, "h": h, "lv": lv or 2, "key": KEYS.get(e["id"]), "c": (cx, cy)})

# ---- G Tower is shaped like a giant "G": tall north block, a top arm reaching south over a see-through void,
# a small hook at the tip, and a lower block below (from photos on Wikimedia Commons). Build it from boxes on the
# real OSM footprint, aligned with the footprint's long side.
def g_tower(b):
    r = b["ring"]
    edges = [(r[i], r[(i + 1) % len(r)]) for i in range(len(r))]
    (p1, p2) = max(edges, key=lambda e: math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]))
    ux, uy = p2[0] - p1[0], p2[1] - p1[1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
    if uy < 0: ux, uy = -ux, -uy                       # u points north
    vx, vy = -uy, ux
    cx, cy = b["c"]
    us = [(x - cx) * ux + (y - cy) * uy for x, y in r]; vs = [(x - cx) * vx + (y - cy) * vy for x, y in r]
    s0, s1, t0, t1 = min(us), max(us), min(vs), max(vs)
    box = lambda a, c: [(cx + ux * a + vx * t0, cy + uy * a + vy * t0), (cx + ux * c + vx * t0, cy + uy * c + vy * t0),
                        (cx + ux * c + vx * t1, cy + uy * c + vy * t1), (cx + ux * a + vx * t1, cy + uy * a + vy * t1)]
    H = b["h"]; cut = s0 + (s1 - s0) * 0.45; hook = s0 + (s1 - s0) * 0.12
    parts = [((cut, s1), 0, H),            # tall north block, full height
             ((s0, cut), 0, H * 0.42),     # lower south block
             ((s0, cut), H * 0.78, H),     # top arm over the void
             ((s0, hook), H * 0.68, H * 0.78)]   # the hook of the "G"
    out = []
    for (a, c), z0, z1 in parts:
        ring = box(a, c)
        area = sum(ring[i][0] * ring[(i+1) % 4][1] - ring[(i+1) % 4][0] * ring[i][1] for i in range(4))
        if area < 0: ring = ring[::-1]
        mx_ = sum(p[0] for p in ring) / 4; my_ = sum(p[1] for p in ring) / 4
        out.append({"ring": ring, "z0": z0, "h": z1, "lv": (z1 - z0) / LEVEL_H, "key": b["key"], "c": (mx_, my_)})
    return out
blds = [p for b in blds for p in (g_tower(b) if b["key"] and b["key"][0] == "gtower" else [b])]

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
    for b in sorted(blds, key=lambda b: (-round(depth(b["c"]), 1), b.get("z0", 0))):
        r, h, key, z0 = b["ring"], b["h"], b["key"], b.get("z0", 0)
        faces = []
        for i in range(len(r)):
            (x1, y1), (x2, y2) = r[i], r[(i + 1) % len(r)]
            nxr, nyr = rot(y2 - y1, -(x2 - x1))
            if nyr >= 0: continue
            L = math.hypot(nxr, nyr) or 1
            lit = -nxr / L                      # +1 = faces left (lit), -1 = faces right
            quad = [P(x1, y1, z0), P(x2, y2, z0), P(x2, y2, h), P(x1, y1, h)]
            d = rot((x1 + x2) / 2, (y1 + y2) / 2)[1]
            if key:
                col = shade(key[2], 0.12 * lit - 0.12)
                lines = ""
                step = 3 if b["lv"] > 12 else 2
                for f in range(step, int(b["lv"]), step):
                    z = z0 + f * LEVEL_H
                    a1, a2 = P(x1, y1, z), P(x2, y2, z)
                    lines += f"M{a1[0]:.1f},{a1[1]:.1f}L{a2[0]:.1f},{a2[1]:.1f}"
                faces.append((d, f'<polygon points="{ps(quad)}" fill="{col}"/>' + (f'<path class="fl" d="{lines}"/>' if lines else "")))
            else:
                cls = "w1" if lit > 0.35 else ("w2" if lit > -0.35 else "w3")
                faces.append((d, f'<polygon class="{cls}" points="{ps(quad)}"/>'))
        faces.sort(key=lambda f: -f[0])
        roof = [P(x, y, h) for x, y in r]
        roof_svg = f'<polygon class="roof" points="{ps(roof)}"' + (f' style="fill:{shade(key[2], 0.45)}"' if key else "") + "/>"
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
        labels.append(f'<g class="lbl" data-k="{b["key"][0]}" transform="translate({X:.1f},{Y - 6:.1f})"><text>{b["key"][1]}</text></g>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f"{v:.0f}" for v in vb)}" class="cbd3d" data-view="{name}">'
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
