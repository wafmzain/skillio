import { supabase } from './supabaseClient'

/**
 * Affiliate Service
 * Centralized data access for the affiliate recommendation system.
 * All errors are caught and surfaced via { data, error } tuples — callers
 * never have to wrap in try/catch themselves.
 */

const TABLE = 'affiliate_products'
const CLICK_LOG_TABLE = 'affiliate_clicks'

/* ---------------------------------------------------------------------------
 * Read
 * ------------------------------------------------------------------------- */

export async function fetchAffiliates({
  category = null,
  featuredOnly = false,
  limit = 50,
} = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  if (featuredOnly) {
    query = query.eq('is_featured', true)
  }

  const { data, error } = await query
  return { data: data || [], error }
}

export async function fetchTopAffiliates(limit = 5) {
  // Try RPC first, fall back to a direct query if missing.
  const rpc = await supabase.rpc('get_top_affiliates', { limit_count: limit })
  if (!rpc.error && rpc.data) return { data: rpc.data, error: null }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('click_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function fetchAffiliateById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return { data, error }
}

export async function fetchAffiliateAnalytics() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, title, category, click_count, is_active, image_url, affiliate_link, button_text, description, created_at, updated_at, is_featured, display_order')
    .eq('is_active', true)

  if (error) {
    return {
      data: { totalClicks: 0, totalProducts: 0, topProducts: [], clicksByCategory: {} },
      error,
    }
  }

  const totalProducts = data.length
  const totalClicks = data.reduce((acc, p) => acc + (p.click_count || 0), 0)
  const topProducts = [...data]
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 5)
  const clicksByCategory = data.reduce((acc, p) => {
    const cat = p.category || 'Lainnya'
    acc[cat] = (acc[cat] || 0) + (p.click_count || 0)
    return acc
  }, {})

  return {
    data: { totalClicks, totalProducts, topProducts, clicksByCategory },
    error: null,
  }
}

/* ---------------------------------------------------------------------------
 * Click tracking
 * ------------------------------------------------------------------------- */

export async function trackAffiliateClick({ productId, source, contextId, userId } = {}) {
  if (!productId) return { error: new Error('productId is required') }

  // Atomic counter increment via RPC (no race conditions)
  const rpc = await supabase.rpc('increment_affiliate_click', { product_uuid: productId })

  // Best-effort fallback when the RPC is missing
  if (rpc.error) {
    const { data: current } = await supabase
      .from(TABLE)
      .select('click_count')
      .eq('id', productId)
      .maybeSingle()
    if (current) {
      await supabase
        .from(TABLE)
        .update({ click_count: (current.click_count || 0) + 1 })
        .eq('id', productId)
    }
  }

  // Optional click log (privacy-friendly, no PII)
  await supabase.from(CLICK_LOG_TABLE).insert([
    {
      product_id: productId,
      source: source || null,
      context_id: contextId || null,
      user_id: userId || null,
    },
  ])

  return { error: null }
}

/**
 * Build a safe outbound URL — appends a small UTM tag for source tracking
 * without rewriting the affiliate link itself.
 */
export function buildOutboundUrl(link, source) {
  if (!link) return '#'
  try {
    const url = new URL(link)
    if (source && !url.searchParams.has('utm_source')) {
      url.searchParams.set('utm_source', 'skillio')
      url.searchParams.set('utm_medium', source)
    }
    return url.toString()
  } catch {
    return link
  }
}
