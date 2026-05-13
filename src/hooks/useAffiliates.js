import { useEffect, useState, useCallback } from 'react'
import {
  fetchAffiliates,
  fetchTopAffiliates,
  fetchAffiliateAnalytics,
} from '../services/affiliateService'

/**
 * useAffiliates — list with optional category + featured filter
 */
export function useAffiliates({ category = null, featuredOnly = false, limit = 50 } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchAffiliates({ category, featuredOnly, limit })
    if (error) setError(error.message || 'Gagal memuat rekomendasi')
    setItems(data)
    setLoading(false)
  }, [category, featuredOnly, limit])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { items, loading, error, refetch }
}

/**
 * useTopAffiliates — most-clicked products (for sidebar widget)
 */
export function useTopAffiliates(limit = 5) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchTopAffiliates(limit).then(({ data, error }) => {
      if (!alive) return
      if (error) setError(error.message || 'Gagal memuat rekomendasi')
      setItems(data || [])
      setLoading(false)
    })
    return () => { alive = false }
  }, [limit])

  return { items, loading, error }
}

/**
 * useAffiliateAnalytics — totals, top products, and click breakdown
 */
export function useAffiliateAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    totalProducts: 0,
    topProducts: [],
    clicksByCategory: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchAffiliateAnalytics()
    if (error) setError(error.message || 'Gagal memuat analytics')
    setAnalytics(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { analytics, loading, error, refetch }
}
