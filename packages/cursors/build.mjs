// Builds the Truvar OS cursors and writes the downloads the docs site serves:
//   apps/docs/public/downloads/truvar-cursors-windows.zip   both colours, each with an install.inf
//   apps/docs/public/downloads/truvar-cursors-linux.zip     both colours as Xcursor themes, plus install.sh
//   apps/docs/public/cursors/<colour>/                      preview images for the docs page
//   apps/docs/src/docs/cursors.json                         the list the docs page reads
// Run it after changing a shape: `pnpm cursors:build`. The outputs are committed, so the docs build doesn't run it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { CURSORS, PALETTES, svg } from "./src/shapes.mjs";
import { cur, ani, xcursor, zip } from "./src/encode.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, "../../apps/docs/public");
// Windows picks a size by the pointer size setting and the display scale. The animated ones stop at 128
// (Windows scales up from there): 256 px frames would make each file about four times bigger.
const WIN_SIZES = [32, 48, 64, 96, 128, 256];
const WIN_ANIMATED_SIZES = [32, 48, 64, 96, 128];
const LINUX_SIZES = [24, 32, 48, 64, 96]; // 24 is the usual default; 48 on high-density screens
const RATE = 2; // jiffies (1/60 s) per frame on Windows: 33 ms
const DELAY = 33; // ms per frame on Linux
const AUTHOR = "Truvar.ai";
const VERSION = JSON.parse(fs.readFileSync(path.join(HERE, "package.json"), "utf8")).version ?? "1.0.0";

// The cursors have no text: skipping the system fonts makes each render instant instead of a font scan
const FONT = { loadSystemFonts: false };
const render = (markup, size) => {
  const img = new Resvg(markup, { fitTo: { mode: "width", value: size }, font: FONT }).render();
  return { size, pixels: img.pixels, png: () => img.asPng() };
};
const framesOf = (c) => Array.from({ length: c.frames ?? 1 }, (_, f) => f);

const winEntries = [], linuxEntries = [];
fs.rmSync(path.join(PUBLIC, "cursors"), { recursive: true, force: true });

