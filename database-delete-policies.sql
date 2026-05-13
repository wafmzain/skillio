-- =============================================================================
-- Skillio · Delete Post & Comment — RLS Policies
-- Run once in Supabase SQL Editor.
-- =============================================================================

-- 1) Posts: owner can delete their own posts
drop policy if exists "posts_owner_delete" on public.posts;
create policy "posts_owner_delete"
  on public.posts
  for delete
  using (auth.uid() = user_id);

-- 2) Comments: owner can delete their own comments
drop policy if exists "comments_owner_delete" on public.comments;
create policy "comments_owner_delete"
  on public.comments
  for delete
  using (auth.uid() = user_id);

-- 3) Cascade cleanup: when a post is deleted, related data should cascade.
-- If your tables don't already have ON DELETE CASCADE, add them:

-- post_likes → cascade on post delete
alter table public.post_likes
  drop constraint if exists post_likes_post_id_fkey,
  add constraint post_likes_post_id_fkey
    foreign key (post_id) references public.posts(id) on delete cascade;

-- post_bookmarks → cascade on post delete
alter table public.post_bookmarks
  drop constraint if exists post_bookmarks_post_id_fkey,
  add constraint post_bookmarks_post_id_fkey
    foreign key (post_id) references public.posts(id) on delete cascade;

-- comments → cascade on post delete
alter table public.comments
  drop constraint if exists comments_post_id_fkey,
  add constraint comments_post_id_fkey
    foreign key (post_id) references public.posts(id) on delete cascade;

-- nested comments: if parent comment is deleted, replies cascade
-- (only if parent_comment_id FK exists)
alter table public.comments
  drop constraint if exists comments_parent_comment_id_fkey,
  add constraint comments_parent_comment_id_fkey
    foreign key (parent_comment_id) references public.comments(id) on delete cascade;
