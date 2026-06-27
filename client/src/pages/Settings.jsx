import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, CreditCard, Shield, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService, paymentService } from '../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Settings = () => {
  const { user, login } = useAuth(); // Assuming login context can just update user state or we force reload
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [username, setUsername] = useState(user?.username || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Subscription State
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username cannot be empty');
    
    setIsUpdatingProfile(true);
    try {
      const res = await userService.updateProfile(username);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        // A simple reload to reflect changes in context, or ideally update AuthContext state
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error('New password cannot be empty');
    
    setIsUpdatingPassword(true);
    try {
      const res = await userService.updatePassword(currentPassword, newPassword);
      if (res.data.success) {
        toast.success(res.data.message);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your PRO subscription? You will lose access to premium features immediately.')) return;
    
    setIsCancelling(true);
    try {
      const res = await paymentService.cancelSubscription();
      if (res.data.success) {
        toast.success('Subscription cancelled');
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Key size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and subscription</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
                activeTab === tab.id 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                  <User className="text-indigo-500" /> Public Profile
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-2">Email cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile || username === user?.username}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                  <Shield className="text-indigo-500" /> Security Settings
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Leave blank if logging in with Google"
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword || !newPassword}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                  <CreditCard className="text-indigo-500" /> Subscription Plan
                </h2>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Current Plan</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black dark:text-white capitalize">{user?.tier || 'Free'}</span>
                      {user?.tier === 'pro' && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold rounded-md">ACTIVE</span>}
                    </div>
                  </div>
                  {user?.tier === 'free' && (
                    <a href="/pricing" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                      Upgrade to PRO
                    </a>
                  )}
                </div>

                {user?.tier === 'pro' && (
                  <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6">
                    <h3 className="text-rose-600 dark:text-rose-400 font-bold mb-2 flex items-center gap-2">
                      <AlertTriangle size={18} /> Cancel Subscription
                    </h3>
                    <p className="text-rose-500/80 dark:text-rose-400/80 text-sm mb-4">
                      Canceling your subscription will immediately revoke your PRO features. You will be downgraded to the Free tier.
                    </p>
                    <button 
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCancelling ? <Loader2 size={16} className="animate-spin" /> : 'Cancel Subscription'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
