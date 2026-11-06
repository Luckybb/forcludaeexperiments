import sys,re,subprocess,html,json
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
def get(u):
    try: return subprocess.run(["curl","-sL","-m","12","-A",UA,u],capture_output=True,text=True,errors="ignore").stdout
    except Exception: return ""
BAD=re.compile(r'(?i)\.(png|jpe?g|gif|webp|svg)|sentry|wixpress|example\.|shopify\.com|domain\.com|email\.com|yourstore|u003e|@2x|@3x')
for d in sys.argv[1:]:
    base="https://"+d
    pages={"home":base,"contact":base+"/pages/contact","policy":base+"/policies/contact-information","about":base+"/pages/about"}
    out={"domain":d}; emails=set()
    for k,u in pages.items():
        h=get(u)
        if k=="home":
            t=re.search(r'<title[^>]*>(.*?)</title>',h,re.S|re.I); out["title"]=html.unescape(t.group(1).strip()) if t else None
            m=re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)',h,re.I) or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description',h,re.I)
            out["desc"]=html.unescape(m.group(1)) if m else None
            out["h1"]=[re.sub('<[^>]+>','',x).strip()[:80] for x in re.findall(r'<h1[^>]*>(.*?)</h1>',h,re.S|re.I)][:3]
            out["len"]=len(h)
            out["password"]= "password" in (out["title"] or "").lower() or "/password" in h[:5000]
            out["footer_year"]=sorted(set(re.findall(r'©\s*(20\d\d)',h)))
        for e in re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',h):
            if not BAD.search(e): emails.add(e.lower())
        for e in re.findall(r'mailto:([^"\'?<> ]+)',h):
            if not BAD.search(e): emails.add(html.unescape(e).lower())
    out["emails"]=sorted(emails)
    print(json.dumps(out))
