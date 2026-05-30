// Run: node scripts/generate-email-excel.js
// Output: Desktop/INAUNTRU_Emailuri.csv  (open with Excel)

const fs = require("fs");
const path = require("path");
const os = require("os");

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractCta(html) {
  const match = html.match(/href="[^"]*"[^>]*>([^<]+)</);
  return match ? match[1].trim() : "";
}

function csvCell(val) {
  const s = String(val ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

const categories = {
  verify_email: "Autentificare",
  reset_password: "Autentificare",
  change_email: "Autentificare",
  invite_user: "Autentificare",
  welcome: "Onboarding",
  getting_started: "Onboarding",
  first_checkin: "Engagement",
  weekly_summary: "Engagement",
  practice_streak: "Engagement",
  reactivation: "Engagement",
  session_booked: "Sesiuni",
  session_reminder: "Sesiuni",
  session_followup: "Sesiuni",
  sub_activated: "Abonamente",
  trial_ending: "Abonamente",
  payment_failed: "Abonamente",
  sub_cancelled: "Abonamente",
};

const variables = {
  verify_email: "{{prenume}}, {{link}}",
  reset_password: "{{prenume}}, {{email}}, {{link}}",
  change_email: "{{prenume}}, {{email}}, {{link}}",
  invite_user: "{{prenume}}, {{rol}}, {{link}}",
  welcome: "{{prenume}}, {{link}}",
  getting_started: "{{prenume}}, {{link}}",
  first_checkin: "{{prenume}}, {{link}}",
  weekly_summary: "{{prenume}}, {{nr_practici}}, {{nr_minute}}, {{streak}}, {{mesaj_personalizat}}, {{link}}",
  practice_streak: "{{prenume}}, {{nr_zile}}, {{link}}",
  reactivation: "{{prenume}}, {{nr_zile}}, {{link}}",
  session_booked: "{{prenume}}, {{sesiune_titlu}}, {{sesiune_data}}, {{sesiune_durata}}, {{facilitator_nume}}, {{link}}",
  session_reminder: "{{prenume}}, {{sesiune_titlu}}, {{sesiune_data}}, {{facilitator_nume}}, {{link}}",
  session_followup: "{{prenume}}, {{facilitator_nume}}, {{link}}",
  sub_activated: "{{prenume}}, {{plan}}, {{suma}}, {{data_reinnoire}}, {{link}}",
  trial_ending: "{{prenume}}, {{data_expirare}}, {{link}}",
  payment_failed: "{{prenume}}, {{plan}}, {{link}}",
  sub_cancelled: "{{prenume}}, {{plan}}, {{data_expirare}}, {{link}}",
};

// Inline all email content (copy from email-defaults.ts, stripped)
const emails = {
  verify_email: {
    subject: "Confirmă-ți adresa de email — INAUNTRU",
    preheader: "Un singur click și ești înăuntru.",
    body_text: "Dragă {{prenume}}, Ești aproape! Confirmă-ți adresa de email pentru a accesa spațiul tău de liniște de pe INAUNTRU. Linkul expiră în 24 de ore. Dacă nu ai creat un cont, poți ignora acest email.",
    cta: "Confirmă emailul →",
  },
  reset_password: {
    subject: "Resetare parolă — INAUNTRU",
    preheader: "Ai cerut resetarea parolei contului tău.",
    body_text: "Dragă {{prenume}}, Am primit o cerere de resetare a parolei pentru contul asociat cu {{email}}. Apasă butonul de mai jos pentru a alege o parolă nouă. Linkul expiră în 1 oră. Dacă nu ai solicitat resetarea, ignoră acest email — contul tău este în siguranță.",
    cta: "Setează parola nouă →",
  },
  change_email: {
    subject: "Confirmare schimbare email — INAUNTRU",
    preheader: "Confirmă noua adresă de email.",
    body_text: "Dragă {{prenume}}, Ai solicitat schimbarea adresei de email a contului tău INAUNTRU la {{email}}. Apasă butonul de mai jos pentru a confirma. Dacă nu ai solicitat această schimbare, contactează-ne imediat la suport@inauntru.ro.",
    cta: "Confirmă noul email →",
  },
  invite_user: {
    subject: "Ești invitat în echipa INAUNTRU",
    preheader: "Ai primit o invitație de admin.",
    body_text: "Bună, Ai fost invitat să te alături echipei INAUNTRU cu rolul de {{rol}}. Apasă butonul de mai jos pentru a accepta invitația și a-ți seta parola. Invitația expiră în 72 de ore.",
    cta: "Acceptă invitația →",
  },
  welcome: {
    subject: "Bun venit la INAUNTRU, {{prenume}}! 🌿",
    preheader: "Spațiul tău de liniște este pregătit.",
    body_text: 'Suntem bucuroși că ești alături de noi, {{prenume}}. Ai făcut primul pas spre echilibrul interior. Spațiul tău INAUNTRU este pregătit — cu practici ghidate, check-in-uri zilnice și sesiuni LIVE cu facilitatorii noștri. Începe cu: Un check-in de 2 minute — cum te simți azi? | Prima practică de respirație din biblioteca noastră | O sesiune LIVE gratuită cu facilitatorii noștri. "Fiecare respirație este un nou început."',
    cta: "Intră în contul tău →",
  },
  getting_started: {
    subject: "Cum să profiți la maximum de INAUNTRU",
    preheader: "3 lucruri pe care le poți face chiar acum.",
    body_text: "Ghidul tău de start, {{prenume}}. Ieri ai făcut primul pas. Azi îți arătăm cum să transformi INAUNTRU în rutina ta de echilibru. 1. Fă-ți check-in-ul zilnic — 2 minute. Notezi cum te simți, ce zone ale corpului simt tensiune și alegi o practică recomandată. 2. Explorează practicile din categoria ta — Suflu, Odihnă, Prezență — găsești practici de 5, 15 sau 30 de minute, pentru orice moment al zilei. 3. Rezervă o sesiune LIVE — Prima sesiune este gratuită. Alege un facilitator și conectează-te în timp real.",
    cta: "Explorează platforma →",
  },
  first_checkin: {
    subject: "Primul tău check-in — felicitări, {{prenume}}!",
    preheader: "Ești deja pe drumul cel bun.",
    body_text: "Dragă {{prenume}}, Conștientizarea este primul pas spre schimbare. Prin check-in-ul de azi ai ales să te oprești, să asculți și să te cunoști mai bine. Încearcă să repeți mâine — constanța este cea care aduce transformarea reală.",
    cta: "Continuă practica →",
  },
  weekly_summary: {
    subject: "Rezumatul tău din această săptămână — INAUNTRU",
    preheader: "{{nr_practici}} practici completate. Continuă tot așa.",
    body_text: "Săptămâna ta în cifre, {{prenume}}. Rezumat pentru săptămâna trecută. {{nr_practici}} practici completate | {{nr_minute}} minute de practică | {{streak}} zile consecutive. {{mesaj_personalizat}}",
    cta: "Continuă săptămâna →",
  },
  practice_streak: {
    subject: "{{nr_zile}} zile consecutive 🔥 — continuă tot așa, {{prenume}}!",
    preheader: "Constanța ta începe să se vadă.",
    body_text: "Dragă {{prenume}}, Ai practicat {{nr_zile}} zile la rând. Sistemul tău nervos simte deja diferența — chiar dacă mintea nu o vede încă. Continuă mâine și construiește un obicei care rămâne.",
    cta: "Practică acum →",
  },
  reactivation: {
    subject: "Ne-a fost dor de tine, {{prenume}} 🌿",
    preheader: "Spațiul tău INAUNTRU te așteaptă.",
    body_text: 'Nu e niciodată prea târziu să revii. Dragă {{prenume}}, Se fac {{nr_zile}} zile de când nu te-am văzut pe platformă. Știm că viața devine uneori prea aglomerată — și tocmai de aia suntem aici. Un singur check-in de 2 minute îți poate schimba restul zilei. Fără presiune — în ritmul tău. "Fiecare respirație este un nou început."',
    cta: "Revin la practică →",
  },
  session_booked: {
    subject: "Rezervare confirmată — {{sesiune_titlu}}",
    preheader: "Te așteptăm pe {{sesiune_data}}.",
    body_text: "Rezervarea ta este confirmată! Dragă {{prenume}}, Detalii sesiune: {{sesiune_titlu}} | Data: {{sesiune_data}} | Durată: {{sesiune_durata}} minute | Facilitator: {{facilitator_nume}}. Vei primi un reminder cu 24 de ore înainte.",
    cta: "Intră în sesiune →",
  },
  session_reminder: {
    subject: "Mâine ai sesiunea: {{sesiune_titlu}} 🌿",
    preheader: "Pregătește-te pentru o sesiune de reglare profundă.",
    body_text: "Sesiunea ta este mâine! Dragă {{prenume}}, îți reamintim că ai o sesiune LIVE mâine cu {{facilitator_nume}}. {{sesiune_titlu}} | {{sesiune_data}}. Sfat: cu 10 minute înainte, găsește un loc liniștit, pune căști și bea un pahar cu apă.",
    cta: "Deschide sesiunea →",
  },
  session_followup: {
    subject: "Cum te-ai simțit după sesiunea de azi?",
    preheader: "Notează-ți observațiile cât sunt proaspete.",
    body_text: "Cum a fost sesiunea, {{prenume}}? Tocmai ai terminat sesiunea cu {{facilitator_nume}}. Corpul tău a trecut printr-o experiență de reglare — ia câteva minute să observi ce simți. Fă un check-in acum și notează-ți starea — vei putea urmări evoluția în timp.",
    cta: "Fă check-in acum →",
  },
  sub_activated: {
    subject: "Abonamentul {{plan}} este activ — bun venit la nivel următor!",
    preheader: "Ai acces complet începând de acum.",
    body_text: "Abonamentul {{plan}} este activ! Dragă {{prenume}}, abonamentul tău {{plan}} a fost activat cu succes. Ce ai acum acces: Toate practicile din biblioteca INAUNTRU | Sesiuni LIVE nelimitate cu facilitatorii noștri | Monitorizarea progresului și istoricul check-in-urilor. Suma de {{suma}} RON a fost procesată. Urmează reînnoirea pe {{data_reinnoire}}.",
    cta: "Explorează platforma →",
  },
  trial_ending: {
    subject: "Perioada ta de probă se termină în {{nr_zile}} zile",
    preheader: "Continuă fără întrerupere — alege un plan.",
    body_text: "Perioada de probă se apropie de final. Dragă {{prenume}}, Perioada ta de probă gratuită se termină pe {{data_expirare}}. Dacă vrei să continui accesul la practicile și sesiunile INAUNTRU, alege un plan care ți se potrivește. Fără abonament, contul rămâne activ pe planul Gratuit — cu acces limitat.",
    cta: "Alege planul tău →",
  },
  payment_failed: {
    subject: "Plata abonamentului tău nu a putut fi procesată",
    preheader: "Acțiune necesară pentru a menține accesul.",
    body_text: "⚠️ Plata nu a putut fi procesată. Dragă {{prenume}}, Nu am reușit să procesăm plata pentru abonamentul tău {{plan}}. Verifică datele cardului și reîncercă pentru a nu pierde accesul la platformă. Dacă plata nu este reluată în 7 zile, abonamentul va fi suspendat automat.",
    cta: "Actualizează metoda de plată →",
  },
  sub_cancelled: {
    subject: "Abonamentul tău a fost anulat",
    preheader: "Ne pare rău să te vedem plecând.",
    body_text: "Abonamentul tău a fost anulat. Dragă {{prenume}}, Abonamentul {{plan}} a fost anulat conform solicitării tale. Vei păstra accesul premium până pe {{data_expirare}}. Contul tău rămâne activ pe planul Gratuit și te poți reabona oricând. Dacă ai anulat din greșeală, scrie-ne la suport@inauntru.ro.",
    cta: "Reactivează abonamentul →",
  },
};

const header = [
  "ID",
  "Categorie",
  "Subiect email",
  "Preheader (text previzualizare)",
  "Text body (fără HTML)",
  "Text buton CTA",
  "Variabile disponibile",
];

const rows = Object.entries(emails).map(([id, e]) => [
  id,
  categories[id] || "",
  e.subject,
  e.preheader,
  e.body_text,
  e.cta,
  variables[id] || "",
]);

// UTF-8 BOM so Excel opens Romanian chars correctly
const BOM = "﻿";
const csvContent =
  BOM +
  [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

const outPath = path.join(os.homedir(), "Desktop", "INAUNTRU_Emailuri.csv");
fs.writeFileSync(outPath, csvContent, "utf8");
console.log("✅ Fișier generat:", outPath);
