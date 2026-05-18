// =============================================================================
// Generator · Posts
// Builds 500-700 realistic insight posts with category-aware titles, bodies,
// thumbnails, premium gating, and trending scores. Engagement counts are
// computed and stamped onto the post (likes_count, bookmarks_count,
// comments_count, views_count) so the feed reads correctly even before the
// interaction generator runs.
// =============================================================================
import { admin, CONFIG, BOOKMARK_HEAVY, TRENDING_THRESHOLD } from '../config.js'
import { log, progress } from '../helpers/logger.js'
import {
  rand,
  randInt,
  pick,
  pickMany,
  chance,
  engagementSample,
} from '../helpers/random.js'
import { randomCreatedAt } from '../helpers/time.js'
import {
  TITLE_TEMPLATES_BY_CATEGORY,
  TITLE_FALLBACK,
  HOOKS,
  POINTS,
  CLOSERS,
  THUMBS_BY_CATEGORY,
} from '../data/dictionaries.js'

/* -------------------------------------------------------------------------- */
/*  Authoring helpers                                                          */
/* -------------------------------------------------------------------------- */
function pickTitle(category, used) {
  const pool = TITLE_TEMPLATES_BY_CATEGORY[category] || TITLE_FALLBACK
  for (let attempt = 0; attempt < 4; attempt++) {
    const t = pick(pool)
    if (!used.has(t)) {
      used.add(t)
      return t
    }
  }
  // Disambiguate with a small suffix to keep titles unique-ish but natural.
  return `${pick(pool)} (catatan ${randInt(2, 9)})`
}

function buildExcerpt(title) {
  const lead = pick([
    'Sharing pelan-pelan dari pengalaman pribadi.',
    'Catatan singkat tapi semoga membantu siapapun yang lagi di fase yang sama.',
    'Insight pendek hasil eksperimen seminggu terakhir.',
    'Notebook publik · semoga ada yang relate.',
    'Cerita kecil dari proses minggu ini.',
  ])
  const seed = title.split(' ').slice(0, 6).join(' ').toLowerCase()
  return `${lead} Topik kali ini soal ${seed}.`
}

function buildBody(category) {
  const paraCount = randInt(3, 6)
  const paragraphs = []
  paragraphs.push(pick(HOOKS))
  const pts = pickMany(POINTS, Math.min(POINTS.length, randInt(2, 4)))
  paragraphs.push(
    'Berikut beberapa hal yang aku temukan:\n\n' +
      pts.map((p, i) => `${i + 1}. ${p}`).join('\n')
  )
  // Optional middle paragraph
  if (paraCount > 4) {
    paragraphs.push(
      pick([
        `Kalau kamu fokus di ${category.toLowerCase()}, hal-hal di atas mungkin kelihatan kecil. Tapi pas dijadiin sistem, efeknya kerasa.`,
        'Yang paling penting buat aku adalah ngerti rasa "bosan" itu sebenernya tanda lagi konsisten, bukan tanda harus berhenti.',
        'Aku bukan bilang ini cara paling benar. Cuma yang akhirnya cocok di aku setelah coba banyak metode.',
      ])
    )
  }
  paragraphs.push(pick(CLOSERS))
  return paragraphs.join('\n\n')
}

function pickThumb(category) {
  const pool = THUMBS_BY_CATEGORY[category] || THUMBS_BY_CATEGORY.Lifestyle
  return pick(pool)
}

/* -------------------------------------------------------------------------- */
/*  Engagement count derivation                                                */
/* -------------------------------------------------------------------------- */
function deriveEngagementCounts({ author, category, ageDays, isPremium }) {
  // Author popularity dominates the mean.
  const base = 0.35 * author.popularity + 0.15 // 0.15..0.5

  // Recency boost — content under 7 days fresh gets a noticeable bump.
  const recencyBoost = ageDays < 7 ? 0.18 : ageDays < 21 ? 0.08 : 0

  // A small percentage of posts go viral.
  const viralBoost = chance(0.06 + author.popularity * 0.08) ? 0.45 : 0

  const popularity = Math.max(0, Math.min(1, base + recencyBoost + viralBoost))

  let likes = engagementSample({ popularity, max: CONFIG.MAX_LIKES_PER_POST })
  // Premium-locked posts naturally get a bit fewer likes (smaller reach).
  if (isPremium) likes = Math.floor(likes * 0.55)

  // Bookmarks correlate with likes but skew higher for educational content.
  const bookmarkRatio = (BOOKMARK_HEAVY.has(category) ? 0.55 : 0.32) * (0.6 + 0.8 * rand())
  const bookmarks = Math.min(
    CONFIG.MAX_BOOKMARKS_PER_POST,
    Math.floor(likes * bookmarkRatio)
  )

  // Comments are a fraction of likes.
  const commentRatio = 0.05 + 0.20 * rand()
  const comments = Math.floor(likes * commentRatio)

  // Views >> likes; viral posts can hit ~50k.
  const viewMultiplier = 6 + Math.floor(rand() * 40) + (viralBoost ? 80 : 0)
  const views = Math.min(
    CONFIG.MAX_VIEWS_PER_POST,
    Math.max(50, likes * viewMultiplier + randInt(50, 600))
  )

  // Trending score — simple blend that exceeds 50 only for clearly hot posts.
  const trendingScore = Math.round(
    likes * 0.4 + comments * 1.2 + bookmarks * 0.8 + (ageDays < 5 ? 18 : 0) + (viralBoost ? 35 : 0)
  )

  return { likes, bookmarks, comments, views, trendingScore }
}

