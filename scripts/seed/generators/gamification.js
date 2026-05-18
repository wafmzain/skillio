// =============================================================================
// Generator · Gamification (points, ranks, badges, redemptions)
// Aggregates points from each user's posts, writes the totals + rank to their
// profile, populates `point_transactions`, awards realistic badges, and
// records a few reward redemptions for top users.
// =============================================================================
import { admin, CONFIG, rankFromPoints, TRENDING_THRESHOLD } from '../config.js'
import { batchInsert } from '../helpers/batch.js'
import { log, progress } from '../helpers/logger.js'
import { rand, randInt, chance, pick, pickMany } from '../helpers/random.js'
import { isoAfter, isoDaysAgo } from '../helpers/time.js'

/*
 * Mirrors POINT_VALUES in src/services/gamification.js.
 *  POST_CREATED: 20 · LIKE_RECEIVED: 2 · COMMENT_RECEIVED: 5 · BOOKMARK_RECEIVED: 3
 *  TRENDING_BONUS: 50 · DAILY_LOGIN: 3
 */
const POINTS = {
  POST_CREATED: 20,
  LIKE_RECEIVED: 2,
  COMMENT_RECEIVED: 5,
  BOOKMARK_RECEIVED: 3,
  DAILY_LOGIN: 3,
  TRENDING_BONUS: 50,
}

/* -------------------------------------------------------------------------- */
/*  Aggregate                                                                   */
/* -------------------------------------------------------------------------- */
function tallyPointsByUser(posts, users) {
  const byUser = new Map()
  for (const u of users) {
    byUser.set(u.id, {
      user: u,
      points: 0,
      transactions: [],
      postsCreated: 0,
      viralPosts: 0,
      trending: 0,
    })
  }

  for (const post of posts) {
    const entry = byUser.get(post.author.id)
    if (!entry) continue

    // Post created
    entry.points += POINTS.POST_CREATED
    entry.postsCreated += 1
    entry.transactions.push({
      user_id: post.author.id,
      amount: POINTS.POST_CREATED,
      reason: 'post_created',
      reference_id: post.id,
      created_at: post.created_at,
    })

    // Likes received
    if (post.counts.likes > 0) {
      entry.points += post.counts.likes * POINTS.LIKE_RECEIVED
      entry.transactions.push({
        user_id: post.author.id,
        amount: post.counts.likes * POINTS.LIKE_RECEIVED,
        reason: 'like_received',
        reference_id: post.id,
        created_at: isoAfter(post.created_at, 30),
      })
    }
    // Comments received
    if (post.counts.comments > 0) {
      entry.points += post.counts.comments * POINTS.COMMENT_RECEIVED
      entry.transactions.push({
        user_id: post.author.id,
        amount: post.counts.comments * POINTS.COMMENT_RECEIVED,
        reason: 'comment_received',
        reference_id: post.id,
        created_at: isoAfter(post.created_at, 30),
      })
    }
    // Bookmarks received
    if (post.counts.bookmarks > 0) {
      entry.points += post.counts.bookmarks * POINTS.BOOKMARK_RECEIVED
      entry.transactions.push({
        user_id: post.author.id,
        amount: post.counts.bookmarks * POINTS.BOOKMARK_RECEIVED,
        reason: 'bookmark_received',
        reference_id: post.id,
        created_at: isoAfter(post.created_at, 30),
      })
    }
    // Trending bonus (one-shot per trending post)
    if (post.counts.trendingScore >= TRENDING_THRESHOLD) {
      entry.points += POINTS.TRENDING_BONUS
      entry.trending += 1
      entry.transactions.push({
        user_id: post.author.id,
        amount: POINTS.TRENDING_BONUS,
        reason: 'trending_bonus',
        reference_id: post.id,
        created_at: isoAfter(post.created_at, 14),
      })
    }
    // Viral marker
    if (post.counts.likes >= 100) entry.viralPosts += 1
  }

  // Daily login streak — sample 3-12 days for active users.
  for (const entry of byUser.values()) {
    const u = entry.user
    const streak =
      u.activityTier === 'top_creator'    ? randInt(8, 14) :
      u.activityTier === 'active_creator' ? randInt(5, 10) :
      u.activityTier === 'active_member'  ? randInt(2, 6)  :
      u.activityTier === 'casual'         ? randInt(0, 3)  : 0
    for (let i = 0; i < streak; i++) {
      entry.points += POINTS.DAILY_LOGIN
      entry.transactions.push({
        user_id: u.id,
        amount: POINTS.DAILY_LOGIN,
        reason: 'daily_login',
        reference_id: null,
        created_at: isoDaysAgo(i, 6),
      })
    }
  }

  return byUser
}

