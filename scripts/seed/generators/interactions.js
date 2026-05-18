// =============================================================================
// Generator · Likes, Bookmarks, Comments, Follows
// Builds rows that match the `*_count` numbers we already wrote on each post,
// keeping the feed counts and the relational truth in sync.
// =============================================================================
import { admin, CONFIG } from '../config.js'
import { batchInsert } from '../helpers/batch.js'
import { log, progress } from '../helpers/logger.js'
import { rand, randInt, pick, chance } from '../helpers/random.js'
import { isoAfter } from '../helpers/time.js'
import {
  COMMENTS_SHORT,
  COMMENTS_MEDIUM,
  COMMENT_REPLIES,
} from '../data/dictionaries.js'

/* -------------------------------------------------------------------------- */
/*  Reactor pool                                                               */
/*  Pre-computes a weighted pool — popular users react more often.             */
/* -------------------------------------------------------------------------- */
function buildReactorPool(users) {
  const pool = []
  for (const u of users) {
    // Weight: lurkers still react sometimes, top creators react a lot.
    const weight =
      u.activityTier === 'top_creator'    ? 7 :
      u.activityTier === 'active_creator' ? 5 :
      u.activityTier === 'active_member'  ? 4 :
      u.activityTier === 'casual'         ? 2 : 1
    for (let i = 0; i < weight; i++) pool.push(u)
  }
  return pool
}

/* Sample N distinct reactor ids excluding the post author. */
function sampleReactors(pool, authorId, n) {
  if (n <= 0) return []
  const seen = new Set()
  const ids = []
  let safety = 0
  while (ids.length < n && safety < n * 6) {
    safety++
    const u = pool[(rand() * pool.length) | 0]
    if (u.id === authorId) continue
    if (seen.has(u.id)) continue
    seen.add(u.id)
    ids.push(u.id)
  }
  return ids
}

/* -------------------------------------------------------------------------- */
/*  Likes                                                                       */
/* -------------------------------------------------------------------------- */
export async function generateLikes(posts, users) {
  log.step('Likes · generating realistic reactions')
  const pool = buildReactorPool(users)
  const rows = []

  for (const post of posts) {
    const targetCount = Math.min(post.counts.likes, users.length - 1)
    const reactors = sampleReactors(pool, post.author.id, targetCount)
    for (const userId of reactors) {
      rows.push({
        user_id: userId,
        post_id: post.id,
        created_at: isoAfter(post.created_at, 30),
      })
    }
  }

  const { inserted, errors } = await batchInsert(
    'post_likes',
    rows,
    CONFIG.BATCH_INTERACTIONS,
    {
      onProgress: (d, t) => progress(d, t, 'likes'),
    }
  )
  if (errors.length) log.warn(`${errors.length} like batches had errors (continuing)`)
  log.ok(`${inserted.toLocaleString()} likes inserted`)
  return inserted
}

/* -------------------------------------------------------------------------- */
/*  Bookmarks                                                                   */
/* -------------------------------------------------------------------------- */
export async function generateBookmarks(posts, users) {
  log.step('Bookmarks · generating saves')
  const pool = buildReactorPool(users)
  const rows = []

  for (const post of posts) {
    const targetCount = Math.min(post.counts.bookmarks, users.length - 1)
    const reactors = sampleReactors(pool, post.author.id, targetCount)
    for (const userId of reactors) {
      rows.push({
        user_id: userId,
        post_id: post.id,
        created_at: isoAfter(post.created_at, 60),
      })
    }
  }

  const { inserted, errors } = await batchInsert(
    'post_bookmarks',
    rows,
    CONFIG.BATCH_INTERACTIONS,
    {
      onProgress: (d, t) => progress(d, t, 'bookmarks'),
    }
  )
  if (errors.length) log.warn(`${errors.length} bookmark batches had errors (continuing)`)
  log.ok(`${inserted.toLocaleString()} bookmarks inserted`)
  return inserted
}

