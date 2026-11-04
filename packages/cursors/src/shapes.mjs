// The Truvar OS cursors, drawn once on a 32 × 32 grid. Every size is rendered from these shapes.
//
// Each cursor is a list of stacks, drawn in order. A stack is a set of shapes that read as one piece:
// solid fills with no outline. Duo adds a band in its second colour around the fill.
// A later stack (the help "?", the loading orbit) is drawn on top.
//
// Shapes: { p: path } filled, { l: path, w } a line of width w (round ends), { c: [cx, cy, r] } a circle.
// color: "fill" (default), "accent" or "outline" (white, for inner details). detail: drawn on top of the fill.

export const PALETTES = {
  blue: { name: "Truvar Blue", fill: "#001250", accent: "#e0b96a" },
  gold: { name: "Truvar Gold", fill: "#e0b96a", accent: "#001250" },
  // Both colours on every cursor: navy with a gold band around it (badges the other way round)
  duo: { name: "Truvar Duo", fill: "#001250", accent: "#e0b96a", band: true },
};
const WHITE = "#ffffff"; // inner details only: the hand's fingers, the pencil's band, the pin's hole
const BAND = 1.6; // Duo: the second colour, 0.8 wide around the fill

/* ---------- Pieces ---------- */
const ARROW = { p: "M3 2 L3 21.5 L7.7 17.3 L10.7 24.3 L13.8 22.9 L10.9 16.2 L17 16.2 Z" };

// The orbit mark exactly as OrbitMark draws it (24-unit grid: core 4.4, dots 1.95 at 8.3 from the centre),
// in its active state: 8 dots evenly spread, ink and gold alternating, turning clockwise.
// No outline, edge or backing: just the core and dots, as in the logo.
// scale: the mark's size against the 24-unit original.
function orbit(cx, cy, scale, turn) {
  const R = 8.3 * scale, dot = 1.95 * scale, core = 4.4 * scale;
  return [
    { c: [cx, cy, core], detail: true, color: "fill" },
    ...Array.from({ length: 8 }, (_, i) => {
      const a = ((i * 45 + 22.5 + turn) * Math.PI) / 180;
      return { c: [cx + R * Math.sin(a), cy - R * Math.cos(a), dot], detail: true, color: i % 2 ? "accent" : "fill" };
    }),
  ];
}
// The ring has 8 dots in 2 alternating colours, so it repeats every 90°: 12 frames of 7.5° make the loop.
// At 2 jiffies (33 ms) a frame, it turns once every 1.6 s, the speed of the OrbitLoader on the web.
const FRAMES = 12;
const turn = (f) => (f / FRAMES) * 90;

const doubleArrow = [
  { l: "M16 9.5 V22.5", w: 2.4 },
  { p: "M16 3 L22 9.8 L10 9.8 Z" },
  { p: "M16 29 L22 22.2 L10 22.2 Z" },
];

/* ---------- The cursors ----------
   win: the Windows pointer role (its registry name). linux: the Xcursor names, the first is the file and
   the others link to it (CSS names, X11 names and the hashes some toolkits ask for). */
