---
name: cold-outreach
description: Write and send first touch cold emails to enriched apparel leads from info@bncproductionz.com, then log and track them.
---

# Cold outreach

Only leads with verdict **email** from enrich-leads. All CLAUDE.md email rules apply.

1. Search Gmail for the brand name and domain first. If anyone (including the other session) emailed them, skip.
2. Read PLAYBOOK.md. About 70% of emails use the proven angles listed there. The other 30% test a new angle, which gets tagged `test:<angle>` in the LEADS.md row.
3. Write it with the cold email template in MESSAGES.md:
   - one genuine compliment
   - one verified nugget in plain words, no links to their site
   - one line on why it matters
   - the free audit offer
   - bncapparel.site
   - the signature
4. Quality gate. Score the draft against the two best performing emails in PLAYBOOK.md:
   - does it sound researched?
   - is it specific?
   - under 120 words?
   - no hype?
   - no hyphen or dash punctuation?
   - only one link?

   Rewrite until it would pass a strict outside reviewer. Never grade a draft as "good" just to move on.
5. Send with mcp__Gmail__send_message. Max 50 new emails per day.
6. Log the full text in MESSAGES.md under today's date. Update LEADS.md (sent 1, FU 0/2, last email, next FU = +3 days), commit, push, then run sync-doc.
