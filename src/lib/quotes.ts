export interface Quote {
  text: string;
  author: string;
}

export type ZodiacSign =
  | "Berbec" | "Taur" | "Gemeni" | "Rac" | "Leu" | "Fecioară"
  | "Balanță" | "Scorpion" | "Săgetător" | "Capricorn" | "Vărsător" | "Pești";

// ── Determină semnul zodiacal din zi + lună ───────────────────────────────────
export function getZodiacSign(month: number, day: number): ZodiacSign {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Berbec";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taur";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemeni";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Rac";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leu";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Fecioară";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Balanță";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpion";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Săgetător";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Vărsător";
  return "Pești";
}

// ── Citate pe semn zodiacal ───────────────────────────────────────────────────
export const ZODIAC_QUOTES: Record<ZodiacSign, Quote[]> = {
  Berbec: [
    { text: "Curajul nu este absența fricii — este decizia că ceva altceva este mai important decât frica.", author: "Ambrose Redmoon" },
    { text: "Energia ta este cel mai valoros resurs. Alege cu grijă unde o investești.", author: "Oprah Winfrey" },
    { text: "Acțiunea este antidotul disperării.", author: "Joan Baez" },
    { text: "Focul dinlăuntru tău nu trebuie stins — trebuie îndreptat.", author: "Brené Brown" },
    { text: "Nu aştepta momentul perfect. Ia momentul şi fă-l perfect.", author: "Zoë Lister-Jones" },
    { text: "Corpul tău ştie direcţia chiar şi când mintea se îndoieşte.", author: "Bessel van der Kolk" },
    { text: "Viteza cu care acţionezi spune ceva despre viteza cu care simţi.", author: "Daniel Siegel" },
    { text: "Pionierul nu aşteaptă permisiunea. Se trezeşte şi merge.", author: "Arianna Huffington" },
  ],
  Taur: [
    { text: "Grija de sine nu este egoism — este oxigenul din avion pe care trebuie să ţi-l pui tu mai întâi.", author: "Audre Lorde" },
    { text: "Corpul tău este casa în care locuieşti toată viaţa. Tratează-l ca atare.", author: "B.K.S. Iyengar" },
    { text: "Stabilitatea nu vine din exterior — vine din rădăcinile pe care le-ai cultivat înlăuntrul tău.", author: "Thich Nhat Hanh" },
    { text: "Există o forţă tăcută în răbdare pe care graba nu o va înţelege niciodată.", author: "Lao Tzu" },
    { text: "Simţurile tale sunt porţile spre prezent. Foloseşte-le.", author: "Jon Kabat-Zinn" },
    { text: "Ceea ce hrăneşti cu atenţia ta creşte. Ai grijă la ce cultivi.", author: "Tara Brach" },
    { text: "Înrădăcinarea nu înseamnă imobilitate — înseamnă că poţi rezista furtunii.", author: "Pema Chödrön" },
    { text: "Plăcerea simţurilor, savurată conştient, este o formă de meditaţie.", author: "Thich Nhat Hanh" },
  ],
  Gemeni: [
    { text: "Curiozitatea este cel mai curajos lucru pe care îl poţi aduce cu tine în interior.", author: "Tara Brach" },
    { text: "Mintea ta este un instrument. Învaţă s-o foloseşti, nu să fii folosit de ea.", author: "Eckhart Tolle" },
    { text: "Nu trebuie să alegi o singură versiune a ta. Poţi fi complex.", author: "Glennon Doyle" },
    { text: "Conversaţia cu sinele este mai importantă decât orice alt dialog.", author: "Byron Katie" },
    { text: "Adaptabilitatea nu este slăbiciune — este o formă de inteligenţă emoţională.", author: "Daniel Goleman" },
    { text: "Gândurile tale nu sunt fapte. Observă-le cu curiozitate, nu cu judecată.", author: "Daniel Siegel" },
    { text: "A fi prezent în mijlocul agitaţiei mentale este un act de curaj.", author: "Jon Kabat-Zinn" },
    { text: "Mintea care se mişcă rapid are nevoie de momente de linişte ca să se audă pe sine.", author: "Gabor Maté" },
  ],
  Rac: [
    { text: "Sensibilitatea ta nu este o vulnerabilitate — este o superputere.", author: "Brené Brown" },
    { text: "Plânsul nu este slăbiciune. Este dovada că simţi profund.", author: "Clarissa Pinkola Estés" },
    { text: "Cel care simte mult are acces la straturi ale realităţii pe care alţii nu le văd.", author: "Carl Jung" },
    { text: "Grija pentru ceilalţi începe cu grija pentru tine. Nu poţi turna dintr-un vas gol.", author: "Harriet Lerner" },
    { text: "Intuiţia ta este colecţia de experienţe procesate de sistemul nervos.", author: "Peter Levine" },
    { text: "Emoţiile tale sunt mesageri, nu inamici. Ascultă ce aduc.", author: "Susan David" },
    { text: "A te întoarce acasă la tine însuţi este cel mai lung — şi mai important — drum.", author: "Thich Nhat Hanh" },
    { text: "Memoria emoţională trăieşte în corp. Eliberarea vine prin corp.", author: "Bessel van der Kolk" },
  ],
  Leu: [
    { text: "Nu te micşora ca să faci loc altora. Lumina ta nu stinge pe a nimănui.", author: "Marianne Williamson" },
    { text: "Autenticitatea este magnetul cel mai puternic.", author: "Brené Brown" },
    { text: "Creaţia este actul de a-ţi exprima sufletul fără scuze.", author: "Clarissa Pinkola Estés" },
    { text: "Generozitatea adevărată vine din plinătate, nu din teamă.", author: "Tara Brach" },
    { text: "A fi văzut aşa cum eşti cu adevărat — aceasta este intimitatea cea mai profundă.", author: "Harriet Lerner" },
    { text: "Expresia sinelui este o formă de vindecare.", author: "Gabor Maté" },
    { text: "Prezenţa ta în lume contează mai mult decât îţi dai seama.", author: "Oprah Winfrey" },
    { text: "Curajul de a fi tu însuţi este cel mai nobil act de leadership.", author: "Arianna Huffington" },
  ],
  Fecioară: [
    { text: "Perfecţionismul este armura care te protejează de vulnerabilitate. Şi de viaţă.", author: "Brené Brown" },
    { text: "Atenţia la detalii este un dar — când nu devine o cuşcă.", author: "Daniel Siegel" },
    { text: "Corpul tău îţi dă informaţii precise în fiecare clipă. Învaţă să îl asculţi.", author: "Peter Levine" },
    { text: "Disciplina fără compasiune faţă de sine devine autodistrugere.", author: "Kristin Neff" },
    { text: "A te îngriji de corp şi de minte cu aceeaşi atenţie este înţelepciune.", author: "Jon Kabat-Zinn" },
    { text: "Analiza fără acţiune este o formă de evitare. Simte mai întâi.", author: "Tara Brach" },
    { text: "Suficienţa este o calitate pe care trebuie s-o practici zilnic.", author: "Harriet Lerner" },
    { text: "Ordinea exterioară calmează sistemul nervos — dar ordinea interioară eliberează sufletul.", author: "Gabor Maté" },
  ],
  Balanță: [
    { text: "Echilibrul nu este o stare statică — este un dans continuu cu dezechilibrul.", author: "Pema Chödrön" },
    { text: "A putea sta în mijlocul contradicţiei fără să trebuiască s-o rezolvi — aceasta este maturitate.", author: "Richard Rohr" },
    { text: "Armonia vine din a accepta că oamenii sunt diferiţi, nu din a-i schimba.", author: "Thich Nhat Hanh" },
    { text: "Nevoia ta de aprobare te costă autenticitatea.", author: "Byron Katie" },
    { text: "Graniţele sănătoase sunt un act de iubire — faţă de tine şi faţă de ceilalţi.", author: "Harriet Lerner" },
    { text: "Justiţia pe care o cauţi în exterior înceapă cu dreptatea pe care ţi-o faci ţie însuţi.", author: "Carl Jung" },
    { text: "Frumosul nu este în perfecţiune — este în armonie.", author: "Rainer Maria Rilke" },
    { text: "A alege din pace, nu din frica de conflict, schimbă totul.", author: "Tara Brach" },
  ],
  Scorpion: [
    { text: "Transformarea nu este confortabilă. Dar este singura cale spre o viaţă autentică.", author: "Carl Jung" },
    { text: "Ce refuzi să simţi te conduce. Ce accepţi să simţi te eliberează.", author: "Peter Levine" },
    { text: "Profunzimea cu care poţi suferi este aceeaşi cu adâncimea la care poţi iubi.", author: "Kahlil Gibran" },
    { text: "Umbrele tale nu sunt inamicele tale. Sunt părţi din tine care aşteaptă să fie integrate.", author: "Carl Jung" },
    { text: "Puterea adevărată nu vine din control — vine din înţelegere.", author: "Gabor Maté" },
    { text: "Vindecarea necesită să intri exact în ceea ce vrei să eviţi.", author: "Bessel van der Kolk" },
    { text: "Intensitatea ta este un dar când ştii s-o direcţionezi spre interior.", author: "Clarissa Pinkola Estés" },
    { text: "Moartea şi renaşterea sunt cicluri. Nu te teme de sfârşit — pregăteşte-te pentru ce urmează.", author: "Pema Chödrön" },
  ],
  Săgetător: [
    { text: "Libertatea pe care o cauţi în exterior există deja înlăuntrul tău.", author: "Eckhart Tolle" },
    { text: "Adevărul nu este confortabil. Dar este singurul lucru care te eliberează cu adevărat.", author: "Byron Katie" },
    { text: "Optimismul nu ignoră realitatea — o transformă.", author: "Martin Seligman" },
    { text: "Fiecare experienţă este o lecţie dacă eşti suficient de prezent s-o primeşti.", author: "Thich Nhat Hanh" },
    { text: "Cunoaşterea de sine este cea mai lungă călătorie pe care o vei face vreodată.", author: "Rainer Maria Rilke" },
    { text: "Nu trebuie să ai toate răspunsurile. Ajunge să rămâi în căutare.", author: "Pema Chödrön" },
    { text: "Entuziasmul tău pentru viaţă este contagios. Foloseşte-l pentru a te vindeca mai întâi pe tine.", author: "Brené Brown" },
    { text: "Filosofia nu este un lux — este instrumentul cu care dai sens suferinţei.", author: "Viktor Frankl" },
  ],
  Capricorn: [
    { text: "Disciplina este libertate.", author: "Jocko Willink" },
    { text: "Răbdarea nu este a aştepta pasiv — este a acţiona cu calm.", author: "Harriet Lerner" },
    { text: "Munca interioară este cea mai grea muncă. Şi cea mai importantă.", author: "Carl Jung" },
    { text: "Rezultatele durabile vin din schimbări profunde, nu din soluţii rapide.", author: "James Clear" },
    { text: "Responsabilitatea faţă de tine însuţi este fundaţia oricărei relaţii sănătoase.", author: "Brené Brown" },
    { text: "Nu construi pentru a impresiona. Construieşte pentru a dura.", author: "Seneca" },
    { text: "Corpul şi mintea au nevoie de odihnă aşa cum pământul are nevoie de iarnă.", author: "Clarissa Pinkola Estés" },
    { text: "Ambiţia fără compasiune faţă de sine devine o formă de violenţă interioară.", author: "Kristin Neff" },
  ],
  Vărsător: [
    { text: "Singularitatea ta nu este un defect — este contribuţia ta unică la lume.", author: "Marianne Williamson" },
    { text: "Schimbarea sistemelor începe cu schimbarea minţilor individuale.", author: "Daniel Siegel" },
    { text: "Independenţa adevărată nu înseamnă să nu ai nevoie de nimeni — înseamnă să alegi conexiunea din forţă, nu din frică.", author: "Harriet Lerner" },
    { text: "Ideile tale radicale de azi vor fi înţelepciunea de mâine.", author: "Buckminster Fuller" },
    { text: "Empatia nu înseamnă să simţi ce simte altul — înseamnă să înţelegi că simte.", author: "Brené Brown" },
    { text: "Detaşarea emoţională nu este vindecare. Vindecarea este să simţi fără să fii copleşit.", author: "Gabor Maté" },
    { text: "Colectivul se vindecă prin indivizii care aleg să se vindece.", author: "Resmaa Menakem" },
    { text: "Viitorul pe care îl vizualizezi devine prezentul pe care îl construieşti.", author: "Buckminster Fuller" },
  ],
  Pești: [
    { text: "Empatia ta este un dar rar. Învaţă şi să o protejezi.", author: "Brené Brown" },
    { text: "Visul şi realitatea nu sunt opuse — visul este realitatea voalată.", author: "Carl Jung" },
    { text: "Compasiunea faţă de tine însuţi este fundamentul compasiunii faţă de ceilalţi.", author: "Kristin Neff" },
    { text: "Arta este modalitatea prin care sufletul vorbeşte când cuvintele nu ajung.", author: "Kahlil Gibran" },
    { text: "Graniţele nu sunt ziduri — sunt uşi pe care le poţi deschide sau închide tu.", author: "Harriet Lerner" },
    { text: "A absorbi durerea lumii fără să te pierzi în ea — aceasta este maturitatea spirituală.", author: "Pema Chödrön" },
    { text: "Intuiţia ta este cunoaştere acumulată dincolo de limbaj.", author: "Clarissa Pinkola Estés" },
    { text: "Fluiditatea nu este haos — este adaptare inteligentă.", author: "Mihaly Csikszentmihalyi" },
  ],
};