/* -------------------------------------------------------------------------- */
/*  Comments + replies                                                          */
/* -------------------------------------------------------------------------- */
export async function generateComments(posts, users) {
  // We aim for COMMENT_TARGET total, distributed across posts in proportion
  // to each post's existing `comments_count` (already on the post row).
  // Plus a handful of reply chains for realism.
  log.step(`Comments · seeding discussion (~${CONFIG.COMMENT_TARGET})`)
  const pool = buildReactorPool(users)

  // Normalize the existing comments_count into a probability distribution.
  const totalReported = posts.reduce((s, p) => s + p.counts.comments, 0) || 1
  const scale = CONFIG.COMMENT_TARGET / totalReported

  const topLevel = []
  for (const post of posts) {
    const target = Math.min(
      Math.round(post.counts.comments * scale),
      40 // cap per post so distribution stays sane
    )
    if (target <= 0) continue
    const commenters = sampleReactors(pool, post.author.id, target)
    for (const userId of commenters) {
      const isShort = chance(0.65)
      topLevel.push({
        post_id: post.id,
        user_id: userId,
        content: isShort ? pick(COMMENTS_SHORT) : pick(COMMENTS_MEDIUM),
        parent_comment_id: null,
        created_at: isoAfter(post.created_at, 21),
      })
    }
  }

  // Insert top-level comments first so we can wire replies to real ids.
  log.info(`Top-level comments queued: ${topLevel.length.toLocaleString()}`)

  // Insert and capture ids per chunk so we can build replies.
  const insertedTop = []
  let done = 0
  for (let i = 0; i < topLevel.length; i += CONFIG.BATCH_COMMENTS) {
    const chunk = topLevel.slice(i, i + CONFIG.BATCH_COMMENTS)
    const { data, error } = await admin
      .from('comments')
      .insert(chunk)
      .select('id, post_id, user_id, created_at')
    if (error) {
      log.warn(`comments chunk ${i}: ${error.message}`)
      continue
    }
    insertedTop.push(...data)
    done += chunk.length
    progress(done, topLevel.length, 'comments')
  }

  // Build a small replies layer (~12% of top-level comments get a reply).
  const replyRows = []
  for (const c of insertedTop) {
    if (!chance(0.12)) continue
    const replyCount = chance(0.25) ? 2 : 1
    for (let i = 0; i < replyCount; i++) {
      const author = pool[(rand() * pool.length) | 0]
      if (author.id === c.user_id) continue
      replyRows.push({
        post_id: c.post_id,
        user_id: author.id,
        parent_comment_id: c.id,
        content: pick(COMMENT_REPLIES),
        created_at: isoAfter(c.created_at, 14),
      })
    }
  }

  if (replyRows.length) {
    const { inserted: insertedReplies, errors } = await batchInsert(
      'comments',
      replyRows,
      CONFIG.BATCH_COMMENTS,
      { onProgress: (d, t) => progress(d, t, 'replies') }
    )
    if (errors.length) log.warn(`${errors.length} reply batches had errors`)
    log.ok(`${insertedTop.length.toLocaleString()} comments + ${insertedReplies.toLocaleString()} replies`)
    return insertedTop.length + insertedReplies
  }

  log.ok(`${insertedTop.length.toLocaleString()} comments inserted`)
  return insertedTop.length
}

/* -------------------------------------------------------------------------- */
/*  Follows                                                                     */
/*  - top creators receive disproportionately more followers                    */
/*  - active members follow ~10-20 people                                       */
/*  - lurkers follow only a handful                                             */
/* -------------------------------------------------------------------------- */
export async function generateFollows(users) {
  log.step('Follows · weaving the social graph')

  // Build a "celebrity weight" — top creators are picked more often as a
  // follow target.
  const targetPool = []
  for (const u of users) {
    const weight =
      u.activityTier === 'top_creator'    ? 22 :
      u.activityTier === 'active_creator' ? 10 :
      u.activityTier === 'active_member'  ? 4 :
      u.activityTier === 'casual'         ? 2 : 1
    for (let i = 0; i < weight; i++) targetPool.push(u.id)
  }

  const rows = []
  for (const u of users) {
    const baseFollows =
      u.activityTier === 'top_creator'    ? CONFIG.FOLLOWS_PER_USER + randInt(8, 20) :
      u.activityTier === 'active_creator' ? CONFIG.FOLLOWS_PER_USER + randInt(2, 8)  :
      u.activityTier === 'active_member'  ? CONFIG.FOLLOWS_PER_USER                  :
      u.activityTier === 'casual'         ? Math.max(2, CONFIG.FOLLOWS_PER_USER - 6) :
      randInt(1, 3) // lurker
    const seen = new Set([u.id])
    let safety = 0
    while (seen.size - 1 < baseFollows && safety < baseFollows * 6) {
      safety++
      const targetId = targetPool[(rand() * targetPool.length) | 0]
      if (seen.has(targetId)) continue
      seen.add(targetId)
      rows.push({
        follower_id: u.id,
        following_id: targetId,
        created_at: isoAfter(u.createdAt, 90),
      })
    }
  }

  const { inserted, errors } = await batchInsert(
    'follows',
    rows,
    CONFIG.BATCH_INTERACTIONS,
    { onProgress: (d, t) => progress(d, t, 'follows') }
  )
  if (errors.length) log.warn(`${errors.length} follow batches had errors (continuing)`)
  log.ok(`${inserted.toLocaleString()} follow edges`)
  return inserted
}
