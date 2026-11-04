// File formats, written by hand so the build has no dependency beyond the SVG renderer.
// Every image comes in as { size, pixels } where pixels are premultiplied RGBA (what resvg renders).
import zlib from "node:zlib";

/* ---------- Windows: .cur (static) and .ani (animated) ---------- */

// One .cur file holds every size; Windows picks the one that matches the pointer size setting.
// Each image is a 32-bit bitmap with straight (not premultiplied) alpha, stored bottom-up, plus a 1-bit mask.
const PNG_FROM = 64;
export function cur(images, hotspot) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(2, 2); // 2 = cursor
  head.writeUInt16LE(images.length, 4);
  const bodies = images.map(({ size, pixels, png }) => {
    // Large sizes are stored as PNG (Windows reads PNG images in cursor files): a fraction of the size,
    // which keeps animated cursors under the size Windows will load
    if (png && size >= PNG_FROM) return png();
    const header = Buffer.alloc(40);
    header.writeUInt32LE(40, 0);
    header.writeInt32LE(size, 4);
    header.writeInt32LE(size * 2, 8); // colour and mask, stacked
    header.writeUInt16LE(1, 12);
    header.writeUInt16LE(32, 14);
    const color = Buffer.alloc(size * size * 4);
    const maskRow = Math.ceil(size / 32) * 4;
    const mask = Buffer.alloc(maskRow * size);
    for (let y = 0; y < size; y++) {
      const row = size - 1 - y; // bottom-up
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4, o = (row * size + x) * 4, a = pixels[i + 3];
        const un = (v) => (a ? Math.min(255, Math.round((v * 255) / a)) : 0);
        color[o] = un(pixels[i + 2]); color[o + 1] = un(pixels[i + 1]); color[o + 2] = un(pixels[i]); color[o + 3] = a;
        if (!a) mask[row * maskRow + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
    header.writeUInt32LE(color.length + mask.length, 20);
    return Buffer.concat([header, color, mask]);
  });
  let offset = head.length;
  images.forEach(({ size }, n) => {
    const e = 6 + 16 * n, scale = size / 32;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(Math.round(hotspot[0] * scale), e + 4);
    head.writeUInt16LE(Math.round(hotspot[1] * scale), e + 6);
    head.writeUInt32LE(bodies[n].length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += bodies[n].length;
  });
  return Buffer.concat([head, ...bodies]);
}

const chunk = (id, data) => {
  const h = Buffer.alloc(8);
  h.write(id, 0, "ascii");
  h.writeUInt32LE(data.length, 4);
  return Buffer.concat([h, data, data.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
};
const list = (type, parts) => chunk("LIST", Buffer.concat([Buffer.from(type, "ascii"), ...parts]));
const zstr = (s) => Buffer.from(s + "\0", "latin1");

// .ani: a RIFF file of .cur frames. rate is in jiffies (1/60 s).
export function ani(frames, hotspot, { rate, title, author }) {
  const anih = Buffer.alloc(36);
  anih.writeUInt32LE(36, 0);
  anih.writeUInt32LE(frames.length, 4); // frames
  anih.writeUInt32LE(frames.length, 8); // steps
  anih.writeUInt32LE(rate, 28);
  anih.writeUInt32LE(1, 32); // the frames are icons (.cur data)
  const body = Buffer.concat([
    Buffer.from("ACON", "ascii"),
    list("INFO", [chunk("INAM", zstr(title)), chunk("IART", zstr(author))]),
    chunk("anih", anih),
    list("fram", frames.map((images) => chunk("icon", cur(images, hotspot)))),
  ]);
  return chunk("RIFF", body);
}

/* ---------- Linux: Xcursor ---------- */

// Every size and frame is a separate image; frames of one size play in order, each for `delay` ms.
// Pixels are premultiplied ARGB, little-endian (so B, G, R, A in memory).
export function xcursor(frames, hotspot, delay = 0) {
  const images = frames.flatMap((sizes) => sizes);
  const head = Buffer.alloc(16 + 12 * images.length);
  head.write("Xcur", 0, "ascii");
  head.writeUInt32LE(16, 4);
  head.writeUInt32LE(0x10000, 8);
  head.writeUInt32LE(images.length, 12);
  // Sizes in order, then frames: viewers expect all frames of a size together
  const ordered = [...images].sort((a, b) => a.size - b.size);
  let offset = head.length;
  const bodies = ordered.map(({ size, pixels }, n) => {
    const b = Buffer.alloc(36 + size * size * 4), scale = size / 32;
    b.writeUInt32LE(36, 0);
    b.writeUInt32LE(0xfffd0002, 4);
    b.writeUInt32LE(size, 8);
    b.writeUInt32LE(1, 12);
    b.writeUInt32LE(size, 16);
    b.writeUInt32LE(size, 20);
    b.writeUInt32LE(Math.round(hotspot[0] * scale), 24);
    b.writeUInt32LE(Math.round(hotspot[1] * scale), 28);
    b.writeUInt32LE(frames.length > 1 ? delay : 0, 32);
    for (let i = 0; i < size * size; i++) {
      b[36 + i * 4] = pixels[i * 4 + 2]; b[36 + i * 4 + 1] = pixels[i * 4 + 1];
      b[36 + i * 4 + 2] = pixels[i * 4]; b[36 + i * 4 + 3] = pixels[i * 4 + 3];
    }
    const t = 16 + 12 * n;
    head.writeUInt32LE(0xfffd0002, t);
    head.writeUInt32LE(size, t + 4);
    head.writeUInt32LE(offset, t + 8);
    offset += b.length;
    return b;
  });
  return Buffer.concat([head, ...bodies]);
}

/* ---------- Zip ---------- */

// entries: { name, data } for files, { name, link } for symbolic links (Linux unzip restores them).
// Dates are fixed, so the same input always gives the same zip.
export function zip(entries) {
  const local = [], central = [];
  let offset = 0;
  const DOS_TIME = 0, DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const raw = e.link != null ? Buffer.from(e.link, "utf8") : e.data;
    const packed = e.link != null ? raw : zlib.deflateRawSync(raw, { level: 9 });
    const method = e.link != null ? 0 : 8;
    const crc = zlib.crc32(raw);
    const mode = e.link != null ? 0o120777 : e.mode ?? 0o100644;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(packed.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(name.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE((3 << 8) | 20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(method, 10); ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(packed.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE((mode << 16) >>> 0, 38); ch.writeUInt32LE(offset, 42);
    local.push(lh, name, packed);
    central.push(ch, name);
    offset += lh.length + name.length + packed.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}
