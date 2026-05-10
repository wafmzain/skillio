import { supabase } from './supabaseClient'

export async function upgradeToPremium(userId, paymentType = 'dummy') {
  try {
    // Calculate expiry date (30 days from now)
    const startedAt = new Date()
    const expiredAt = new Date()
    expiredAt.setDate(expiredAt.getDate() + 30)

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan: 'skillio_plus',
          status: 'active',
          payment_type: paymentType,
          started_at: startedAt.toISOString(),
          expired_at: expiredAt.toISOString()
        }
      ])
      .select()
      .single()

    if (subError) throw subError

    // Update profile to premium
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true, subscription }
  } catch (error) {
    console.error('Error upgrading to premium:', error)
    return { success: false, error: error.message }
  }
}

export async function cancelSubscription(userId) {
  try {
    // Get active subscription
    const { data: subscription, error: getError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (getError) throw getError

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id)

    if (updateError) throw updateError

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return { success: false, error: error.message }
  }
}

export async function getSubscriptionDetails(userId) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, subscription: data }
  } catch (error) {
    console.error('Error getting subscription details:', error)
    return { success: false, error: error.message }
  }
}
