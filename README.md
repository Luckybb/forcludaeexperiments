# BNC Apparel website

Static site for www.bncapparel.site with a real-time cloth simulation T-shirt hero, smooth scroll, parallax, a horizontal portfolio with full-size board viewer, the Dream in Defiance case study and a free audit call to action. No build step: upload `index.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml` and the `images/` folder to any host.

## Leads and contact
- Audit form requests are emailed to info@bncproductionz.com via FormSubmit (no account needed). The very first submission sends an activation email to that inbox: click "Activate Form" once and every lead after that arrives, with the subject tagged [HOT], [WARM] or [COLD].
- After submitting, visitors are pushed to book on Calendly (https://calendly.com/burhannazir) with their name and email prefilled, or to WhatsApp.
- WhatsApp (+1 747 336 4515) is linked from a floating button, the audit section and the footer.
- To change any of these, edit the SETTINGS block at the top of `script.js` and the links in `index.html`.

## Portfolio images
`images/work/<name>.webp` is the card image, `<name>-full.webp` opens in the viewer. `images/case/` holds the case study photos.

Libraries (Three.js, GSAP, Lenis) load from cdnjs and jsDelivr. If they fail, the page still works and the hero falls back to a flat tee.

## SEO
See `SEO.md` for what is set up on the site and the step by step plan after launch.
