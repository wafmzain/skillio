-- =============================================================================
-- Skillio · Affiliate Recommendation System — Schema
-- Run once in Supabase SQL Editor.
-- =============================================================================

-- 1) Affiliate products owned by the platform
create table if not exists public.affiliate_products (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  description     text        not null default '',
  image_url       text,
  category        text        not null default 'General',
  affiliate_link  text        not null,
  button_text     text        not null default 'Pelajari lebih',
  click_count     int         not null default 0,
  is_active       boolean     not null default true,
  is_featured     boolean     not null default false,
  display_order   int         not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_affiliate_products_active   on public.affiliate_products (is_active);
create index if not exists idx_affiliate_products_category on public.affiliate_products (category);
create index if not exists idx_affiliate_products_clicks   on public.affiliate_products (click_count desc);
create index if not exists idx_affiliate_products_featured on public.affiliate_products (is_featured, display_order);

-- 2) Click tracking — atomic increment via RPC
create or replace function public.increment_affiliate_click(product_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.affiliate_products
     set click_count = click_count + 1,
         updated_at  = now()
   where id = product_uuid;
end;
$$;

-- 3) Optional click log for analytics (privacy-friendly, no PII)
create table if not exists public.affiliate_clicks (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.affiliate_products(id) on delete cascade,
  source      text,                 -- 'sidebar' | 'post-bottom' | 'tools-page' | etc.
  context_id  text,                 -- e.g. post id when clicked from a post
  user_id     uuid,                 -- optional, may be null for guests
  created_at  timestamptz not null default now()
);

create index if not exists idx_affiliate_clicks_product on public.affiliate_clicks (product_id);
create index if not exists idx_affiliate_clicks_created on public.affiliate_clicks (created_at desc);

-- 4) RPC: top clicked affiliates
create or replace function public.get_top_affiliates(limit_count int default 5)
returns setof public.affiliate_products
language sql
stable
as $$
  select *
    from public.affiliate_products
   where is_active = true
   order by click_count desc, created_at desc
   limit limit_count;
$$;

-- 5) Row-Level Security
alter table public.affiliate_products enable row level security;
alter table public.affiliate_clicks   enable row level security;

-- Public read for active products
drop policy if exists "affiliate_products_public_read" on public.affiliate_products;
create policy "affiliate_products_public_read"
  on public.affiliate_products
  for select
  using (is_active = true);

-- Click logs: anyone (incl. anon) can insert; only auth admins can read
drop policy if exists "affiliate_clicks_insert_any" on public.affiliate_clicks;
create policy "affiliate_clicks_insert_any"
  on public.affiliate_clicks
  for insert
  with check (true);

-- Replace this with your admin role / claim check in production
drop policy if exists "affiliate_clicks_admin_read" on public.affiliate_clicks;
create policy "affiliate_clicks_admin_read"
  on public.affiliate_clicks
  for select
  using (auth.role() = 'service_role');

-- 6) Sample seeds (safe to remove in production)
insert into public.affiliate_products
  (title, description, image_url, category, affiliate_link, button_text, is_featured, display_order)
values
  ('Notion AI', 'Tools produktivitas dengan AI assist untuk catatan, dokumen, dan database personal.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600', 'Productivity', 'https://example.com/aff/notion', 'Coba Gratis', true, 1),
  ('Figma Pro', 'Desain UI kolaboratif yang dipakai jutaan tim produk di seluruh dunia.', 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600', 'Design', 'https://example.com/aff/figma', 'Mulai Pakai', false, 2),
  ('Linear', 'Issue tracker modern untuk tim teknologi yang ingin bergerak cepat.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 'Productivity', 'https://example.com/aff/linear', 'Coba Linear', false, 3),
  ('Raycast', 'Launcher cepat untuk macOS dengan AI, snippets, dan ratusan ekstensi.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 'Productivity', 'https://example.com/aff/raycast', 'Download', false, 4)
on conflict do nothing;
