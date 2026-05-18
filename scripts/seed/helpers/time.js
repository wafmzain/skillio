// =============================================================================
// Helpers · realistic timestamp distribution
// =============================================================================
import { rand, randInt, pickWeighted } from './random.js'
import { CONFIG } from '../config.js'

/**
 * Sample "days ago" with a heavy bias toward recency — feels like an
 * active platform where most activity is from the last week.
 */
export function sampleDaysAgo() {
  return pickWeighted([
    { value: () => randInt(0, 1),   weight: 22 }, // last 24-48h
    { value: () => randInt(2, 6),   weight: 28 }, // this week
    { value: () => randInt(7, 14),  weight: 18 }, // last 2 weeks
    { value: () => randInt(15, 30), weight: 14 }, // last month
    { value: () => randInt(31, 90), weight: 12 }, // last 3 months
    { value: () => randInt(91, CONFIG.ACTIVITY_HORIZON_DAYS), weight: 6 },
  ])()
}

export function isoDaysAgo(days, jitterHours = 12) {
  const ms =
    Date.now() -
    days * 86_400_000 -
    Math.floor(rand() * jitterHours * 3_600_000)
  return new Date(ms).toISOString()
}

export function randomCreatedAt() {
  return isoDaysAgo(sampleDaysAgo(), 23)
}

/**
 * Pick a timestamp that's strictly *after* the given anchor — used so likes,
 * comments, and bookmarks come after the post they react to.
 */
export function isoAfter(anchorIso, maxDaysAfter = 14) {
  const anchor = new Date(anchorIso).getTime()
  const now = Date.now()
  const window = Math.min(now - anchor, maxDaysAfter * 86_400_000)
  if (window <= 0) return new Date(now).toISOString()
  const offset = Math.floor(rand() * window)
  return new Date(anchor + offset).toISOString()
}
