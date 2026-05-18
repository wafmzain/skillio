// =============================================================================
// Skillio Seed · Reset
//
// Deletes everything created by the seeder. Identification is by the seed
// email domain — only `@<SEED_EMAIL_DOMAIN>` users are touched.
//
// Run with:
//   npm run seed:reset
// =============================================================================
import { admin, CONFIG } from './config.js'
import { log } from './helpers/logger.js'

async function listAllSeededAuthUsers() {
  const all = []
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(`listUsers failed: ${error.message}`)
    const users = data?.users || []
    for (const u of users) {
      if ((u.email || '').endsWith(`@${CONFIG.SEED_EMAIL_DOMAIN}`)) all.push(u)
    }
    if (users.length < 1000) break
    page += 1
  }
  return all
}

async function main() {
  log.step(`Reset · removing all users with @${CONFIG.SEED_EMAIL_DOMAIN}`)
  const users = await listAllSeededAuthUsers()
  log.info(`Found ${users.length} seeded users`)

  // Deleting auth users cascades through profiles → posts → likes/bookmarks
  // → comments → follows → user_badges → redemptions → point_transactions
  // because profiles.id has ON DELETE CASCADE on its FK to auth.users.id.
  let removed = 0
  for (const u of users) {
    const { error } = await admin.auth.admin.deleteUser(u.id)
    if (error) {
      log.warn(`failed for ${u.email}: ${error.message}`)
      continue
    }
    removed += 1
    if (removed % 25 === 0) log.info(`deleted ${removed}/${users.length}`)
  }
  log.ok(`Removed ${removed}/${users.length} users (cascade cleared their data)`)
}

main().catch((err) => {
  log.err(err.stack || err.message || String(err))
  process.exit(1)
})
