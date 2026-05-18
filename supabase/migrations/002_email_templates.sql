-- ============================================================
-- Email Templates — stochează template-urile customizabile
-- Rulează în Supabase → SQL Editor → Run
-- ============================================================

create table public.email_templates (
  id text primary key,
  name text not null,
  category text not null,
  subject text not null,
  preheader text not null default '',
  body_html text not null,
  status text not null default 'activ' check (status in ('activ', 'draft')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- RLS: doar adminii pot accesa
alter table public.email_templates enable row level security;

create policy "Admins can manage email templates" on public.email_templates
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Date inițiale (16 template-uri)
insert into public.email_templates (id, name, category, subject, preheader, body_html) values
  ('verify_email',    'Confirmare cont',           'auth',        'Confirmă-ți adresa de email — INAUNTRU',                      'Un singur click și ești înăuntru.',             ''),
  ('reset_password',  'Resetare parolă',           'auth',        'Resetare parolă — INAUNTRU',                                  'Ai cerut resetarea parolei contului tău.',      ''),
  ('change_email',    'Schimbare email',            'auth',        'Confirmare schimbare email — INAUNTRU',                       'Confirmă noua adresă de email.',                ''),
  ('invite_user',     'Invitație admin',            'auth',        'Ești invitat în echipa INAUNTRU',                             'Ai primit o invitație de admin.',               ''),
  ('welcome',         'Bun venit',                  'onboarding',  'Bun venit la INAUNTRU, {{prenume}}! 🌿',                     'Spațiul tău de liniște este pregătit.',         ''),
  ('getting_started', 'Ghid de start',              'onboarding',  'Cum să profiți la maximum de INAUNTRU',                       '3 lucruri pe care le poți face chiar acum.',   ''),
  ('first_checkin',   'Primul check-in',            'onboarding',  'Primul tău check-in — felicitări, {{prenume}}!',              'Ești deja pe drumul cel bun.',                  ''),
  ('weekly_summary',  'Rezumat săptămânal',         'engagement',  'Rezumatul tău din această săptămână — INAUNTRU',              '{{nr_practici}} practici completate.',          ''),
  ('practice_streak', 'Streak practici',            'engagement',  '3 zile consecutive 🔥 — continuă tot așa, {{prenume}}!',     'Constanța ta începe să se vadă.',               ''),
  ('reactivation',    'Reactivare',                 'engagement',  'Ne-a fost dor de tine, {{prenume}} 🌿',                      'Spațiul tău INAUNTRU te așteaptă.',             ''),
  ('session_booked',  'Confirmare rezervare',       'sessions',    'Rezervare confirmată — {{sesiune_titlu}}',                    'Te așteptăm pe {{sesiune_data}}.',              ''),
  ('session_reminder','Reminder sesiune',           'sessions',    'Mâine ai sesiunea: {{sesiune_titlu}} 🌿',                    'Pregătește-te pentru o sesiune de reglare.',    ''),
  ('session_followup','Follow-up sesiune',          'sessions',    'Cum te-ai simțit după sesiunea de azi?',                      'Notează-ți observațiile cât sunt proaspete.',   ''),
  ('sub_activated',   'Abonament activat',          'billing',     'Abonamentul {{plan}} este activ — bun venit la nivel următor!','Ai acces complet începând de acum.',           ''),
  ('trial_ending',    'Trial pe cale să expire',    'billing',     'Perioada ta de probă se termină în {{nr_zile}} zile',         'Continuă fără întrerupere — alege un plan.',   ''),
  ('payment_failed',  'Plată eșuată',               'billing',     'Plata abonamentului tău nu a putut fi procesată',             'Acțiune necesară pentru a menține accesul.',   ''),
  ('sub_cancelled',   'Abonament anulat',           'billing',     'Abonamentul tău a fost anulat',                               'Ne pare rău să te vedem plecând.',              '');
