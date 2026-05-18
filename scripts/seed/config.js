// =============================================================================
// Skillio Seed · Config
// Loads env, builds the admin Supabase client, and exposes seed knobs.
// =============================================================================
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

/* --------------------------------- env --------------------------------- */

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const ENV_PATH = resolve(ROOT, '.env')

function loadDotenv(path) {
  if (!existsSync(path)) return
  const txt = readFileSync(path, 'utf8')
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotenv(ENV_PATH)

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\n❌  Skillio seed: missing env vars.\n' +
      '    Add the following to your .env file at the project root:\n\n' +
      '      SUPABASE_URL=<your-project-url>\n' +
      '      SUPABASE_SERVICE_ROLE_KEY=<service-role-key>\n\n' +
      '    The service role key is required because we create real auth users\n' +
      '    via the admin API (profiles.id is FK to auth.users.id).\n'
  )
  process.exit(1)
}

/* --------------------------- supabase client --------------------------- */

export const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* ----------------------------- seed knobs ------------------------------ */

export const CONFIG = {
  // Identification — every seeded user has this email suffix so cleanup is one
  // query: delete from auth.users where email like '%@SEED_EMAIL_DOMAIN'.
  SEED_EMAIL_DOMAIN: 'seed.skillio.dev',
  SEED_PASSWORD: 'SkillioSeed!2026',

  // Volumes — tuned for performance demos (smaller seeds keep mobile feeds
  // snappy while still feeling alive). Override via env vars to scale up.
  USER_COUNT:        Number(process.env.SEED_USERS    || 100),
  POST_COUNT:        Number(process.env.SEED_POSTS    || 220),
  COMMENT_TARGET:    Number(process.env.SEED_COMMENTS || 1000),
  FOLLOWS_PER_USER:  Number(process.env.SEED_FOLLOWS  || 12),

  // Engagement caps (matched to the brief).
  MAX_LIKES_PER_POST:     3000,
  MAX_BOOKMARKS_PER_POST: 1000,
  MAX_VIEWS_PER_POST:     50000,

  // Time horizon — most activity in the last week, tail going back ~6 months.
  ACTIVITY_HORIZON_DAYS: 180,

  // Batch sizes for inserts.
  BATCH_PROFILES:     50,
  BATCH_POSTS:        100,
  BATCH_INTERACTIONS: 1000,
  BATCH_COMMENTS:     500,
  BATCH_TX:           1000,

  // RNG seed — change to regenerate a different community.
  RNG_SEED: Number(process.env.SEED_RNG || 20260518),
}

/* ----------------------- shared seed taxonomies ------------------------ */

export const CATEGORIES = [
  'Productivity',
  'Study Tips',
  'Lifestyle',
  'Career',
  'Technology',
  'AI Tools',
  'Design',
  'Entrepreneurship',
  'Fitness',
  'Writing',
  'Freelance',
  'Motivation',
  'Content Creation',
  'Personal Growth',
  'Finance',
  'Music',
  'Photography',
  'Gaming',
  'Remote Work',
]

// Categories that organically attract more bookmarks (educational / actionable).
export const BOOKMARK_HEAVY = new Set([
  'Productivity',
  'Study Tips',
  'AI Tools',
  'Career',
  'Writing',
  'Freelance',
  'Personal Growth',
  'Finance',
  'Remote Work',
])

// Trending threshold mirrors POINTS_CONFIG.TRENDING_THRESHOLD in the app.
export const TRENDING_THRESHOLD = 50

export const RANKS = [
  { key: 'Beginner',    min: 0    },
  { key: 'Contributor', min: 500  },
  { key: 'Expert',      min: 2000 },
  { key: 'Master',      min: 5000 },
  { key: 'Legend',      min: 10000 },
]

export function rankFromPoints(points) {
  let r = RANKS[0]
  for (const tier of RANKS) if (points >= tier.min) r = tier
  return r.key
}
