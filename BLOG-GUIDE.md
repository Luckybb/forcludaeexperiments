# BNC site: blog, AI chat and tracking setup

## 1. Write and publish blog posts (like WordPress)

Open **https://www.bncapparel.site/admin/** and log in with GitHub.

- **Blog posts > New Blog post**: write the title, a short description (shown on Google), pick a date, add a cover image, tags and related services, then write the post in the editor (headings, bold, links, images, lists).
- Click **Publish**. The site rebuilds automatically and the post is live at bncapparel.site/blog/ in about 1 to 2 minutes.
- **Draft** switch: keep a post hidden until it's ready.
- **Service pages**: edit the text and FAQs of the 8 service pages the same way.

Each post automatically gets: its own SEO title and description, Google article data, breadcrumbs, a spot in the sitemap and RSS feed, links to related service pages, and a free audit call to action.

### One-time login setup (about 5 minutes)
1. On GitHub: **Settings > Developer settings > OAuth Apps > New OAuth App**
   - Application name: `BNC Blog`
   - Homepage URL: `https://www.bncapparel.site`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Click **Register application**, then **Generate a new client secret**. Copy the Client ID and the secret.
2. In Netlify: **Site configuration > Access & security > OAuth > Install provider > GitHub**, paste the Client ID and secret, save.
3. Go to **https://www.bncapparel.site/admin/** and click **Login with GitHub**. Use the GitHub account that owns the `luckybb/forcludaeexperiments` repo.

### Tips for posts that rank
- Put the phrase people search for in the title, e.g. "How to price a T-shirt for your clothing brand".
- Description: 1 to 2 sentences, about 150 characters.
- Use H2 headings for each section, link to a related service page and to the free audit (`/#audit`).
- Cover images: about 1600 x 900 px, under 300 KB, with a description (alt text).

## 2. AI chat assistant

The "Ask BNC AI" button opens a chat that answers questions about BNC and guides visitors to the free audit or WhatsApp. It needs an Anthropic API key:

1. Create a key at **https://console.anthropic.com** (Settings > API keys) and add billing.
2. In Netlify: **Site configuration > Environment variables > Add a variable**: key `ANTHROPIC_API_KEY`, value = your key.
3. **Deploys > Trigger deploy**.

Until the key is added, the chat shows a friendly message with the WhatsApp link instead of an answer. The assistant uses Claude Opus 5.5 at low effort for fast replies. What it knows about BNC is in `netlify/functions/chat.js` (the SYSTEM text), so edit it there when services change.

## 3. Google Tag Manager, Analytics and Search Console

- **Tag Manager**: containers `GTM-T6ZBT4ZS` and `GTM-WK4V4SB3` are on every page.
- **Google Analytics 4**: add it inside Tag Manager. In one container: **Tags > New > Google tag**, enter your GA4 Measurement ID (starts with `G-`), trigger **All Pages**, then **Submit > Publish**. Add GA4 to only one of the two containers, otherwise every visit is counted twice.
- **Conversion events** already sent to Tag Manager: `generate_lead` (audit form sent, with `lead_priority` HOT/WARM/COLD), `whatsapp_click`, `ai_chat_open`, `ai_chat_start`, `ai_chat_message`, `behance_click`. In GTM create a **Custom Event** trigger for each and a GA4 event tag, then mark `generate_lead` as a key event in GA4.
- **Search Console**: the verification tag is on the homepage. In Search Console use **URL prefix** `https://www.bncapparel.site/`, method **HTML tag**, click **Verify**, then submit `sitemap.xml` under **Sitemaps**.

## 4. How the site is built
Netlify runs `npm run build` (see `build.mjs`), which copies the homepage and assets unchanged and generates `/blog/`, `/services/`, the sitemap and the RSS feed into `dist/`. Content lives in `content/blog/` and `content/services/` as Markdown files.
