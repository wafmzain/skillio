// =============================================================================
// Skillio Seed · Orchestrator
//
// Run from project root:
//   npm run seed
//
// Requires the following in .env:
//   SUPABASE_URL=<project-url>
//   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
//
// Optional knobs (override config defaults):
//   SEED_USERS=150 SEED_POSTS=600 SEED_COMMENTS=3000
//
// To wipe seeded data first, run:
//   npm run seed:reset
// =============================================================================
import { CONFIG } from './config.js'
import { log } from './helpers/logger.js'
import { generateUsers } from './generators/users.js'
import { buildPostBlueprints, insertPosts } from './generators/posts.js'
import {
  generateLikes,
  generateBookmarks,
  generateComments,
  generateFollows,
} from './generators/interactions.js'
import { applyGamification } from './generators/gamification.js'

const startedAt = Date.now()

async function main() {
  log.line()
  log.step('Skillio · Social Activity Simulation')
  log.info(`Users: ${CONFIG.USER_COUNT} · Posts: ${CONFIG.POST_COUNT} · Comments target: ${CONFIG.COMMENT_TARGET}`)
  log.info(`Seed email domain: @${CONFIG.SEED_EMAIL_DOMAIN}  ·  RNG seed: ${CONFIG.RNG_SEED}`)
  log.line()

  /* 1) Users + profiles ---------------------------------------------------- */
  const users = await generateUsers()

  /* 2) Posts --------------------------------------------------------------- */
  const blueprints = buildPostBlueprints(users)
  const posts = await insertPosts(blueprints)

  /* 3) Likes / Bookmarks / Comments / Follows ----------------------------- */
  await generateLikes(posts, users)
  await generateBookmarks(posts, users)
  await generateComments(posts, users)
  await generateFollows(users)

  /* 4) Gamification (points, ranks, badges, redemptions) ------------------ */
  const stats = await applyGamification(posts, users)

  /* 5) Done ---------------------------------------------------------------- */
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
  log.line()
  log.ok(`Skillio is alive — finished in ${seconds}s`)
  log.info(`Total points distributed: ${stats.pointsTotal.toLocaleString()}`)
  log.info(`Transactions: ${stats.transactions.toLocaleString()} · Badges: ${stats.badges.toLocaleString()}`)
  log.info(`Login any seeded account with password: ${CONFIG.SEED_PASSWORD}`)
  log.line()
}

main().catch((err) => {
  log.err(err.stack || err.message || String(err))
  process.exit(1)
})
