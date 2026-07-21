import { type ZodiacSign, getZodiacSign } from "./quotes";

export type InfluenceLevel = "favorabil" | "echilibrat" | "provocator";
export type Element = "foc" | "pamant" | "aer" | "apa";

export interface AreaInfluence {
  area: string;
  icon: string;
  level: InfluenceLevel;
  description: string;
}

export interface DayInfluences {
  sign: ZodiacSign;
  element: Element;
  areas: AreaInfluence[];
}

// ── Semn → element ────────────────────────────────────────────────────────────
const SIGN_ELEMENT: Record<ZodiacSign, Element> = {
  Berbec: "foc", Leu: "foc", Săgetător: "foc",
  Taur: "pamant", Fecioară: "pamant", Capricorn: "pamant",
  Gemeni: "aer", Balanță: "aer", Vărsător: "aer",
  Rac: "apa", Scorpion: "apa", Pești: "apa",
};

// ── Semn → ordine (pentru variație per semn) ──────────────────────────────────
const SIGN_ORDER: Record<ZodiacSign, number> = {
  Berbec:1, Taur:2, Gemeni:3, Rac:4, Leu:5, Fecioară:6,
  Balanță:7, Scorpion:8, Săgetător:9, Capricorn:10, Vărsător:11, Pești:12,
};

// ── Conținut influențe: element × domeniu × nivel ────────────────────────────
// Structură: CONTENT[element][domeniu][nivel 0=favorabil, 1=echilibrat, 2=provocator]
const CONTENT: Record<Element, Record<string, [string, string, string]>> = {
  foc: {
    corp: [
      "Corpul tău cere mișcare azi. Energia se acumulează și vrea un canal.",
      "Tensiunea musculară îți semnalează ceva. Stai o clipă cu senzațiile.",
      "Sistemul nervos simte urgența mai mult decât situația o cere. Răcorește ritmul.",
    ],
    minte: [
      "Claritatea vine rapid. Deciziile pe care le-ai tot amânat prind contur.",
      "Gândurile aleargă, dar direcția nu e clară încă. Lasă lucrurile să se sedimenteze.",
      "Mintea sare de la un gând la altul. Alege un singur lucru și rămâi cu el.",
    ],
    relatii: [
      "Prezența ta este magnetică azi. Interacțiunile pot fi cu adevărat semnificative.",
      "Energia ta domină spațiul. Fă loc și celuilalt să existe.",
      "Impulsivitatea poate răni fără intenție. Gândește înainte să vorbești.",
    ],
    energie: [
      "Rezervele sunt pline. Este momentul pentru ce ai tot amânat.",
      "Energia vine în valuri. Prinde momentele de flux, nu forța flacăra.",
      "Arzi prea repede prea mult. Conservarea este și ea un act de forță.",
    ],
  },
  pamant: {
    corp: [
      "Simțurile sunt ascuțite azi. Acordă-ți timp să guști, să atingi, să respiri adânc.",
      "Corpul tău știe ritmul potrivit. Ascultă-l mai mult decât agenda.",
      "Încremenirea nu este odihnă. Mișcă-te ușor, chiar dacă nu simți nevoia.",
    ],
    minte: [
      "Analiza ta este precisă azi. Momentul bun pentru planificare sau structurare.",
      "Ești metodic, dar poate prea rigid. Lasă loc pentru imprevizibil.",
      "Perfectul este dușmanul bunului. Eliberează standardul imposibil.",
    ],
    relatii: [
      "Stabilitatea pe care o oferi este exact ce au nevoie cei din jurul tău.",
      "Conexiunea vine prin lucruri concrete, nu prin vorbe. Fii prezent fizic.",
      "Rigiditatea ta poate fi citită ca distanță. Un gest mic contează mult.",
    ],
    energie: [
      "Energia ta este constantă și fiabilă azi. Profită fără să te epuizezi.",
      "Nu te grăbi. Ritmul tău natural este mai eficient decât viteza.",
      "Inacțiunea consumă tot atâta energie cât acțiunea. Alege ceva mic și fă-l.",
    ],
  },
  aer: {
    corp: [
      "Respirația este ancora ta azi. Fiecare expir eliberează un gând inutil.",
      "Mintea și corpul vorbesc limbi diferite azi. Fă o pauză să le sincronizezi.",
      "Capul este plin, corpul este neglijat. Coboară din gânduri.",
    ],
    minte: [
      "Conexiunile între idei vin rapid. Noteazh-le înainte să dispară.",
      "Prea multe perspective simultan. Alege un unghi și explorează-l complet.",
      "Suprastimularea cognitivă este reală azi. Tăcerea este productivă.",
    ],
    relatii: [
      "Conversațiile de azi pot schimba perspective. Rămâi curios față de celălalt.",
      "Comunici mult, dar asculți suficient? Testează inversul azi.",
      "Detașarea emoțională este evidentă pentru ceilalți. Încearcă să fii prezent.",
    ],
    energie: [
      "Mintea activă îți alimentează energia azi. Stimulii te energizează.",
      "Energia se risipește în prea multe direcții. Concentrează-te pe una.",
      "Suprastimularea a consumat rezervele. Oprește-te înainte de epuizare.",
    ],
  },
  apa: {
    corp: [
      "Emoțiile și senzațiile fizice sunt aliniate azi. Simți clar.",
      "Corpul absoarbe tot ce simți. Acordă-i timp să proceseze.",
      "Oboseala pe care o simți nu este fizică. Granițele emoționale sunt subțiri azi.",
    ],
    minte: [
      "Intuiția ta completează ce nu poate explica logica. Fii atent la primele impresii.",
      "Sentimentele colorează gândurile azi. Separă cele două cu blândețe.",
      "Emoțiile par fapte. Pune câteva întrebări înainte să tragi concluzii.",
    ],
    relatii: [
      "Empatia ta este un cadou azi. Cineva are nevoie să fie cu adevărat auzit.",
      "Absorbi stările celor din jur. Verifică care emoții sunt ale tale.",
      "Granițele sunt neclare. Ai grijă să nu preiei ceea ce nu îți aparține.",
    ],
    energie: [
      "Energia emoțională este în fluxul tău. Simți din plin și asta îți dă putere.",
      "Energia fluctuează cu starea emoțională. Normal, azi.",
      "Drena emoțională este reală. Întoarce-te la sine înainte de orice altceva.",
    ],
  },
};

