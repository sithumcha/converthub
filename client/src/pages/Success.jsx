import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Optionally trigger a confim endpoint here, or just trust the webhook and redirect
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-10 max-w-md w-full text-center border border-emerald-500/20"
      >
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4 dark:text-white text-emerald-600">Payment Successful!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Welcome to ConvertHub PRO! Your account has been upgraded. You now have access to unlimited conversions.
        </p>
        <p className="text-sm text-slate-400 mb-6">Redirecting to your dashboard in a few seconds...</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </motion.div>
    </div>
  );
};

export default Success;
