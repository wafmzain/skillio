import { useState, useCallback } from 'react'
import { generateSummary, validateContent } from '../services/groq'

/**
 * Custom hook for AI Summary functionality
 * Handles loading, error states, and summary generation
 */
export function useAISummary() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Generate AI summary for content
   * @param {string} content - Content to summarize
   * @returns {Promise<Object>} - Result object
   */
  const handleGenerateSummary = useCallback(async (content) => {
    console.log('🎯 [useAISummary] Starting handleGenerateSummary...')
    console.log('📝 [useAISummary] Content length:', content?.length)
    
    // Reset states
    setSummary(null)
    setError(null)
    setLoading(true)

    try {
      // Validate content
      console.log('✅ [useAISummary] Validating content...')
      if (!validateContent(content)) {
        console.error('❌ [useAISummary] Content validation failed')
        throw new Error('Konten terlalu pendek atau tidak valid untuk diringkas (minimal 50 karakter)')
      }
      console.log('✅ [useAISummary] Content validation passed')

      // Generate summary
      console.log('🤖 [useAISummary] Generating summary...')
      const result = await generateSummary(content)
      console.log('📥 [useAISummary] Result:', result)
      
      if (!result.success) {
        console.error('❌ [useAISummary] Generation failed:', result.error)
        throw new Error(result.error)
      }

      console.log('✅ [useAISummary] Summary generated successfully')
      setSummary(result.data)
      
      return {
        success: true,
        data: result.data
      }

    } catch (err) {
      console.error('❌ [useAISummary] Error:', err)
      const errorMessage = err.message || 'Gagal membuat ringkasan AI'
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
      console.log('🏁 [useAISummary] handleGenerateSummary completed')
    }
  }, [])

  /**
   * Reset summary state
   */
  const resetSummary = useCallback(() => {
    console.log('🔄 [useAISummary] Resetting summary state')
    setSummary(null)
    setError(null)
  }, [])

  /**
   * Retry generating summary with same content
   */
  const retrySummary = useCallback(async (content) => {
    console.log('🔄 [useAISummary] Retrying summary generation')
    return await handleGenerateSummary(content)
  }, [handleGenerateSummary])

  return {
    // States
    summary,
    loading,
    error,
    
    // Actions
    handleGenerateSummary,
    resetSummary,
    retrySummary
  }
}