/* -------------------------------------------------------------------------- */
/*  Build post rows                                                            */
/* -------------------------------------------------------------------------- */
export function buildPostBlueprints(users) {
  // Skip "lurker" tier when assigning posts, but keep their accounts in the
  // community. Top creators publish proportionally more.
  const authorPool = []
  for (const u of users) {
    if (u.activityTier === 'lurker') continue
    for (let i = 0; i < u.prolific; i++) authorPool.push(u)
  }

  // Trim/extend to hit POST_COUNT.
  while (authorPool.length < CONFIG.POST_COUNT) {
    authorPool.push(pick(users.filter((u) => u.activityTier !== 'lurker')))
  }
  authorPool.length = CONFIG.POST_COUNT

  const usedTitles = new Set()
  const blueprints = []

  for (const author of authorPool) {
    const category = pick(
      author.profession.topics?.length
        ? author.profession.topics
        : Object.keys(TITLE_TEMPLATES_BY_CATEGORY)
    )
    const title = pickTitle(category, usedTitles)
    const createdAt = randomCreatedAt()
    const ageDays = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 86_400_000)
    const isPremiumPost = author.isPremium && chance(0.18)
    const hasThumb = chance(0.78)
    const counts = deriveEngagementCounts({ author, category, ageDays, isPremium: isPremiumPost })

    blueprints.push({
      author,
      ageDays,
      title,
      excerpt: buildExcerpt(title),
      content: buildBody(category),
      category,
      thumbnail_url: hasThumb ? pickThumb(category) : null,
      is_premium: isPremiumPost,
      created_at: createdAt,
      counts,
    })
  }
  return blueprints
}

export async function insertPosts(blueprints) {
  log.step(`Posts · publishing ${blueprints.length} insights`)

  const rows = blueprints.map((bp) => ({
    title: bp.title,
    excerpt: bp.excerpt,
    content: bp.content,
    category: bp.category,
    thumbnail_url: bp.thumbnail_url,
    user_id: bp.author.id,
    is_premium: bp.is_premium,
    likes_count: bp.counts.likes,
    bookmarks_count: bp.counts.bookmarks,
    comments_count: bp.counts.comments,
    views_count: bp.counts.views,
    trending_score: bp.counts.trendingScore,
    created_at: bp.created_at,
    updated_at: bp.created_at,
  }))

  /* Insert + read back IDs in chunks so each post id is correlated to its
     blueprint for downstream generators. */
  const idByIndex = new Array(rows.length)
  let inserted = 0
  for (let i = 0; i < rows.length; i += CONFIG.BATCH_POSTS) {
    const chunk = rows.slice(i, i + CONFIG.BATCH_POSTS)
    const { data, error } = await admin
      .from('posts')
      .insert(chunk)
      .select('id, created_at, user_id')
    if (error) throw new Error(`posts insert failed at chunk ${i}: ${error.message}`)
    data.forEach((row, j) => {
      idByIndex[i + j] = row.id
    })
    inserted += chunk.length
    progress(inserted, rows.length, 'posts')
  }

  // Stitch ids back into the blueprints we return.
  blueprints.forEach((bp, i) => {
    bp.id = idByIndex[i]
    bp.isTrending = bp.counts.trendingScore >= TRENDING_THRESHOLD
  })

  const trendingCount = blueprints.filter((b) => b.isTrending).length
  log.ok(`${blueprints.length} posts inserted · ${trendingCount} trending`)
  return blueprints
}
