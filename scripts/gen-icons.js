const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const ORANGE = '#E8622C';
const BORDER = '#17181A'; // matches current app background

function stadium(ctx, x, y, rx, ry) {
  // Vertically oriented stadium (pill): flat sides top/bottom are half-circles,
  // straight run down the middle. rx = half-width, ry = half-height.
  const r = rx;
  const straight = ry - r;
  ctx.moveTo(x - r, y - straight);
  ctx.arc(x, y - straight, r, Math.PI, 0, false);
  ctx.lineTo(x + r, y + straight);
  ctx.arc(x, y + straight, r, 0, Math.PI, false);
  ctx.closePath();
}

function ringPath(ctx, x, y, rx, ry, strokeW) {
  ctx.beginPath();
  stadium(ctx, x, y, rx, ry);
  stadium(ctx, x, y, rx - strokeW, ry - strokeW);
}

// Draws the two-loop "chain link" glyph so it reads as an actual chain: the
// left ring is drawn first (fully bordered), then the right ring is drawn on
// top with its own border, so its edge visibly cuts across the left ring at
// the crossing, like one link passing in front of the other.
function chainPath(ctx, cx, cy, ringW, ringH, strokeW, gap, borderW) {
  const offsetX = (ringW - gap) / 2; // distance from center to each ring's center
  const rx = ringW / 2;
  const ry = ringH / 2;

  [cx - offsetX, cx + offsetX].forEach((x) => {
    ctx.fillStyle = BORDER;
    ringPath(ctx, x, cy, rx + borderW, ry + borderW, strokeW + borderW * 2);
    ctx.fill('evenodd');

    ctx.fillStyle = ORANGE;
    ringPath(ctx, x, cy, rx, ry, strokeW);
    ctx.fill('evenodd');
  });
}

function renderIcon(size, { maskable, opaqueBg }) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  if (opaqueBg) {
    ctx.fillStyle = BORDER;
    ctx.fillRect(0, 0, size, size);
  }

  // Maskable/opaque-background icons need padding (maskable for the safe
  // zone, opaque so it doesn't read edge-to-edge like an iOS icon shouldn't),
  // so scale the glyph down a bit more for those variants.
  const fill = maskable || opaqueBg ? 0.62 : 0.82;
  const ringH = size * fill;
  const ringW = ringH * 0.62;
  const strokeW = ringW * 0.34;
  const gap = ringW * 0.28;
  const borderW = Math.max(2, size * 0.018);

  const cx = size / 2;
  const cy = size / 2;

  chainPath(ctx, cx, cy, ringW, ringH, strokeW, gap, borderW);

  return canvas;
}

function write(canvas, name) {
  const outPath = path.join(__dirname, '..', name);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('wrote', outPath);
}

write(renderIcon(512, { maskable: false }), 'icon-512.png');
write(renderIcon(192, { maskable: false }), 'icon-192.png');
write(renderIcon(512, { maskable: true }), 'icon-512-maskable.png');

// iOS ignores transparency on home-screen icons (fills it with white/black),
// so apple-touch-icon needs its own opaque, padded variant. Not referenced
// by the manifest or the <link rel="icon"> favicon, so Chrome is unaffected.
write(renderIcon(180, { opaqueBg: true }), 'apple-touch-icon.png');
