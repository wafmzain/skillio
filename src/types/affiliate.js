/**
 * Skillio · Affiliate types (JSDoc)
 *
 * @typedef {Object} AffiliateProduct
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string|null} image_url
 * @property {string} category
 * @property {string} affiliate_link
 * @property {string} button_text
 * @property {number} click_count
 * @property {boolean} is_active
 * @property {boolean} is_featured
 * @property {number} display_order
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} AffiliateAnalytics
 * @property {number} totalClicks
 * @property {number} totalProducts
 * @property {AffiliateProduct[]} topProducts
 * @property {Record<string, number>} clicksByCategory
 *
 * @typedef {'sidebar'|'post-bottom'|'tools-page'|'inline'|'home-feed'} AffiliateSource
 */

export const AFFILIATE_SOURCES = Object.freeze({
  SIDEBAR: 'sidebar',
  POST_BOTTOM: 'post-bottom',
  TOOLS_PAGE: 'tools-page',
  INLINE: 'inline',
  HOME_FEED: 'home-feed',
})

export const AFFILIATE_CATEGORIES = [
  'All',
  'Productivity',
  'Design',
  'AI Tools',
  'Marketing',
  'Development',
  'Writing',
  'Learning',
  'Finance',
]
