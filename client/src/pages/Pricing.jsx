import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { Check, Zap, Shield, Rocket, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await paymentService.createCheckoutSession();
      if (res.data.success) {
        window.location.href = res.data.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for occasional conversions',
      features: [
        '5 conversions per day',
        'Max file size: 10MB',
        'Standard processing speed',
        'Basic Image & PDF tools',
        'Standard conversion quality'
      ],
      buttonText: 'Current Plan',
      isCurrent: user?.tier === 'free' || !user,
      highlight: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      description: 'For power users and professionals',
      features: [
        '100 conversions per day',
        'Max file size: 50MB',
        'Priority high-speed processing',
        'AI Background Removal',
        'Batch processing & downloads',
        'Premium 24/7 support'
      ],
      buttonText: 'Upgrade to PRO',
      isCurrent: user?.tier === 'pro',
      highlight: true
    }
  ];

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold mb-6 dark:text-white"
        >
          Choose Your Plan
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 dark:text-slate-400"
        >
          Simple, transparent pricing for all your file conversion needs.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-10 rounded-[2.5rem] border-2 transition-all duration-500 ${
              plan.highlight 
                ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-200 dark:shadow-none scale-105 z-10' 
                : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 dark:text-white uppercase tracking-wider">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-extrabold dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className={`p-1 rounded-full ${plan.highlight ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={plan.highlight && !plan.isCurrent ? handleUpgrade : undefined}
              disabled={loading || plan.isCurrent}
              className={`w-full py-4 rounded-3xl font-bold transition-all flex items-center justify-center gap-3 ${
                plan.isCurrent 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95'
              }`}
            >
              {loading && plan.highlight ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Starting Checkout...
                </>
              ) : (
                <>
                  {plan.buttonText}
                  {plan.highlight && !plan.isCurrent && <Zap size={18} fill="currentColor" />}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {[
          { icon: <Shield className="text-indigo-500" />, title: 'Secure Payments', desc: 'PCI-compliant processing via Stripe' },
          { icon: <Rocket className="text-indigo-500" />, title: 'Instant Upgrade', desc: 'Get pro features immediately after payment' },
          { icon: <Check className="text-indigo-500" />, title: 'Cancel Anytime', desc: 'Manage subscriptions easily from your settings' }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="text-center p-6"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {item.icon}
            </div>
            <h4 className="font-bold dark:text-white mb-2">{item.title}</h4>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