/* -------------------------------------------------------------------------- */
/*  Update profiles + insert transactions                                      */
/* -------------------------------------------------------------------------- */
export async function applyGamification(posts, users) {
  log.step('Gamification · points, ranks, badges, redemptions')
  const byUser = tallyPointsByUser(posts, users)

  /* ------------------------ profile points + rank ----------------------- */
  let updated = 0
  const userArr = Array.from(byUser.values())
  for (const entry of userArr) {
    const points = Math.max(0, entry.points)
    const rank = rankFromPoints(points)
    const { error } = await admin
      .from('profiles')
      .update({ points, current_rank: rank })
      .eq('id', entry.user.id)
    if (error) log.warn(`profile points update failed for ${entry.user.username}: ${error.message}`)
    updated += 1
    if (updated % 25 === 0 || updated === userArr.length) {
      progress(updated, userArr.length, 'profiles · points')
    }
  }

  /* --------------------- point_transactions inserts --------------------- */
  const allTx = userArr.flatMap((e) => e.transactions)
  const { inserted: txInserted, errors: txErrors } = await batchInsert(
    'point_transactions',
    allTx,
    CONFIG.BATCH_TX,
    { onProgress: (d, t) => progress(d, t, 'transactions') }
  )
  if (txErrors.length) log.warn(`${txErrors.length} tx batches had errors`)
  log.ok(`${txInserted.toLocaleString()} point transactions logged`)

  /* ----------------------------- badges --------------------------------- */
  const badgeRows = []
  for (const entry of userArr) {
    const u = entry.user
    if (entry.postsCreated >= 1) badgeRows.push({ user_id: u.id, badge_id: 'first_post' })
    if (entry.viralPosts >= 1)   badgeRows.push({ user_id: u.id, badge_id: 'viral_post' })
    if (entry.points >= 100)     badgeRows.push({ user_id: u.id, badge_id: 'rising_member' })
    if (entry.points >= 500)     badgeRows.push({ user_id: u.id, badge_id: 'top_contributor' })
    if (entry.points >= 2000)    badgeRows.push({ user_id: u.id, badge_id: 'expert_rank' })
    if (u.isPremium)             badgeRows.push({ user_id: u.id, badge_id: 'skillio_plus' })
    if (chance(0.18))            badgeRows.push({ user_id: u.id, badge_id: '7_days_active' })
    if (chance(0.10))            badgeRows.push({ user_id: u.id, badge_id: 'ai_explorer' })
  }

  // Deduplicate (user_id, badge_id) before insert.
  const seen = new Set()
  const uniqueBadgeRows = badgeRows.filter((r) => {
    const k = `${r.user_id}|${r.badge_id}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  // user_badges has a unique constraint — use insert with ignoreDuplicates.
  let badgesInserted = 0
  for (let i = 0; i < uniqueBadgeRows.length; i += CONFIG.BATCH_INTERACTIONS) {
    const chunk = uniqueBadgeRows.slice(i, i + CONFIG.BATCH_INTERACTIONS)
    const { error, count } = await admin
      .from('user_badges')
      .upsert(chunk, { onConflict: 'user_id,badge_id', ignoreDuplicates: true, count: 'exact' })
    if (error) log.warn(`badge chunk ${i}: ${error.message}`)
    else badgesInserted += count ?? chunk.length
    progress(Math.min(i + CONFIG.BATCH_INTERACTIONS, uniqueBadgeRows.length), uniqueBadgeRows.length, 'badges')
  }
  log.ok(`${badgesInserted.toLocaleString()} badges granted`)

  /* -------------------------- reward redemptions ------------------------ */
  const { data: rewards, error: rewardsErr } = await admin
    .from('rewards')
    .select('id, title, cost_points')
    .eq('is_active', true)
  if (rewardsErr) {
    log.warn(`rewards lookup failed: ${rewardsErr.message}`)
  } else if (rewards?.length) {
    const redemptions = []
    const txForRedemption = []
    for (const entry of userArr) {
      if (entry.points < 200) continue
      const tries = entry.points >= 2000 ? randInt(1, 3) : chance(0.4) ? 1 : 0
      for (let i = 0; i < tries; i++) {
        const reward = pick(rewards.filter((r) => r.cost_points <= entry.points))
        if (!reward) break
        const when = isoAfter(entry.user.createdAt, 90)
        redemptions.push({
          user_id: entry.user.id,
          reward_id: reward.id,
          points_spent: reward.cost_points,
          status: 'completed',
          created_at: when,
        })
        txForRedemption.push({
          user_id: entry.user.id,
          amount: -reward.cost_points,
          reason: 'reward_redeem',
          reference_id: reward.id,
          created_at: when,
        })
        entry.points -= reward.cost_points
      }
    }

    if (redemptions.length) {
      const { inserted: r1 } = await batchInsert('reward_redemptions', redemptions, CONFIG.BATCH_INTERACTIONS, {
        onProgress: (d, t) => progress(d, t, 'redemptions'),
      })
      const { inserted: r2 } = await batchInsert('point_transactions', txForRedemption, CONFIG.BATCH_TX, {
        onProgress: (d, t) => progress(d, t, 'redeem-tx'),
      })
      log.ok(`${r1.toLocaleString()} redemptions · ${r2.toLocaleString()} extra tx logs`)

      // Re-sync remaining points after redemption-driven decrement.
      let resync = 0
      for (const entry of userArr) {
        const finalPoints = Math.max(0, entry.points)
        const finalRank = rankFromPoints(finalPoints)
        await admin
          .from('profiles')
          .update({ points: finalPoints, current_rank: finalRank })
          .eq('id', entry.user.id)
        resync += 1
        if (resync % 25 === 0 || resync === userArr.length) {
          progress(resync, userArr.length, 'profiles · resync')
        }
      }
    } else {
      log.info('no eligible redemptions sampled')
    }
  }

  return {
    pointsTotal: userArr.reduce((s, e) => s + Math.max(0, e.points), 0),
    transactions: txInserted,
    badges: badgesInserted,
  }
}
