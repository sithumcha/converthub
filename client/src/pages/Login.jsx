import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 flex justify-center items-center gap-2 disabled:opacity-70 shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          Don't have an account? {' '}
          <Link to="/signup" className="text-indigo-600 hover:underline font-bold">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
