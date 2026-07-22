/**
 * Calcule astrologice natale: zodia lunară și ascendentul.
 * Algoritmi de precizie joasă după Jean Meeus (Astronomical Algorithms) —
 * suficient de exacți pentru determinarea semnului zodiacal (~1°).
 * Ora nașterii se presupune ora locală a României (EET/EEST).
 */

export const ZODIAC_SIGNS = [
  "Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioară",
  "Balanță", "Scorpion", "Săgetător", "Capricorn", "Vărsător", "Pești",
] as const;

export function signFromLongitude(lonDeg: number): string {
  const norm = ((lonDeg % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(norm / 30)];
}

// ── Coordonate orașe (România + capitale europene uzuale) ────────────────────

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "bucuresti": { lat: 44.43, lon: 26.10 }, "cluj-napoca": { lat: 46.77, lon: 23.60 },
  "cluj": { lat: 46.77, lon: 23.60 }, "timisoara": { lat: 45.76, lon: 21.23 },
  "iasi": { lat: 47.16, lon: 27.59 }, "constanta": { lat: 44.18, lon: 28.63 },
  "craiova": { lat: 44.33, lon: 23.79 }, "brasov": { lat: 45.66, lon: 25.61 },
  "galati": { lat: 45.44, lon: 28.05 }, "ploiesti": { lat: 44.94, lon: 26.02 },
  "oradea": { lat: 47.05, lon: 21.94 }, "braila": { lat: 45.27, lon: 27.96 },
  "arad": { lat: 46.19, lon: 21.31 }, "pitesti": { lat: 44.86, lon: 24.87 },
  "sibiu": { lat: 45.79, lon: 24.15 }, "bacau": { lat: 46.57, lon: 26.91 },
  "targu mures": { lat: 46.54, lon: 24.56 }, "baia mare": { lat: 47.66, lon: 23.58 },
  "buzau": { lat: 45.15, lon: 26.82 }, "satu mare": { lat: 47.79, lon: 22.89 },
  "botosani": { lat: 47.75, lon: 26.66 }, "ramnicu valcea": { lat: 45.10, lon: 24.37 },
  "suceava": { lat: 47.64, lon: 26.25 }, "piatra neamt": { lat: 46.93, lon: 26.37 },
  "drobeta-turnu severin": { lat: 44.63, lon: 22.66 }, "focsani": { lat: 45.70, lon: 27.18 },
  "targu jiu": { lat: 45.03, lon: 23.27 }, "tulcea": { lat: 45.18, lon: 28.80 },
  "resita": { lat: 45.30, lon: 21.89 }, "slatina": { lat: 44.43, lon: 24.37 },
  "bistrita": { lat: 47.13, lon: 24.50 }, "hunedoara": { lat: 45.75, lon: 22.90 },
  "deva": { lat: 45.88, lon: 22.90 }, "alba iulia": { lat: 46.07, lon: 23.58 },
  "zalau": { lat: 47.18, lon: 23.06 }, "sfantu gheorghe": { lat: 45.86, lon: 25.79 },
  "targoviste": { lat: 44.93, lon: 25.46 }, "calarasi": { lat: 44.20, lon: 27.33 },
  "giurgiu": { lat: 43.90, lon: 25.97 }, "slobozia": { lat: 44.56, lon: 27.36 },
  "alexandria": { lat: 43.97, lon: 25.33 }, "vaslui": { lat: 46.64, lon: 27.73 },
  "miercurea ciuc": { lat: 46.36, lon: 25.80 }, "chisinau": { lat: 47.01, lon: 28.86 },
  "londra": { lat: 51.51, lon: -0.13 }, "london": { lat: 51.51, lon: -0.13 },
  "paris": { lat: 48.86, lon: 2.35 }, "berlin": { lat: 52.52, lon: 13.40 },
  "roma": { lat: 41.90, lon: 12.50 }, "madrid": { lat: 40.42, lon: -3.70 },
  "viena": { lat: 48.21, lon: 16.37 }, "bruxelles": { lat: 50.85, lon: 4.35 },
};

/** Caută coordonatele orașului (normalizat, fără diacritice). Fallback: București. */
export function cityCoords(city: string): { lat: number; lon: number; exact: boolean } {
  const norm = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .trim();
  const found = CITY_COORDS[norm];
  if (found) return { ...found, exact: true };
  return { lat: 44.43, lon: 26.10, exact: false };
}

