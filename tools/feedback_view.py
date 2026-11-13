"""Pretty-print Bangkok Sidekick feedback JSON (from tools/feedback.sh) on stdin."""
import json, sys
from datetime import datetime, timezone, timedelta

ICT = timezone(timedelta(hours=7))
data = json.load(sys.stdin)
rows = data.get("feedback", [])
if not rows:
    print(data.get("error") and "Error: " + data["error"] or "No feedback yet.")
    sys.exit()
avg = sum(r["stars"] for r in rows) / len(rows)
print("%d responses, average %.1f / 5\n" % (len(rows), avg))
for s in range(5, 0, -1):
    n = sum(1 for r in rows if r["stars"] == s)
    print("  %d★ %s %d" % (s, "█" * n, n))
print()
for r in rows:
    t = datetime.fromisoformat(r["ts"].replace("Z", "+00:00")).astimezone(ICT).strftime("%d %b %H:%M")
    stars = "★" * r["stars"] + "☆" * (5 - r["stars"])
    extra = ("  👍%d" % r["metoo"] if r.get("metoo") else "") + ("  [HIDDEN]" if r.get("hidden") else "")
    print("#%s  %s  %s ICT  v%s  %s  %s%s" % (r["id"], stars, t, r.get("ver") or "?", r.get("device") or "", r.get("name") or "(anonymous)", extra))
    if r.get("comment"):
        print("     " + r["comment"].replace("\n", "\n     "))
