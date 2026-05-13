import { supabase } from './supabaseClient'

/* ---------------------------------------------------------------------------
 * Skillio Reputation System — MVP
 *
 * Points economy (derived client-side for MVP, no DB schema changes needed):
 *  - Upload a post:      +10 points
 *  - Like received:       +2 points
 *  - Bookmark received:   +3 points
 *  - Comment received:    +4 points
 *  - Trending bonus:     +50 points  (once per trending post)
 * ------------------------------------------------------------------------- */

export const POINTS_CONFIG = {
  POST: 10,
  LIKE: 2,
  BOOKMARK: 3,
  COMMENT: 4,
  TRENDING_BONUS: 50,
  TRENDING_THRESHOLD: 50, // trending_score >= 50 counts as trending
}

/* ---------------------------------------------------------------------------
 * LEVELS — tiered by total points
 * ------------------------------------------------------------------------- */
export const LEVELS = [
  {
    key: 'beginner',
    name: 'Beginner',
    min: 0,
    max: 99,
    icon: 'seed',
    accent: '#94A3B8',
    accentBg: 'rgba(148,163,184,0.12)',
  },
  {
    key: 'active',
    name: 'Active Member',
    min: 100,
    max: 499,
    icon: 'zap',
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.12)',
  },
  {
    key: 'top-contributor',
    name: 'Top Contributor',
    min: 500,
    max: 1499,
    icon: 'trophy',
    accent: '#2563EB',
    accentBg: 'rgba(37,99,235,0.14)',
  },
  {
    key: 'insight-expert',
    name: 'Insight Expert',
    min: 1500,
    max: 4999,
    icon: 'star',
    accent: '#1D4ED8',
    accentBg: 'rgba(29,78,216,0.15)',
  },
  {
    key: 'community-leader',
    name: 'Community Leader',
    min: 5000,
    max: Infinity,
    icon: 'crown',
    accent: '#1E3A8A',
    accentBg: 'rgba(30,58,138,0.18)',
  },
]

/**
 * Calculate total reputation points from a set of posts.
 * Safe to call with any posts-like array that has likes_count, bookmarks_count,
 * comments_count, and optionally trending_score.
 */
export function calculatePointsFromPosts(posts = []) {
  let points = 0
  let trendingCount = 0

  posts.forEach((p) => {
    points += POINTS_CONFIG.POST
    points += (p.likes_count || 0) * POINTS_CONFIG.LIKE
    points += (p.bookmarks_count || 0) * POINTS_CONFIG.BOOKMARK
    points += (p.comments_count || 0) * POINTS_CONFIG.COMMENT
    if ((p.trending_score || 0) >= POINTS_CONFIG.TRENDING_THRESHOLD) {
      points += POINTS_CONFIG.TRENDING_BONUS
      trendingCount += 1
    }
  })

  return { points, trendingCount }
}

/**
 * Given a points total, return the matching level object + progress info.
 */
export function getLevel(points = 0) {
  const level =
    LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0]
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1] || null

  const progress = nextLevel
    ? Math.min(
        1,
        (points - level.min) / Math.max(1, nextLevel.min - level.min)
      )
    : 1

  return {
    ...level,
    nextLevel,
    progress,
    pointsToNext: nextLevel ? Math.max(0, nextLevel.min - points) : 0,
  }
}

/**
 * Derive achievement badges from a user's stats.
 */
export function getReputationBadges({
  points = 0,
  posts = [],
  isPremium = false,
}) {
  const badges = []

  if (isPremium) {
    badges.push({
      key: 'skillio-plus',
      label: 'Skillio+',
      icon: 'sparkles',
      tone: 'accent',
    })
  }

  const hasTrending = posts.some(
    (p) => (p.trending_score || 0) >= POINTS_CONFIG.TRENDING_THRESHOLD
  )
  if (hasTrending) {
    badges.push({
      key: 'trending',
      label: 'Trending',
      icon: 'flame',
      tone: 'warm',
    })
  }

  const topInsight = posts.some((p) => (p.likes_count || 0) >= 100)
  if (topInsight) {
    badges.push({
      key: 'top-insight',
      label: 'Top Insight',
      icon: 'star',
      tone: 'accent',
    })
  }

  if (points >= 500) {
    badges.push({
      key: 'top-contributor',
      label: 'Top Contributor',
      icon: 'trophy',
      tone: 'accent',
    })
  }

  if (posts.length >= 3 && points >= 50 && points < 500) {
    badges.push({
      key: 'rising',
      label: 'Rising Member',
      icon: 'rocket',
      tone: 'subtle',
    })
  }

  return badges
}

/* ---------------------------------------------------------------------------
 * Compose user reputation from their posts in one call.
 * ------------------------------------------------------------------------- */
export function buildReputation({ posts = [], isPremium = false }) {
  const { points, trendingCount } = calculatePointsFromPosts(posts)
  const level = getLevel(points)
  const badges = getReputationBadges({ points, posts, isPremium })
  return {
    points,
    trendingCount,
    postCount: posts.length,
    level,
    badges,
  }
}

/* ---------------------------------------------------------------------------
 * Leaderboard — fetch top users by derived points.
 * For MVP we fetch a pool of recent posts and aggregate per user.
 * ------------------------------------------------------------------------- */
export async function fetchLeaderboard({ limit = 5, windowDays = 7 } = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('posts')
    .select(
      'user_id, likes_count, bookmarks_count, comments_count, trending_score, profiles(id, username, name, avatar_url, is_premium)'
    )
    .gte('created_at', since)
    .limit(500)

  if (error || !data) return []

  const map = new Map()
  data.forEach((row) => {
    const profile = row.profiles
    if (!profile?.id) return
    const existing = map.get(profile.id) || {
      profile,
      posts: [],
      _metrics: { likes: 0, bookmarks: 0, comments: 0, trending: 0 },
    }
    existing.posts.push(row)
    existing._metrics.likes += row.likes_count || 0
    existing._metrics.bookmarks += row.bookmarks_count || 0
    existing._metrics.comments += row.comments_count || 0
    if ((row.trending_score || 0) >= POINTS_CONFIG.TRENDING_THRESHOLD) {
      existing._metrics.trending += 1
    }
    map.set(profile.id, existing)
  })

  const rows = Array.from(map.values()).map((entry) => {
    const { points } = calculatePointsFromPosts(entry.posts)
    const level = getLevel(points)
    return {
      profile: entry.profile,
      points,
      level,
      metrics: entry._metrics,
      postCount: entry.posts.length,
    }
  })

  rows.sort((a, b) => b.points - a.points)
  return rows.slice(0, limit)
}

/* ---------------------------------------------------------------------------
 * Utility — format points with thousands
 * ------------------------------------------------------------------------- */
export function formatPoints(n) {
  const num = Math.max(0, Math.floor(n || 0))
  if (num < 1000) return String(num)
  if (num < 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return Math.round(num / 1000) + 'k'
}
