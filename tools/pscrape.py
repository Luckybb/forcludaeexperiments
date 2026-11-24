import sys,json,subprocess
from concurrent.futures import ThreadPoolExecutor
def run(d):
    r=subprocess.run(["python3","tools/scrape.py",d],capture_output=True,text=True,timeout=110)
    return r.stdout.strip() or json.dumps({"domain":d,"err":"timeout/none"})
doms=[l.strip() for l in open(sys.argv[1]) if l.strip()]
with ThreadPoolExecutor(12) as ex:
    for o in ex.map(lambda d: (lambda: run(d))() if True else None, doms):
        print(o, flush=True)
