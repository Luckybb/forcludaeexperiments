// Builds the deployable site into dist/:
//  - copies the existing site files untouched (homepage, styles, scripts, images, icons)
//  - turns content/blog/*.md into /blog/ and /blog/<slug>/ pages
//  - turns content/services/*.md into /services/ and /services/<slug>/ pages
//  - writes sitemap.xml and /blog/rss.xml
// Run locally with: npm install && npm run build
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const SITE = "https://www.bncapparel.site";
const OUT = "dist";
const WA = "https://wa.me/17473364515?text=Hi%20BNC%2C%20I%27d%20like%20a%20free%20audit%20for%20my%20clothing%20brand.";
const today = new Date().toISOString().slice(0, 10);

// ---------- helpers ----------
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
const isoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : today);
const prettyDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).length / 220));
const abs = (url) => (!url ? "" : /^https?:/.test(url) ? url : SITE + (url.startsWith("/") ? url : "/" + url));

function loadCollection(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      let parsed;
      try { parsed = matter(fs.readFileSync(path.join(dir, f), "utf8")); }
      catch (err) { console.warn(`Skipping ${dir}/${f}: ${err.reason || err.message}`); return null; }
      const { data, content } = parsed;
      const slug = data.slug ? slugify(data.slug) : slugify(f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""));
      return { ...data, slug, body: content, html: marked.parse(content) };
    })
    .filter((p) => p && !p.draft);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copyRecursive(path.join(src, f), path.join(dest, f));
  } else fs.copyFileSync(src, dest);
}

// ---------- shared page parts ----------
const GTM_IDS = ["GTM-T6ZBT4ZS", "GTM-WK4V4SB3"];
const gtmHead = GTM_IDS.map((id) => `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');</script>`).join("\n  ");
const gtmBody = GTM_IDS.map((id) => `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`).join("\n  ");

