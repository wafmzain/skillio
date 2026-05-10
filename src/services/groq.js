import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, move to backend
})

/**
 * Generate AI summary for creator content using Groq API
 * @param {string} content - The content to summarize
 * @returns {Promise<Object>} - Success/error response with summary
 */
export async function generateSummary(content) {
  console.log('🤖 [Groq] Starting generateSummary...')
  console.log('📝 [Groq] Content length:', content?.length)
  
  try {
    // Validate input
    if (!content || content.trim().length === 0) {
      console.error('❌ [Groq] Content is empty')
      return {
        success: false,
        error: 'Konten tidak boleh kosong'
      }
    }

    // Check API key
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      console.error('❌ [Groq] API key not configured')
      return {
        success: false,
        error: 'API key tidak dikonfigurasi'
      }
    }

    console.log('🔑 [Groq] API Key configured:', !!apiKey)
    console.log('📤 [Groq] Sending request to Groq API...')

    // Create the prompt
    const prompt = `Ringkas insight creator berikut menjadi:

1. Poin Utama
2. Workflow Singkat
3. Tools yang Digunakan
4. Key Takeaway

Gunakan bahasa Indonesia yang clean, singkat, modern, dan mudah dipahami creator.
Format output dengan struktur yang jelas dan rapi.

Content:
${content}

Berikan ringkasan yang padat, actionable, dan langsung to the point.`

    // Generate summary using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 1,
      stream: false
    })

    console.log('📥 [Groq] Received response from Groq API')

    // Extract summary from response
    const summary = completion.choices[0]?.message?.content

    if (!summary || summary.trim().length === 0) {
      console.error('❌ [Groq] Empty response from API')
      return {
        success: false,
        error: 'Gagal menghasilkan ringkasan. Coba lagi.'
      }
    }

    console.log('✅ [Groq] Summary generated successfully')
    console.log('📝 [Groq] Summary length:', summary.length)

    return {
      success: true,
      data: summary.trim()
    }

  } catch (error) {
    console.error('❌ [Groq] Error generating summary:', error)
    console.error('❌ [Groq] Error name:', error.name)
    console.error('❌ [Groq] Error message:', error.message)

    // Handle specific errors
    let errorMessage = 'Gagal membuat ringkasan AI'

    if (error.message?.includes('API key')) {
      errorMessage = 'API key tidak valid'
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = 'Quota API habis. Coba lagi nanti.'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Koneksi bermasalah. Periksa internet Anda.'
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Coba lagi.'
    } else if (error.status === 429) {
      errorMessage = 'Terlalu banyak request. Tunggu sebentar.'
    } else if (error.status === 401) {
      errorMessage = 'API key tidak valid atau expired'
    } else if (error.status === 500) {
      errorMessage = 'Server AI bermasalah. Coba lagi nanti.'
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Validate content before generating summary
 * @param {string} content - The content to validate
 * @returns {boolean} - Whether content is valid
 */
export function validateContent(content) {
  if (!content || typeof content !== 'string') {
    return false
  }

  const trimmed = content.trim()
  
  // Minimum 50 characters
  if (trimmed.length < 50) {
    return false
  }

  // Maximum 50000 characters
  if (trimmed.length > 50000) {
    return false
  }

  return true
}

/**
 * Security Note:
 * 
 * PRODUCTION RECOMMENDATION:
 * - Move this API call to backend/server function
 * - Use server-side environment variables
 * - Implement rate limiting
 * - Add request validation
 * - Monitor usage and costs
 * 
 * CURRENT SETUP (MVP):
 * - Frontend implementation for quick development
 * - API key exposed in browser (not recommended for production)
 * - Direct API calls from client
 */