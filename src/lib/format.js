/**
 * Tiny formatting helpers reused across the affiliate UI.
 */

export function formatCount(n) {
  const num = Math.max(0, Math.floor(n || 0))
  if (num < 1000) return String(num)
  if (num < 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  if (num < 1_000_000) return Math.round(num / 1000) + 'k'
  return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
}

export function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Best-effort hostname extraction for showing alongside affiliate cards.
 * Returns the bare hostname without `www.`.
 */
export function hostnameFrom(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
