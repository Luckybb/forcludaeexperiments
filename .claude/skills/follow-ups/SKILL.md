---
name: follow-ups
description: Send due follow ups to cold leads in the same Gmail thread, rotating angles from the follow up pool so no lead gets the same "just checking in" twice.
---

# Follow ups

## Who is due
- LEADS.md rows where "Next FU" is today or earlier and FU is under 2/2.
- Oldest first, max 50 per day.
- For each one, open the Gmail thread first. Skip if they replied (move to Hot leads), bounced (move to Lost), asked to stop, or the brand was emailed at another address in the last 3 days.

## Follow up pool (rotate, never repeat an angle to the same lead)
Each follow up adds something new. Only restate facts from the original email.

**FU1 options**
- **A. Short bump with the stake.** Two lines: the issue from the first email is still there, and one line on what it costs (search traffic, first impressions).
- **B. Quick question.** "Is the website something you handle yourself, or does someone help you with it?" Easy to answer, starts a conversation.
- **C. Timing.** If they recently dropped a product or collection: new visitors are landing now, so the fix matters most this week.

**FU2 options (last note, value first)**
- **D. One useful insight.** A general apparel insight related to their issue, e.g. most first time visitors decide in seconds whether a brand feels worth their time. Then the "reply audit" offer.
- **E. Close the loop.** "I'll leave it here so I don't crowd your inbox. If you ever want the 3 to 5 things I'd look at first, just reply audit."
- **F. Pattern seen elsewhere.** "This is one of the most common things I see on growing apparel stores, and usually one of the quickest wins." No client names unless real and approved.

Pick the angle that fits the lead (C only if the drop is verified). Note the angle letter in the LEADS.md FU column, e.g. `1/2 (B)`. PLAYBOOK.md tracks which letters get replies. Shift the mix toward winners, but keep about 30% on other angles as tests.

## After sending
- Reply in the same thread with replyThreadId.
- Log the full text in MESSAGES.md.
- Update LEADS.md: FU x/2 with the angle, last email, next FU +3 days, or "done" after 2/2.
- Commit, push, run sync-doc.
