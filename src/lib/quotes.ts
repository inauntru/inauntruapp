export interface Quote {
  text: string;
  author: string;
}

export const JOURNAL_QUOTES: Quote[] = [
  { text: "Scrisul este cel mai sincer lucru pe care îl poți face pentru tine însuți.", author: "Anaïs Nin" },
  { text: "Nu știi ce simți cu adevărat până nu pui în cuvinte.", author: "Joan Didion" },
  { text: "Un jurnal nu este despre ce s-a întâmplat — ci despre ce ai simțit că s-a întâmplat.", author: "Madeleine L'Engle" },
  { text: "Scrie. Nu pentru că lumea are nevoie de mai mult conținut, ci pentru că tu ai nevoie să te înțelegi.", author: "Glennon Doyle" },
  { text: "Cel mai bun mod de a procesa emoțiile este să le dai un loc unde să existe.", author: "Brené Brown" },
  { text: "Corpul ține scorul, iar mintea rescrie povestea — scrisul le aduce împreună.", author: "Bessel van der Kolk" },
  { text: "Reflecția transformă experiența în înțelepciune.", author: "John Dewey" },
  { text: "Cine privește în exterior visează. Cine privește în interior se trezește.", author: "Carl Jung" },
  { text: "Cea mai grea conversație pe care o poți purta este cea cu tine însuți. Și cea mai importantă.", author: "Rainer Maria Rilke" },
  { text: "Emoțiile nerostite nu dispar — trăiesc în corp și ies altfel.", author: "Gabor Maté" },
  { text: "Dacă vrei să cunoști mintea cuiva, citește ce scrie când crede că nu îl citește nimeni.", author: "Virginia Woolf" },
  { text: "Liniștea dinlăuntru nu înseamnă absența gândurilor — înseamnă să nu fii definit de ele.", author: "Pema Chödrön" },
  { text: "Vindecarea nu înseamnă că durerea dispare. Înseamnă că nu te mai conduce.", author: "Thich Nhat Hanh" },
  { text: "Cuvintele scrise sunt urme ale sufletului — fiecare pagină un pas spre tine.", author: "Søren Kierkegaard" },
  { text: "Nu fuga de ce simți. Stai cu emoția și lasă-o să îți spună ce are de spus.", author: "Tara Brach" },
  { text: "Corpul tău știe adevărul înainte ca mintea să îl formuleze.", author: "Peter Levine" },
  { text: "Scrisul este meditație cu pixul pe hârtie.", author: "Natalie Goldberg" },
  { text: "Nu trebuie să ai răspunsuri. Ajunge să pui întrebări cu sinceritate.", author: "Rainer Maria Rilke" },
  { text: "Creierul procesează emoțiile de două ori mai eficient când le exprimăm în cuvinte.", author: "Matthew Lieberman" },
  { text: "Jurnalul nu judecă, nu grăbește și nu uită. E cel mai blând martor al tău.", author: "Julia Cameron" },
  { text: "Tot ceea ce refuzi să simți va continua să se întoarcă.", author: "Carl Jung" },
  { text: "Curiozitatea față de propria viață interioară este primul act de curaj.", author: "Harriet Lerner" },
  { text: "Nu trebuie să fii în regulă. Trebuie doar să fii onest cu tine.", author: "Brené Brown" },
  { text: "Scrie ce nu poți spune cu voce tare — pagina te ascultă fără să clipească.", author: "Anne Lamott" },
  { text: "Sistemul nervos învață din calm — nu din grabă și forță.", author: "Deb Dana" },
  { text: "Pauzele nu sunt pierdere de timp. Sunt momentele în care integrezi tot ce ai trăit.", author: "Daniel Siegel" },
  { text: "Fiecare gând scris eliberează puțin spațiu în minte.", author: "Julia Cameron" },
  { text: "Nu contează cât de haotică e pagina — contează că ai stat cu tine.", author: "Natalie Goldberg" },
  { text: "Întoarce-te în interior. Acolo e sursa ta.", author: "Marcus Aurelius" },
  { text: "Emoția este informație — nu inamică.", author: "Susan David" },
  { text: "Vocea din jurnal este cea mai autentică versiune a ta.", author: "Anaïs Nin" },
  { text: "Ce nu e exprimat, e reprimat. Ce e reprimat, caută altă ieșire.", author: "Gabor Maté" },
  { text: "Scrie despre ce te doare — acolo e și ce te vindecă.", author: "Clarissa Pinkola Estés" },
  { text: "Momentul prezent este singurul loc în care te poți întâlni cu tine însuți.", author: "Thich Nhat Hanh" },
  { text: "Nu trebuie să rezolvi totul azi. Ajunge să observi.", author: "Tara Brach" },
];

export function getDailyQuote(): Quote {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return JOURNAL_QUOTES[dayOfYear % JOURNAL_QUOTES.length];
}
