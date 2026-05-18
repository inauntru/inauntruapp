-- ============================================================
-- INAUNTRU — Schema completă bază de date Supabase
-- Rulează acest fișier în Supabase → SQL Editor → Run
-- ============================================================

-- Activează extensia pentru UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extinde auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  plan text not null default 'gratuit' check (plan in ('gratuit', 'standard', 'premium')),
  role text not null default 'user' check (role in ('user', 'moderator', 'admin', 'super_admin')),
  check_ins_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crează automat profil la înregistrare
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FACILITATORS
-- ============================================================
create table public.facilitators (
  id serial primary key,
  slug text not null unique,
  name text not null,
  specialty text,
  bio text,
  image_url text,
  rating decimal(3,1) default 5.0,
  sessions_count int default 0,
  tags text[] default '{}',
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRACTICES
-- ============================================================
create table public.practices (
  id serial primary key,
  title text not null,
  category text not null check (category in ('Suflu', 'Prezență', 'Fluiditate', 'Odihnă', 'Vitalitate', 'Expresie')),
  facilitator_id int references public.facilitators(id),
  facilitator_name text,
  facilitator_slug text,
  duration int not null,
  level text not null check (level in ('Începător', 'Intermediar', 'Avansat')),
  is_premium boolean default false,
  media_type text check (media_type in ('audio', 'video')),
  image_url text,
  thumbnail_url text,
  description text,
  long_description text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('active', 'draft')),
  views_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BLOG POSTS (Inspirație)
-- ============================================================
create table public.blog_posts (
  id serial primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  author text,
  category text,
  tags text[] default '{}',
  image_url text,
  read_time int default 5,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- LIVE SESSIONS
-- ============================================================
create table public.live_sessions (
  id serial primary key,
  title text not null,
  facilitator_id int references public.facilitators(id),
  facilitator_name text,
  facilitator_avatar text,
  scheduled_at timestamptz not null,
  duration int not null,
  spots_total int default 50,
  spots_left int default 50,
  is_premium boolean default true,
  tags text[] default '{}',
  status text default 'upcoming' check (status in ('upcoming', 'live', 'completed', 'cancelled')),
  meeting_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CHECK-INS
-- ============================================================
create table public.check_ins (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood text not null,
  body_zones text[] default '{}',
  intensity text,
  note text,
  created_at timestamptz not null default now()
);

-- Incrementează check_ins_count la fiecare check-in nou
create or replace function public.increment_check_ins()
returns trigger as $$
begin
  update public.profiles
  set check_ins_count = check_ins_count + 1,
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_check_in_created
  after insert on public.check_ins
  for each row execute function public.increment_check_ins();

-- ============================================================
-- USER PRACTICES (progres utilizator)
-- ============================================================
create table public.user_practices (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  practice_id int references public.practices(id) on delete cascade not null,
  completed boolean default false,
  duration_watched int default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, practice_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.facilitators enable row level security;
alter table public.practices enable row level security;
alter table public.blog_posts enable row level security;
alter table public.live_sessions enable row level security;
alter table public.check_ins enable row level security;
alter table public.user_practices enable row level security;

-- Profiles: fiecare user vede și editează doar profilul lui; adminii văd tot
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Practices: toată lumea vede practicile active; adminii gestionează tot
create policy "Anyone can view active practices" on public.practices
  for select using (status = 'active');
create policy "Admins can manage practices" on public.practices
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Blog posts: toată lumea vede postările publicate
create policy "Anyone can view published posts" on public.blog_posts
  for select using (published = true);
create policy "Admins can manage blog posts" on public.blog_posts
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Live sessions: toată lumea vede sesiunile
create policy "Anyone can view live sessions" on public.live_sessions
  for select using (true);
create policy "Admins can manage live sessions" on public.live_sessions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Facilitators: toată lumea vede facilitatorii activi
create policy "Anyone can view active facilitators" on public.facilitators
  for select using (is_active = true);
create policy "Admins can manage facilitators" on public.facilitators
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Check-ins: fiecare user vede doar ale lui
create policy "Users can manage own check-ins" on public.check_ins
  for all using (auth.uid() = user_id);

-- User practices: fiecare user vede doar ale lui
create policy "Users can manage own progress" on public.user_practices
  for all using (auth.uid() = user_id);

-- ============================================================
-- DATE INIȚIALE — Facilitatori
-- ============================================================
insert into public.facilitators (slug, name, specialty, bio, image_url, rating, sessions_count, tags) values
  ('ana-ionescu', 'Ana Ionescu', 'Terapie Somatică', 'Facilitator certificat cu 8 ani experiență', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', 4.9, 320, array['Anxietate', 'Traumă', 'Respirație']),
  ('maria-constantin', 'Maria Constantin', 'Reglare Nervoasă', 'Specialist în tehnici somato-senzoriale', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', 4.8, 185, array['Burnout', 'Stres', 'Corp']),
  ('mihai-popescu', 'Mihai Popescu', 'Mișcare Somatică', 'Practician TRE și mișcare conștientă', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 4.7, 210, array['Traumă', 'Mișcare', 'Energie']),
  ('elena-dumitrescu', 'Elena Dumitrescu', 'Voce și Expresie', 'Terapeut vocal și practician somatic', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', 4.9, 143, array['Voce', 'Emoții', 'Expresie']);

-- ============================================================
-- DONE
-- ============================================================
