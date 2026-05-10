import { useState, useEffect, useCallback } from 'react'
import { getTrendingPosts, getTrendingCategories } from '../services/trending'

/**
 * Custom hook for trending posts
 * @param {number} limit - Number of posts to fetch
 * @param {boolean} autoRefresh - Whether to auto-refresh data
 * @returns {Object} - Trending posts state and actions
 */
export function useTrendingPosts(limit = 20, autoRefresh = false) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  /**
   * Fetch trending posts
   */
  const fetchTrendingPosts = useCallback(async () => {
    console.log('🔥 [useTrending] Fetching trending posts...')
    setLoading(true)
    setError(null)

    try {
      const result = await getTrendingPosts(limit)
      
      if (result.success) {
        console.log('✅ [useTrending] Trending posts loaded:', result.count)
        setPosts(result.posts)
        setLastFetch(new Date())
      } else {
        console.error('❌ [useTrending] Failed to load trending posts:', result.error)
        setError(result.error)
      }
    } catch (err) {
      console.error('❌ [useTrending] Unexpected error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [limit])

  /**
   * Refresh trending posts
   */
  const refreshTrending = useCallback(async () => {
    console.log('🔄 [useTrending] Refreshing trending posts...')
    await fetchTrendingPosts()
  }, [fetchTrendingPosts])

  /**
   * Initial fetch and auto-refresh setup
   */
  useEffect(() => {
    fetchTrendingPosts()

    // Auto-refresh every 5 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('⏰ [useTrending] Auto-refreshing trending posts...')
        fetchTrendingPosts()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [fetchTrendingPosts, autoRefresh])

  return {
    posts,
    loading,
    error,
    lastFetch,
    refreshTrending,
    fetchTrendingPosts
  }
}

/**
 * Custom hook for trending categories
 * @returns {Object} - Trending categories state and actions
 */
export function useTrendingCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch trending categories
   */
  const fetchTrendingCategories = useCallback(async () => {
    console.log('📊 [useTrending] Fetching trending categories...')
    setLoading(true)
    setError(null)

    try {
      const result = await getTrendingCategories()
      console.log('✅ [useTrending] Trending categories loaded:', result.length)
      setCategories(result)
    } catch (err) {
      console.error('❌ [useTrending] Error fetching categories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchTrendingCategories()
  }, [fetchTrendingCategories])

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchTrendingCategories
  }
}

/**
 * Lightweight hook for checking if posts are trending
 * @param {Array} posts - Array of posts to check
 * @returns {Object} - Trending status for each post
 */
export function useTrendingStatus(posts = []) {
  const [trendingStatus, setTrendingStatus] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!posts || posts.length === 0) return

    setLoading(true)
    
    // Simple client-side trending detection based on engagement
    const status = {}
    
    posts.forEach(post => {
      const engagementScore = 
        (post.likes_count || 0) * 4 +
        (post.comments_count || 0) * 6 +
        (post.bookmarks_count || 0) * 5 +
        (post.views_count || 0) * 1

      // Consider trending if high engagement and recent
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
      const isTrending = engagementScore > 50 && hoursOld < 168 // 7 days

      status[post.id] = {
        isTrending,
        engagementScore,
        hoursOld: Math.round(hoursOld)
      }
    })

    setTrendingStatus(status)
    setLoading(false)
  }, [posts])

  return {
    trendingStatus,
    loading
  }
}