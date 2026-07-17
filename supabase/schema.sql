create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.characters enable row level security;

grant select, insert, update, delete on table public.characters to authenticated;

drop policy if exists "Users can read own characters" on public.characters;
create policy "Users can read own characters"
on public.characters
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own characters" on public.characters;
create policy "Users can insert own characters"
on public.characters
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own characters" on public.characters;
create policy "Users can update own characters"
on public.characters
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own characters" on public.characters;
create policy "Users can delete own characters"
on public.characters
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
before update on public.characters
for each row
execute function public.set_updated_at();
