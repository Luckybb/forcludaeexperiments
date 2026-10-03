# Outreach rules for BNC Apparel (always follow)

These apply to every cold email, follow-up, DM or audit written for this business.

## Email content
- Always send outreach from **info@bncproductionz.com**. The website and the only link is **bncapparel.site**.
- Never put a Google link in an email. No `google.com/url?q=...` redirects, no links copied out of Gmail or search results.
- Do not paste links to the prospect's own site or pages. Describe the problem in plain words instead (for example "your reservation page title still shows a placeholder").
- The only link in an email is the call to action: **bncapparel.site**
- Point out the specific problem, explain briefly why it matters, then CTA to bncapparel.site and the free audit offer.
- Never use em dashes or hyphens as punctuation. Use commas.
- No hype, no credentials dump, no meeting ask in the first email.

## Signature
- Sign as **Ben | BNC Group | bncapparel.site**
- Never sign as "BNC Apparel", "BNC Productionz" or "BNC Designs".

## When a prospect replies (warm lead)
- Keep it short. Do not send a full audit by email and never say "here's what I'd fix".
- Open with emotion: recognize what's genuinely great about their brand or story.
- Then point out 2 to 3 bugs as problems only, with no solutions, so they feel the gap (name conflicts, inconsistent naming, crowded or AI looking visuals, SEO issues).
- Add a line of light education on why it hurts: split Google search strength, lost long term free organic traffic, lost trust and higher bounce rate.
- Tease that more was found and is easier to show than explain.
- CTA: a free in depth audit call (about 20 minutes) where we walk through everything and give the solutions, no strings attached, they keep the plan either way. Ask them to reply with a day, weekdays 11 AM to 3:30 PM Pacific, plus bncapparel.site.
- Always show Ben the draft before sending replies to warm leads.

## Follow-ups
- Wait at least 3 days after our last message before following up.
- Oldest outreach first, up to 50 follow-ups per day.
- Max 2 follow-ups per lead, then stop.
- Reply in the same Gmail thread.
- Skip anyone who bounced, replied, or asked to stop. Replies go to Ben to handle.
- If a brand was already emailed again at a different address in the last 3 days, skip the older thread.
- Only restate facts that are in the original email.

## Lead tracking
- Two copies, always kept the same: **LEADS.md** in this repo (source of truth, read it at the start of every session) and the Claude Doc "BNC Group Lead Pipeline": https://claude.ai/code/artifact/0996846a-bfff-4980-bc6f-e801b8b7ac2e
- After sending emails or follow ups, update that lead's row in LEADS.md (sent count, FU x/2, last email, next FU), add new leads, move replies to Hot leads and bounces to Lost, then commit and push.
- Then sync the doc with the whole file (the doc caps one write at 32KB, so go through a file upload):
  1. Artifact publish with url = the doc link, file_path = LEADS.md, asset: true. Note the asset id.
  2. Claude Docs batch: create blob with payload {"asset": "<asset id>"}. Note the blob id.
  3. Claude Docs create: object node, engine prose, parent file 544e9a87-83a6, source from blob/<blob id> as markdown. Note the node id.
  4. Claude Docs update: ref file 544e9a87-83a6, payload patch set ["content"] to {"kind":"node","id":"<node id>"}.
- Every message sent (cold email, follow up, pitch, warm reply) is logged in full in **MESSAGES.md** (newest day at the top, under its date) and synced to the doc's **Messages** tab the same way: upload MESSAGES.md, create blob, create node with parent file e4a2687f-7eb3, then patch file e4a2687f-7eb3 content to the new node.
- Do not use the Slack list for tracking.

## Extra lead gen methods (use alongside cold email)
- Free audit giveaway post: in apparel founder groups (Facebook, Shopify community, Discord, LinkedIn) post that we're doing a full free brand audit for one apparel brand. DM everyone who comments, pick one, then offer the rest the free 20 minute audit call. They sell themselves to us.
- Instagram close friends pitch for hot leads: add the founder alone to close friends, post a short personalized story showing one real issue on their brand, tag them. Ben does this manually, Claude writes the script.
- Buy and break down: for hot leads, Ben orders one item, Claude helps document the full customer journey (confirmation email, shipping updates, packaging, review request) and turns the gaps into the golden nugget.
- Breakdown content: public posts breaking down what a well known apparel brand does right, or "3 things I'd keep from [brand]". Keep it positive when tagging prospects, never shame a brand in public.
- Founder feature series: invite founders to a short interview about their brand story, give them the clips, pitch the audit after.
- Referrals: ask every warm lead and client who else they know building a brand, after delivering value.
- Paid events: apparel trade shows and markets (MAGIC Las Vegas, Agenda, Dallas Market Center apparel markets, local pop up markets).
- Value follow ups: a second follow up can share one useful insight instead of repeating the pitch. Never pretend the person subscribed to anything.
