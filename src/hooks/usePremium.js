import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function usePremium(userId) {
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      checkPremiumStatus()
    } else {
      setIsPremium(false)
      setSubscription(null)
      setLoading(false)
    }
  }, [userId])

  async function checkPremiumStatus() {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Get active subscription
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError && subError.code !== 'PGRST116') throw subError

      // Check if subscription is expired
      if (sub && new Date(sub.expired_at) < new Date()) {
        await expireSubscription(sub.id, userId)
        setIsPremium(false)
        setSubscription(null)
      } else {
        setIsPremium(profile?.is_premium || false)
        setSubscription(sub)
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
      setIsPremium(false)
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }

  async function expireSubscription(subscriptionId, userId) {
    try {
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscriptionId)

      // Update profile
      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', userId)
    } catch (error) {
      console.error('Error expiring subscription:', error)
    }
  }

  return { isPremium, subscription, loading, refetch: checkPremiumStatus }
}

export async function checkUserPremium(userId) {
  if (!userId) return false

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single()

    if (error) throw error
    return profile?.is_premium || false
  } catch (error) {
    console.error('Error checking user premium:', error)
    return false
  }
}
