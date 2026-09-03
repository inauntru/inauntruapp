/**
 * Iconurile ilustrate WithIN — sistemul vizual „desenat" introdus pe pagina
 * Somn (macheta within-somn-v4): simboluri SVG cu linii în gradient, umbră de
 * sol elipsoidală și glow moale, pe paleta de brand (verde forest + indigo,
 * cu ambră și albastru de noapte ca accente ilustrative).
 *
 * Folosire:
 *   - <ArtDefs /> e montat o singură dată în layout-ul rădăcină (gradienții și
 *     filtrele sunt globale — orice icon de pe pagină le referă prin url(#art-…)).
 *   - Iconurile primesc `className` pentru mărime (implicit w-12 h-12).
 *
 * Iconuri funcționale (săgeți, ceas, X, carete) rămân Phosphor — sistemul de
 * față e pentru identitatea vizuală a cardurilor, categoriilor și secțiunilor.
 */

interface ArtProps { className?: string }

/* ── Definiții globale: gradienți + filtre ───────────────────────────────── */
export function ArtDefs() {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      <defs>
        <filter id="art-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.42" /></feComponentTransfer>
        </filter>
        <filter id="art-soft"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="art-softer"><feGaussianBlur stdDeviation="9" /></filter>

        {/* indigo de brand (#6668CC → #3D3FAA) */}
        <linearGradient id="art-gInd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6668CC" /><stop offset="1" stopColor="#3D3FAA" />
        </linearGradient>
        {/* verde de brand (#4AAA78 → #2B8C5C) */}
        <linearGradient id="art-gGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4AAA78" /><stop offset="1" stopColor="#2B8C5C" />
        </linearGradient>
        {/* accente ilustrative: ambră caldă și albastru de noapte */}
        <linearGradient id="art-gAmber" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#F5C46B" /><stop offset="1" stopColor="#C97F2E" />
        </linearGradient>
        <linearGradient id="art-gBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8FA9C4" /><stop offset="1" stopColor="#51708F" />
        </linearGradient>
        {/* fața lunii + halo (folosite de scenele nocturne) */}
        <radialGradient id="art-gMoonFace" cx="36%" cy="30%">
          <stop offset="0" stopColor="#FDF6E7" /><stop offset="55%" stopColor="#E4D3B0" />
          <stop offset="100%" stopColor="#B9A784" />
        </radialGradient>
        <radialGradient id="art-gHalo" cx="50%" cy="50%">
          <stop offset="0" stopColor="#E8D6AE" stopOpacity=".55" />
          <stop offset="55%" stopColor="#C6B48E" stopOpacity=".14" />
          <stop offset="100%" stopColor="#0C1626" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* Învelișul comun: viewBox 60, umbră drop moale ca în machetă */
function Art({ className = "w-12 h-12", children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" className={`${className} drop-shadow-md flex-shrink-0`}>
      {children}
    </svg>
  );
}

/* ── Minte / gânduri — norul cu spirală (indigo) ─────────────────────────── */
export function ArtMinte({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="50" rx="19" ry="4" fill="#3D3FAA" opacity=".13" />
      <path d="M14 30c2-11 12-16 21-13 8 2 13 10 11 18-2 7-9 11-16 10" stroke="url(#art-gInd)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 32c1-6 6-9 11-7 5 2 6 8 3 12-3 3-8 3-11 0-3-4-1-10 4-12 6-2 12 2 13 8" stroke="url(#art-gInd)" strokeWidth="1.9" strokeLinecap="round" opacity=".78" />
      <path d="M28 38c2-3 6-3 8 0" stroke="url(#art-gInd)" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      <circle cx="43" cy="18" r="2.6" fill="#6668CC" opacity=".55" />
      <circle cx="49" cy="12" r="1.6" fill="#6668CC" opacity=".35" />
    </Art>
  );
}

/* ── Energie / corp în alertă — fulgerul (ambră) ─────────────────────────── */
export function ArtFulger({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#C97F2E" opacity=".14" />
      <circle cx="31" cy="28" r="21" fill="#F5C46B" opacity=".16" filter="url(#art-soft)" />
      <path d="M34 9L20 32h9l-3 19 16-24h-10z" fill="url(#art-gAmber)" />
      <path d="M34 9L20 32h9z" fill="#FFF" opacity=".22" />
      <path d="M12 20c-1.5 2-1.5 5 0 7" stroke="#E0A755" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      <path d="M49 32c1.5-2 1.5-5 0-7" stroke="#E0A755" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
    </Art>
  );
}

/* ── Ceață / epuizare — soarele coborât în straturi (albastru) ───────────── */
export function ArtCeata({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="17" ry="3.5" fill="#51708F" opacity=".13" />
      <circle cx="34" cy="24" r="12" fill="#C9D8E6" />
      <circle cx="34" cy="24" r="12" fill="url(#art-gBlue)" opacity=".35" />
      <path d="M9 30h26M15 37h30M11 44h24" stroke="url(#art-gBlue)" strokeWidth="3" strokeLinecap="round" opacity=".85" />
      <path d="M20 30h18M22 37h20" stroke="#F2F7FB" strokeWidth="1.1" strokeLinecap="round" opacity=".6" />
    </Art>
  );
}

/* ── Liniște / natură blândă — frunza (verde) ────────────────────────────── */
export function ArtFrunza({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <circle cx="32" cy="26" r="21" fill="#A8DFC0" opacity=".22" filter="url(#art-soft)" />
      <path d="M40 12a15 15 0 10-9 27 18 18 0 009-27z" fill="url(#art-gGreen)" />
      <path d="M40 12a15 15 0 00-13 8 15 15 0 0114 12 18 18 0 00-1-20z" fill="#FFF" opacity=".18" />
      <circle cx="46" cy="41" r="2.2" fill="#4AAA78" opacity=".6" />
      <circle cx="16" cy="16" r="1.6" fill="#4AAA78" opacity=".45" />
    </Art>
  );
}

/* ── Natură / pădure — brazii (verde) ────────────────────────────────────── */
export function ArtCopaci({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#2B8C5C" opacity=".14" />
      <path d="M38 46l-8-15h4.5L28 18.5h3.5L23.5 5 15.5 18.5H19l-6.5 12.5H17l-8 15z" fill="url(#art-gGreen)" opacity=".45" />
      <path d="M47 48l-7-12.5h3.5L37.7 24h3L34.5 12.5 28 24h3l-5.8 11.5h3.5L21.5 48z" fill="url(#art-gGreen)" />
      <rect x="33" y="46" width="3" height="7" rx="1.2" fill="#1E5C3D" />
    </Art>
  );
}

/* ── Muzică — harpa cu note (indigo) ─────────────────────────────────────── */
export function ArtMuzica({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#3D3FAA" opacity=".14" />
      <path d="M25 41V15l21-4.5V35" stroke="url(#art-gInd)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <ellipse cx="19.5" cy="41" rx="6.8" ry="5.6" fill="url(#art-gInd)" />
      <ellipse cx="40.5" cy="35.5" rx="6" ry="5" fill="url(#art-gInd)" opacity=".82" />
      <path d="M25 21.5l21-4.5" stroke="#A9ABE0" strokeWidth="1.5" opacity=".7" />
    </Art>
  );
}

/* ── Sunet continuu / noise — undele suprapuse (albastru) ────────────────── */
export function ArtUnde({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#51708F" opacity=".13" />
      <g stroke="url(#art-gBlue)" strokeLinecap="round" fill="none">
        <path d="M8 21c5.5-6.6 10 6.6 15.5 0s10 6.6 15.5 0 7.7 5.5 13 0" strokeWidth="3" opacity=".45" />
        <path d="M8 31c5.5-6.6 10 6.6 15.5 0s10 6.6 15.5 0 7.7 5.5 13 0" strokeWidth="3.4" />
        <path d="M8 41c5.5-6.6 10 6.6 15.5 0s10 6.6 15.5 0 7.7 5.5 13 0" strokeWidth="3" opacity=".45" />
      </g>
    </Art>
  );
}

/* ── Tonuri / frecvențe — inelele concentrice (ambră) ────────────────────── */
export function ArtInele({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="17" ry="3.5" fill="#C97F2E" opacity=".13" />
      <circle cx="30" cy="29" r="5" fill="url(#art-gAmber)" />
      <circle cx="30" cy="29" r="11.5" stroke="url(#art-gAmber)" strokeWidth="2.4" opacity=".7" fill="none" />
      <circle cx="30" cy="29" r="18.5" stroke="url(#art-gAmber)" strokeWidth="2" opacity=".42" fill="none" />
      <circle cx="30" cy="29" r="25" stroke="url(#art-gAmber)" strokeWidth="1.5" opacity=".2" fill="none" />
    </Art>
  );
}

/* ── Respirație — valul care intră și iese (verde) ───────────────────────── */
export function ArtRespiratie({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <circle cx="30" cy="28" r="19" fill="#A8DFC0" opacity=".2" filter="url(#art-soft)" />
      <path d="M10 33c6.5-9 13.5 9 20 0s13.5-9 20 0" stroke="url(#art-gGreen)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M14 24c5.5-7 11 7 16.5 0s11-7 16.5 0" stroke="url(#art-gGreen)" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="M18 41c4.5-5.5 9 5.5 13.5 0s9-5.5 13.5 0" stroke="url(#art-gGreen)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".35" />
    </Art>
  );
}

/* ── Corp / scanare — silueta așezată cu aură (verde) ────────────────────── */
export function ArtCorp({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <circle cx="30" cy="29" r="21" stroke="url(#art-gGreen)" strokeWidth="1.4" opacity=".3" fill="none" />
      <circle cx="30" cy="17" r="5.5" fill="url(#art-gGreen)" />
      <path d="M30 25c-7 0-11 5-12 13-.5 4 1.5 6 4.5 6h15c3 0 5-2 4.5-6-1-8-5-13-12-13z" fill="url(#art-gGreen)" opacity=".85" />
      <path d="M30 25c-4 0-7 1.6-9 4.6 2.6 1.8 5.8 2.9 9 2.9s6.4-1.1 9-2.9c-2-3-5-4.6-9-4.6z" fill="#FFF" opacity=".16" />
      <circle cx="30" cy="34" r="2.4" fill="#E6F5ED" opacity=".8" />
    </Art>
  );
}

/* ── Ancoră — ancora cu val (indigo) ─────────────────────────────────────── */
export function ArtAncora({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="17" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <circle cx="30" cy="13" r="4" stroke="url(#art-gInd)" strokeWidth="2.4" fill="none" />
      <path d="M30 17v26" stroke="url(#art-gInd)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 23h16" stroke="url(#art-gInd)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 32c0 9 7 14 16 14s16-5 16-14" stroke="url(#art-gInd)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M14 32l-3.5-3M14 32l4.5-1.5M46 32l3.5-3M46 32l-4.5-1.5" stroke="url(#art-gInd)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 51c4-4.5 7 4.5 11 0" stroke="#A9ABE0" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".6" />
    </Art>
  );
}

/* ── Inimă / grijă — inima cu puls blând (verde) ─────────────────────────── */
export function ArtInima({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="16" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <circle cx="30" cy="27" r="20" fill="#A8DFC0" opacity=".18" filter="url(#art-soft)" />
      <path d="M30 45C19 37 12 30.5 12 22.5 12 16.5 16.5 12 22 12c3.4 0 6.4 1.7 8 4.4C31.6 13.7 34.6 12 38 12c5.5 0 10 4.5 10 10.5 0 8-7 14.5-18 22.5z" fill="url(#art-gGreen)" />
      <path d="M30 45C19 37 12 30.5 12 22.5 12 16.5 16.5 12 22 12c3.4 0 6.4 1.7 8 4.4z" fill="#FFF" opacity=".14" />
      <path d="M20 27h5l2.5-4.5 4 8 2.5-3.5h6" stroke="#E6F5ED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".85" />
    </Art>
  );
}

/* ── Carte / bibliotecă — cartea deschisă (indigo) ───────────────────────── */
export function ArtCarte({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <path d="M9 40c7-4.5 14.5-4.5 21-1 6.5-3.5 14-3.5 21 1V17c-7-4.5-14.5-4.5-21-1-6.5-3.5-14-3.5-21 1z" fill="url(#art-gInd)" opacity=".9" />
      <path d="M30 16v23" stroke="#E9EAFB" strokeWidth="1.6" opacity=".8" />
      <g stroke="#E9EAFB" strokeWidth="1.2" opacity=".55" fill="none">
        <path d="M14 23c4-1.6 8-1.7 12-.4M14 29c4-1.6 8-1.7 12-.4M34 22.6c4-1.3 8-1.2 12 .4M34 28.6c4-1.3 8-1.2 12 .4" />
      </g>
      <circle cx="45" cy="11" r="2.2" fill="#6668CC" opacity=".55" />
    </Art>
  );
}

/* ── Soare — răsăritul peste linie (ambră) ───────────────────────────────── */
export function ArtSoare({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#C97F2E" opacity=".13" />
      <circle cx="30" cy="30" r="17" fill="#F5C46B" opacity=".18" filter="url(#art-soft)" />
      <circle cx="30" cy="30" r="9.5" fill="url(#art-gAmber)" />
      <circle cx="30" cy="30" r="9.5" fill="#FFF" opacity=".14" />
      <g stroke="url(#art-gAmber)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M30 12v4M30 44v4M12 30h4M44 30h4M17.3 17.3l2.8 2.8M39.9 39.9l2.8 2.8M42.7 17.3l-2.8 2.8M20.1 39.9l-2.8 2.8" />
      </g>
    </Art>
  );
}

/* ── Lună — semiluna cu stele (ambră pe noapte) ──────────────────────────── */
export function ArtLuna({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#51708F" opacity=".13" />
      <circle cx="28" cy="28" r="19" fill="url(#art-gHalo)" />
      <path d="M36 11a19 19 0 10 0 34 22 22 0 01 0-34z" fill="url(#art-gMoonFace)" />
      <g fill="#B6A484" opacity=".35">
        <ellipse cx="26" cy="24" rx="3.4" ry="2.6" />
        <ellipse cx="31" cy="33" rx="2.4" ry="2" />
        <ellipse cx="24" cy="38" rx="1.8" ry="1.5" />
      </g>
      <circle cx="45" cy="15" r="1.8" fill="#E8D6AE" opacity=".8" />
      <circle cx="50" cy="24" r="1.2" fill="#E8D6AE" opacity=".55" />
    </Art>
  );
}

/* ── Oameni / comunitate — două siluete (indigo + verde) ─────────────────── */
export function ArtOameni({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="18" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <circle cx="22" cy="19" r="5.5" fill="url(#art-gGreen)" />
      <path d="M22 27c-6.5 0-10 4.5-11 11.5-.4 3.4 1.4 5.5 4.2 5.5h13.6c2.8 0 4.6-2.1 4.2-5.5-1-7-4.5-11.5-11-11.5z" fill="url(#art-gGreen)" opacity=".9" />
      <circle cx="39" cy="21" r="4.8" fill="url(#art-gInd)" />
      <path d="M39 28.5c-5.6 0-8.7 3.9-9.6 10-.3 3 1.3 4.8 3.7 4.8h11.8c2.4 0 4-1.8 3.7-4.8-.9-6.1-4-10-9.6-10z" fill="url(#art-gInd)" opacity=".88" />
      <circle cx="22" cy="19" r="5.5" fill="#FFF" opacity=".1" />
    </Art>
  );
}

/* ── Jurnal — pana care scrie (indigo) ───────────────────────────────────── */
export function ArtJurnal({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <path d="M13 44c1-10 5-17 12-23 6-5 13-8 21-9-1 8-4 15-9 21-6 7-13 11-23 12z" fill="url(#art-gInd)" opacity=".88" />
      <path d="M13 44c1-10 5-17 12-23 3-2.5 6.2-4.5 9.7-6-4.5 4.3-8.2 9-11.2 14.3C20.5 34.7 16.6 39.6 13 44z" fill="#FFF" opacity=".16" />
      <path d="M16 47c8-9 16-17 27-25" stroke="#E9EAFB" strokeWidth="1.4" strokeLinecap="round" opacity=".6" fill="none" />
      <path d="M40 46h9" stroke="url(#art-gInd)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
    </Art>
  );
}

/* ── Lotus / practică — floarea deschisă (verde) ─────────────────────────── */
export function ArtLotus({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="17" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <circle cx="30" cy="31" r="19" fill="#A8DFC0" opacity=".18" filter="url(#art-soft)" />
      <path d="M30 44c-4-3.5-6-8.5-6-14 0-5 2.5-10 6-13 3.5 3 6 8 6 13 0 5.5-2 10.5-6 14z" fill="url(#art-gGreen)" />
      <path d="M30 44c-6-1-11-4.5-13.5-10 4.5-1.5 9.5-1 13.5 1.5z" fill="url(#art-gGreen)" opacity=".7" />
      <path d="M30 44c6-1 11-4.5 13.5-10-4.5-1.5-9.5-1-13.5 1.5z" fill="url(#art-gGreen)" opacity=".7" />
      <path d="M30 17c1.8 1.6 3.3 3.7 4.4 6-1.4 3-2.9 5.8-4.4 8.5z" fill="#FFF" opacity=".18" />
      <circle cx="30" cy="12" r="1.8" fill="#4AAA78" opacity=".5" />
    </Art>
  );
}

/* ── Stea / începuturi — steaua căzătoare (ambră) ────────────────────────── */
export function ArtStea({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#C97F2E" opacity=".13" />
      <path d="M33 14l3.6 8.6 9.4.8-7.1 6.1 2.1 9.1-8-4.8-8 4.8 2.1-9.1-7.1-6.1 9.4-.8z" fill="url(#art-gAmber)" />
      <path d="M33 14l3.6 8.6 9.4.8-7.1 6.1z" fill="#FFF" opacity=".2" />
      <path d="M13 15l6 6M10 24l4.5 1.5M16 9l1.5 4.5" stroke="#E0A755" strokeWidth="1.8" strokeLinecap="round" opacity=".6" />
    </Art>
  );
}

/* ── Scut / siguranță — scutul cu frunză (verde) ─────────────────────────── */
export function ArtScut({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#2B8C5C" opacity=".12" />
      <path d="M30 9l17 6v12c0 10.5-7 18.5-17 22C20 45.5 13 37.5 13 27V15z" fill="url(#art-gGreen)" opacity=".9" />
      <path d="M30 9l17 6v12c0 2-.3 4-.8 5.8L30 12.8z" fill="#FFF" opacity=".14" />
      <path d="M23 28.5l5 5 9.5-10" stroke="#E6F5ED" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Art>
  );
}

/* ── Clepsidră / 2 minute — timpul blând (indigo) ────────────────────────── */
export function ArtTimp({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="52" rx="16" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <circle cx="30" cy="30" r="17.5" stroke="url(#art-gInd)" strokeWidth="2.6" fill="none" />
      <circle cx="30" cy="30" r="17.5" fill="#6668CC" opacity=".08" />
      <path d="M30 20v10l7 5" stroke="url(#art-gInd)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M45 11l4 4M15 11l-4 4" stroke="url(#art-gInd)" strokeWidth="2.2" strokeLinecap="round" opacity=".6" />
    </Art>
  );
}

/* ── Spirală / proces interior — cochilia (indigo) ───────────────────────── */
export function ArtSpirala({ className }: ArtProps) {
  return (
    <Art className={className}>
      <ellipse cx="30" cy="51" rx="16" ry="3.5" fill="#3D3FAA" opacity=".13" />
      <path d="M30 30a3 3 0 106-.5 6.5 6.5 0 10-12 3 10.5 10.5 0 1020-4.5 15 15 0 10-27 9" stroke="url(#art-gInd)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="29.5" r="1.8" fill="url(#art-gInd)" />
      <circle cx="47" cy="16" r="1.6" fill="#6668CC" opacity=".45" />
    </Art>
  );
}
