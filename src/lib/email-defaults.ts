export interface EmailDefault {
  subject: string;
  preheader: string;
  body: string;
}

export const SHELL = (body: string) => `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;background:#f5f0eb;margin:0;padding:40px 16px;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 20px;">
    <p style="color:#b0b8c1;font-size:12px;text-align:center;margin:0;">© 2026 WithIn · România &nbsp;·&nbsp; <a href="#" style="color:#b0b8c1;">Dezabonare</a></p>
  </div>
</body>
</html>`;

export const EMAIL_DEFAULTS: Record<string, EmailDefault> = {
  verify_email: {
    subject: "Confirmă-ți adresa de email — WithIn",
    preheader: "Un singur click și ești înăuntru.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:52px;height:52px;background:#2D5016;border-radius:50%;margin:0 auto 16px;line-height:52px;font-size:24px;">🌿</div>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:24px;margin:0 0 8px;">Confirmă-ți adresa de email</h1>
      <p style="color:#6b7280;font-size:14px;margin:0;">Un singur click și ești înăuntru.</p>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Ești aproape! Confirmă-ți adresa de email pentru a accesa spațiul tău de liniște de pe WithIn.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;display:inline-block;">Confirmă emailul →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">Linkul expiră în <strong>24 de ore</strong>.<br>Dacă nu ai creat un cont, poți ignora acest email.</p>`),
  },

  reset_password: {
    subject: "Resetare parolă — WithIn",
    preheader: "Ai cerut resetarea parolei contului tău.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:52px;height:52px;background:#2D5016;border-radius:50%;margin:0 auto 16px;line-height:52px;font-size:24px;">🔑</div>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:24px;margin:0;">Resetare parolă</h1>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Am primit o cerere de resetare a parolei pentru contul asociat cu <strong>{{email}}</strong>. Apasă butonul de mai jos pentru a alege o parolă nouă.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Setează parola nouă →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Linkul expiră în <strong>1 oră</strong>. Dacă nu ai solicitat resetarea, ignoră acest email — contul tău este în siguranță.</p>`),
  },

  change_email: {
    subject: "Confirmare schimbare email — WithIn",
    preheader: "Confirmă noua adresă de email.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Confirmare schimbare email</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Ai solicitat schimbarea adresei de email a contului tău WithIn la <strong>{{email}}</strong>. Apasă butonul de mai jos pentru a confirma.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Confirmă noul email →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Dacă nu ai solicitat această schimbare, contactează-ne imediat la suport@inauntru.ro.</p>`),
  },

  invite_user: {
    subject: "Ești invitat în echipa WithIn",
    preheader: "Ai primit o invitație de admin.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Invitație echipă WithIn</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Bună,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Ai fost invitat să te alături echipei WithIn cu rolul de <strong>{{rol}}</strong>. Apasă butonul de mai jos pentru a accepta invitația și a-ți seta parola.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Acceptă invitația →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Invitația expiră în <strong>72 de ore</strong>.</p>`),
  },

  welcome: {
    subject: "Bun venit la WithIn, {{prenume}}! 🌿",
    preheader: "Spațiul tău de liniște este pregătit.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#4a7c59;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Bun venit</p>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:26px;margin:0;">Suntem bucuroși că ești alături de noi, {{prenume}}.</h1>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.8;">Ai făcut primul pas spre echilibrul interior. Spațiul tău WithIn este pregătit — cu practici ghidate, check-in-uri zilnice și sesiuni LIVE cu facilitatorii noștri.</p>
    <div style="background:#f0f7ee;border-radius:12px;padding:20px 24px;margin:24px 0;">
      <p style="color:#2D5016;font-size:14px;font-weight:600;margin:0 0 10px;">Începe cu:</p>
      <ul style="color:#4a5568;font-size:14px;line-height:2.2;margin:0;padding-left:20px;">
        <li>Un check-in de 2 minute — cum te simți azi?</li>
        <li>Prima practică de respirație din biblioteca noastră</li>
        <li>O sesiune LIVE gratuită cu facilitatorii noștri</li>
      </ul>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Intră în contul tău →</a>
    </div>
    <p style="color:#9ca3af;font-size:14px;text-align:center;font-style:italic;">"Fiecare respirație este un nou început."</p>`),
  },

  getting_started: {
    subject: "Cum să profiți la maximum de WithIn",
    preheader: "3 lucruri pe care le poți face chiar acum.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Ghidul tău de start, {{prenume}}</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Ieri ai făcut primul pas. Azi îți arătăm cum să transformi WithIn în rutina ta de echilibru.</p>
    <div style="margin:24px 0;border-left:3px solid #4a7c59;padding-left:20px;">
      <p style="color:#2D5016;font-size:15px;font-weight:600;margin:0 0 6px;">1. Fă-ți check-in-ul zilnic</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">2 minute. Notezi cum te simți, ce zone ale corpului simt tensiune și alegi o practică recomandată.</p>
    </div>
    <div style="margin:24px 0;border-left:3px solid #4a7c59;padding-left:20px;">
      <p style="color:#2D5016;font-size:15px;font-weight:600;margin:0 0 6px;">2. Explorează practicile din categoria ta</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">Suflu, Odihnă, Prezență — găsești practici de 5, 15 sau 30 de minute, pentru orice moment al zilei.</p>
    </div>
    <div style="margin:24px 0;border-left:3px solid #4a7c59;padding-left:20px;">
      <p style="color:#2D5016;font-size:15px;font-weight:600;margin:0 0 6px;">3. Rezervă o sesiune LIVE</p>
      <p style="color:#6b7280;font-size:14px;margin:0;">Prima sesiune este gratuită. Alege un facilitator și conectează-te în timp real.</p>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Explorează platforma →</a>
    </div>`),
  },

  first_checkin: {
    subject: "Primul tău check-in — felicitări, {{prenume}}!",
    preheader: "Ești deja pe drumul cel bun.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:36px;margin-bottom:12px;">✨</div>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:24px;margin:0;">Ai completat primul check-in!</h1>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Conștientizarea este primul pas spre schimbare. Prin check-in-ul de azi ai ales să te oprești, să asculți și să te cunoști mai bine.</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Încearcă să repeți mâine — constanța este cea care aduce transformarea reală.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Continuă practica →</a>
    </div>`),
  },

  weekly_summary: {
    subject: "Rezumatul tău din această săptămână — WithIn",
    preheader: "{{nr_practici}} practici completate. Continuă tot așa.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 8px;">Săptămâna ta în cifre, {{prenume}}</h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 28px;">Rezumat pentru săptămâna trecută</p>
    <div style="display:flex;gap:12px;margin-bottom:28px;">
      <div style="flex:1;background:#f0f7ee;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:#2D5016;font-size:28px;font-weight:700;margin:0;">{{nr_practici}}</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">practici completate</p>
      </div>
      <div style="flex:1;background:#f0f7ee;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:#2D5016;font-size:28px;font-weight:700;margin:0;">{{nr_minute}}</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">minute de practică</p>
      </div>
      <div style="flex:1;background:#f0f7ee;border-radius:12px;padding:16px;text-align:center;">
        <p style="color:#2D5016;font-size:28px;font-weight:700;margin:0;">{{streak}}</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">zile consecutive</p>
      </div>
    </div>
    <p style="color:#4a5568;font-size:15px;line-height:1.75;">{{mesaj_personalizat}}</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Continuă săptămâna →</a>
    </div>`),
  },

  practice_streak: {
    subject: "{{nr_zile}} zile consecutive 🔥 — continuă tot așa, {{prenume}}!",
    preheader: "Constanța ta începe să se vadă.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:40px;margin-bottom:12px;">🔥</div>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:24px;margin:0;">{{nr_zile}} zile consecutive!</h1>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Ai practicat <strong>{{nr_zile}} zile la rând</strong>. Sistemul tău nervos simte deja diferența — chiar dacă mintea nu o vede încă.</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Continuă mâine și construiește un obicei care rămâne.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Practică acum →</a>
    </div>`),
  },

  reactivation: {
    subject: "Ne-a fost dor de tine, {{prenume}} 🌿",
    preheader: "Spațiul tău WithIn te așteaptă.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Nu e niciodată prea târziu să revii.</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Se fac <strong>{{nr_zile}} zile</strong> de când nu te-am văzut pe platformă. Știm că viața devine uneori prea aglomerată — și tocmai de aia suntem aici.</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Un singur check-in de 2 minute îți poate schimba restul zilei. Fără presiune — în ritmul tău.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Revin la practică →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;font-style:italic;">"Fiecare respirație este un nou început."</p>`),
  },

  session_booked: {
    subject: "Rezervare confirmată — {{sesiune_titlu}}",
    preheader: "Te așteptăm pe {{sesiune_data}}.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Rezervarea ta este confirmată!</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <div style="background:#f0f7ee;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <p style="color:#2D5016;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Detalii sesiune</p>
      <p style="color:#1a3a0a;font-size:17px;font-weight:600;margin:0 0 6px;">{{sesiune_titlu}}</p>
      <p style="color:#4a5568;font-size:14px;margin:0 0 4px;">📅 {{sesiune_data}}</p>
      <p style="color:#4a5568;font-size:14px;margin:0 0 4px;">⏱ {{sesiune_durata}} minute</p>
      <p style="color:#4a5568;font-size:14px;margin:0;">👤 Facilitator: {{facilitator_nume}}</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Intră în sesiune →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Vei primi un reminder cu 24 de ore înainte.</p>`),
  },

  session_reminder: {
    subject: "Mâine ai sesiunea: {{sesiune_titlu}} 🌿",
    preheader: "Pregătește-te pentru o sesiune de reglare profundă.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Sesiunea ta este mâine!</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>, îți reamintim că ai o sesiune LIVE mâine cu <strong>{{facilitator_nume}}</strong>.</p>
    <div style="background:#f0f7ee;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <p style="color:#1a3a0a;font-size:17px;font-weight:600;margin:0 0 6px;">{{sesiune_titlu}}</p>
      <p style="color:#4a5568;font-size:14px;margin:0;">📅 {{sesiune_data}}</p>
    </div>
    <p style="color:#4a5568;font-size:15px;line-height:1.75;">Sfat: cu 10 minute înainte, găsește un loc liniștit, pune căști și bea un pahar cu apă.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Deschide sesiunea →</a>
    </div>`),
  },

  session_followup: {
    subject: "Cum te-ai simțit după sesiunea de azi?",
    preheader: "Notează-ți observațiile cât sunt proaspete.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Cum a fost sesiunea, {{prenume}}?</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Tocmai ai terminat sesiunea cu <strong>{{facilitator_nume}}</strong>. Corpul tău a trecut printr-o experiență de reglare — ia câteva minute să observi ce simți.</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Fă un check-in acum și notează-ți starea — vei putea urmări evoluția în timp.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Fă check-in acum →</a>
    </div>`),
  },

  sub_activated: {
    subject: "Abonamentul {{plan}} este activ — bun venit la nivel următor!",
    preheader: "Ai acces complet începând de acum.",
    body: SHELL(`    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:36px;margin-bottom:12px;">🎉</div>
      <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:24px;margin:0;">Abonamentul {{plan}} este activ!</h1>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>, abonamentul tău <strong>{{plan}}</strong> a fost activat cu succes.</p>
    <div style="background:#f0f7ee;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <p style="color:#2D5016;font-size:14px;font-weight:600;margin:0 0 10px;">Ce ai acum acces:</p>
      <ul style="color:#4a5568;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li>Toate practicile din biblioteca WithIn</li>
        <li>Sesiuni LIVE nelimitate cu facilitatorii noștri</li>
        <li>Monitorizarea progresului și istoricul check-in-urilor</li>
      </ul>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">Suma de <strong>{{suma}} RON</strong> a fost procesată. Urmează reînnoirea pe <strong>{{data_reinnoire}}</strong>.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Explorează platforma →</a>
    </div>`),
  },

  trial_ending: {
    subject: "Perioada ta de probă se termină în {{nr_zile}} zile",
    preheader: "Continuă fără întrerupere — alege un plan.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Perioada de probă se apropie de final</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Perioada ta de probă gratuită se termină pe <strong>{{data_expirare}}</strong>. Dacă vrei să continui accesul la practicile și sesiunile WithIn, alege un plan care ți se potrivește.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Alege planul tău →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Fără abonament, contul rămâne activ pe planul Gratuit — cu acces limitat.</p>`),
  },

  payment_failed: {
    subject: "Plata abonamentului tău nu a putut fi procesată",
    preheader: "Acțiune necesară pentru a menține accesul.",
    body: SHELL(`    <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#b91c1c;font-size:14px;font-weight:600;margin:0;">⚠️ Plata nu a putut fi procesată</p>
    </div>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Nu am reușit să procesăm plata pentru abonamentul tău <strong>{{plan}}</strong>. Verifică datele cardului și reîncercă pentru a nu pierde accesul la platformă.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Actualizează metoda de plată →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Dacă plata nu este reluată în 7 zile, abonamentul va fi suspendat automat.</p>`),
  },

  sub_cancelled: {
    subject: "Abonamentul tău a fost anulat",
    preheader: "Ne pare rău să te vedem plecând.",
    body: SHELL(`    <h1 style="font-family:Georgia,serif;color:#1a3a0a;font-size:22px;margin:0 0 16px;">Abonamentul tău a fost anulat</h1>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Dragă <strong>{{prenume}}</strong>,</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Abonamentul <strong>{{plan}}</strong> a fost anulat conform solicitării tale. Vei păstra accesul premium până pe <strong>{{data_expirare}}</strong>.</p>
    <p style="color:#4a5568;font-size:16px;line-height:1.75;">Contul tău rămâne activ pe planul Gratuit și te poți reabona oricând.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{link}}" style="background:#2D5016;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">Reactivează abonamentul →</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">Dacă ai anulat din greșeală, scrie-ne la suport@inauntru.ro.</p>`),
  },
};
