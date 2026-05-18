// =============================================================================
// Helpers · Deterministic RNG + sampling utilities
// =============================================================================
import { CONFIG } from '../config.js'

/* Mulberry32 — fast, deterministic, good enough for seeding. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(CONFIG.RNG_SEED)

export function rand() {
  return rng()
}

export function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function pick(arr) {
  return arr[Math.floor(rand() * arr.length)]
}

export function pickMany(arr, n) {
  const copy = arr.slice()
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    const j = Math.floor(rand() * copy.length)
    out.push(copy.splice(j, 1)[0])
  }
  return out
}

/** Probability gate. */
export function chance(p) {
  return rand() < p
}

/**
 * Weighted pick.
 * Items: [{ value, weight }]
 */
export function pickWeighted(items) {
  let total = 0
  for (const it of items) total += it.weight
  let r = rand() * total
  for (const it of items) {
    r -= it.weight
    if (r <= 0) return it.value
  }
  return items[items.length - 1].value
}

/**
 * Power-law / Pareto-shaped sample from [0..1].
 * shape > 1 => long tail (most values small, a few very large).
 */
export function powerLaw(shape = 2) {
  return Math.pow(rand(), shape)
}

/**
 * Realistic engagement sample: log-normal-ish, capped at `max`.
 *  - `popularity` 0..1 from the post itself (drives the mean)
 *  - returns an integer in [0, max]
 */
export function engagementSample({ popularity, max }) {
  // base log-normal noise
  const u = Math.max(1e-6, rand())
  const v = Math.max(1e-6, rand())
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) // standard normal
  const mean = -1 + popularity * 5 // -1..4
  const sigma = 1.1
  const x = Math.exp(mean + sigma * z)
  return Math.min(max, Math.max(0, Math.round(x)))
}

/**
 * Build a stable slug from a string + a bit of randomness so duplicates are
 * extremely unlikely.
 */
export function slugify(s, suffix = '') {
  const base = String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
  return suffix ? `${base}-${suffix}` : base
}

/** Quick UUID-ish (not cryptographically strong; fine for seed correlation). */
export function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (rand() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
