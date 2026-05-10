import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './services/supabaseClient'
import { usePremium } from './hooks/usePremium'
import { upgradeToPremium, cancelSubscription } from './services/premiumService'
import PremiumBadge from './components/PremiumBadge'

function Premium() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const navigate = useNavigate()

  const { isPremium, subscription, loading: premiumLoading, refetch } = usePremium(currentUser?.id)

  useEffect(() => {
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    setLoading(false)
  }

  async function handleUpgrade(paymentType) {
    if (!currentUser) return

    const result = await upgradeToPremium(currentUser.id, paymentType)
    
    if (result.success) {
      await refetch()
      alert('🎉 Selamat! Anda sekarang adalah member Skillio+')
    } else {
      alert('Gagal upgrade: ' + result.error)
    }
  }

  async function handleCancel() {
    if (!confirm('Apakah Anda yakin ingin membatalkan subscription?')) return

    const result = await cancelSubscription(currentUser.id)
    
    if (result.success) {
      await refetch()
      alert('Subscription berhasil dibatalkan')
    } else {
      alert('Gagal membatalkan: ' + result.error)
    }
  }

  if (loading || premiumLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const features = [
    {
      icon: '🔓',
      title: 'Unlock Premium Insights',
      description: 'Access exclusive content from top creators and industry experts'
    },
    {
      icon: '🤖',
      title: 'AI Summary Unlimited',
      description: 'Get instant AI-powered summaries of any content, unlimited usage'
    },
    {
      icon: '✦',
      title: 'Premium Creator Badge',
      description: 'Stand out with an exclusive badge on your profile and posts'
    },
    {
      icon: '📚',
      title: 'Exclusive Workflows',
      description: 'Download premium templates, workflows, and resources'
    },
    {
      icon: '🎯',
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support'
    },
    {
      icon: '🚀',
      title: 'Early Access',
      description: 'Be the first to try new features and updates'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Designer',
      role: 'UI/UX Designer',
      avatar: '👩‍🎨',
      text: 'Skillio+ helped me level up my design workflow. The premium insights are worth every penny!'
    },
    {
      name: 'Alex Developer',
      role: 'Full Stack Developer',
      avatar: '👨‍💻',
      text: 'AI summaries save me hours every week. Best investment for my productivity.'
    },
    {
      name: 'Maya Marketer',
      role: 'Digital Marketer',
      avatar: '👩‍💼',
      text: 'The exclusive content and templates are game-changers for my marketing campaigns.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-20 text-center">
          <div className="inline-flex mb-6">
            <PremiumBadge size="large" />
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Unlock Your Creative
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Potential
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators who are accelerating their growth with Skillio+ premium membership
          </p>

          {!isPremium ? (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all"
            >
              <span className="flex items-center gap-3">
                <span>Upgrade to Skillio+</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          ) : (
            <div className="inline-flex flex-col items-center gap-4">
              <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl">
                <span className="flex items-center gap-3">
                  <span>✓</span>
                  <span>You're a Skillio+ Member</span>
                </span>
              </div>
              {subscription && (
                <p className="text-sm text-slate-600">
                  Active until {new Date(subscription.expired_at).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black text-slate-900 text-center mb-12">
          Everything You Need to Succeed
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>🔥</span>
                <span>LIMITED TIME OFFER</span>
              </div>
              <h2 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-purple-200">One plan, unlimited possibilities</p>
            </div>

            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-black">Rp 49.000</span>
                  <span className="text-xl text-purple-200">/bulan</span>
                </div>
                <p className="text-purple-200">Billed monthly, cancel anytime</p>
              </div>

              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">✓</span>
                    </div>
                    <span className="text-white">{feature.title}</span>
                  </div>
                ))}
              </div>

              {!isPremium ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl"
                >
                  Get Started Now
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-center">
                    ✓ Active Subscription
                  </div>
                  <button
                    onClick={handleCancel}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold transition-all"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black text-slate-900 text-center mb-12">
          Loved by Creators
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  )
}

function UpgradeModal({ onClose, onUpgrade }) {
  const [selectedPayment, setSelectedPayment] = useState('qris')
  const [processing, setProcessing] = useState(false)

  const paymentMethods = [
    { id: 'qris', name: 'QRIS', icon: '📱', popular: true },
    { id: 'gopay', name: 'GoPay', icon: '💚' },
    { id: 'dana', name: 'DANA', icon: '💙' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
  ]

  async function handleSimulatePayment() {
    setProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await onUpgrade(selectedPayment)
    setProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
        >
          <span className="text-xl">✕</span>
        </button>

        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex mb-4">
              <PremiumBadge size="large" />
            </div>
            <h2 className="text-3xl font-black mb-2">Upgrade to Skillio+</h2>
            <p className="text-purple-100">Unlock premium features and exclusive content</p>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">Rp 49.000</span>
              <span className="text-slate-500">/bulan</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-slate-900 mb-4">Select Payment Method:</h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    selectedPayment === method.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  {method.popular && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-slate-900">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              processing
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl hover:scale-105'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              'Simulate Payment Success'
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            This is a demo payment. No real transaction will occur.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Premium
