-- Back-office accounts. Run this in the Supabase SQL editor.
-- Do not grant anon or authenticated any insert, update, or delete.
-- Role changes are made with the server secret, which bypasses row level security.

create table public.profiles (
  -- Same id as the Supabase Auth user. Deleting the account removes the profile.
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  -- New accounts wait here until a super admin approves them.
  role text not null default 'pending' check (role in ('pending', 'admin', 'super_admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Public roles cannot write this table.';

comment on column public.profiles.role is
  'pending, admin, or super_admin. Defaults to pending.';

create index profiles_role_idx on public.profiles (role);

-- Runs as the function owner, so the insert is allowed even with no write policy.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'pending');
  return new;
end;
$$;

-- The trigger is the only caller. Hide the function from the public API.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- A signed-in user may read only their own row. This is not a write policy.
drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- No insert, update, or delete policy for anon or authenticated.
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

-- After the first signup, promote that one account in the SQL editor:
-- update public.profiles set role = 'super_admin' where email = 'you@example.com';
