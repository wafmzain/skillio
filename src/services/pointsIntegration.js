import { addPoints, checkAndGrantBadges, POINT_VALUES } from './gamification'

/**
 * Points Integration Layer
 *
 * Fire-and-forget wrappers that grant points after successful user actions.
 * These never throw — they log errors silently so the main flow is never blocked.
 *
 * Duplicate prevention:
 * - Like/Bookmark: only grant on the INSERT path (not on unlike/unbookmark)
 * - Unlike does NOT deduct points (keeps system simple and non-punitive)
 * - Daily login: server-side guard (once per day)
 * - Post create: called once after successful insert
 */

/**
 * Grant points for creating a post.
 * Call AFTER the post is successfully inserted.
 */
export async function grantPostCreatedPoints(userId, postId) {
  if (!userId) return null
  try {
    const result = await addPoints({
      userId,
      amount: POINT_VALUES.POST_CREATED,
      reason: 'post_created',
      referenceId: postId,
    })
    if (result.success) {
      await checkAndGrantBadges(userId)
    }
    return result
  } catch (err) {
    console.error('[Points] grantPostCreatedPoints error:', err)
    return null
  }
}

/**
 * Grant points when a user's post receives a like.
 * Call AFTER the like is successfully inserted (not on unlike).
 * `postOwnerId` is the author of the post (who receives the points).
 */
export async function grantLikeReceivedPoints(postOwnerId, postId) {
  if (!postOwnerId) return null
  try {
    const result = await addPoints({
      userId: postOwnerId,
      amount: POINT_VALUES.LIKE_RECEIVED,
      reason: 'like_received',
      referenceId: postId,
    })
    if (result.success) {
      await checkAndGrantBadges(postOwnerId)
    }
    return result
  } catch (err) {
    console.error('[Points] grantLikeReceivedPoints error:', err)
    return null
  }
}

/**
 * Grant points when a user's post receives a comment.
 * `postOwnerId` is the author of the post.
 */
export async function grantCommentReceivedPoints(postOwnerId, postId) {
  if (!postOwnerId) return null
  try {
    const result = await addPoints({
      userId: postOwnerId,
      amount: POINT_VALUES.COMMENT_RECEIVED,
      reason: 'comment_received',
      referenceId: postId,
    })
    if (result.success) {
      await checkAndGrantBadges(postOwnerId)
    }
    return result
  } catch (err) {
    console.error('[Points] grantCommentReceivedPoints error:', err)
    return null
  }
}

/**
 * Grant points when a user's post receives a bookmark.
 * `postOwnerId` is the author of the post.
 */
export async function grantBookmarkReceivedPoints(postOwnerId, postId) {
  if (!postOwnerId) return null
  try {
    const result = await addPoints({
      userId: postOwnerId,
      amount: POINT_VALUES.BOOKMARK_RECEIVED,
      reason: 'bookmark_received',
      referenceId: postId,
    })
    return result
  } catch (err) {
    console.error('[Points] grantBookmarkReceivedPoints error:', err)
    return null
  }
}

/**
 * Grant trending bonus. Call when a post crosses the trending threshold.
 */
export async function grantTrendingBonus(postOwnerId, postId) {
  if (!postOwnerId) return null
  try {
    const result = await addPoints({
      userId: postOwnerId,
      amount: POINT_VALUES.TRENDING_BONUS,
      reason: 'trending_bonus',
      referenceId: postId,
    })
    if (result.success) {
      await checkAndGrantBadges(postOwnerId)
    }
    return result
  } catch (err) {
    console.error('[Points] grantTrendingBonus error:', err)
    return null
  }
}
