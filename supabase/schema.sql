-- Supabase schema for madplanlægger
-- Kør denne SQL i Supabase → SQL Editor → New query

create extension if not exists "pgcrypto";

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  category text not null check (category in ('morgenmad','snack','frokost','aftensmad')),
  description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists meals_user_idx on meals(user_id);
create index if not exists meals_category_idx on meals(category);
create index if not exists meals_tags_idx on meals using gin(tags);

create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  year int not null,
  week int not null check (week between 1 and 53),
  day_of_week int not null check (day_of_week between 1 and 7),
  slot text not null check (slot in ('morgenmad','snack_1','frokost','snack_2','snack_3','aftensmad','snack_4')),
  meal_id uuid references meals on delete set null,
  unique (user_id, year, week, day_of_week, slot)
);

create index if not exists meal_plans_week_idx on meal_plans(user_id, year, week);

alter table meals enable row level security;
alter table meal_plans enable row level security;

-- SELECT + INSERT: kun egne måltider
drop policy if exists "meals_owner" on meals;
drop policy if exists "meals_select" on meals;
drop policy if exists "meals_insert" on meals;
drop policy if exists "meals_update" on meals;
drop policy if exists "meals_delete" on meals;

create policy "meals_select" on meals for select
  using (auth.uid() = user_id);

create policy "meals_insert" on meals for insert
  with check (auth.uid() = user_id);

-- UPDATE + DELETE: egne måltider ELLER admin-rolle
create policy "meals_update" on meals for update
  using (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
  with check (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

create policy "meals_delete" on meals for delete
  using (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

drop policy if exists "plans_owner" on meal_plans;
create policy "plans_owner" on meal_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
