-- =============================================================================
-- Skillio · Gamification & Reward System — Schema
-- Run once in Supabase SQL Editor.
-- =============================================================================

-- 1) Add points + rank columns to profiles (safe if already exists)
alter table public.profiles add column if not exists points int not null default 0;
alter table public.profiles add column if not exists current_rank text not null default 'Beginner';
alter table public.profiles add column if not exists last_daily_claim timestamptz;

-- 2) Point transactions — audit log of all point changes
create table if not exists public.point_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      int not null,
  reason      text not null,           -- 'post_created' | 'like_received' | 'comment_received' | 'daily_login' | 'trending_bonus' | 'reward_redeem'
  reference_id text,                   -- optional: post_id, comment_id, reward_id
  created_at  timestamptz not null default now()
);

create index if not exists idx_point_tx_user    on public.point_transactions (user_id);
create index if not exists idx_point_tx_created on public.point_transactions (created_at desc);

-- 3) Badges catalog (platform-defined)
create table if not exists public.badges (
  id          text primary key,        -- e.g. 'first_post', 'viral_post'
  name        text not null,
  description text not null default '',
  icon        text not null default 'sparkles',
  category    text not null default 'achievement',
  created_at  timestamptz not null default now()
);

-- 4) User badges (many-to-many)
create table if not exists public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  badge_id    text not null references public.badges(id) on delete cascade,
  earned_at   timestamptz not null default now(),
  unique(user_id, badge_id)
);

create index if not exists idx_user_badges_user on public.user_badges (user_id);

-- 5) Rewards catalog (what users can redeem)
create table if not exists public.rewards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text not null default 'gift',
  cost_points int not null,
  category    text not null default 'feature',  -- 'feature' | 'badge' | 'boost'
  is_active   boolean not null default true,
  stock       int,                               -- null = unlimited
  created_at  timestamptz not null default now()
);

create index if not exists idx_rewards_active on public.rewards (is_active, cost_points);

-- 6) Reward redemptions
create table if not exists public.reward_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reward_id   uuid not null references public.rewards(id) on delete cascade,
  points_spent int not null,
  status      text not null default 'completed', -- 'completed' | 'pending' | 'failed'
  created_at  timestamptz not null default now()
);

create index if not exists idx_redemptions_user on public.reward_redemptions (user_id);

-- 7) RPC: Add points to user (atomic)
create or replace function public.add_user_points(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_reference_id text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total int;
  new_rank text;
begin
  -- Update points
  update profiles
     set points = points + p_amount
   where id = p_user_id
   returning points into new_total;

  -- Determine rank
  new_rank := case
    when new_total >= 10000 then 'Legend'
    when new_total >= 5000  then 'Master'
    when new_total >= 2000  then 'Expert'
    when new_total >= 500   then 'Contributor'
    else 'Beginner'
  end;

  -- Update rank if changed
  update profiles set current_rank = new_rank where id = p_user_id and current_rank != new_rank;

  -- Log transaction
  insert into point_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, p_amount, p_reason, p_reference_id);

  return new_total;
end;
$$;

-- 8) RPC: Redeem reward (atomic deduction + log)
create or replace function public.redeem_reward(
  p_user_id uuid,
  p_reward_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost int;
  v_user_points int;
  v_stock int;
  v_title text;
  new_total int;
begin
  -- Get reward info
  select cost_points, stock, title into v_cost, v_stock, v_title
    from rewards where id = p_reward_id and is_active = true;

  if v_cost is null then
    return json_build_object('success', false, 'error', 'Reward tidak ditemukan');
  end if;

  -- Check stock
  if v_stock is not null and v_stock <= 0 then
    return json_build_object('success', false, 'error', 'Reward sudah habis');
  end if;

  -- Check user points
  select points into v_user_points from profiles where id = p_user_id;
  if v_user_points < v_cost then
    return json_build_object('success', false, 'error', 'Poin tidak cukup');
  end if;

  -- Deduct points
  update profiles set points = points - v_cost where id = p_user_id returning points into new_total;

  -- Update rank
  update profiles set current_rank = case
    when new_total >= 10000 then 'Legend'
    when new_total >= 5000  then 'Master'
    when new_total >= 2000  then 'Expert'
    when new_total >= 500   then 'Contributor'
    else 'Beginner'
  end where id = p_user_id;

  -- Decrease stock if limited
  if v_stock is not null then
    update rewards set stock = stock - 1 where id = p_reward_id;
  end if;

  -- Log transaction
  insert into point_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, -v_cost, 'reward_redeem', p_reward_id::text);

  -- Log redemption
  insert into reward_redemptions (user_id, reward_id, points_spent)
  values (p_user_id, p_reward_id, v_cost);

  return json_build_object('success', true, 'new_points', new_total, 'reward_title', v_title);
