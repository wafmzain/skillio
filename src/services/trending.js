import { supabase } from './supabaseClient'

/**
 * Get trending posts using the trending algorithm
 * @param {number} limit - Number of posts to fetch (default: 20)
 * @returns {Promise<Object>} - Result object with posts and metadata
 */
export async function getTrendingPosts(limit = 20) {
  console.log('🔥 [Trending] Fetching trending posts...')
  console.log('🔥 [Trending] Limit:', limit)
  
  try {
    const { data, error } = await supabase.rpc('get_trending_posts', {
      limit_count: limit
    })
    
    if (error) {
      console.error('❌ [Trending] Error fetching trending posts:', error)
      return {
        success: false,
        error: error.message,
        posts: []
      }
    }
    
    console.log('✅ [Trending] Trending posts fetched successfully')
    console.log('📊 [Trending] Posts count:', data?.length || 0)
    
    // Log top 3 trending scores for debugging
    if (data && data.length > 0) {
      console.log('🏆 [Trending] Top 3 trending scores:')
      data.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. "${post.title.substring(0, 30)}..." - Score: ${post.trending_score}`)
      })
    }
    
    return {
      success: true,
      posts: data || [],
      count: data?.length || 0
    }
    
  } catch (error) {
    console.error('❌ [Trending] Unexpected error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch trending posts',
      posts: []
    }
  }
}

/**
 * Get trending score for a specific post
 * @param {string} postId - The post ID
 * @returns {Promise<number>} - Trending score
 */
export async function getPostTrendingScore(postId) {
  try {
    if (!postId) return 0
    
    const { data, error } = await supabase.rpc('get_post_trending_score', {
      post_uuid: postId
    })
    
    if (error) {
      console.error('Error fetching trending score:', error)
      return 0
    }
    
    return parseFloat(data) || 0
  } catch (error) {
    console.error('Error getting post trending score:', error)
    return 0
  }
}

/**
 * Check if a post is trending (has high trending score)
 * @param {number} trendingScore - The trending score
 * @returns {boolean} - Whether the post is considered trending
 */
export function isTrendingPost(trendingScore) {
  // Consider a post trending if score > 50
  // This threshold can be adjusted based on platform activity
  return trendingScore > 50
}

/**
 * Format trending score for display
 * @param {number} score - The trending score
 * @returns {string} - Formatted score
 */
export function formatTrendingScore(score) {
  if (!score || score === 0) return '0'
  
  const num = parseFloat(score)
  
  if (num < 10) {
    return num.toFixed(1)
  } else if (num < 100) {
    return Math.round(num).toString()
  } else if (num < 1000) {
    return Math.round(num).toString()
  } else {
    return (num / 1000).toFixed(1) + 'K'
  }
}

/**
 * Get trending categories (most active categories)
 * @returns {Promise<Array>} - Array of trending categories
 */
export async function getTrendingCategories() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .gt('likes_count', 0) // Has some engagement
    
    if (error) {
      console.error('Error fetching trending categories:', error)
      return []
    }
    
    // Count category frequency
    const categoryCount = {}
    data.forEach(post => {
      if (post.category) {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1
      }
    })
    
    // Sort by frequency and return top categories
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))
    
  } catch (error) {
    console.error('Error getting trending categories:', error)
    return []
  }
}