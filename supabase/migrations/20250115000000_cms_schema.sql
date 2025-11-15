-- Pages
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sections (page composition)
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null,
  order_index int not null default 0,
  visible boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.sections(page_id, order_index);

-- Blocks (fine-grained units inside a section)
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  type text not null,
  order_index int not null default 0,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.blocks(section_id, order_index);

-- Per-language block content
create table if not exists public.block_translations (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks(id) on delete cascade,
  lang text not null,
  content jsonb not null default '{}'::jsonb,
  unique(block_id, lang)
);

-- Media assets
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.blocks enable row level security;
alter table public.block_translations enable row level security;
alter table public.media_assets enable row level security;

-- Read all published pages/sections/blocks
create policy "pages_read_published" on public.pages
  for select using (status = 'published');

create policy "sections_read" on public.sections
  for select using (true);

create policy "blocks_read" on public.blocks
  for select using (true);

create policy "block_translations_read" on public.block_translations
  for select using (true);

create policy "media_read" on public.media_assets
  for select using (true);

-- Write: only admins
create policy "pages_write_admin" on public.pages
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "sections_write_admin" on public.sections
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "blocks_write_admin" on public.blocks
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "block_translations_write_admin" on public.block_translations
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "media_write_admin" on public.media_assets
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