end;
$$;

-- 9) RPC: Daily login claim
create or replace function public.claim_daily_login(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  new_total int;
begin
  select last_daily_claim into v_last from profiles where id = p_user_id;

  -- Check if already claimed today
  if v_last is not null and v_last::date = now()::date then
    return json_build_object('success', false, 'error', 'Sudah klaim hari ini');
  end if;

  -- Grant points
  update profiles
     set points = points + 3,
         last_daily_claim = now()
   where id = p_user_id
   returning points into new_total;

  -- Update rank
  update profiles set current_rank = case
    when new_total >= 10000 then 'Legend'
    when new_total >= 5000  then 'Master'
    when new_total >= 2000  then 'Expert'
    when new_total >= 500   then 'Contributor'
    else 'Beginner'
  end where id = p_user_id;

  -- Log
  insert into point_transactions (user_id, amount, reason)
  values (p_user_id, 3, 'daily_login');

  return json_build_object('success', true, 'new_points', new_total, 'amount', 3);
end;
$$;

-- 10) RLS
alter table public.point_transactions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

-- Public read for badges & rewards
create policy "badges_public_read" on public.badges for select using (true);
create policy "rewards_public_read" on public.rewards for select using (is_active = true);

-- Users can read their own data
create policy "point_tx_own_read" on public.point_transactions for select using (auth.uid() = user_id);
create policy "user_badges_own_read" on public.user_badges for select using (auth.uid() = user_id);
create policy "redemptions_own_read" on public.reward_redemptions for select using (auth.uid() = user_id);

-- Allow public read of user_badges for profile display
create policy "user_badges_public_read" on public.user_badges for select using (true);

-- 11) Seed badges
insert into public.badges (id, name, description, icon, category) values
  ('first_post',       'First Post',       'Membagikan insight pertama',           'pen',      'milestone'),
  ('top_contributor',  'Top Contributor',  'Masuk top 10 leaderboard',             'trophy',   'achievement'),
  ('7_days_active',    '7 Days Active',    'Login 7 hari berturut-turut',          'flame',    'streak'),
  ('viral_post',       'Viral Post',       'Insight mendapat 100+ likes',          'trending', 'achievement'),
  ('ai_explorer',      'AI Explorer',      'Menggunakan AI Summary 10 kali',       'sparkles', 'feature'),
  ('skillio_plus',     'Skillio+',         'Member Skillio+ aktif',                'sparkles', 'membership'),
  ('rising_member',    'Rising Member',    'Mencapai 100 points',                  'rocket',   'milestone'),
  ('expert_rank',      'Expert Rank',      'Mencapai rank Expert',                 'star',     'milestone')
on conflict (id) do nothing;

-- 12) Seed rewards
insert into public.rewards (title, description, icon, cost_points, category) values
  ('Skillio+ 7 Hari',          'Akses premium selama 7 hari',                    'sparkles', 500,  'feature'),
  ('AI Summary Extra (5x)',    'Tambahan 5 kali penggunaan AI Summary',          'brain',    200,  'feature'),
  ('Custom Profile Badge',     'Badge khusus yang tampil di profil kamu',        'badge',    1000, 'badge'),
  ('Post Boost',               'Insight kamu diprioritaskan di feed selama 24j', 'trending', 300,  'boost')
on conflict do nothing;
