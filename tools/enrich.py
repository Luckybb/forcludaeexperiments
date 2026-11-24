"""Enrich and score apparel leads before any outreach.

Usage: python3 tools/enrich.py domain1.com domain2.com ...
       python3 tools/enrich.py --file domains.txt
Prints one JSON line per domain with enrichment fields, a score out of 20 and a verdict.
"""
import sys, re, subprocess, html, json, datetime
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
BAD = re.compile(r'(?i)\.(png|jpe?g|gif|webp|svg)|sentry|wixpress|example\.|shopify\.com|domain\.com|email\.com|yourstore|u003e|@2x|@3x')
OK_COUNTRIES = {"US", "CA", "GB", "UK", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "LU", "PT", "AT", "CH", "DK", "SE",
                "NO", "FI", "IS", "PL", "CZ", "SK", "HU", "SI", "HR", "GR", "RO", "BG", "EE", "LV", "LT", "MT", "CY"}
OK_CURRENCIES = {"USD", "CAD", "GBP", "EUR", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON"}
BAD_CURRENCIES = {"INR", "PKR", "LKR", "BDT", "NGN", "SAR", "AED", "EGP", "KES", "PHP", "IDR", "VND"}


def get(u, t=12):
    try:
        return subprocess.run(["curl", "-sL", "-m", str(t), "-A", UA, u], capture_output=True, text=True, errors="ignore").stdout
    except Exception:
        return ""


def first(pat, s, flags=re.I):
    m = re.search(pat, s, flags)
    return html.unescape(m.group(1).strip()) if m else None


def enrich(d):
    d = d.strip().replace("https://", "").replace("http://", "").strip("/")
    base = "https://" + d
    h = get(base)
    out = {"domain": d}
    if not h:
        out.update(score=0, verdict="skip", why=["site down"])
        return out
    out["title"] = first(r'<title[^>]*>(.*?)</title>', h, re.S | re.I)
    out["desc"] = first(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', h) or \
        first(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description', h)
    out["h1"] = [re.sub('<[^>]+>', '', x).strip()[:80] for x in re.findall(r'<h1[^>]*>(.*?)</h1>', h, re.S | re.I)][:2]
    out["password"] = "password" in (out["title"] or "").lower() or "/password" in h[:5000]
    years = sorted(set(re.findall(r'©\s*(20\d\d)', h)))
    out["footer_year"] = years[-1] if years else None

    # Platform, market and currency
    shopify = "cdn.shopify.com" in h or "Shopify.shop" in h
    out["platform"] = "shopify" if shopify else ("wix" if "wixstatic" in h else ("squarespace" if "squarespace" in h else ("woocommerce" if "woocommerce" in h else "other")))
    out["country"] = first(r'Shopify\.country\s*=\s*"([A-Z]{2})"', h, 0)
    out["currency"] = first(r'Shopify\.currency\s*=\s*\{"active":"([A-Z]{3})"', h, 0) or first(r'"priceCurrency"\s*:\s*"([A-Z]{3})"', h, 0) \
        or first(r'"currency(?:Code)?"\s*:\s*"([A-Z]{3})"', h, 0)
    tld = d.rsplit(".", 1)[-1].upper()

    # Social and marketing stack (signals the founder is investing)
    out["instagram"] = first(r'instagram\.com/([A-Za-z0-9_.]{2,30})', h, 0)
    out["tiktok"] = first(r'tiktok\.com/@([A-Za-z0-9_.]{2,30})', h, 0)
    out["meta_pixel"] = bool(re.search(r'fbq\(|connect\.facebook\.net|facebook-pixel', h))
    out["tiktok_pixel"] = "analytics.tiktok.com" in h
    out["google_ads"] = bool(re.search(r'AW-\d{6,}|googleadservices', h))
    out["email_tool"] = next((n for n, p in [("klaviyo", "klaviyo"), ("omnisend", "omnisend"), ("mailchimp", "mailchimp"),
                                            ("privy", "privy"), ("shopify email", "shopify-email")] if p in h.lower()), None)
    out["reviews_app"] = next((n for n, p in [("judge.me", "judge.me"), ("loox", "loox"), ("yotpo", "yotpo"), ("okendo", "okendo"),
                                             ("stamped", "stamped.io")] if p in h.lower()), None)

    # Catalog size and activity (Shopify only)
    out["products"] = None
    out["newest_product_days"] = None
    if shopify:
        try:
            pj = json.loads(get(base + "/products.json?limit=250", 15) or "{}").get("products", [])
            out["products"] = len(pj)
            dates = [p.get("published_at") or p.get("created_at") for p in pj]
            dates = [x for x in dates if x]
            if dates:
                newest = max(datetime.datetime.fromisoformat(x.replace("Z", "+00:00")) for x in dates)
                out["newest_product_days"] = (datetime.datetime.now(datetime.timezone.utc) - newest).days
        except Exception:
            pass

    # Emails
    emails = set()
    for u in [base, base + "/pages/contact", base + "/policies/contact-information", base + "/pages/about"]:
        page = h if u == base else get(u)
        for e in re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:com|co|net|org|us|ca|uk|shop|store|io|la|run|golf|de|fr|es|se|nl|ie|eu|it|club|clothing|studio|design)(?![A-Za-z])', page) + re.findall(r'mailto:([^"\'?<> ]+)', page):
            e = html.unescape(e).lower()
            if not BAD.search(e):
                emails.add(e)
        if u.endswith("contact-information"):
            out["policy_country_hint"] = first(r'\b(United States|USA|Canada|United Kingdom|England|Ireland|Germany|France|Spain|Italy|Netherlands|'
                                               r'India|Pakistan|Sri Lanka|Bangladesh|Nigeria|UAE|Saudi Arabia|Philippines)\b', re.sub('<[^>]+>', ' ', page))
    out["emails"] = sorted(emails)

    # Golden nugget candidates (verified issues we can mention in plain words)
    nuggets = []
    t = (out["title"] or "").strip()
    if not t or t.lower() in {"home", "home page", "shop", "store"} or "my store" in t.lower():
        nuggets.append("homepage title is empty or generic")
    if not out["desc"]:
        nuggets.append("no meta description, Google writes its own snippet")
    if out["footer_year"] and int(out["footer_year"]) < datetime.date.today().year - 1:
        nuggets.append(f"footer still says {out['footer_year']}")
    if not out["h1"]:
        nuggets.append("homepage has no main heading for Google")
    if not out["email_tool"]:
        nuggets.append("no email capture tool detected")
    if not out["reviews_app"]:
        nuggets.append("no product reviews shown")
    out["nuggets"] = nuggets

    # Score out of 20
    s, why = 0, []
    market = (out["country"] or "").upper() or None
    hint = out.get("policy_country_hint") or ""
    bad_hint = hint in {"India", "Pakistan", "Sri Lanka", "Bangladesh", "Nigeria", "UAE", "Saudi Arabia", "Philippines"}
    bad_market = (market and market not in OK_COUNTRIES) or (out["currency"] in BAD_CURRENCIES) or \
        tld in {"IN", "PK", "LK", "BD", "NG", "AE", "SA", "PH"} or (not market and not out["currency"] and bad_hint)
    if bad_market:
        out.update(score=0, verdict="skip", why=["outside target markets"])
        return out
    if market in OK_COUNTRIES or out["currency"] in OK_CURRENCIES or hint:
        s += 4; why.append("market ok")
    else:
        s += 1; why.append("market unknown, check manually")
    if out["password"]:
        why.append("store locked")
    else:
        s += 1
    nd = out["newest_product_days"]
    if nd is not None and nd <= 90:
        s += 4; why.append(f"new product {nd}d ago")
    elif nd is not None and nd <= 180:
        s += 2; why.append(f"last product {nd}d ago")
    elif nd is None and not shopify:
        s += 1
    pc = out["products"]
    if pc is not None:
        s += 3 if pc >= 10 else (2 if pc >= 3 else 0)
    else:
        s += 1
    if out["meta_pixel"] or out["tiktok_pixel"] or out["google_ads"]:
        s += 2; why.append("ad pixel, investing")
    if out["email_tool"]:
        s += 1
    if out["instagram"] or out["tiktok"]:
        s += 2
    if out["emails"]:
        s += 2
    else:
        why.append("no email found")
    real_gaps = [n for n in nuggets if n != "no product reviews shown"]
    if real_gaps:
        s += 1
    # Our client is a founder led brand with a real marketing gap, not a brand that already has a team and agency
    big = (pc or 0) >= 200 and out["email_tool"] and (out["meta_pixel"] or out["google_ads"]) and out["reviews_app"]
    out["size"] = "established, likely has a team" if big else "founder stage"
    out["score"] = min(s, 20)
    if big:
        verdict = "skip (too big)"
    elif s >= 14 and out["emails"] and real_gaps:
        verdict = "email"
    elif s >= 14 and out["emails"]:
        verdict = "email if you find a gap by eye"
    elif s >= 10:
        verdict = "dm or later"
    else:
        verdict = "skip"
    out["verdict"] = verdict
    out["why"] = why
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--file":
        args = [l.strip() for l in open(args[1]) if l.strip()]
    with ThreadPoolExecutor(10) as ex:
        for o in ex.map(enrich, args):
            print(json.dumps(o), flush=True)