// ── Citate generale (fallback dacă nu există dată de naştere) ─────────────────
export const GENERAL_QUOTES: Quote[] = [
  { text: "Scrisul este cel mai sincer lucru pe care îl poți face pentru tine însuți.", author: "Anaïs Nin" },
  { text: "Nu știi ce simți cu adevărat până nu pui în cuvinte.", author: "Joan Didion" },
  { text: "Reflecția transformă experiența în înțelepciune.", author: "John Dewey" },
  { text: "Cine privește în exterior visează. Cine privește în interior se trezește.", author: "Carl Jung" },
  { text: "Emoțiile nerostite nu dispar — trăiesc în corp și ies altfel.", author: "Gabor Maté" },
  { text: "Liniștea dinlăuntru nu înseamnă absența gândurilor — înseamnă să nu fii definit de ele.", author: "Pema Chödrön" },
  { text: "Vindecarea nu înseamnă că durerea dispare. Înseamnă că nu te mai conduce.", author: "Thich Nhat Hanh" },
  { text: "Nu fuga de ce simți. Stai cu emoția și lasă-o să îți spună ce are de spus.", author: "Tara Brach" },
  { text: "Corpul tău știe adevărul înainte ca mintea să îl formuleze.", author: "Peter Levine" },
  { text: "Tot ceea ce refuzi să simți va continua să se întoarcă.", author: "Carl Jung" },
  { text: "Curiozitatea față de propria viață interioară este primul act de curaj.", author: "Harriet Lerner" },
  { text: "Emoția este informație — nu inamică.", author: "Susan David" },
  { text: "Momentul prezent este singurul loc în care te poți întâlni cu tine însuți.", author: "Thich Nhat Hanh" },
  { text: "Sistemul nervos învață din calm — nu din grabă și forță.", author: "Deb Dana" },
];

// ── Returnează citatul zilei ──────────────────────────────────────────────────
export function getDailyQuote(dateOfBirth?: string): { quote: Quote; sign?: ZodiacSign } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (!isNaN(dob.getTime())) {
      const sign = getZodiacSign(dob.getMonth() + 1, dob.getDate());
      const pool = ZODIAC_QUOTES[sign];
      return { quote: pool[dayOfYear % pool.length], sign };
    }
  }

  return { quote: GENERAL_QUOTES[dayOfYear % GENERAL_QUOTES.length] };
}
