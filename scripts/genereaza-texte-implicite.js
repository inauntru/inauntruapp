/**
 * Citește textele implicite din paginile publice și le scrie într-un singur fișier,
 * ca formularul din Admin → Texte site să poată arăta, gri în fiecare câmp, ce scrie
 * ACUM pe site. Fără asta se edita orbește: un câmp gol nu spune ce înlocuiești.
 *
 * Rulează cu:  node scripts/genereaza-texte-implicite.js
 * Rezultat:    src/lib/site-content-defaults.ts
 *
 * Sursa e chiar codul paginilor: fiecare text editabil e scris acolo sub forma
 * t("cheie", "textul implicit"), deci îl putem culege de acolo. Rulează scriptul
 * din nou după ce schimbi texte în pagini, ca sugestiile să rămână adevărate.
 */
const fs = require("fs");
const path = require("path");

// id-ul paginii din Admin  ->  fișierul care conține textele
const PAGINI = {
  homepage: "src/app/(public)/HomePageClient.tsx",
  preturi: "src/app/(public)/preturi/PreturiClient.tsx",
  despre_noi: "src/app/(public)/despre-noi/DespreNoiClient.tsx",
  practici: "src/app/(public)/practici/PracticiClient.tsx",
  inspiratie: "src/app/(public)/blog/BlogClient.tsx",
  sesiuni_live: "src/app/(public)/sesiuni-live/SesiuniLiveClient.tsx",
  facilitatori: "src/app/(public)/facilitatori/FacilitatoriClient.tsx",
  ancore: "src/app/(public)/ancore/AncoreClient.tsx",
};

/**
 * Prinde t("cheie", "text") și t(`cheie`, "text").
 * Textul implicit poate fi scris și cu apostrofi, când conține ghilimele —
 * de exemplu t("problem_body", 'Nu sunt "doar in capul nostru".').
 */
const TIPAR = new RegExp(
  "\\bt\\(\\s*(?:\"([a-z0-9_]+)\"|`([a-z0-9_]+)`)\\s*,\\s*" +
    "(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')\\s*\\)",
  "g"
);

const rezultat = {};
let total = 0;

for (const [pagina, fisier] of Object.entries(PAGINI)) {
  const cale = path.join(process.cwd(), fisier);
  if (!fs.existsSync(cale)) {
    console.warn(`  lipsește: ${fisier}`);
    continue;
  }
  const sursa = fs.readFileSync(cale, "utf8");

  const chei = {};
  for (const m of sursa.matchAll(TIPAR)) {
    const cheie = m[1] || m[2];
    const brut = m[3] !== undefined ? m[3] : m[4];
    if (brut === undefined) continue;
    const text = brut.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    if (!cheie || !text) continue;
    if (chei[cheie] === undefined) chei[cheie] = text;
  }

  const cate = Object.keys(chei).length;
  total += cate;
  if (cate) rezultat[pagina] = chei;
  console.log(`  ${pagina.padEnd(14)} ${cate} texte`);
}

const antet = `// Generat de scripts/genereaza-texte-implicite.js — nu edita de mână.
// Textele implicite ale paginilor publice, folosite în Admin → Texte site ca sugestie
// gri în fiecare câmp. Rulează scriptul din nou dacă schimbi textele din pagini.

export const TEXTE_IMPLICITE: Record<string, Record<string, string>> = `;

fs.writeFileSync("src/lib/site-content-defaults.ts", antet + JSON.stringify(rezultat, null, 2) + ";\n");
console.log(`\nTotal: ${total} texte în src/lib/site-content-defaults.ts`);