export const CURSORS = [
  {
    id: "pointer", label: ["Normal select", "التحديد العادي"], win: "Arrow", hotspot: [3, 2],
    linux: ["default", "left_ptr", "arrow", "top_left_arrow", "left_arrow", "context-menu", "copy", "alias", "dnd-copy", "dnd-link", "dnd-move", "dnd-none", "cell", "plus"],
    stacks: [[ARROW]],
  },
  {
    id: "help", label: ["Help", "المساعدة"], win: "Help", hotspot: [3, 2],
    linux: ["help", "question_arrow", "whats_this", "left_ptr_help", "dnd-ask", "5c6cd98b3f3ebcb1f9c7f1c204630408", "d9ce0ab605698f320427677b8c7f1101"],
    stacks: [[ARROW], [
      { l: "M19.8 19.6 C19.8 17.6 21.2 16.4 23.1 16.4 C25 16.4 26.4 17.6 26.4 19.3 C26.4 21.7 23.1 21.8 23.1 24.3", w: 2.4, color: "accent" },
      { c: [23.1, 27.7, 1.5], color: "accent" },
    ]],
  },
  {
    id: "working", label: ["Working in background", "يعمل في الخلفية"], win: "AppStarting", hotspot: [3, 2], frames: FRAMES,
    linux: ["progress", "left_ptr_watch", "half-busy", "08e8e1c95fe2fc01f976f1e063a24ccd", "3ecb610c1bf2410f44200f48c40d3599", "00000000000000020006000e7e9ffc3f"],
    stacks: (f) => [[ARROW], orbit(23.4, 23.4, 0.7, turn(f))],
  },
  {
    id: "busy", label: ["Busy", "مشغول"], win: "Wait", hotspot: [16, 16], frames: FRAMES,
    linux: ["wait", "watch"],
    stacks: (f) => [orbit(16, 16, 1.45, turn(f))],
  },
  {
    id: "precision", label: ["Precision select", "التحديد الدقيق"], win: "Crosshair", hotspot: [16, 16],
    linux: ["crosshair", "cross", "tcross", "cross_reverse", "diamond_cross"],
    stacks: [[
      { l: "M16 4 V12", w: 2 }, { l: "M16 20 V28", w: 2 }, { l: "M4 16 H12", w: 2 }, { l: "M20 16 H28", w: 2 },
      { c: [16, 16, 1.4] },
    ]],
  },
  {
    id: "text", label: ["Text select", "تحديد النص"], win: "IBeam", hotspot: [16, 16],
    linux: ["text", "xterm", "ibeam", "vertical-text"],
    stacks: [[
      { l: "M12.4 5.6 C14.6 5.6 16 6.5 16 8.4 V23.6 C16 25.5 14.6 26.4 12.4 26.4", w: 1.9 },
      { l: "M19.6 5.6 C17.4 5.6 16 6.5 16 8.4 V23.6 C16 25.5 17.4 26.4 19.6 26.4", w: 1.9 },
      { l: "M13.6 16 H18.4", w: 1.6 },
    ]],
  },
  {
    id: "pen", label: ["Handwriting", "الكتابة اليدوية"], win: "NWPen", hotspot: [6.81, 25.19], rotate: 45,
    linux: ["pencil", "draft"],
    stacks: [[
      { p: "M13 21.8 L16 29 L19 21.8 Z" },
      { p: "M13 21.8 V6.4 Q13 4.8 14.6 4.8 H17.4 Q19 4.8 19 6.4 V21.8 Z" },
      { l: "M13 9.2 H19", w: 0.9, detail: true, color: "outline" },
    ]],
  },
  {
    id: "unavailable", label: ["Unavailable", "غير متاح"], win: "No", hotspot: [16, 16],
    linux: ["not-allowed", "no-drop", "crossed_circle", "forbidden", "circle", "03b6e0fcb3499374a867c041f52298f0"],
    stacks: [[
      { l: "M16 6.6 A9.4 9.4 0 1 1 15.99 6.6 Z", w: 3 },
      { l: "M9.4 9.4 L22.6 22.6", w: 3 },
    ]],
  },
  {
    id: "resize-ns", label: ["Vertical resize", "تغيير الحجم رأسيًا"], win: "SizeNS", hotspot: [16, 16],
    linux: ["ns-resize", "n-resize", "s-resize", "size_ver", "sb_v_double_arrow", "v_double_arrow", "top_side", "bottom_side", "row-resize", "split_v", "00008160000006810000408080010102", "2870a09082c103050810ffdffffe0204"],
    stacks: [doubleArrow],
  },
  {
    id: "resize-ew", label: ["Horizontal resize", "تغيير الحجم أفقيًا"], win: "SizeWE", hotspot: [16, 16], rotate: 90,
    linux: ["ew-resize", "e-resize", "w-resize", "size_hor", "sb_h_double_arrow", "h_double_arrow", "left_side", "right_side", "col-resize", "split_h", "028006030e0e7ebffc7f7070c0600140", "14fef782d02440884392942c11205230"],
    stacks: [doubleArrow],
  },
  {
    id: "resize-nwse", label: ["Diagonal resize 1", "تغيير الحجم قطريًا 1"], win: "SizeNWSE", hotspot: [16, 16], rotate: -45,
    linux: ["nwse-resize", "nw-resize", "se-resize", "size_fdiag", "top_left_corner", "bottom_right_corner", "bd_double_arrow", "c7088f0f3e6c8088236ef8e1e3e70000"],
    stacks: [doubleArrow],
  },
  {
    id: "resize-nesw", label: ["Diagonal resize 2", "تغيير الحجم قطريًا 2"], win: "SizeNESW", hotspot: [16, 16], rotate: 45,
    linux: ["nesw-resize", "ne-resize", "sw-resize", "size_bdiag", "top_right_corner", "bottom_left_corner", "fd_double_arrow", "fcf1c3c7cd4491d801f1e1c78f100000"],
    stacks: [doubleArrow],
  },
  {
    id: "move", label: ["Move", "النقل"], win: "SizeAll", hotspot: [16, 16],
    linux: ["move", "fleur", "all-scroll", "size_all", "grabbing", "closedhand", "dnd-none", "4498f0e0c1937ffe01fd06f973665830", "9081237383d90e509aa00f00170e968f"],
    stacks: [[
      { l: "M16 8.5 V23.5", w: 2.2 }, { l: "M8.5 16 H23.5", w: 2.2 },
      { p: "M16 3 L21 8.8 L11 8.8 Z" }, { p: "M16 29 L21 23.2 L11 23.2 Z" },
      { p: "M3 16 L8.8 11 L8.8 21 Z" }, { p: "M29 16 L23.2 11 L23.2 21 Z" },
    ]],
  },
  {
    id: "alternate", label: ["Alternate select", "التحديد البديل"], win: "UpArrow", hotspot: [16, 3],
    linux: ["center_ptr", "up-arrow"],
    stacks: [[{ p: "M16 3 L24 12 L19.4 12 V28 H12.6 V12 H8 Z" }]],
  },
  {
    id: "link", label: ["Link select", "تحديد الرابط"], win: "Hand", hotspot: [12.9, 2.6],
    linux: ["pointer", "hand", "hand1", "hand2", "pointing_hand", "grab", "openhand", "9d800788f1b08800ae810202380a0822", "e29285e634086352946a0e7090d73106", "5aca4d189052212118709018842178c0"],
    stacks: [[
      { l: "M12.9 4.9 V17", w: 4.6 },
      { l: "M17.4 12.4 V18", w: 4.4 },
      { l: "M21.6 13.6 V18.5", w: 4.3 },
      { l: "M25.3 15.3 V19", w: 3.9 },
      { l: "M11.2 21.4 L6.9 17.5", w: 4.4 },
      { p: "M10.6 17 H27.3 V23.4 C27.3 26.3 25.2 28.5 22.3 28.5 H15.6 C12.8 28.5 10.6 26.3 10.6 23.5 Z" },
      { l: "M15.15 13 V17.6", w: 0.8, detail: true, color: "outline" },
      { l: "M19.5 14.2 V17.9", w: 0.8, detail: true, color: "outline" },
      { l: "M23.45 15.8 V18.3", w: 0.8, detail: true, color: "outline" },
    ]],
  },
  {
    id: "location", label: ["Location select", "تحديد الموقع"], win: "Pin", hotspot: [3, 2], linux: [],
    stacks: [[ARROW], [
      { p: "M23.5 30 C20.8 26.6 18.9 24.2 18.9 21.4 A4.6 4.6 0 1 1 28.1 21.4 C28.1 24.2 26.2 26.6 23.5 30 Z", color: "accent" },
      { c: [23.5, 21.3, 1.7], detail: true, color: "outline" },
    ]],
  },
  {
    id: "person", label: ["Person select", "تحديد شخص"], win: "Person", hotspot: [3, 2], linux: [],
    stacks: [[ARROW], [
      { c: [23.5, 19.2, 2.9], color: "accent" },
      { p: "M18 29 C18 25.6 20.4 23.6 23.5 23.6 C26.6 23.6 29 25.6 29 29 Z", color: "accent" },
    ]],
  },
];

