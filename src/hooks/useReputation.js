import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { buildReputation } from '../services/reputation'

/**
 * useReputation
 * Fetches a user's posts and derives their reputation (points, level, badges).
 *
 * Accepts either a userId or a preloaded list of posts.
 * When `posts` is passed it skips the fetch — useful to avoid double fetches
 * from pages that already load the user's posts (e.g. Profile).
 */
export function useReputation({ userId, posts: providedPosts, isPremium = false } = {}) {
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(!providedPosts)

  useEffect(() => {
    let alive = true

    async function load() {
      if (providedPosts) {
        setReputation(buildReputation({ posts: providedPosts, isPremium }))
        setLoading(false)
        return
      }
      if (!userId) {
        setReputation(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('posts')
        .select('likes_count, bookmarks_count, comments_count, trending_score')
        .eq('user_id', userId)

      if (!alive) return
      setReputation(buildReputation({ posts: data || [], isPremium }))
      setLoading(false)
    }

    load()
    return () => { alive = false }
  }, [userId, providedPosts, isPremium])

  return { reputation, loading }
}
