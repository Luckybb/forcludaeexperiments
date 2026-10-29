# BNC site: blog and tracking setup

## 1. Write and publish blog posts (like WordPress)

Open **https://www.bncapparel.site/admin/** and log in with GitHub.

- **Blog posts > New Blog post**: write the title, a short description (shown on Google), pick a date, add a cover image and tags, then write the post in the editor (headings, bold, links, images, lists).
- Click **Publish**. The site rebuilds automatically and the post is live at bncapparel.site/blog/ in about 1 to 2 minutes.
- **Draft** switch: keep a post hidden until it's ready.

Each post automatically gets: its own SEO title and description, Google article data, breadcrumbs, a spot in the sitemap and RSS feed, and a free audit call to action.

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
- Use H2 headings for each section and link to the free audit (`/#audit`).
- Cover images: about 1600 x 900 px, under 300 KB, with a description (alt text).

## 2. Google Tag Manager, Analytics and Search Console

- **Tag Manager**: both containers you gave, `GTM-T6ZBT4ZS` and `GTM-WK4V4SB3`, are on every page (homepage, blog, 404), so both can be verified in Tag Assistant. `GTM-WK4V4SB3` contains your GA4 Google tag (`G-S37MX6BC9R`). `GTM-T6ZBT4ZS` currently has no tags published; if you add a GA4 tag there too, every visit is counted twice, so keep GA4 in one container only.
- **Conversion events** already sent to Tag Manager: `generate_lead` (audit form sent, with `lead_priority` HOT/WARM/COLD). To see them in GA4: in GTM-WK4V4SB3 create a **Custom Event** trigger for each name and a **Google Analytics: GA4 Event** tag (Measurement ID `G-S37MX6BC9R`, same event name), publish, then mark `generate_lead` as a key event in GA4.
- **Search Console**: the verification tag is on the homepage. In Search Console use **URL prefix** `https://www.bncapparel.site/`, method **HTML tag**, click **Verify**, then submit `sitemap.xml` under **Sitemaps**.

## 3. How the site is built
Netlify runs `npm run build` (see `build.mjs`), which copies the homepage and assets unchanged and generates `/blog/`, the sitemap and the RSS feed into `dist/`. Posts live in `content/blog/` as Markdown files.

## 4. Uploading by hand (Netlify drag and drop)
Upload the contents of the `dist` folder (or the zip of it) at Netlify: **Deploys > drag and drop**. Redirects and headers are included as `_redirects` and `_headers`.
Note: with manual uploads, posts published in `/admin/` are saved to GitHub but only appear on the site after the next build and upload. To publish posts instantly, connect the site to GitHub in Netlify (**Site configuration > Build & deploy > Link repository**, branch `claude/bnc-apparel-site-recreation-ni25ng`); Netlify then rebuilds on every publish.
