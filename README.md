# BNC Apparel website

Static site for www.bncapparel.site with a real-time cloth simulation T-shirt hero, smooth scroll, parallax, a horizontal portfolio with full-size board viewer, the Dream in Defiance case study and a free audit call to action. No build step: upload `index.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml` and the `images/` folder to any host.

## Leads and contact
- The audit form uses Netlify Forms. In Netlify: Site configuration > Forms > Enable form detection, redeploy, then Forms > Form notifications > Add notification > Email notification, and enter the inbox that should receive leads. The address stays private in Netlify and never appears on the site.
- Each lead arrives with the subject "[HOT], [WARM] or [COLD] Free audit request: Brand".
- If sending ever fails, visitors see a backup "Send it by email or message me on WhatsApp" option, so no lead is lost.
- After submitting, visitors are pushed to book on Calendly (name and email prefilled) or WhatsApp.

## Portfolio images
`images/work/<name>.webp` is the card image, `<name>-full.webp` opens in the viewer. `images/case/` holds the case study photos.

Libraries (Three.js, GSAP, Lenis) load from cdnjs and jsDelivr. If they fail, the page still works and the hero falls back to a flat tee.

## SEO
See `SEO.md` for what is set up on the site and the step by step plan after launch.
