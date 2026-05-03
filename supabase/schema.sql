-- People table
create table public.people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  maiden_name text,
  birth_date date,
  death_date date,
  birth_place text,
  death_place text,
  gender text check (gender in ('male', 'female', 'other')),
  bio text,
  photo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relationships table (parent-child and partner links)
create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  person_a_id uuid not null references public.people(id) on delete cascade,
  person_b_id uuid not null references public.people(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('parent_child', 'partner')),
  -- for parent_child: person_a is the parent, person_b is the child
  -- for partner: order doesn't matter
  created_at timestamptz default now()
);

-- Sources table (citations, documents, links)
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  title text not null,
  description text,
  url text,
  file_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.people enable row level security;
alter table public.relationships enable row level security;
alter table public.sources enable row level security;

-- RLS policies: anyone authenticated can read, anyone authenticated can write
create policy "Authenticated users can read people" on public.people
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert people" on public.people
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update people" on public.people
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can read relationships" on public.relationships
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert relationships" on public.relationships
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete relationships" on public.relationships
  for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can read sources" on public.sources
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert sources" on public.sources
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update sources" on public.sources
  for update using (auth.role() = 'authenticated');
