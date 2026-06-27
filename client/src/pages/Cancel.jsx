import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-10 max-w-md w-full text-center border border-rose-500/20"
      >
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4 dark:text-white text-rose-600">Payment Cancelled</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Your payment process was interrupted or cancelled. No charges were made.
        </p>
        <button 
          onClick={() => navigate('/pricing')}
          className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
        >
          Return to Pricing
        </button>
      </motion.div>
    </div>
  );
};

export default Cancel;
