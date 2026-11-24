---
name: enrich-leads
description: Enrich and score apparel brand leads before any outreach. Use whenever new leads are scraped or before a cold email batch. No lead gets emailed without this.
---

# Enrich leads (always before outreach)

1. Put candidate domains in the scratchpad, one per line.
2. Run `python3 tools/enrich.py --file <domains.txt>`. Each line returns:
   - market: Shopify country, currency, policy page country, TLD
   - activity: product count, days since newest product, store locked or not
   - investing signals: Meta, TikTok or Google ad pixel, email tool (Klaviyo etc.), reviews app
   - socials: Instagram, TikTok handle
   - emails found
   - nuggets: verified issues we can mention in plain words
   - score out of 20 and verdict
3. Act on the verdict:
   - **email** (14+ and an email found): goes to cold-outreach.
   - **dm or later** (10 to 13): add to "DM leads for Ben" in LEADS.md with the Instagram handle.
   - **skip** (under 10, outside US, Canada, UK, Europe, or site down): do not contact. Note it in Lost only if it was already in LEADS.md.
4. "market unknown, check manually" means look at the about page, address or Instagram bio before emailing. Unknown never counts as approved.
5. Before writing, open the homepage text yourself and confirm the nugget is real and still there. The script flags candidates, a human eye picks the one worth mentioning.
6. If a scraped batch has fewer than half its leads scoring 14+, find a better source instead of lowering the bar.
7. Write the founder's first name, Instagram, score and nugget into the lead's LEADS.md row.

## Lessons learned
- Store fetched on its myshopify address can show a myshopify canonical even when the brand has its own domain. Never claim "you're still on the default Shopify address" unless you typed their own domain and saw it redirect there (Hood T'z, Oct 5).
- Gmail turns written domains into Google links. Describe titles in words ("your Google title starts with your web address"), never type the domain.
- Good sources so far: WebSearch with allowed_domains ["myshopify.com"] plus a niche query (golf, pickleball, run club, faith, western, gym, UK, Canada), then resolve and enrich. Niche "brands to know" list articles mostly return brands too big for us. Reddit and Apollo company search are blocked.
