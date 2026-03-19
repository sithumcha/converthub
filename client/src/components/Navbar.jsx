import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, FolderSync } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { title: 'PDF Toolkit', path: '/pdf' },
    { title: 'Image Studio', path: '/images' },
    { title: 'Pricing', path: '/pricing' }
  ];

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-colors">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <FolderSync size={24} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ConvertHub
          </span>
        </Link>
      </motion.div>

      <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300">
        {navLinks.map((link) => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`transition-all font-medium text-sm relative group ${
              location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-600'
            }`}
          >
            {link.title}
            {location.pathname === link.path && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </Link>
        ))}
        
        {user?.tier === 'pro' && (
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-tighter shadow-lg shadow-indigo-100">
            PRO
          </span>
        )}

        <motion.button 
          whileHover={{ rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="group hover:text-indigo-600 transition-colors flex items-center gap-1">
              <motion.div whileHover={{ y: -2 }}>
                <User size={18} />
              </motion.div>
              <span className="hidden sm:inline font-medium">{user.username}</span>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#ef4444' }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-indigo-600 transition-colors font-medium">
              Login
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
