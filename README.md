# R.N. Walia, Architect & Valuer · Website

A static website for GitHub Pages. Plain HTML, CSS and JavaScript, no build step, no paid services, no server.

**Before publishing, read [CONFIRM-BEFORE-PUBLISHING.md](CONFIRM-BEFORE-PUBLISHING.md).**

---

## Folder structure

```
index.html            Home
services.html         Services (content comes from config.js)
approach.html         Our Approach + FAQ
about.html            About
contact.html          Contact, directions, map, short enquiry form
enquiry.html          Property Requirement Builder (step-by-step enquiry)
portfolio.html        Portfolio (hidden from the menu until real projects exist)
404.html              "Page not found"
robots.txt, sitemap.xml, site.webmanifest, .nojekyll
assets/
  css/styles.css      All styling (design system)
  js/config.js        ← ALL BUSINESS DETAILS, the only file you normally edit
  js/app.js           Shared behaviour
  js/wizard.js        Enquiry builder
  img/                Favicon, sharing image, icons; put photos here
  img/projects/       Portfolio photos
tools/set-site-url.mjs  Writes the public web address into the pages
```

---

## Open and test locally

The site works if you double-click `index.html`. For the most accurate test, run a small local server from the project folder:

```
python -m http.server 8000
```

Then open <http://localhost:8000>. (Or use VS Code's "Live Server" extension.)

**Preview mode.** Add `?preview` to any address on your own computer, e.g. `http://localhost:8000/index.html?preview`. This shows services, areas, credentials and sample projects marked **pending**, each with a blue "Pending" badge. Use `?preview=0` to leave preview mode. Preview mode only works on your own computer, never on the live site.

---

## Publish on GitHub Pages

1. Create a free account at <https://github.com> and sign in.
2. Click **+** (top right), then **New repository**. Name it, for example, `rn-walia`. Choose **Public** and click **Create repository**.
3. On the new repository page, click **uploading an existing file**. Drag in **everything inside this project folder**, not the folder itself. That means `index.html`, the `assets` folder, `.nojekyll` and the rest. Click **Commit changes**.
   - `.nojekyll` is a hidden file. If your computer hides it, the site still works without it.
   - If you use Git instead: `git init`, `git add .`, `git commit -m "Website"`, `git branch -M main`, `git remote add origin https://github.com/YOUR-USERNAME/rn-walia.git`, `git push -u origin main`.
4. In the repository, go to **Settings**, then **Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
5. Wait a minute or two and refresh the Pages settings screen. It shows **"Your site is live at https://YOUR-USERNAME.github.io/rn-walia/"**. That is the live URL.
6. Set the address for search engines and social sharing. On your computer, with Node.js installed, run:
   ```
   node tools/set-site-url.mjs https://YOUR-USERNAME.github.io/rn-walia/
   ```
   Then upload the changed files again (all `.html` files, `robots.txt`, `sitemap.xml` and `assets/js/config.js`).
   *Without Node.js:* open each of those files in a text editor and use find-and-replace to change `__SITE_URL__` to your full address, ending with `/`.
7. Optional: in [Google Search Console](https://search.google.com/search-console), add the site and submit `sitemap.xml`. Creating a free **Google Business Profile** for the office usually helps local search more than anything else.

---

## Connect a custom domain later (e.g. `www.rnwalia.in`)

1. Buy the domain from any registrar.
2. In GitHub, go to **Settings**, then **Pages**, then **Custom domain**. Enter `www.yourdomain.in` and click **Save**. GitHub creates a `CNAME` file.
3. At your registrar's DNS settings, add a **CNAME** record. Set the host to `www` and the value to `YOUR-USERNAME.github.io`.
   For the bare domain, also add four **A** records for host `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
4. When the domain works, tick **Enforce HTTPS**. This can take up to 24 hours to become available.
5. Run `node tools/set-site-url.mjs https://www.yourdomain.in/`, change `<base href="/rn-walia/">` in `404.html` to `<base href="/">`, and upload the changed files.

---

## Update business details

Open `assets/js/config.js` in any text editor, such as Notepad or VS Code. Every part is labelled. Change only the text between quotation marks, save, and upload the file to GitHub.

| To change… | Edit in `config.js` |
|---|---|
| Phone | `contact.phone` (e.g. `"+919876543210"`) and `contact.phoneDisplay` |
| WhatsApp | `contact.whatsapp`, digits with country code (e.g. `"919876543210"`) |
| Email | `contact.email` |
| Office hours | `hours`, as in the example in the file |
| Services | `services`. Set `status: "confirmed"` to publish a service, or `"pending"` to hide it. The text for each service is in the same block. |
| Areas served | `serviceArea.areas` (same `status` rule) |
| Credentials | `about.credentials`. Fill in `value` and set `status: "confirmed"`. |
| Portrait / office photo | Put a JPG in `assets/img/`, then set `about.portrait: "assets/img/portrait.jpg"` |
| Full name | `business.fullName`, only once you are sure it should appear |
| Portfolio | Add entries to `projects` without `sample: true`. Put images in `assets/img/projects/`. The Portfolio menu link appears automatically. Then remove the `noindex` line from `portfolio.html` and un-comment the portfolio line in `sitemap.xml`. |

Empty values (`""`) are hidden automatically. When a phone number, email or WhatsApp number is added, the matching buttons appear everywhere: the contact page, footer, homepage, the mobile quick-contact bar and the enquiry summaries. The business's structured data (for search engines) also updates.

Photos: resize to about 1600 px wide and save as JPG (under ~300 KB) before uploading. Use only photos you own or have permission to use. Never publish client documents, signatures or private addresses.

---

## Enquiries: what works on a static site (please read)

GitHub Pages hosts files only. It cannot send email or store form submissions by itself. Here is how the site handles enquiries:

- **Enquiry builder and contact form (default).** Both prepare a tidy summary in the visitor's browser. The visitor can copy, download or print it. When an email address or WhatsApp number is configured, they can also open it pre-filled in their email app or WhatsApp and send it themselves. The screen always says plainly **"Nothing has been sent yet."** No data is stored anywhere.
- **Optional real delivery (free tier).** Create a form at [Formspree](https://formspree.io) or a similar service, and paste its endpoint into `form.endpoint` in `config.js` (e.g. `"https://formspree.io/f/abcd1234"`). The short contact form then submits directly. It shows "sent" only after the service confirms receipt, and falls back to the copy/email options if sending fails. Free tiers have monthly limits; check the provider's current terms and privacy policy. No secret keys are involved.
- **Map.** The contact page loads a Google Map only when the visitor clicks "Show map", for privacy and speed. The "Get directions" links open Google Maps. Both use the office address as a search; no coordinates were invented.
- **Fonts.** Loaded from Google Fonts, which is free. If they cannot load, the site falls back to system fonts.
