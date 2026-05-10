import { useState, useEffect, useCallback, useRef } from 'react'
import { incrementPostView, getPostViewCount } from '../services/postViews'

/**
 * Custom hook for handling post views
 * Automatically increments view when component mounts
 * Provides view count and loading states
 */
export function usePostView(postId, currentUser = null) {
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasIncremented, setHasIncremented] = useState(false)
  
  // Use ref to prevent multiple increments
  const incrementedRef = useRef(false)
  const postIdRef = useRef(null)

  /**
   * Increment view count for the post
   */
  const handleIncrementView = useCallback(async () => {
    if (!postId || incrementedRef.current || postIdRef.current === postId) {
      console.log('👁️ [usePostView] Skipping increment - already processed or no postId')
      return
    }

    console.log('👁️ [usePostView] Starting view increment for post:', postId)
    setLoading(true)
    setError(null)

    try {
      // Mark as incremented to prevent duplicates
      incrementedRef.current = true
      postIdRef.current = postId

      const result = await incrementPostView(postId, currentUser)
      
      if (result.success) {
        console.log('✅ [usePostView] View incremented successfully')
        setHasIncremented(true)
        
        // Use the new view count from the service if available
        if (result.newViewCount !== null && result.newViewCount !== undefined) {
          console.log('📊 [usePostView] Using view count from service:', result.newViewCount)
          setViewCount(result.newViewCount)
        } else {
          // Fallback: fetch updated count with delay
          setTimeout(async () => {
            const updatedCount = await getPostViewCount(postId)
            console.log('📊 [usePostView] Fetched updated view count:', updatedCount)
            setViewCount(updatedCount)
          }, 1000)
        }
      } else {
        console.warn('⚠️ [usePostView] View increment failed:', result.error)
        if (!result.duplicate) {
          setError(result.error)
        } else {
          // Even if duplicate, still fetch current count
          const currentCount = await getPostViewCount(postId)
          setViewCount(currentCount)
        }
      }
    } catch (err) {
      console.error('❌ [usePostView] Error incrementing view:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [postId, currentUser])

  /**
   * Fetch current view count
   */
  const fetchViewCount = useCallback(async () => {
    if (!postId) return

    try {
      const count = await getPostViewCount(postId)
      setViewCount(count)
    } catch (err) {
      console.error('❌ [usePostView] Error fetching view count:', err)
    }
  }, [postId])

  /**
   * Reset states when postId changes
   */
  useEffect(() => {
    if (postIdRef.current !== postId) {
      incrementedRef.current = false
      postIdRef.current = null
      setHasIncremented(false)
      setError(null)
      setViewCount(0)
    }
  }, [postId])

  /**
   * Auto-increment view when component mounts or postId changes
   */
  useEffect(() => {
    if (!postId) return

    console.log('🎬 [usePostView] Effect triggered for postId:', postId)
    console.log('🎬 [usePostView] Current user:', currentUser?.id || 'guest')
    console.log('🎬 [usePostView] hasIncremented:', hasIncremented)
    console.log('🎬 [usePostView] incrementedRef.current:', incrementedRef.current)

    // Fetch initial view count
    fetchViewCount()

    // Increment view with a small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      console.log('⏰ [usePostView] Timer triggered, calling handleIncrementView...')
      handleIncrementView()
    }, 500)

    return () => {
      console.log('🧹 [usePostView] Cleanup timer for postId:', postId)
      clearTimeout(timer)
    }
  }, [postId, handleIncrementView, fetchViewCount])

  /**
   * Manual refresh view count
   */
  const refreshViewCount = useCallback(async () => {
    await fetchViewCount()
  }, [fetchViewCount])

  return {
    viewCount,
    loading,
    error,
    hasIncremented,
    refreshViewCount,
    incrementView: handleIncrementView
  }
}

/**
 * Lightweight hook for just displaying view count
 * Does not auto-increment views
 */
export function useViewCount(postId) {
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchViewCount = useCallback(async () => {
    if (!postId) return

    setLoading(true)
    try {
      const count = await getPostViewCount(postId)
      setViewCount(count)
    } catch (err) {
      console.error('Error fetching view count:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchViewCount()
  }, [fetchViewCount])

  const refreshViewCount = useCallback(async () => {
    await fetchViewCount()
  }, [fetchViewCount])

  return {
    viewCount,
    loading,
    refreshViewCount
  }
}