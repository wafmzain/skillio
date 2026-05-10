import { supabase } from './supabaseClient'
import { getVisitorToken } from '../utils/formatViews'

/**
 * Increment post view count with anti-spam logic
 * @param {string} postId - The post ID
 * @param {Object} currentUser - Current authenticated user (optional)
 * @returns {Promise<Object>} - Result object
 */
export async function incrementPostView(postId, currentUser = null) {
  console.log('👁️ [PostViews] Starting incrementPostView...')
  console.log('📄 [PostViews] Post ID:', postId)
  console.log('👤 [PostViews] Current user:', currentUser?.id || 'guest')
  
  try {
    if (!postId) {
      console.error('❌ [PostViews] Post ID is required')
      return {
        success: false,
        error: 'Post ID is required'
      }
    }

    // Determine user identification
    let userId = null
    let visitorToken = null
    
    if (currentUser?.id) {
      userId = currentUser.id
      console.log('🔐 [PostViews] Using authenticated user ID:', userId)
    } else {
      visitorToken = getVisitorToken()
      console.log('👻 [PostViews] Using visitor token:', visitorToken?.substring(0, 20) + '...')
    }

    // Check for duplicate view within 24 hours
    console.log('🔍 [PostViews] Checking for duplicate views...')
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    let duplicateQuery = supabase
      .from('post_views')
      .select('id')
      .eq('post_id', postId)
      .gte('viewed_at', twentyFourHoursAgo)
    
    if (userId) {
      duplicateQuery = duplicateQuery.eq('user_id', userId)
    } else {
      duplicateQuery = duplicateQuery.eq('visitor_token', visitorToken)
    }
    
    const { data: existingView, error: checkError } = await duplicateQuery.maybeSingle()
    
    if (checkError) {
      console.error('❌ [PostViews] Error checking duplicate view:', checkError)
      return {
        success: false,
        error: 'Failed to check view history'
      }
    }
    
    if (existingView) {
      console.log('⚠️ [PostViews] Duplicate view detected, skipping increment')
      return {
        success: true,
        message: 'View already counted within 24 hours',
        duplicate: true
      }
    }
    
    console.log('✅ [PostViews] No duplicate found, proceeding with increment')

    // Insert new view record
    console.log('📝 [PostViews] Inserting new view record...')
    const viewData = {
      post_id: postId,
      viewed_at: new Date().toISOString()
    }
    
    if (userId) {
      viewData.user_id = userId
    } else {
      viewData.visitor_token = visitorToken
    }
    
    const { error: insertError } = await supabase
      .from('post_views')
      .insert([viewData])
    
    if (insertError) {
      console.error('❌ [PostViews] Error inserting view record:', insertError)
      return {
        success: false,
        error: 'Failed to record view'
      }
    }
    
    console.log('✅ [PostViews] View record inserted successfully')

    // Increment post views count using correct RPC function
    console.log('📈 [PostViews] Incrementing post views count...')
    console.log('📈 [PostViews] Calling supabase.rpc with post_id:', postId)
    
    const { data: newViewCount, error: updateError } = await supabase.rpc('increment_post_views', {
      post_id: postId
    })
    
    console.log('📈 [PostViews] RPC Response - data:', newViewCount, 'error:', updateError)
    
    if (updateError) {
      console.error('❌ [PostViews] Error incrementing post views:', updateError)
      console.error('❌ [PostViews] Error details:', updateError.message)
      console.error('❌ [PostViews] Error code:', updateError.code)
      console.error('❌ [PostViews] Error hint:', updateError.hint)
      
      // Don't return error here as the view was already recorded
      console.warn('⚠️ [PostViews] View recorded but count increment failed')
      
      // Fallback: fetch current count
      console.log('🔄 [PostViews] Fetching fallback count...')
      const fallbackCount = await getPostViewCount(postId)
      console.log('🔄 [PostViews] Fallback count:', fallbackCount)
      
      return {
        success: true,
        message: 'View counted successfully (with fallback)',
        newViewCount: fallbackCount,
        error: updateError.message
      }
    } else {
      console.log('✅ [PostViews] Post views count incremented successfully')
      console.log('📊 [PostViews] New view count:', newViewCount)
      
      return {
        success: true,
        message: 'View counted successfully',
        newViewCount: newViewCount
      }
    }

  } catch (error) {
    console.error('❌ [PostViews] Unexpected error:', error)
    return {
      success: false,
      error: error.message || 'Failed to increment view'
    }
  }
}

/**
 * Get post view count
 * @param {string} postId - The post ID
 * @returns {Promise<number>} - View count
 */
export async function getPostViewCount(postId) {
  try {
    if (!postId) return 0
    
    const { data, error } = await supabase
      .from('posts')
      .select('views_count')
      .eq('id', postId)
      .single()
    
    if (error) {
      console.error('Error fetching view count:', error)
      return 0
    }
    
    return data?.views_count || 0
  } catch (error) {
    console.error('Error getting post view count:', error)
    return 0
  }
}

/**
 * Get view statistics for a post
 * @param {string} postId - The post ID
 * @returns {Promise<Object>} - View statistics
 */
export async function getPostViewStats(postId) {
  try {
    if (!postId) {
      return {
        totalViews: 0,
        uniqueViews: 0,
        todayViews: 0
      }
    }

    // Get total views from posts table
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('views_count')
      .eq('id', postId)
      .single()

    if (postError) {
      console.error('Error fetching post views:', postError)
      return { totalViews: 0, uniqueViews: 0, todayViews: 0 }
    }

    // Get unique views count
    const { count: uniqueViews, error: uniqueError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (uniqueError) {
      console.error('Error fetching unique views:', uniqueError)
    }

    // Get today's views
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayViews, error: todayError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .gte('viewed_at', today.toISOString())

    if (todayError) {
      console.error('Error fetching today views:', todayError)
    }

    return {
      totalViews: postData?.views_count || 0,
      uniqueViews: uniqueViews || 0,
      todayViews: todayViews || 0
    }

  } catch (error) {
    console.error('Error getting post view stats:', error)
    return {
      totalViews: 0,
      uniqueViews: 0,
      todayViews: 0
    }
  }
}

/**
 * Check if user has viewed a post
 * @param {string} postId - The post ID
 * @param {Object} currentUser - Current authenticated user (optional)
 * @returns {Promise<boolean>} - Whether user has viewed the post
 */
export async function hasUserViewedPost(postId, currentUser = null) {
  try {
    if (!postId) return false

    let query = supabase
      .from('post_views')
      .select('id')
      .eq('post_id', postId)

    if (currentUser?.id) {
      query = query.eq('user_id', currentUser.id)
    } else {
      const visitorToken = getVisitorToken()
      query = query.eq('visitor_token', visitorToken)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('Error checking user view:', error)
      return false
    }

    return !!data

  } catch (error) {
    console.error('Error checking if user viewed post:', error)
    return false
  }
}