const AREAS = [
  { key: "corp",    label: "Corp",         icon: "🫀" },
  { key: "minte",   label: "Minte",        icon: "🌊" },
  { key: "relatii", label: "Relații",      icon: "🌿" },
  { key: "energie", label: "Energie",      icon: "✦" },
] as const;

// ── Primii numeri pentru distribuție variată ──────────────────────────────────
const AREA_PRIMES = [7, 13, 19, 31];

// ── Funcție principală ────────────────────────────────────────────────────────
export function getDailyInfluences(dateOfBirth: string): DayInfluences | null {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const sign = getZodiacSign(dob.getMonth() + 1, dob.getDate());
  const element = SIGN_ELEMENT[sign];
  const signOrd = SIGN_ORDER[sign];

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);

  const areas: AreaInfluence[] = AREAS.map(({ key, label, icon }, i) => {
    // Nivel 0/1/2 deterministic dar diferit per arie și per semn
    const raw = (dayOfYear * AREA_PRIMES[i] + signOrd * 5 + i * 17) % 9;
    // Distribuție 3-3-3: 0,1,2 = favorabil; 3,4,5 = echilibrat; 6,7,8 = provocator
    const levelIdx = Math.floor(raw / 3) as 0 | 1 | 2;
    const levels: InfluenceLevel[] = ["favorabil", "echilibrat", "provocator"];
    const level = levels[levelIdx];
    const description = CONTENT[element][key][levelIdx];
    return { area: label, icon, level, description };
  });

  return { sign, element, areas };
}
