/**
 * Generates src/views/partials/icons.ejs from lucide-static.
 *
 * Single source of truth: node_modules/lucide-static/icons/<lucide>.svg —
 * the sprite is a build artifact, never hand-edited. Run `npm run icons`
 * after adding an icon to the map; the committed sprite keeps views working
 * without a build step.
 *
 * Symbols keep the Lucide geometry; `.ic` in app.css supplies the stroke
 * styling (fill: none; stroke: currentColor), so no per-symbol attributes
 * are needed.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const lucideDir = path.join(here, "..", "node_modules", "lucide-static", "icons");
const outFile = path.join(here, "..", "src", "views", "partials", "icons.ejs");

/** app symbol id → lucide-static file name (without .svg). */
const ICONS = {
  "i-briefcase": "briefcase",
  "i-users": "users",
  "i-user": "user",
  "i-search": "search",
  "i-plus": "plus",
  "i-pin": "map-pin",
  "i-calendar": "calendar",
  "i-wallet": "wallet",
  "i-trash": "trash-2",
  "i-edit": "pencil",
  "i-logout": "log-out",
  "i-shield": "shield",
  "i-chevron": "chevron-down",
  "i-arrow-ur": "arrow-up-right",
  "i-clock": "clock",
  "i-trend": "trending-up",
  "i-check": "check",
  "i-x": "x",
  "i-lock": "lock",
  "i-alert": "circle-alert",
  "i-grid": "layout-grid",
  "i-arrow-left": "arrow-left",
  "i-sun": "sun",
  "i-moon": "moon",
};

function innerSvg(markup) {
  const start = markup.indexOf(">", markup.indexOf("<svg")) + 1;
  const end = markup.lastIndexOf("</svg>");
  return markup.slice(start, end).replace(/\s+/g, " ").trim();
}

let sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none" aria-hidden="true">\n';
for (const [id, name] of Object.entries(ICONS)) {
  const markup = await readFile(path.join(lucideDir, `${name}.svg`), "utf8");
  sprite += `  <symbol id="${id}" viewBox="0 0 24 24">${innerSvg(markup)}</symbol>\n`;
}
sprite += "</svg>\n";

await writeFile(outFile, sprite);
console.log(`icons.ejs generated with ${Object.keys(ICONS).length} symbols`);
