# BNC SEO plan

## What is already done on the site
- Keyword focused title and meta description (clothing brand design, T-shirt design, Shopify, print on demand)
- One H1, clean H2/H3 structure, descriptive image alt text on every portfolio and case study image
- Structured data (JSON-LD graph): Organization, WebSite, WebPage, ProfessionalService with 8 services and a free audit offer, ItemList of 8 portfolio projects, FAQPage matching all 8 visible FAQs
- Open Graph and Twitter cards with a 1200x630 preview image (og.jpg)
- Crawlable favicons (svg, 48px png, apple touch icon), web manifest
- sitemap.xml with image entries for every portfolio board, robots.txt, 404 page (noindex)
- llms.txt so AI search tools (ChatGPT, Perplexity, Google AI answers) describe BNC correctly
- netlify.toml: redirects bncapparel.site to https://www., long image caching, security headers
- All scripts deferred, images compressed to WebP and lazy loaded

## Added: service pages, blog and tracking
- 8 service landing pages under /services/ (one per service), each with Service, Breadcrumb and FAQ structured data, related work and internal links
- Blog at /blog/ with a WordPress-style editor at /admin/, BlogPosting structured data, RSS feed and automatic sitemap entries
- 3 starter posts: how to start a clothing brand, Printful vs Printify, and launching creator merch (Dream in Defiance case study)
- Google Tag Manager (GTM-WK4V4SB3 with GA4 G-S37MX6BC9R) on every page and the Search Console verification tag
- Footer links from the homepage to every service page and the blog, so Google finds them

## Target keywords
Primary (homepage, US): clothing brand design agency, t-shirt design services, apparel brand identity, streetwear brand design, merch design for creators
Secondary: print on demand store setup, Shopify clothing store design, clothing brand marketing agency, Printful Shopify setup, custom hoodie design, merch design for creators
Long tail (future blog posts): how to start a clothing brand, how to launch merch as a YouTuber, Printful vs Printify, best Shopify theme for clothing brand, how to price t-shirts, clothing brand launch checklist

## US targeting already set
- Title and description say "clothing brand design agency for US apparel brands and creators"
- hreflang en-us, og:locale en_US, US phone number in structured data, areaServed United States first

## Week 1 after launch
1. Google Search Console: add the domain, submit https://www.bncapparel.site/sitemap.xml, request indexing of the homepage
2. Bing Webmaster Tools: import from Search Console (also feeds ChatGPT search)
3. Test structured data: https://search.google.com/test/rich-results with the homepage URL
4. Test speed: https://pagespeed.web.dev (aim for green on mobile)
5. Google Business Profile as a service area business (no public address needed), set service areas to US states or "United States", category "Graphic designer" plus "Marketing agency", link the site

## Backlinks and mentions (highest impact, in order)
1. Behance: add https://www.bncapparel.site to your profile and to every project description
2. Dribbble, LinkedIn company page, Instagram and TikTok bio links
3. Ask clients (Dream in Defiance, Paragon, etc.) for a "Designed by BNC" credit link in their site footer
4. Directories: Clutch, DesignRush, Sortlist, GoodFirms (free listings)
5. Printful and Printify expert / designer directories, Shopify Partners directory
6. Guest posts or podcast mentions in creator merch and streetwear communities

## Content plan
Service pages and the blog are live. Next:
- Publish 1 to 2 posts a month on the long tail keywords above (sitemap and RSS update automatically)
- Link each new post to its related service pages using the Related services field
- Later: one page per case study (for example /work/dream-in-defiance/)

## Things to keep consistent
Use one business name everywhere (site, email, Behance, Google Business Profile, directories). Right now BNC, BNC Apparel, BNC Designs and BNC Productionz are all used. Pick one and update the listings to match.
