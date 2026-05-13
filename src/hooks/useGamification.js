import { useEffect, useState, useCallback } from 'react'
import {
  getUserPoints,
  getUserBadges,
  getAvailableRewards,
  getUserRedemptions,
  getLeaderboard,
  claimDailyLogin,
  redeemReward,
  canClaimToday,
  getPointHistory,
} from '../services/gamification'

/**
 * useGamification — main hook for the gamification system.
 * Provides points, rank, badges, rewards, and actions.
 */
export function useGamification(userId) {
  const [points, setPoints] = useState(0)
  const [rank, setRank] = useState('Beginner')
  const [lastDailyClaim, setLastDailyClaim] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [pointsData, badgesData] = await Promise.all([
      getUserPoints(userId),
      getUserBadges(userId),
    ])
    setPoints(pointsData.points)
    setRank(pointsData.rank)
    setLastDailyClaim(pointsData.lastDailyClaim)
    setBadges(badgesData.data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const dailyClaimAvailable = canClaimToday(lastDailyClaim)

  const handleDailyClaim = useCallback(async () => {
    if (!userId) return { success: false, error: 'Not logged in' }
    const result = await claimDailyLogin(userId)
    if (result.success) {
      setPoints(result.newPoints || points + 3)
      setLastDailyClaim(new Date().toISOString())
    }
    return result
  }, [userId, points])

  return {
    points,
    rank,
    badges,
    loading,
    dailyClaimAvailable,
    handleDailyClaim,
    refetch,
  }
}

/**
 * useLeaderboard — fetches the global leaderboard.
 */
export function useLeaderboard({ limit = 20 } = {}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getLeaderboard({ limit })
    if (error) setError(error.message)
    setUsers(data)
    setLoading(false)
  }, [limit])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { users, loading, error, refetch }
}

/**
 * useRewards — available rewards + user redemption history.
 */
export function useRewards(userId) {
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const [rewardsRes, redemptionsRes] = await Promise.all([
      getAvailableRewards(),
      userId ? getUserRedemptions(userId) : Promise.resolve({ data: [] }),
    ])
    if (rewardsRes.error) setError(rewardsRes.error.message)
    setRewards(rewardsRes.data)
    setRedemptions(redemptionsRes.data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleRedeem = useCallback(
    async (rewardId) => {
      if (!userId) return { success: false, error: 'Not logged in' }
      const result = await redeemReward(userId, rewardId)
      if (result.success) await refetch()
      return result
    },
    [userId, refetch]
  )

  return { rewards, redemptions, loading, error, handleRedeem, refetch }
}

/**
 * usePointHistory — transaction log.
 */
export function usePointHistory(userId, limit = 20) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    let alive = true
    getPointHistory(userId, limit).then(({ data }) => {
      if (alive) {
        setHistory(data)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [userId, limit])

  return { history, loading }
}
