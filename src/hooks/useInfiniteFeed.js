import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'

/**
 * useInfiniteFeed
 * --------------------------------------------------------------------------
 * Cursor-paginated feed loader for any `posts` query in Skillio.
 *
 *   - Initial fetch grabs `pageSize` rows (default 12).
 *   - `loadMore()` grabs the next page using `.range(start, end)`.
 *   - When `loaderRef` is mounted on a sentinel near the bottom of the list,
 *     `loadMore` is invoked automatically via `IntersectionObserver`.
 *   - Filter changes (`category`, `sort`, `search`, `userId`) reset the feed.
 *   - Stale responses are ignored (request-id guard) so fast filter switches
 *     never leak old results onto a new query.
 *
 * Returns
 *   posts, loading, loadingMore, hasMore, error,
 *   loadMore(), reset(), refresh(), loaderRef
 *
 * Usage
 *   const feed = useInfiniteFeed({ category: 'AI Tools', sort: 'trending' })
 *   <FeedSentinel loaderRef={feed.loaderRef} hasMore={feed.hasMore} loading={feed.loadingMore} />
 * --------------------------------------------------------------------------
 */
const DEFAULT_PAGE_SIZE = 12

const SELECT_FIELDS =
  '*, profiles!inner(id, username, name, avatar_url, is_premium)'

export function useInfiniteFeed(options = {}) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    category = 'Semua',
    sort = 'latest',
    search = '',
    userId = null,        // when set, scopes to a single author's posts
    enabled = true,
  } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  const pageRef = useRef(0)
  const reqIdRef = useRef(0)
  const loaderRef = useRef(null)

  /* ------------------------------------------------------------------ */
  /*  Build the Supabase query for a given page index                   */
  /* ------------------------------------------------------------------ */
  const buildQuery = useCallback(
    (page) => {
      const from = page * pageSize
      const to = from + pageSize - 1

      let q = supabase.from('posts').select(SELECT_FIELDS).range(from, to)

      // Filters
      if (userId) q = q.eq('user_id', userId)
      if (category && category !== 'Semua') q = q.eq('category', category)

      // Server-side text search across title + excerpt (case-insensitive)
      const term = (search || '').trim()
      if (term) {
        const safe = term.replace(/[%(),]/g, ' ').slice(0, 80)
        q = q.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%`)
      }

      // Sort
      switch (sort) {
        case 'trending':
          q = q
            .order('trending_score', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
          break
        case 'popular':
          q = q
            .order('likes_count', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
          break
        case 'latest':
        default:
          q = q.order('created_at', { ascending: false })
      }
      return q
    },
    [pageSize, category, sort, search, userId]
  )

  /* ------------------------------------------------------------------ */
  /*  Page loader                                                        */
  /* ------------------------------------------------------------------ */
  const fetchPage = useCallback(
    async (page, { append }) => {
      const myReq = ++reqIdRef.current
      if (append) {
        setLoadingMore(true)
      } else {
        // Page 0 — synchronously reset cursors before the request fires
        // so a pending older request can't write into the new state.
        setLoading(true)
        setHasMore(true)
        pageRef.current = 0
      }
      setError(null)

      const { data, error: err } = await buildQuery(page)

      // Drop the response if a newer request superseded it.
      if (myReq !== reqIdRef.current) return

      if (err) {
        setError(err.message || 'Gagal memuat feed')
        if (!append) setPosts([])
        setHasMore(false)
      } else {
        const rows = data || []
        setPosts((prev) => (append ? [...prev, ...rows] : rows))
        setHasMore(rows.length >= pageSize)
        pageRef.current = page
      }

      if (append) setLoadingMore(false)
      else setLoading(false)
    },
    [buildQuery, pageSize]
  )

  /* ------------------------------------------------------------------ */
  /*  Public helpers                                                     */
  /* ------------------------------------------------------------------ */
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    fetchPage(pageRef.current + 1, { append: true })
  }, [fetchPage, hasMore, loading, loadingMore])

  const reset = useCallback(() => {
    fetchPage(0, { append: false })
  }, [fetchPage])

  const refresh = useCallback(() => {
    fetchPage(0, { append: false })
  }, [fetchPage])

  /* ------------------------------------------------------------------ */
  /*  Initial fetch + reset whenever the filter inputs change            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!enabled) return
    // Effect-driven fetch is the intended pattern: filter inputs feed into
    // `buildQuery` (memoized), which feeds into `fetchPage` (memoized), so
    // a new query only fires when an actual filter changes. The state
    // updates inside `fetchPage` are guarded with a request-id token.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0, { append: false })
  }, [enabled, fetchPage])

  /* ------------------------------------------------------------------ */
  /*  Auto-load when the sentinel scrolls into view                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const node = loaderRef.current
    if (!node) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) loadMore()
        }
      },
      { root: null, rootMargin: '600px 0px', threshold: 0 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [loadMore])

  /* ------------------------------------------------------------------ */

  return useMemo(
    () => ({
      posts,
      loading,
      loadingMore,
      hasMore,
      error,
      loadMore,
      reset,
      refresh,
      loaderRef,
    }),
    [posts, loading, loadingMore, hasMore, error, loadMore, reset, refresh]
  )
}

export default useInfiniteFeed
