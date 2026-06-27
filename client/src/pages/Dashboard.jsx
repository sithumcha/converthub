import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, FileText, Zap, HardDrive, Timer, ArrowRight, FilePlus, ImageIcon, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ history: [], chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        const res = await axios.get(`${SERVER_URL}/api/user/dashboard`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        // Fallback mock data if server fails or history is empty
        setData({
          history: [
            { _id: '1', fileName: 'Q3_Financial_Report.pdf', action: 'merge', fileType: 'pdf', createdAt: new Date().toISOString(), status: 'completed' },
            { _id: '2', fileName: 'profile_pic_raw.png', action: 'remove-bg', fileType: 'image', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
            { _id: '3', fileName: 'presentation_deck.pptx', action: 'to-pdf', fileType: 'document', createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
            { _id: '4', fileName: 'video_compressed.mp4', action: 'compress', fileType: 'video', createdAt: new Date(Date.now() - 259200000).toISOString(), status: 'failed' }
          ],
          chartData: [
            { date: 'Mon', conversions: 2 },
            { date: 'Tue', conversions: 5 },
            { date: 'Wed', conversions: 3 },
            { date: 'Thu', conversions: 8 },
            { date: 'Fri', conversions: 4 },
            { date: 'Sat', conversions: 12 },
            { date: 'Sun', conversions: 7 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - ConvertHub</title>
      </Helmet>
      
      {/* Dynamic Background Blob */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none" />
      
      <div className="py-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-brand-500/30">
              {getInitials(user?.username || user?.name)}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Welcome back,</p>
              <h1 className="text-4xl font-black dark:text-white capitalize tracking-tight">
                {user?.username || user?.name || 'User'}
              </h1>
            </div>
          </div>
          {user?.tier !== 'pro' && (
            <button onClick={() => window.location.href = '/pricing'} className="btn-primary py-3 px-6 shadow-brand-500/25 flex items-center gap-2">
              <Zap size={18} /> Upgrade to PRO
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FilePlus size={24} />, name: 'Merge PDF', color: 'from-blue-500 to-cyan-500', link: '/pdf' },
              { icon: <ImageIcon size={24} />, name: 'Remove BG', color: 'from-rose-500 to-orange-500', link: '/images' },
              { icon: <Zap size={24} />, name: 'Compress File', color: 'from-emerald-500 to-teal-500', link: '/pdf' },
              { icon: <Settings size={24} />, name: 'Settings', color: 'from-slate-500 to-slate-700', link: '/dashboard' }
            ].map((action, i) => (
              <Link to={action.link} key={i}>
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-panel p-4 flex flex-col items-center justify-center text-center gap-3 cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-lg`}>
                    {action.icon}
                  </div>
                  <span className="font-bold text-sm dark:text-slate-200">{action.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={<Activity size={24} />} 
            title="Total Conversions" 
            value={data.history.length * 5 || 24} 
            subtitle="+12% this week" 
            color="text-brand-500" 
            bg="bg-brand-50 dark:bg-brand-500/10" 
          />
          <StatCard 
            icon={<Zap size={24} />} 
            title="Daily Limits" 
            value={user?.tier === 'pro' ? 'Unlimited' : '8/10'} 
            subtitle="Resets in 4h" 
            color="text-amber-500" 
            bg="bg-amber-50 dark:bg-amber-500/10" 
          />
          <StatCard 
            icon={<HardDrive size={24} />} 
            title="Storage Used" 
            value="1.2 GB" 
            subtitle="of 5.0 GB total" 
            color="text-emerald-500" 
            bg="bg-emerald-50 dark:bg-emerald-500/10" 
          />
          <StatCard 
            icon={<Timer size={24} />} 
            title="Time Saved" 
            value="4.5 hrs" 
            subtitle="Estimated vs manual" 
            color="text-purple-500" 
            bg="bg-purple-50 dark:bg-purple-500/10" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 glass-panel p-8 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xl font-black dark:text-white">Activity Analytics</h3>
              <select className="bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold rounded-lg px-3 py-2 outline-none dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-[320px] w-full relative z-10">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium animate-pulse">Loading analytics...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-200)" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="conversions" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorConversions)" activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* History */}
          <div className="glass-panel p-8 flex flex-col h-[450px] border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
                <Clock size={22} className="text-brand-500" /> Recent Files
              </h3>
              <button className="text-brand-500 text-sm font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col gap-4 mt-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                </div>
              ) : data.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <FileText size={24} />
                  </div>
                  <p className="text-slate-500 font-medium">No recent conversions</p>
                  <Link to="/pdf" className="text-brand-500 font-bold mt-2 hover:underline">Start converting</Link>
                </div>
              ) : (
                data.history.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                      {item.fileType === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold dark:text-white truncate">{item.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">{item.action}</span>
                        <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${item.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`} title={item.status} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color, bg }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel p-6 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 ${bg} rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-50`} />
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`${bg} ${color} p-3 rounded-2xl`}>
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-black dark:text-white tracking-tight mb-1">{value}</h3>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </motion.div>
);

export default Dashboard;