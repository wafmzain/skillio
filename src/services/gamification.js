import { supabase } from './supabaseClient'

/**
 * Skillio Gamification Service
 * Handles points, ranks, badges, daily login, and reward redemption.
 */

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
export const POINT_VALUES = {
  POST_CREATED: 20,
  LIKE_RECEIVED: 2,
  COMMENT_RECEIVED: 5,
  BOOKMARK_RECEIVED: 3,
  DAILY_LOGIN: 3,
  TRENDING_BONUS: 50,
}

export const RANKS = [
  { key: 'Beginner', min: 0, max: 499, color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
  { key: 'Contributor', min: 500, max: 1999, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'Expert', min: 2000, max: 4999, color: '#2563EB', bg: 'rgba(37,99,235,0.14)' },
  { key: 'Master', min: 5000, max: 9999, color: '#1D4ED8', bg: 'rgba(29,78,216,0.15)' },
  { key: 'Legend', min: 10000, max: Infinity, color: '#1E3A8A', bg: 'rgba(30,58,138,0.18)' },
]

export function getRankInfo(rankKey) {
  return RANKS.find((r) => r.key === rankKey) || RANKS[0]
}

export function getRankFromPoints(points) {
  return RANKS.find((r) => points >= r.min && points <= r.max) || RANKS[0]
}

/* ---------------------------------------------------------------------------
 * Points
 * ------------------------------------------------------------------------- */

export async function addPoints({ userId, amount, reason, referenceId = null }) {
  // Try RPC first (atomic, handles rank update)
  const { data, error } = await supabase.rpc('add_user_points', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_reference_id: referenceId,
  })

  if (error) {
    // Fallback: manual update
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single()

    if (profile) {
      const newTotal = (profile.points || 0) + amount
      const newRank = getRankFromPoints(newTotal).key
      await supabase
        .from('profiles')
        .update({ points: newTotal, current_rank: newRank })
        .eq('id', userId)

      // Log transaction (best effort)
      await supabase.from('point_transactions').insert([
        { user_id: userId, amount, reason, reference_id: referenceId },
      ])

      return { success: true, newPoints: newTotal }
    }
    return { success: false, error: error.message }
  }

  return { success: true, newPoints: data }
}

export async function getUserPoints(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('points, current_rank, last_daily_claim')
    .eq('id', userId)
    .single()

  if (error) return { points: 0, rank: 'Beginner', lastDailyClaim: null }
  return {
    points: data.points || 0,
    rank: data.current_rank || 'Beginner',
    lastDailyClaim: data.last_daily_claim,
  }
}

export async function getPointHistory(userId, limit = 20) {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

/* ---------------------------------------------------------------------------
 * Daily Login
 * ------------------------------------------------------------------------- */

export async function claimDailyLogin(userId) {
  // Try RPC
  const { data, error } = await supabase.rpc('claim_daily_login', {
    p_user_id: userId,
  })

  if (error) {
    // Fallback: check manually
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_daily_claim, points')
      .eq('id', userId)
      .single()

    if (!profile) return { success: false, error: 'Profile tidak ditemukan' }

    const today = new Date().toDateString()
    const lastClaim = profile.last_daily_claim
      ? new Date(profile.last_daily_claim).toDateString()
      : null

    if (lastClaim === today) {
      return { success: false, error: 'Sudah klaim hari ini' }
    }

    const newPoints = (profile.points || 0) + POINT_VALUES.DAILY_LOGIN
    await supabase
      .from('profiles')
      .update({
        points: newPoints,
        last_daily_claim: new Date().toISOString(),
        current_rank: getRankFromPoints(newPoints).key,
      })
      .eq('id', userId)

    await supabase.from('point_transactions').insert([
      { user_id: userId, amount: POINT_VALUES.DAILY_LOGIN, reason: 'daily_login' },
    ])

    return { success: true, newPoints, amount: POINT_VALUES.DAILY_LOGIN }
  }

  // RPC returns JSON
  if (typeof data === 'object') return data
  return { success: true, newPoints: data }
}

export function canClaimToday(lastDailyClaim) {
  if (!lastDailyClaim) return true
  const today = new Date().toDateString()
  const lastDate = new Date(lastDailyClaim).toDateString()
  return today !== lastDate
}

/* ---------------------------------------------------------------------------
 * Badges
 * ------------------------------------------------------------------------- */

export async function getUserBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  return { data: data || [], error }
}

export async function getAllBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('category', { ascending: true })

  return { data: data || [], error }
}

export async function grantBadge(userId, badgeId) {
  const { error } = await supabase
    .from('user_badges')
    .insert([{ user_id: userId, badge_id: badgeId }])

  // Ignore duplicate errors (already has badge)
  if (error && error.code !== '23505') return { success: false, error: error.message }
  return { success: true }
}

/* ---------------------------------------------------------------------------
 * Rewards
 * ------------------------------------------------------------------------- */

export async function getAvailableRewards() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('cost_points', { ascending: true })

  return { data: data || [], error }
}

export async function redeemReward(userId, rewardId) {
  // Try RPC (atomic)
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_user_id: userId,
    p_reward_id: rewardId,
  })

  if (error) return { success: false, error: error.message }
  if (typeof data === 'object') return data
  return { success: true }
}

export async function getUserRedemptions(userId, limit = 20) {
  const { data, error } = await supabase
    .from('reward_redemptions')
    .select('*, rewards(title, icon, cost_points)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

/* ---------------------------------------------------------------------------
 * Leaderboard
 * ------------------------------------------------------------------------- */

export async function getLeaderboard({ limit = 20, period = 'all' } = {}) {
  let query = supabase
    .from('profiles')
    .select('id, username, name, avatar_url, is_premium, points, current_rank')
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(limit)

  const { data, error } = await query
  return { data: data || [], error }
}

/* ---------------------------------------------------------------------------
 * Auto-badge check (call after point changes)
 * ------------------------------------------------------------------------- */

export async function checkAndGrantBadges(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('points, current_rank')
    .eq('id', userId)
    .single()

  if (!profile) return

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // First Post
  if (postCount >= 1) await grantBadge(userId, 'first_post')

  // Rising Member (100+ points)
  if (profile.points >= 100) await grantBadge(userId, 'rising_member')

  // Expert Rank
  if (profile.current_rank === 'Expert' || profile.points >= 2000) {
    await grantBadge(userId, 'expert_rank')
  }

  // Viral Post (any post with 100+ likes)
  const { count: viralCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('likes_count', 100)

  if (viralCount > 0) await grantBadge(userId, 'viral_post')

  // Top Contributor (500+ points)
  if (profile.points >= 500) await grantBadge(userId, 'top_contributor')
}
