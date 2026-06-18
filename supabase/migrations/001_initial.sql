-- supabase/migrations/001_initial.sql

create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null,
  color_bg text not null,
  created_at timestamptz default now() not null
);

create table meetings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  date date not null,
  type text not null default '',
  notes text not null default '',
  actions text[] not null default '{}',
  created_at timestamptz default now() not null
);

create index meetings_client_id_idx on meetings(client_id);
create index meetings_date_idx on meetings(date desc);
