# Skillio · Social Activity Simulation

Generates a realistic, full-stack community for the Skillio app — users,
posts, likes, bookmarks, comments, follows, points, ranks, badges, and
reward redemptions — so the homepage feed, explore page, leaderboard, and
profile pages all feel alive on first load.

## Prerequisites

The seeder talks directly to your Supabase project using the **service role
key** because `profiles.id` is a foreign key to `auth.users.id`, so we have
to create real auth users via the admin API.

Add the following to your project root `.env`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> ⚠️ Never commit the service role key. Keep it in `.env` only.

You should also have already run:

- `database-gamification-setup.sql`
- `database-delete-policies.sql`

so badges, rewards, and cascades are in place.

## Run

```bash
npm install                     # installs @supabase/supabase-js
npm run seed                    # build the community
npm run seed:reset              # remove every seeded user (cascade-cleans data)
```

### Optional knobs

```bash
SEED_USERS=150 SEED_POSTS=600 SEED_COMMENTS=3000 npm run seed
SEED_RNG=42 npm run seed         # deterministic regeneration with a different community
```

## What you get

- **150 users** with diverse professions, bios, and DiceBear avatars. Mix of
  top creators, active members, casual users, and a few lurkers.
- **~600 posts** spread across all 19 Skillio categories, with category-aware
  titles, paragraph bodies, Unsplash thumbnails, and trending scores.
- **Realistic engagement**: log-normal-distributed likes (0–3000), bookmarks
  (0–1000), comments, and views (50–50,000). Educational categories skew
  bookmark-heavy. Recent posts get a recency boost; ~6% of posts go viral.
- **~3000 comments** plus reply chains so post detail pages look like real
  discussions.
- **Follow graph** weighted toward popular creators — the leaderboard feels
  competitive and creator profiles look influential.
- **Gamification** mirrors `src/services/gamification.js` exactly:
  - Post created +20, like received +2, comment received +5, bookmark +3
  - Trending bonus +50 (once per trending post)
  - Daily-login streaks for active users
  - Badges granted by milestone (`first_post`, `viral_post`,
    `top_contributor`, `expert_rank`, `skillio_plus`, etc.)
  - A handful of reward redemptions for users with enough points
  - `point_transactions` audit log written for every event
  - `profiles.points` and `profiles.current_rank` updated to match

## Login as a seeded user

Every seeded account uses the same password:

```
SkillioSeed!2026
```

Pick any email shown in the Supabase auth dashboard ending in
`@seed.skillio.dev`.

## Implementation notes

The seeder is split into focused modules:

```
scripts/seed/
├── index.js                  # orchestrator (npm run seed)
├── reset.js                  # safe cleanup (npm run seed:reset)
├── config.js                 # env loader, Supabase admin client, config knobs
├── helpers/
│   ├── batch.js              # chunked insert helper
│   ├── logger.js             # tiny CLI logger + progress bar
│   ├── random.js             # deterministic RNG, weighted picks, log-normal
│   └── time.js               # realistic timestamp distribution
├── data/
│   └── dictionaries.js       # names, bios, post titles, comment lines, thumbs
└── generators/
    ├── users.js              # auth users + profiles
    ├── posts.js              # 500–700 posts with realistic engagement counts
    ├── interactions.js       # likes, bookmarks, comments (+ replies), follows
    └── gamification.js       # points, ranks, badges, redemptions, audit log
```

All numeric ranges, weights, and probabilities are tunable from `config.js`.
The RNG is deterministic, so re-running with the same `SEED_RNG` produces an
identical community — handy for screenshots and demos.