// ── Timp astronomic ──────────────────────────────────────────────────────────

/** Ora României pentru o dată: +3 vara (ultima duminică mar–oct), +2 iarna. */
function romaniaUtcOffset(year: number, month: number, day: number): number {
  function lastSunday(y: number, m: number): number {
    const last = new Date(Date.UTC(y, m + 1, 0));
    return last.getUTCDate() - last.getUTCDay();
  }
  const afterMarch = month > 2 || (month === 2 && day >= lastSunday(year, 2));
  const beforeOctober = month < 9 || (month === 9 && day < lastSunday(year, 9));
  return afterMarch && beforeOctober ? 3 : 2;
}

/** Ziua iuliană pentru data/ora locală românească. */
function julianDay(year: number, month: number, day: number, hourLocal: number): number {
  const offset = romaniaUtcOffset(year, month - 1, day);
  const hourUTC = hourLocal - offset;
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hourUTC / 24 + b - 1524.5;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// ── Longitudinea Lunii (Meeus, trunchiat — precizie ~0.5°) ───────────────────

function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T;               // longitudine medie
  const D  = 297.8501921 + 445267.1114034 * T;                // elongație medie
  const M  = 357.5291092 + 35999.0502909 * T;                 // anomalia Soarelui
  const Mp = 134.9633964 + 477198.8675055 * T;                // anomalia Lunii
  const F  = 93.2720950 + 483202.0175233 * T;                 // argumentul latitudinii

  const lon = Lp
    + 6.288774 * Math.sin(rad(Mp))
    + 1.274027 * Math.sin(rad(2 * D - Mp))
    + 0.658314 * Math.sin(rad(2 * D))
    + 0.213618 * Math.sin(rad(2 * Mp))
    - 0.185116 * Math.sin(rad(M))
    - 0.114332 * Math.sin(rad(2 * F))
    + 0.058793 * Math.sin(rad(2 * D - 2 * Mp))
    + 0.057066 * Math.sin(rad(2 * D - M - Mp))
    + 0.053322 * Math.sin(rad(2 * D + Mp))
    + 0.045758 * Math.sin(rad(2 * D - M));
  return ((lon % 360) + 360) % 360;
}

// ── Longitudinea Soarelui (Meeus — precizie ~0.01°) ──────────────────────────

function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * Math.sin(rad(M))
    + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M))
    + 0.000289 * Math.sin(rad(3 * M));
  return (((L0 + C) % 360) + 360) % 360;
}

// ── Ascendentul ──────────────────────────────────────────────────────────────

function ascendantLongitude(jd: number, lat: number, lon: number): number {
  const T = (jd - 2451545.0) / 36525;
  // Timpul sideral la Greenwich (grade)
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;
  const lst = ((gmst + lon) % 360 + 360) % 360;       // timp sideral local = RAMC
  const eps = 23.4393 - 0.0130 * T;                    // oblicitatea eclipticii

  const ramc = rad(lst);
  const e = rad(eps);
  const phi = rad(lat);

  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(e) + Math.tan(phi) * Math.sin(e))
  );
  return ((deg(asc) % 360) + 360) % 360;
}

// ── API public ────────────────────────────────────────────────────────────────

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  cityExact: boolean;
}

/**
 * Profilul natal din data nașterii (YYYY-MM-DD), ora (HH:MM) și oraș.
 * Returnează null dacă datele sunt invalide.
 */
export function computeNatalChart(dateOfBirth: string, birthTime: string, birthCity: string): NatalChart | null {
  const dm = dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = birthTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return null;

  const [year, month, day] = [Number(dm[1]), Number(dm[2]), Number(dm[3])];
  const hour = Number(tm[1]) + Number(tm[2]) / 60;
  if (hour < 0 || hour >= 24) return null;

  const coords = cityCoords(birthCity);
  const jd = julianDay(year, month, day, hour);

  return {
    sunSign: signFromLongitude(sunLongitude(jd)),
    moonSign: signFromLongitude(moonLongitude(jd)),
    ascendant: signFromLongitude(ascendantLongitude(jd, coords.lat, coords.lon)),
    cityExact: coords.exact,
  };
}
