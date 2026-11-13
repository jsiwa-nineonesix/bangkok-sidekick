"""Weekly check (run by .github/workflows/applepay-th.yml): has Apple Pay launched in Thailand?

Looks for "Thailand" in Apple's official list of Apple Pay countries. If it is there and the app still says
Apple Pay is not available, it swaps the tip, bumps the app version and adds a changelog note.
Prints "changed=true" (for the workflow) only when it edited files.
"""
import datetime, json, os, re, sys, urllib.request

APPLE_URL = "https://support.apple.com/en-us/102775"   # "Countries and regions that support Apple Pay"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA, SW, LOG = (os.path.join(ROOT, "app", f) for f in ("data.js", "sw.js", "changelog.json"))
MARK_NO = "// @applepay-th: no"

NEW_TIP = ('    { h: "Phone payments: Google Pay & Apple Pay", b: ["Google Pay (Google Wallet) works in Thailand: tap your phone at '
           'contactless card readers in malls, 7-Eleven, supermarkets and restaurant chains, using a Visa or Mastercard.", '
           '"Apple Pay is now available in Thailand ({date}): look for the contactless symbol and tap your iPhone or Apple Watch. '
           'Some small shops may not take it yet, so carry your physical card too.", '
           '"Street food, markets, taxis and boats are still mostly cash or Thai QR (PromptPay)."] },  '
           '// @applepay-th: yes (updated automatically by .github/workflows/applepay-th.yml)')


def apple_lists_thailand() -> bool:
    req = urllib.request.Request(APPLE_URL, headers={"User-Agent": "Mozilla/5.0 (BangkokSidekick weekly check)"})
    html = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
    if len(html) < 20000 or "Apple Pay" not in html:
        raise SystemExit("Apple page looks wrong (too short or no 'Apple Pay'); not changing anything")
    text = re.sub(r"<[^>]+>", "\n", html)
    return any(line.strip() == "Thailand" for line in text.splitlines())


def main() -> None:
    data = open(DATA, encoding="utf-8").read()
    if MARK_NO not in data:
        print("changed=false  (app already says Apple Pay is available)"); return
    if not apple_lists_thailand():
        print("changed=false  (Thailand not on Apple's list yet)"); return

    today = datetime.date.today().isoformat()
    lines = data.split("\n")
    idx = [i for i, l in enumerate(lines) if MARK_NO in l]
    if len(idx) != 1: raise SystemExit("expected exactly one Apple Pay tip line")
    lines[idx[0]] = NEW_TIP.replace("{date}", today)
    data = "\n".join(lines)

    m = re.search(r'version: "(\d+)"', data)
    old_v, new_v = m.group(1), str(int(m.group(1)) + 1)
    data = data.replace(f'version: "{old_v}"', f'version: "{new_v}"', 1)
    open(DATA, "w", encoding="utf-8").write(data)

    sw = open(SW, encoding="utf-8").read()
    open(SW, "w", encoding="utf-8").write(sw.replace(f"bangkok-sidekick-v{old_v}", f"bangkok-sidekick-v{new_v}"))

    log = json.load(open(LOG, encoding="utf-8"))
    log["releases"].insert(0, {"v": new_v, "date": today, "notes": ["Good news: Apple Pay is now available in Thailand, so the payments tip is updated"]})
    open(LOG, "w", encoding="utf-8").write(json.dumps(log, ensure_ascii=False, indent=2) + "\n")
    print(f"changed=true  (v{old_v} -> v{new_v})")


if __name__ == "__main__":
    main()
    sys.exit(0)
