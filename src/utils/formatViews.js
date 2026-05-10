/**
 * Format view count for display
 * Examples: 1200 → 1.2K, 2500000 → 2.5M
 * @param {number} views - The view count
 * @returns {string} - Formatted view count
 */
export function formatViews(views) {
  if (!views || views === 0) return '0'
  
  const num = parseInt(views)
  
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    const formatted = (num / 1000).toFixed(1)
    return formatted.endsWith('.0') ? `${Math.floor(num / 1000)}K` : `${formatted}K`
  } else if (num < 1000000000) {
    const formatted = (num / 1000000).toFixed(1)
    return formatted.endsWith('.0') ? `${Math.floor(num / 1000000)}M` : `${formatted}M`
  } else {
    const formatted = (num / 1000000000).toFixed(1)
    return formatted.endsWith('.0') ? `${Math.floor(num / 1000000000)}B` : `${formatted}B`
  }
}

/**
 * Generate unique visitor token for guest users
 * @returns {string} - Unique visitor token
 */
export function generateVisitorToken() {
  // Generate a unique token based on timestamp and random values
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2)
  const userAgent = navigator.userAgent.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')
  
  return `visitor_${timestamp}_${random}_${userAgent}`.toLowerCase()
}

/**
 * Get or create visitor token for guest users
 * @returns {string} - Visitor token from localStorage or newly created
 */
export function getVisitorToken() {
  const STORAGE_KEY = 'skillio_visitor_token'
  
  try {
    let token = localStorage.getItem(STORAGE_KEY)
    
    if (!token) {
      token = generateVisitorToken()
      localStorage.setItem(STORAGE_KEY, token)
    }
    
    return token
  } catch (error) {
    console.error('Error accessing localStorage:', error)
    // Fallback: generate temporary token
    return generateVisitorToken()
  }
}

/**
 * Check if view count should be displayed
 * @param {number} views - The view count
 * @returns {boolean} - Whether to show view count
 */
export function shouldShowViews(views) {
  // Always show views, even if 0
  return true
}

/**
 * Get view count display text
 * @param {number} views - The view count
 * @returns {string} - Display text for views
 */
export function getViewsDisplayText(views) {
  const formatted = formatViews(views)
  const count = parseInt(views) || 0
  
  if (count === 1) {
    return `${formatted} view`
  } else {
    return `${formatted} views`
  }
}