/* ---------- SVG ---------- */
function shape(s, paint) {
  const { kind, color, width } = paint;
  if (s.c) {
    const [cx, cy, r] = s.c;
    return kind === "fill" ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${color}" stroke-width="${width}"/>`;
  }
  if (s.l) return `<path d="${s.l}" fill="none" stroke="${color}" stroke-width="${s.w + (kind === "fill" ? 0 : width)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return kind === "fill" ? `<path d="${s.p}" fill="${color}"/>`
    : `<path d="${s.p}" fill="${color}" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;
}

export function svg(cursor, palette, frame = 0) {
  const colors = { fill: palette.fill, accent: palette.accent, outline: WHITE };
  // Duo's band is the other colour: gold around navy shapes, navy around gold badges
  const band = { fill: palette.accent, accent: palette.fill };
  const stacks = typeof cursor.stacks === "function" ? cursor.stacks(frame) : cursor.stacks;
  const body = stacks.map((stack) => {
    const base = stack.filter((s) => !s.detail);
    return [
      ...(palette.band ? base.map((s) => shape(s, { kind: "band", color: band[s.color ?? "fill"], width: BAND })) : []),
      ...base.map((s) => shape(s, { kind: "fill", color: colors[s.color ?? "fill"] })),
      ...stack.filter((s) => s.detail).map((s) => shape(s, { kind: "fill", color: colors[s.color] })),
    ].join("");
  }).join("");
  const out = cursor.rotate ? `<g transform="rotate(${cursor.rotate} 16 16)">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">${out}</svg>`;
}
