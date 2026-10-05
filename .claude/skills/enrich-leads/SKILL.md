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
