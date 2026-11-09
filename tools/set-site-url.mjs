/* ---------------------------------------------------------------------
   Sets the public website address in every page's search/sharing tags,
   robots.txt and sitemap.xml.

   Usage (from the project folder, requires Node.js):
     node tools/set-site-url.mjs https://your-username.github.io/rn-walia/

   Run it again later with a new address (e.g. a custom domain); it
   remembers the previous address and replaces it.
   --------------------------------------------------------------------- */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stateFile = path.join(root, "tools", ".site-url");

let url = (process.argv[2] || "").trim();
if (!/^https?:\/\/[^\s]+$/.test(url)) {
  console.error("Please give the full address, e.g.\n  node tools/set-site-url.mjs https://your-username.github.io/rn-walia/");
  process.exit(1);
}
if (!url.endsWith("/")) url += "/";

const previous = fs.existsSync(stateFile) ? fs.readFileSync(stateFile, "utf8").trim() : "";
const tokens = ["__SITE_URL__", previous].filter(Boolean);

const files = fs.readdirSync(root).filter((f) => /\.(html|xml|txt)$/.test(f));
let changed = 0;
for (const f of files) {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  for (const t of tokens) s = s.split(t).join(url);
  if (s !== before) { fs.writeFileSync(p, s); changed++; console.log("updated", f); }
}

// Keep config.js in step
const cfg = path.join(root, "assets", "js", "config.js");
let c = fs.readFileSync(cfg, "utf8");
const c2 = c.replace(/(\n\s*url:\s*)"[^"]*"/, `$1"${url}"`);
if (c2 !== c) { fs.writeFileSync(cfg, c2); console.log("updated assets/js/config.js"); }

fs.writeFileSync(stateFile, url + "\n");
console.log(`\nDone. ${changed} file(s) now use ${url}`);
