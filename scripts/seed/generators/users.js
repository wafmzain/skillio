// =============================================================================
// Generator · Users
// Creates real auth users (admin API) + matching profile rows.
// Each user has an "activity profile" so later generators know how prolific
// or popular they should be.
// =============================================================================
import { admin, CONFIG, rankFromPoints } from '../config.js'
import { batchInsert } from '../helpers/batch.js'
import { log, progress } from '../helpers/logger.js'
import { rand, randInt, pick, pickWeighted, slugify, chance } from '../helpers/random.js'
import { isoDaysAgo, sampleDaysAgo } from '../helpers/time.js'
import {
  FIRST_NAMES,
  LAST_NAMES,
  PROFESSIONS,
  BIO_TEMPLATES,
  avatarUrlForUsername,
} from '../data/dictionaries.js'

/* -------------------------------------------------------------------------- */
/*  Activity profile — drives popularity & prolificacy                        */
/* -------------------------------------------------------------------------- */
function sampleActivityProfile() {
  return pickWeighted([
    { value: { tier: 'top_creator',     popularity: () => 0.85 + rand() * 0.15, prolific: () => randInt(10, 22) }, weight: 6 },
    { value: { tier: 'active_creator',  popularity: () => 0.55 + rand() * 0.30, prolific: () => randInt(6, 11)  }, weight: 18 },
    { value: { tier: 'active_member',   popularity: () => 0.30 + rand() * 0.30, prolific: () => randInt(2, 6)   }, weight: 32 },
    { value: { tier: 'casual',          popularity: () => 0.10 + rand() * 0.25, prolific: () => randInt(0, 2)   }, weight: 32 },
    { value: { tier: 'lurker',          popularity: () => 0.05 + rand() * 0.10, prolific: () => 0               }, weight: 12 },
  ])
}

/* -------------------------------------------------------------------------- */
/*  Username uniqueness                                                        */
/* -------------------------------------------------------------------------- */
function buildUsername(first, last, taken) {
  const styles = [
    () => slugify(`${first}${last}`),
    () => slugify(`${first}.${last}`),
    () => slugify(`${first}_${last}`),
    () => slugify(`${first}${randInt(10, 99)}`),
    () => slugify(`${first}${last}${randInt(2, 9)}`),
  ]
  for (let i = 0; i < 8; i++) {
    const candidate = styles[i % styles.length]()
      .replace(/[^a-z0-9._]/g, '')
      .slice(0, 20)
    if (candidate && !taken.has(candidate)) return candidate
  }
  // last resort
  let i = 1
  while (taken.has(`${slugify(first)}${i}`)) i++
  return `${slugify(first)}${i}`
}

function buildBio(profession) {
  const tpl = pick(BIO_TEMPLATES)
  const [t1, t2] = (profession.topics || []).slice(0, 2)
  return tpl
    .replaceAll('{role}', profession.role)
    .replaceAll('{topic1}', t1 || 'belajar')
    .replaceAll('{topic2}', t2 || 'produktivitas')
}

/* -------------------------------------------------------------------------- */
/*  Step 1 · create auth users                                                 */
/* -------------------------------------------------------------------------- */
async function createAuthUser({ email }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: CONFIG.SEED_PASSWORD,
    email_confirm: true,
  })
  if (error) {
    // If the user already exists (e.g. re-running the seed), look them up.
    if (
      error.message?.toLowerCase().includes('already') ||
      error.code === 'email_exists' ||
      error.status === 422
    ) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1, email })
      const existing = list?.users?.find((u) => u.email === email)
      if (existing) return existing
    }
    throw new Error(`auth.admin.createUser failed for ${email}: ${error.message}`)
  }
  return data.user
}

/* -------------------------------------------------------------------------- */
/*  Public                                                                     */
/* -------------------------------------------------------------------------- */
export async function generateUsers() {
  log.step(`Users · creating ${CONFIG.USER_COUNT} community members`)

  const taken = new Set()
  const blueprints = []
  for (let i = 0; i < CONFIG.USER_COUNT; i++) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const username = buildUsername(first, last, taken)
    taken.add(username)
    const profession = pick(PROFESSIONS)
    const activity = sampleActivityProfile()
    const popularity = activity.popularity()
    const prolific = activity.prolific()
    const isPremium = chance(activity.tier === 'top_creator' ? 0.55 : 0.10)
    const joinedDaysAgo =
      activity.tier === 'top_creator'
        ? randInt(60, CONFIG.ACTIVITY_HORIZON_DAYS)
        : Math.max(1, sampleDaysAgo())
    const createdAt = isoDaysAgo(joinedDaysAgo, 23)
    const email = `${username}.${randInt(100, 999)}@${CONFIG.SEED_EMAIL_DOMAIN}`

    blueprints.push({
      first,
      last,
      username,
      email,
      profession,
      activityTier: activity.tier,
      popularity,
      prolific,
      isPremium,
      createdAt,
    })
  }

  /* ---------------------- create auth users (sequential) ---------------- */
  const users = []
  let done = 0
  for (const bp of blueprints) {
    const user = await createAuthUser({ email: bp.email })
    users.push({ ...bp, authId: user.id })
    done += 1
    progress(done, blueprints.length, `auth · ${bp.username}`)
  }

  /* ----------------------- upsert profile rows --------------------------- */
  const profileRows = users.map((u) => {
    const fullName = `${u.first} ${u.last}`
    return {
      id: u.authId,
      username: u.username,
      name: fullName,
      email: u.email,
      avatar_url: avatarUrlForUsername(u.username),
      bio: buildBio(u.profession),
      website: chance(0.18) ? `https://${u.username}.skillio.dev` : null,
      is_premium: u.isPremium,
      points: 0, // accumulated later
      current_rank: rankFromPoints(0),
      last_daily_claim: chance(0.4) ? isoDaysAgo(randInt(0, 3), 12) : null,
      created_at: u.createdAt,
      updated_at: u.createdAt,
    }
  })

  // Use upsert so re-runs are idempotent (auth users already exist).
  let upserted = 0
  for (let i = 0; i < profileRows.length; i += CONFIG.BATCH_PROFILES) {
    const chunk = profileRows.slice(i, i + CONFIG.BATCH_PROFILES)
    const { error } = await admin
      .from('profiles')
      .upsert(chunk, { onConflict: 'id' })
    if (error) {
      // some schemas don't have website/updated_at — retry without those.
      const cleaned = chunk.map(({ website, updated_at, ...rest }) => rest)
      const { error: retryError } = await admin
        .from('profiles')
        .upsert(cleaned, { onConflict: 'id' })
      if (retryError) throw new Error(`profiles upsert failed: ${retryError.message}`)
    }
    upserted += chunk.length
    progress(upserted, profileRows.length, 'profiles')
  }

  log.ok(`${users.length} users + profiles ready`)

  // Tag the metadata used by downstream generators.
  return users.map((u) => ({
    id: u.authId,
    username: u.username,
    name: `${u.first} ${u.last}`,
    email: u.email,
    isPremium: u.isPremium,
    activityTier: u.activityTier,
    popularity: u.popularity,
    prolific: u.prolific,
    createdAt: u.createdAt,
    profession: u.profession,
  }))
}