function head({ title, description, url, image = "/og.jpg", type = "website", schema = [], extra = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <!-- Google Tag Manager -->
  ${gtmHead}
  <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}</script>
  <!-- End Google Tag Manager -->
  <meta name="google-site-verification" content="6CzrClzx4_GC6DPjvTPrEUib2yooQpFdynJm1dM9h_I" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en-us" href="${url}" />
  <link rel="alternate" type="application/rss+xml" title="BNC Blog" href="${SITE}/blog/rss.xml" />
  <meta name="theme-color" content="#0d0d0c" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="BNC" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${abs(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${abs(image)}" />
  ${extra}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/blog.css" />
  <link rel="stylesheet" href="/chat.css" />
  ${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ")}
</head>
<body class="bnc-page">
  <!-- Google Tag Manager (noscript) -->
  ${gtmBody}
  <!-- End Google Tag Manager (noscript) -->
  <header class="nav">
    <a href="/" class="logo" aria-label="BNC home">BNC<sup>®</sup></a>
    <nav class="nav__links" aria-label="Main">
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/#case">Case study</a>
      <a href="/#collections">Collections</a>
      <a href="/#ads-check">Ad check</a>
      <a href="/#faq">FAQ</a>
      <a href="/blog/">Blog</a>
    </nav>
    <a href="/#audit" class="pill pill--accent">Free audit</a>
  </header>
`;
}

const ctaBand = (title, sub) => `
    <div class="cta-band">
      <p class="cta-band__t">${title}</p>
      <p class="cta-band__s">${sub}</p>
      <div class="cta-band__btns">
        <a href="/#audit" class="pill pill--accent pill--lg">Get my free audit ↗</a>
        <a href="${WA}" target="_blank" rel="noopener" class="pill pill--line" data-wa>WhatsApp me</a>
      </div>
    </div>`;

function foot(services) {
  return `
  <footer class="footer">
    <a href="/#audit" class="footer__cta">
      <span class="serif">Let's find what's holding your brand back</span>
      <span class="footer__big">BNC<span>↗</span></span>
    </a>
    <div class="footer__row">
      <span>© ${new Date().getFullYear()} BNC Designs</span>
      <span>Growth marketing for apparel brands</span>
      <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.behance.net/burhanbnc" target="_blank" rel="noopener">Behance</a>
    </div>
    <nav class="footer__row" aria-label="Services">
${services.map((s) => `      <a href="/services/${s.slug}/">${esc(s.nav_label || s.title)}</a>`).join("\n")}
      <a href="/blog/">Blog</a>
    </nav>
  </footer>
  <script src="/chat.js" defer></script>
  <script>
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a"); if (!a) return;
      try { if (/wa\\.me/.test(a.href)) (window.dataLayer = window.dataLayer || []).push({ event: "whatsapp_click", link_location: location.pathname }); } catch (_) {}
    });
  </script>
</body>
</html>
`;
}

const orgRef = { "@id": SITE + "/#org" };
const breadcrumb = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: url })),
});

// ---------- build ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. Existing site, copied as is
const ROOT_FILES = fs.readdirSync(".").filter((f) =>
  /\.(html|css|js|png|svg|jpg|jpeg|webp|ico|txt|webmanifest)$/.test(f) && !["build.mjs"].includes(f));
for (const f of ROOT_FILES) fs.copyFileSync(f, path.join(OUT, f));
copyRecursive("images", path.join(OUT, "images"));
copyRecursive("admin", path.join(OUT, "admin"));

// 2. Content
const services = loadCollection("content/services").sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const posts = loadCollection("content/blog").sort((a, b) => new Date(b.date) - new Date(a.date));
const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

// 3. Service pages
for (const s of services) {
  const url = `${SITE}/services/${s.slug}/`;
  const faq = Array.isArray(s.faq) ? s.faq.filter((f) => f && f.q && f.a) : [];
  const related = posts.filter((p) => (p.services || []).includes(s.slug)).slice(0, 3);
  const work = Array.isArray(s.work) ? s.work : [];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.title,
      serviceType: s.title,
      description: s.description,
      url,
      provider: { "@type": "ProfessionalService", name: "BNC", url: SITE + "/", ...orgRef },
      areaServed: [{ "@type": "Country", name: "United States" }, "Worldwide"],
      offers: { "@type": "Offer", name: "Free site and business audit", price: "0", priceCurrency: "USD", url: SITE + "/#audit" },
    },
    breadcrumb([["Home", SITE + "/"], ["Services", SITE + "/services/"], [s.title, url]]),
  ];
  if (faq.length) schema.push({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  });
  const html = head({ title: s.seo_title || `${s.title} | BNC`, description: s.description, url, image: s.image || "/og.jpg", schema })
    + `
  <main class="bp">
    <section class="bp-hero">
      <nav class="bp-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / <span>${esc(s.title)}</span></nav>
      <div class="tag tag--light">[ SERVICE ]</div>
      <h1 class="bp-title">${esc(s.h1 || s.title)}</h1>
      <p class="bp-lead">${esc(s.lead || s.description)}</p>
      <div class="bp-hero__cta">
        <a href="/#audit" class="pill pill--accent pill--lg">Get my free audit ↗</a>
        <a href="${WA}" target="_blank" rel="noopener" class="pill pill--ghost" data-wa>WhatsApp me</a>
      </div>
    </section>
    <div class="bp-wrap">
      <article class="prose">
${s.html}
      </article>
${work.length ? `      <section class="bp-work">
        <div class="tag">[ RELATED WORK ]</div>
        <div class="bp-work__grid">
${work.map((w) => `          <a class="bp-work__card" href="/#work"><img src="/images/work/${esc(w)}.webp" alt="${esc(w.replace(/-/g, " "))} brand design work by BNC" loading="lazy" width="720" height="1080" /><span>${esc(w.replace(/-/g, " "))}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
${faq.length ? `      <section class="bp-faq">
        <h2>Questions about ${esc(s.title.toLowerCase())}</h2>
${faq.map((f) => `        <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
      </section>` : ""}
${related.length ? `      <section class="bp-related">
        <div class="tag">[ FROM THE BLOG ]</div>
        <ul>${related.map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a></li>`).join("")}</ul>
      </section>` : ""}
      <section class="bp-more">
        <div class="tag">[ OTHER SERVICES ]</div>
        <ul>${services.filter((x) => x.slug !== s.slug).map((x) => `<li><a href="/services/${x.slug}/">${esc(x.title)}</a></li>`).join("")}</ul>
      </section>
${ctaBand(s.cta_title || "Want to know where to start?", "Get a free audit with the 3 to 5 fixes that will move your brand first.")}
    </div>
  </main>` + foot(services);
  write(path.join(OUT, "services", s.slug, "index.html"), html);
}

// Services index
if (services.length) {
  const url = `${SITE}/services/`;
  const html = head({
    title: "Clothing Brand Services: Design, Shopify, POD, SEO & Ads | BNC",
    description: "Everything a clothing brand needs to launch and grow: T-shirt design, brand identity, print on demand setup, Shopify stores, SEO, ad creatives and social media.",
    url,
    schema: [breadcrumb([["Home", SITE + "/"], ["Services", url]])],
  }) + `
  <main class="bp">
    <section class="bp-hero">
      <nav class="bp-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <span>Services</span></nav>
      <div class="tag tag--light">[ SERVICES / ${String(services.length).padStart(2, "0")} ]</div>
      <h1 class="bp-title">Everything between <em>great product</em> and consistent sales.</h1>
      <p class="bp-lead">Design, store, launch and growth for clothing brands, from first sketch to sold out drop.</p>
    </section>
    <div class="bp-wrap">
      <div class="bp-cards">
${services.map((s) => `        <a class="bp-card" href="/services/${s.slug}/"><span class="tag">${esc(s.nav_label || "")}</span><h2>${esc(s.title)}</h2><p>${esc(s.description)}</p><span class="bp-card__more">Learn more ↗</span></a>`).join("\n")}
      </div>
${ctaBand("Not sure which of these you need?", "The free audit tells you exactly where to start, in priority order.")}
    </div>
  </main>` + foot(services);
  write(path.join(OUT, "services", "index.html"), html);
}

// 4. Blog posts
for (const [i, p] of posts.entries()) {
  const url = `${SITE}/blog/${p.slug}/`;
  const cover = p.cover || "";
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const relatedServices = (p.services || []).map((x) => serviceBySlug[x]).filter(Boolean);
  const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      image: cover ? abs(cover) : SITE + "/og.jpg",
      datePublished: isoDate(p.date),
      dateModified: isoDate(p.updated || p.date),
      author: { "@type": "Person", name: p.author || "BNC" },
      publisher: { "@type": "Organization", name: "BNC", logo: { "@type": "ImageObject", url: SITE + "/icon-512.png" }, ...orgRef },
      mainEntityOfPage: url,
      keywords: tags.join(", "),
    },
    breadcrumb([["Home", SITE + "/"], ["Blog", SITE + "/blog/"], [p.title, url]]),
  ];
  const html = head({
    title: p.seo_title || `${p.title} | BNC Blog`, description: p.description, url, image: cover || "/og.jpg", type: "article", schema,
    extra: `<meta property="article:published_time" content="${isoDate(p.date)}" />`,
  }) + `
  <main class="bp">
    <section class="bp-hero bp-hero--post">
      <nav class="bp-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a> / <span>${esc(p.title)}</span></nav>
      <div class="bp-meta"><time datetime="${isoDate(p.date)}">${prettyDate(p.date)}</time> · ${readingTime(p.body)} min read${p.author ? ` · ${esc(p.author)}` : ""}</div>
      <h1 class="bp-title">${esc(p.title)}</h1>
      <p class="bp-lead">${esc(p.description)}</p>
      ${tags.length ? `<ul class="bp-tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    </section>
    <div class="bp-wrap">
      ${cover ? `<img class="bp-cover" src="${esc(cover)}" alt="${esc(p.cover_alt || p.title)}" />` : ""}
      <article class="prose">
${p.html}
      </article>
${relatedServices.length ? `      <section class="bp-related">
        <div class="tag">[ RELATED SERVICES ]</div>
        <ul>${relatedServices.map((s) => `<li><a href="/services/${s.slug}/">${esc(s.title)}</a></li>`).join("")}</ul>
      </section>` : ""}
${ctaBand("Want this applied to your brand?", "Get a free audit with the 3 to 5 fixes I'd make first on your store and marketing.")}
${others.length ? `      <section class="bp-more">
        <div class="tag">[ KEEP READING ]</div>
        <ul>${others.map((x) => `<li><a href="/blog/${x.slug}/">${esc(x.title)}</a></li>`).join("")}</ul>
      </section>` : ""}
    </div>
  </main>` + foot(services);
  write(path.join(OUT, "blog", p.slug, "index.html"), html);
}

// Blog index
{
  const url = `${SITE}/blog/`;
  const html = head({
    title: "Clothing Brand Blog: Design, Shopify, POD & Marketing Tips | BNC",
    description: "Practical guides for clothing brand founders: launching a brand, T-shirt design, print on demand, Shopify, SEO and ads, from a studio that builds apparel brands.",
    url,
    schema: [
      { "@context": "https://schema.org", "@type": "Blog", name: "BNC Blog", url, publisher: orgRef,
        blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}/`, datePublished: isoDate(p.date) })) },
      breadcrumb([["Home", SITE + "/"], ["Blog", url]]),
    ],
  }) + `
  <main class="bp">
    <section class="bp-hero">
      <nav class="bp-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <span>Blog</span></nav>
      <div class="tag tag--light">[ BLOG / NOTES FROM THE STUDIO ]</div>
      <h1 class="bp-title">Build a clothing brand <em>that sells.</em></h1>
      <p class="bp-lead">Guides on apparel design, Shopify, print on demand, SEO and marketing for clothing brand founders.</p>
    </section>
    <div class="bp-wrap">
      ${posts.length ? `<div class="bp-cards">
${posts.map((p) => `        <a class="bp-card" href="/blog/${p.slug}/">${p.cover ? `<img src="${esc(p.cover)}" alt="${esc(p.cover_alt || p.title)}" loading="lazy" />` : ""}<span class="tag">${prettyDate(p.date)} · ${readingTime(p.body)} min read</span><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><span class="bp-card__more">Read ↗</span></a>`).join("\n")}
      </div>` : `<p class="bp-empty">New posts are on the way.</p>`}
${ctaBand("Rather have it done for you?", "Get a free audit with the 3 to 5 fixes that will move your brand first.")}
    </div>
  </main>` + foot(services);
  write(path.join(OUT, "blog", "index.html"), html);
}

// 5. RSS feed
write(path.join(OUT, "blog", "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>BNC Blog</title>
  <link>${SITE}/blog/</link>
  <description>Guides for clothing brand founders: design, Shopify, print on demand, SEO and marketing.</description>
  <language>en-us</language>
  <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
${posts.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/blog/${p.slug}/</link>
    <guid>${SITE}/blog/${p.slug}/</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`).join("\n")}
</channel>
</rss>
`);

// 6. Sitemap (homepage with its image entries, services, blog)
const homeImages = [
  ["images/work/dream-in-defiance-full.webp", "Dream in Defiance clothing brand design and Shopify launch"],
  ["images/work/hamrah-full.webp", "Hamrah streetwear brand identity and T-shirt design"],
  ["images/work/apex-full.webp", "Apex Apparel sportswear brand identity"],
  ["images/work/paragon-full.webp", "Paragon performance apparel brand identity"],
  ["images/work/slash-32-full.webp", "Slash-32 techwear brand identity"],
  ["images/work/stillski-full.webp", "Stillski streetwear brand identity and graphic tees"],
  ["images/work/gretchen-am-strand-full.webp", "Gretchen am Strand family apparel brand identity"],
  ["images/work/streetwear-graphics-full.webp", "Streetwear graphic T-shirt design series"],
  ["images/case/lifestyle.webp", "Dream in Defiance hoodie and T-shirt lifestyle photoshoot"],
  ["og.jpg", "BNC, we build clothing brands that sell"],
];
const urlEntry = (loc, lastmod, priority, images = []) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>${images.map(([src, t]) => `
    <image:image><image:loc>${abs(src)}</image:loc><image:title>${esc(t)}</image:title></image:image>`).join("")}
  </url>`;
write(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[
  urlEntry(SITE + "/", today, "1.0", homeImages),
  services.length ? urlEntry(SITE + "/services/", today, "0.9") : "",
  ...services.map((s) => urlEntry(`${SITE}/services/${s.slug}/`, isoDate(s.updated), "0.9")),
  urlEntry(SITE + "/blog/", posts[0] ? isoDate(posts[0].date) : today, "0.8"),
  ...posts.map((p) => urlEntry(`${SITE}/blog/${p.slug}/`, isoDate(p.updated || p.date), "0.7", p.cover ? [[p.cover, p.title]] : [])),
].filter(Boolean).join("\n")}
</urlset>
`);

console.log(`Built ${services.length} service pages and ${posts.length} blog posts into ${OUT}/`);
