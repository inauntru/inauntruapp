/**
 * Generează imaginea care apare la share (WhatsApp, Facebook, LinkedIn).
 *
 * Rulează cu:  node scripts/genereaza-og-image.js
 * Rezultatul:  src/app/opengraph-image.png (1200x630) — Next.js îl folosește automat.
 *
 * De ce un script și nu generare la build: pachetul pe care îl folosește Next
 * pentru imagini generate (@vercel/og) nu rulează pe Windows din acest proiect,
 * deci imaginea se face o dată aici și se urcă gata făcută.
 *
 * Textul e transformat în contur vectorial din fontul Sentient, ca să arate la fel
 * oriunde, fără să depindă de fonturile instalate pe calculator.
 */
const sharp = require("sharp");
const opentype = require("opentype.js");
const fs = require("fs");

const W = 1200;
const H = 630;
const FONT = "src/app/fonts/sentient/Sentient-Medium.ttf";
const LOGO = "public/logo-orizontal-alb.png";
const IESIRE = "src/app/opengraph-image.png";
const TAGLINE = "Întoarce-te la tine";
const SIZE = 42;

const buf = fs.readFileSync(FONT);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const lipsa = [...TAGLINE].filter((c) => font.charToGlyphIndex(c) === 0);
if (lipsa.length) {
  console.error("Fontul nu are caracterele: " + lipsa.join(", "));
  process.exit(1);
}

const latime = font.getAdvanceWidth(TAGLINE, SIZE);
const contur = font.getPath(TAGLINE, (W - latime) / 2, 452, SIZE).toSVG(2);

const fundal = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="44%" r="62%">
      <stop offset="0%"   stop-color="#2B8C5C" stop-opacity="0.50"/>
      <stop offset="55%"  stop-color="#2B8C5C" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#0F2E1A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0A1F12" stop-opacity="0.45"/>
      <stop offset="45%"  stop-color="#0A1F12" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0A1F12" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0F2E1A"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#vign)"/>
  <rect x="${(W - 84) / 2}" y="385" width="84" height="2" rx="1" fill="#E6F5ED" fill-opacity="0.30"/>
  <g fill="#E6F5ED" fill-opacity="0.92">${contur}</g>
</svg>`);

(async () => {
  const logoW = 560;
  const logo = await sharp(LOGO).resize({ width: logoW }).toBuffer();
  const logoH = (await sharp(logo).metadata()).height;

  await sharp(fundal)
    .composite([{ input: logo, left: Math.round((W - logoW) / 2), top: Math.round(268 - logoH / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(IESIRE);

  const meta = await sharp(IESIRE).metadata();
  const kb = (fs.statSync(IESIRE).size / 1024).toFixed(0);
  console.log(`Gata: ${IESIRE} — ${meta.width}x${meta.height}, ${kb} KB`);
})();
