# BNC Apparel website

Static site for www.bncapparel.site with a WebGL fabric hero, smooth scroll, parallax, a horizontal portfolio with full-size board viewer, the Dream in Defiance case study and a free audit call to action. No build step: upload `index.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml` and the `images/` folder to any host.

## Before going live
1. Put your booking link (Calendly, WhatsApp, etc) in `BOOKING_URL` at the top of `script.js`, and set `CONTACT_EMAIL`.
2. A contact form can go where the `<!-- Contact form goes here -->` comment sits in the audit section.

## Portfolio images
`images/work/<name>.webp` is the card image, `<name>-full.webp` opens in the viewer. `images/case/` holds the case study photos.

Libraries (Three.js, GSAP, Lenis) load from cdnjs and jsDelivr. If they fail, the page still works and the hero falls back to a gradient.