for (const [key, palette] of Object.entries(PALETTES)) {
  const winDir = `Truvar Cursors/${palette.name}`;
  const theme = palette.name.replace(" ", "-");
  const previewDir = path.join(PUBLIC, "cursors", key);
  fs.mkdirSync(previewDir, { recursive: true });

  for (const c of CURSORS) {
    const frames = framesOf(c).map((f) => svg(c, palette, f));

    // Windows: one .cur, or an .ani for the animated ones
    const winFrames = frames.map((m) => (c.frames ? WIN_ANIMATED_SIZES : WIN_SIZES).map((s) => render(m, s)));
    const file = `${c.id}.${c.frames ? "ani" : "cur"}`;
    winEntries.push({
      name: `${winDir}/${file}`,
      data: c.frames ? ani(winFrames, c.hotspot, { rate: RATE, title: `${palette.name} ${c.label[0]}`, author: AUTHOR }) : cur(winFrames[0], c.hotspot),
    });

    // Linux: one Xcursor file, and links for every other name apps ask for
    if (c.linux.length) {
      const linuxFrames = frames.map((m) => LINUX_SIZES.map((s) => render(m, s)));
      const [main, ...aliases] = c.linux;
      linuxEntries.push({ name: `${theme}/cursors/${main}`, data: xcursor(linuxFrames, c.hotspot, DELAY) });
      for (const a of aliases) linuxEntries.push({ name: `${theme}/cursors/${a}`, link: main });
    }

    // Previews: 64 px for the page, 32 px to try the cursor on the page, a strip of frames for the animated ones
    fs.writeFileSync(path.join(previewDir, `${c.id}.png`), render(frames[0], 64).png());
    fs.writeFileSync(path.join(previewDir, `${c.id}-32.png`), render(frames[0], 32).png());
    if (c.frames) {
      const strip = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${32 * frames.length} 32">${frames
        .map((m, i) => `<g transform="translate(${i * 32} 0)">${m.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`).join("")}</svg>`;
      fs.writeFileSync(path.join(previewDir, `${c.id}-strip.png`), new Resvg(strip, { fitTo: { mode: "height", value: 64 }, font: FONT }).render().asPng());
    }
  }

  // install.inf: right-click it and choose Install. It copies the files to C:\Windows\Cursors\<name>
  // and adds the scheme to Mouse settings, where the person chooses it. Nothing changes until they do.
  const roles = ["Arrow", "Help", "AppStarting", "Wait", "Crosshair", "IBeam", "NWPen", "No", "SizeNS", "SizeWE", "SizeNWSE", "SizeNESW", "SizeAll", "UpArrow", "Hand", "Pin", "Person"];
  const byRole = Object.fromEntries(CURSORS.map((c) => [c.win, `${c.id}.${c.frames ? "ani" : "cur"}`]));
  const inf = [
    `; ${palette.name} cursors for Windows ${VERSION}, by Truvar.ai (https://design-system.truvar.ai/docs/cursors/)`,
    "; Right-click this file and choose Install. Then open Mouse settings > Additional mouse settings > Pointers,",
    `; choose "${palette.name}" under Scheme, and press OK.`,
    "",
    "[Version]",
    'signature="$CHICAGO$"',
    "",
    "[DefaultInstall]",
    "CopyFiles = Scheme.Cur",
    "AddReg = Scheme.Reg",
    "",
    "[DestinationDirs]",
    'Scheme.Cur = 10,"%CUR_DIR%"',
    "",
    "[Scheme.Reg]",
    `HKCU,"Control Panel\\Cursors\\Schemes","%SCHEME_NAME%",0x00020000,"${roles.map((r) => `%10%\\%CUR_DIR%\\${byRole[r]}`).join(",")}"`,
    "",
    "[Scheme.Cur]",
    ...roles.map((r) => byRole[r]),
    "",
    "[Strings]",
    `CUR_DIR = "Cursors\\${palette.name}"`,
    `SCHEME_NAME = "${palette.name}"`,
    "",
  ].join("\r\n");
  winEntries.push({ name: `${winDir}/install.inf`, data: Buffer.from(inf, "latin1") });

  // Linux theme files. Missing shapes fall back to Adwaita, which every desktop has.
  const index = `[Icon Theme]\nName=${palette.name}\nComment=Truvar OS cursors in ${palette.name} (https://design-system.truvar.ai/docs/cursors/)\nInherits=Adwaita\n`;
  linuxEntries.push({ name: `${theme}/index.theme`, data: Buffer.from(index) });
  linuxEntries.push({ name: `${theme}/cursor.theme`, data: Buffer.from(`[Icon Theme]\nInherits=${theme}\n`) });
}

const WIN_README = `Truvar Cursors for Windows 10 and 11, version ${VERSION}
https://design-system.truvar.ai/docs/cursors/

Install
1. Open the folder of the colour you want: Truvar Blue, Truvar Gold or Truvar Duo (both colours).
2. Right-click install.inf and choose Install (on Windows 11, choose Show more options first).
   Windows asks for permission, because the files are copied to C:\\Windows\\Cursors.
3. Open Settings > Bluetooth & devices > Mouse > Additional mouse settings > Pointers
   (or press Windows + R, type  main.cpl ,,1  and press Enter).
4. Under Scheme, choose Truvar Blue, Truvar Gold or Truvar Duo, then press OK.

Bigger cursors: Settings > Accessibility > Mouse pointer and touch > Size.

Remove
In the same Pointers tab, choose the scheme, press Delete, then choose Windows Default and press OK.
You can also delete the folder C:\\Windows\\Cursors\\Truvar Blue (or Truvar Gold, Truvar Duo).

Truvar Cursors are free to use. (c) Truvar.ai, MIT licence.
`;
winEntries.unshift({ name: "Truvar Cursors/README.txt", data: Buffer.from(WIN_README.replace(/\n/g, "\r\n")) });

const INSTALL_SH = `#!/bin/sh
# Installs Truvar Blue, Gold and Duo for your user, then turns on the one you name (Blue by default).
#   ./install.sh          Truvar Blue
#   ./install.sh gold     Truvar Gold
#   ./install.sh duo      Truvar Duo (both colours)
set -e
cd "$(dirname "$0")"
DEST="\${XDG_DATA_HOME:-$HOME/.local/share}/icons"
mkdir -p "$DEST" "$HOME/.icons"
for t in Truvar-Blue Truvar-Gold Truvar-Duo; do
  rm -rf "$DEST/$t" && cp -a "$t" "$DEST/"
  ln -sfn "$DEST/$t" "$HOME/.icons/$t"   # some X11 apps only look in ~/.icons
done
case "\${1:-blue}" in gold|Gold) THEME=Truvar-Gold ;; duo|Duo) THEME=Truvar-Duo ;; *) THEME=Truvar-Blue ;; esac
if command -v gsettings >/dev/null 2>&1; then
  gsettings set org.gnome.desktop.interface cursor-theme "$THEME" 2>/dev/null || true
fi
if command -v plasma-apply-cursortheme >/dev/null 2>&1; then
  plasma-apply-cursortheme "$THEME" || true
fi
echo "Installed. $THEME is on; if it isn't, choose it in your desktop settings (Appearance or Cursors)."
`;
const LINUX_README = `Truvar Cursors for Linux, version ${VERSION}
https://design-system.truvar.ai/docs/cursors/

Install
  unzip truvar-cursors-linux.zip -d truvar-cursors && sh truvar-cursors/install.sh

  Add "gold" or "duo" at the end for Truvar Gold or Truvar Duo:  sh truvar-cursors/install.sh duo

Or by hand: copy the Truvar-Blue, Truvar-Gold and Truvar-Duo folders into ~/.local/share/icons, then choose the
cursor in your desktop settings:
  GNOME: Settings > Appearance, or GNOME Tweaks > Appearance > Cursor
  KDE Plasma: System Settings > Colors & Themes > Cursors
  Others: your desktop's appearance settings, or XCURSOR_THEME=Truvar-Blue

Log out and in again if some apps still show the old cursor.

Remove: delete ~/.local/share/icons/Truvar-Blue, Truvar-Gold and Truvar-Duo (and the links in ~/.icons).

Truvar Cursors are free to use. (c) Truvar.ai, MIT licence.
`;
linuxEntries.unshift({ name: "README.txt", data: Buffer.from(LINUX_README) }, { name: "install.sh", data: Buffer.from(INSTALL_SH), mode: 0o100755 });

const out = path.join(PUBLIC, "downloads");
fs.mkdirSync(out, { recursive: true });
const win = zip(winEntries), linux = zip(linuxEntries);
fs.writeFileSync(path.join(out, "truvar-cursors-windows.zip"), win);
fs.writeFileSync(path.join(out, "truvar-cursors-linux.zip"), linux);
// What the docs page needs: names, hotspots (for trying each cursor on the page), and the download sizes
const manifest = {
  version: VERSION,
  palettes: Object.fromEntries(Object.entries(PALETTES).map(([k, p]) => [k, { name: p.name, fill: p.fill, accent: p.accent }])),
  cursors: CURSORS.map((c) => ({ id: c.id, label: c.label, hotspot: c.hotspot, frames: c.frames ?? 1 })),
  downloads: { windows: win.length, linux: linux.length },
};
fs.writeFileSync(path.join(HERE, "../../apps/docs/src/docs/cursors.json"), JSON.stringify(manifest, null, 2) + "\n");
const kb = (b) => `${Math.round(b.length / 1024)} KB`;
console.log(`cursors: ${CURSORS.length} × ${Object.keys(PALETTES).length} colours · windows.zip ${kb(win)} · linux.zip ${kb(linux)}`);
