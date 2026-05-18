-- =============================================================================
-- Skillio · Feed performance indexes
-- Run once in Supabase SQL Editor.
-- These indexes back the paginated queries powered by `useInfiniteFeed`.
-- =============================================================================

-- Latest feed (Home / Explore default sort).
create index if not exists idx_posts_created_at_desc
  on public.posts (created_at desc);

-- Trending sort uses a NULLS LAST fallback to created_at, so we index both.
create index if not exists idx_posts_trending_score_desc
  on public.posts (trending_score desc nulls last, created_at desc);

-- Popular sort (likes_count desc, created_at desc).
create index if not exists idx_posts_likes_desc
  on public.posts (likes_count desc nulls last, created_at desc);

-- Profile feed (`/u/:username` and own profile) — fetches the author's
-- posts ordered by recency.
create index if not exists idx_posts_user_created
  on public.posts (user_id, created_at desc);

-- Category-filtered feed (chips on Home / Explore).
create index if not exists idx_posts_category_created
  on public.posts (category, created_at desc);

-- Case-insensitive search backing for `useInfiniteFeed`'s ILIKE search
-- across title + excerpt. pg_trgm makes %term% lookups fast.
create extension if not exists pg_trgm;

create index if not exists idx_posts_title_trgm
  on public.posts using gin (title gin_trgm_ops);

create index if not exists idx_posts_excerpt_trgm
  on public.posts using gin (excerpt gin_trgm_ops);

-- Engagement tables — keep per-post lookups fast for `count(*)` queries.
create index if not exists idx_post_likes_post     on public.post_likes (post_id);
create index if not exists idx_post_likes_user     on public.post_likes (user_id);

create index if not exists idx_post_bookmarks_post on public.post_bookmarks (post_id);
create index if not exists idx_post_bookmarks_user on public.post_bookmarks (user_id);

create index if not exists idx_comments_post       on public.comments (post_id, created_at desc);
create index if not exists idx_comments_user       on public.comments (user_id);

-- Follow graph lookups (followers / following counts on profile pages).
create index if not exists idx_follows_following   on public.follows (following_id);
create index if not exists idx_follows_follower    on public.follows (follower_id);

-- Leaderboard sort.
create index if not exists idx_profiles_points_desc
  on public.profiles (points desc nulls last);
