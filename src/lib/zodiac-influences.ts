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
// Regula de ton (cerută de Sabina): fiecare text e ancorat în universul
// platformei — corp, respirație, tensiune, ancorare, somn, jurnal, granițe —
// și sugerează implicit un pas mic de lucru interior, fără sfaturi generice
// de viață. Chiar și „Relații" e privit prin lentila somatică (co-reglare,
// granițe, cum răspunde sistemul nervos în prezența altora).
const CONTENT: Record<Element, Record<string, [string, string, string]>> = {
  foc: {
    corp: [
      "Corpul tău cere mișcare azi și o primește ușor. Canalizeaz-o conștient — câteva minute de practică îi dau direcție.",
      "Tensiunea din umeri și maxilar îți semnalează ceva. Stai o clipă cu senzațiile înainte să treci mai departe.",
      "Sistemul nervos simte urgența mai mult decât o cere situația. Un expir lung, repetat, îi răcorește ritmul.",
    ],
    minte: [
      "Claritatea vine rapid azi. Deciziile amânate prind contur — notează-le cât sunt vii, apoi lasă mintea să se așeze.",
      "Gândurile aleargă înaintea corpului. Două minute de prezență le lasă să se sedimenteze.",
      "Mintea sare din gând în gând. Alege unul singur, iar restul pune-le pe hârtie — jurnalul le ține locul.",
    ],
    relatii: [
      "Prezența ta aprinde spațiul azi. Cu sistemul nervos așezat, intensitatea devine căldură, nu presiune.",
      "Energia ta umple camera. Un inspir înainte să răspunzi face loc și celuilalt.",
      "Impulsivitatea poate răni fără intenție. Simte-ți tălpile pe podea înainte de conversațiile importante.",
    ],
    energie: [
      "Rezervele sunt pline. Folosește-le pe ce contează și lasă seara să se încheie blând, nu în viteză.",
      "Energia vine în valuri. Prinde fluxul, iar între valuri respiră — pauzele întrețin flacăra.",
      "Arzi prea repede prea mult. Zece secunde de oprire conștientă, repetate, valorează mai mult decât o prăbușire la final.",
    ],
  },
  pamant: {
    corp: [
      "Simțurile sunt ascuțite azi. Respiră adânc, atinge, gustă — corpul se hrănește din prezență.",
      "Corpul tău știe ritmul potrivit. Ascultă-l măcar două minute înainte să asculți agenda.",
      "Încremenirea nu este odihnă. Mișcă-te blând și scanează-ți corpul din creștet în tălpi, să se dezmorțească.",
    ],
    minte: [
      "Analiza ta este precisă azi. Structurează ce ai de făcut, apoi lasă mintea să coboare în corp.",
      "Ești metodic, dar poate prea rigid. Lasă un spațiu gol în plan — acolo respiră ziua.",
      "Perfectul sufocă bunul. Eliberează standardul cu un expir lung și alege pasul mic.",
    ],
    relatii: [
      "Stabilitatea pe care o oferi este exact ce au nevoie cei din jur. Reglat tu, se liniștesc și ei lângă tine.",
      "Conexiunea vine prin prezență, nu prin vorbe. Fii acolo cu tot corpul, nu doar cu atenția.",
      "Rigiditatea ta poate fi citită ca distanță. Relaxează-ți umerii și maxilarul înainte de întâlniri — se simte.",
    ],
    energie: [
      "Energia ta este constantă și fiabilă azi. Doseaz-o cu pauze scurte ca să o duci până seara.",
      "Nu te grăbi. Ritmul tău natural, susținut de respirație, este mai eficient decât viteza.",
      "Inacțiunea consumă tot atâta energie cât acțiunea. Alege ceva mic — un minut de practică e un început întreg.",
    ],
  },
  aer: {
    corp: [
      "Respirația este ancora ta azi. Fiecare expir lasă jos câte un gând inutil.",
      "Mintea și corpul vorbesc limbi diferite azi. O pauză scurtă de respirație le sincronizează.",
      "Capul este plin, corpul este neglijat. Coboară din gânduri în tălpi — corpul te ține, dacă îl lași.",
    ],
    minte: [
      "Conexiunile între idei vin rapid. Notează-le în jurnal înainte să dispară, apoi revino la respirație.",
      "Prea multe perspective simultan. Alege un unghi, iar restul lasă-le să plece pe expir.",
      "Suprastimularea cognitivă este reală azi. Câteva minute de tăcere sunt cea mai productivă oră a zilei.",
    ],
    relatii: [
      "Conversațiile de azi pot muta perspective. Ascultă cu tot corpul, nu doar cu mintea.",
      "Comunici mult, dar asculți suficient? Un inspir înainte de fiecare replică schimbă tot.",
      "Detașarea ta se simte de către ceilalți. Întoarce-te în corp — prezența nu se mimează.",
    ],
    energie: [
      "Stimulii te energizează azi. Dozează-i totuși — sistemul nervos are nevoie și de gol.",
      "Energia se risipește în prea multe direcții. Adun-o într-un singur lucru, cu respirația ca fir.",
      "Suprastimularea a consumat rezervele. Închide ecranele devreme — somnul bun începe cu seara, nu cu noaptea.",
    ],
  },
  apa: {
    corp: [
      "Emoțiile și senzațiile fizice sunt aliniate azi. Simți clar — corpul îți vorbește și merită ascultat.",
      "Corpul absoarbe tot ce simți. Dă-i timp să proceseze — o scanare blândă îl ajută.",
      "Oboseala pe care o simți nu este fizică. Granițele emoționale sunt subțiri azi — lucrează blând cu ele.",
    ],
    minte: [
      "Intuiția completează ce nu poate explica logica. Notează prima impresie — jurnalul o păstrează curată.",
      "Sentimentele colorează gândurile azi. Separă-le cu blândețe: ce simt, ce gândesc.",
      "Emoțiile par fapte azi. Respiră înainte de concluzii — corpul liniștit vede mai limpede.",
    ],
    relatii: [
      "Empatia ta este un dar azi. Rămâi ancorat în corpul tău cât timp îl asculți pe celălalt.",
      "Absorbi stările celor din jur. Verifică în corp: ce e al tău și ce ai preluat?",
      "Granițele sunt neclare azi. După fiecare interacțiune grea, un minut de revenire la tine.",
    ],
    energie: [
      "Energia emoțională curge din plin azi. Folosește-o pentru lucrul interior — azi intri adânc și ușor.",
      "Energia fluctuează cu starea emoțională. E normal azi — reglează-te în valuri mici, nu dintr-o dată.",
      "Drenajul emoțional este real. Întoarce-te la tine înainte de orice altceva — restul poate aștepta.",
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
