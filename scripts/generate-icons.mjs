/**
 * Generate PWA icons for Mythos Quest
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public', 'icons');

// Lovecraftian themed icon - Elder Sign inspired
const createIconSvg = (size) => {
  const padding = size * 0.1;
  const center = size / 2;
  const symbolSize = size - (padding * 2);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0f0f1a"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#4ade80;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#4ade80;stop-opacity:0"/>
    </radialGradient>
    <filter id="eldritch" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${size * 0.005}"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- Outer glow -->
  <circle cx="${center}" cy="${center}" r="${symbolSize * 0.45}" fill="url(#glow)"/>

  <!-- Outer circle (arcane ring) -->
  <circle cx="${center}" cy="${center}" r="${symbolSize * 0.4}"
          fill="none" stroke="#4ade80" stroke-width="${size * 0.015}" opacity="0.8"/>

  <!-- Elder Sign - Five-pointed star with eye -->
  ${generateElderSign(center, symbolSize * 0.35, size)}

  <!-- Inner eye symbol -->
  <ellipse cx="${center}" cy="${center}" rx="${symbolSize * 0.12}" ry="${symbolSize * 0.08}"
           fill="none" stroke="#a78bfa" stroke-width="${size * 0.012}" opacity="0.9"/>
  <circle cx="${center}" cy="${center}" r="${symbolSize * 0.04}" fill="#a78bfa" opacity="0.9"/>

  <!-- Decorative runes around the edge -->
  ${generateRunes(center, symbolSize * 0.42, size)}

  <!-- "M" letterform for Mythos Quest -->
  <text x="${center}" y="${center + symbolSize * 0.02}"
        font-family="Georgia, serif" font-size="${symbolSize * 0.25}"
        fill="#e2e8f0" text-anchor="middle" dominant-baseline="middle"
        opacity="0.15">M</text>
</svg>`;
};

function generateElderSign(center, radius, size) {
  const points = 5;
  const innerRadius = radius * 0.4;
  let path = '';

  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI / points) - Math.PI / 2;
    const nextAngle = ((i + 2) * 2 * Math.PI / points) - Math.PI / 2;

    const x1 = center + radius * Math.cos(angle);
    const y1 = center + radius * Math.sin(angle);
    const x2 = center + radius * Math.cos(nextAngle);
    const y2 = center + radius * Math.sin(nextAngle);

    path += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
             stroke="#4ade80" stroke-width="${size * 0.012}" opacity="0.7"/>`;
  }

  return path;
}

function generateRunes(center, radius, size) {
  const runeCount = 8;
  let runes = '';
  const runeSymbols = ['⍟', '☆', '◇', '△', '⬡', '⎔', '⌘', '✧'];

  for (let i = 0; i < runeCount; i++) {
    const angle = (i * 2 * Math.PI / runeCount) - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    runes += `<text x="${x}" y="${y}" font-size="${size * 0.06}"
              fill="#4ade80" text-anchor="middle" dominant-baseline="middle"
              opacity="0.5">${runeSymbols[i]}</text>`;
  }

  return runes;
}

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const buffer = Buffer.from(svg);

    await sharp(buffer)
      .png()
      .toFile(join(outputDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Also generate apple-touch-icon (180x180)
  const appleSvg = createIconSvg(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Generate a simple screenshot placeholder
  const screenshotSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screenbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0f0f1a"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#screenbg)"/>
  <text x="640" y="320" font-family="Georgia, serif" font-size="72"
        fill="#4ade80" text-anchor="middle" opacity="0.9">Mythos Quest</text>
  <text x="640" y="400" font-family="Arial, sans-serif" font-size="24"
        fill="#e2e8f0" text-anchor="middle" opacity="0.7">A Lovecraftian Horror Game</text>
  <text x="640" y="440" font-family="Arial, sans-serif" font-size="18"
        fill="#a78bfa" text-anchor="middle" opacity="0.5">Hero Quest meets Mansions of Madness</text>
</svg>`;

  await sharp(Buffer.from(screenshotSvg))
    .png()
    .toFile(join(outputDir, 'screenshot-wide.png'));
  console.log('Generated screenshot-wide.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
