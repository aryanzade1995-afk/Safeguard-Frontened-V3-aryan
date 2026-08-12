-- Safeguard: profiles table + RLS + auto-provisioning trigger.
-- Run this once in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created — fires for
-- both email/password sign-up and Google OAuth sign-in. Google populates
-- raw_user_meta_data with `full_name`/`name` and `avatar_url`/`picture`;
-- our own email/password sign-up passes `full_name` explicitly at sign-up.
--
-- The insert is wrapped in its own exception handler: this trigger runs
-- inside the SAME transaction as the `auth.users` insert, so any error it
-- raises aborts account creation entirely — surfaced to the client as the
-- generic "Database error saving new user" with no further detail. Catching
-- and logging instead of propagating means a profile-row hiccup can never
-- block someone from actually getting an account (new email/password sign-up
-- AND first-time Google sign-in both go through this exact path).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
      coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user: failed to create profile for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current on every profile edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ==================================================
-- Assessments: one row per completed questionnaire +
-- backend risk analysis, scoped to the owning user.
-- ==================================================

create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_id_created_at_idx
  on public.assessments (user_id, created_at desc);

alter table public.assessments enable row level security;

drop policy if exists "Users can view own assessments" on public.assessments;
create policy "Users can view own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own assessments" on public.assessments;
create policy "Users can insert own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own assessments" on public.assessments;
create policy "Users can delete own assessments"
  on public.assessments for delete
  using (auth.uid() = user_id);
