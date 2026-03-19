import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, PartyPopper, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UpgradeSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { verifySession } = useAuth();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Small delay to ensure webhook has time to process
      const timer = setTimeout(async () => {
        await verifySession(sessionId);
        setVerifying(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setVerifying(false);
    }
  }, [sessionId, verifySession]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100 dark:border-slate-800"
      >
        <div className="relative inline-block mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 size={56} />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-2 -right-2 text-indigo-500"
          >
            <Sparkles size={32} />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold mb-4 dark:text-white"
        >
          Welcome to ConvertHub PRO!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed"
        >
          {verifying 
            ? "We're verifying your subscription... almost there!" 
            : "Your account has been successfully upgraded. You now have full access to all premium features and high daily limits."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
            <PartyPopper className="text-indigo-500" size={24} />
            <div className="text-left">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
              <p className="font-bold dark:text-white">Active Pro</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="text-green-500" size={24} />
            <div className="text-left">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Payments</p>
              <p className="font-bold dark:text-white">Verified</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4"
        >
          <Link
            to="/dashboard"
            className="btn-primary py-4 px-8 flex items-center justify-center gap-2 text-lg shadow-xl shadow-indigo-100"
          >
            Go to Dashboard <ArrowRight size={20} />
          </Link>
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-indigo-600 font-bold transition-all text-sm"
          >
            Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpgradeSuccess;
