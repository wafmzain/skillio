import { useState } from 'react'
import { Link } from 'react-router-dom'
import PremiumBadge from './PremiumBadge'

function PremiumPaywall({ onUpgrade, compact = false }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const features = [
    { icon: '🔓', text: 'Unlock all premium insights' },
    { icon: '🤖', text: 'AI summary unlimited' },
    { icon: '✦', text: 'Premium creator badge' },
    { icon: '📚', text: 'Exclusive workflows & templates' },
    { icon: '🎯', text: 'Priority support' },
    { icon: '🚀', text: 'Early access to new features' }
  ]

  if (compact) {
    return (
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex mb-4">
            <PremiumBadge size="large" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Skillio+ Exclusive
          </h3>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Unlock deeper creator insights and premium workflows
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full px-6 py-3.5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 hover:scale-105 transition-all shadow-xl"
          >
            Upgrade to Skillio+
          </button>
        </div>

        {showUpgradeModal && (
          <UpgradeModal 
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={onUpgrade}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl p-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex mb-6">
          <PremiumBadge size="large" />
        </div>
        
        <h2 className="text-4xl font-black text-white mb-4">
          Skillio+ Exclusive Content
        </h2>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Unlock deeper creator insights, premium workflows, and exclusive content from top creators
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-white font-semibold">{feature.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl"
        >
          Upgrade to Skillio+ — Rp 49.000/bulan
        </button>
      </div>

      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={onUpgrade}
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

  const features = [
    'Unlock all premium insights',
    'AI summary unlimited',
    'Premium creator badge',
    'Exclusive workflows & templates',
    'Priority support',
    'Early access to new features'
  ]

  async function handleSimulatePayment() {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (onUpgrade) {
      await onUpgrade(selectedPayment)
    }
    
    setProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
        >
          <span className="text-xl">✕</span>
        </button>

        {/* Header */}
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
          {/* Pricing */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 font-semibold">Monthly Plan</span>
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                <span>🔥</span>
                <span>BEST VALUE</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">Rp 49.000</span>
              <span className="text-slate-500">/bulan</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 mb-4">What you'll get:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
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

          {/* Simulate Payment Button */}
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

export default PremiumPaywall
