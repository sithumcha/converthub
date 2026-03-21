import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, FolderSync, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { title: 'PDF Toolkit', path: '/pdf' },
    { title: 'Image Studio', path: '/images' },
    { title: 'Pricing', path: '/pricing' }
  ];

  return (
    <nav className="glass sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center transition-colors">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <FolderSync size={20} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ConvertHub
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 text-slate-600 dark:text-slate-300">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition-all font-medium text-sm relative group ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-600'
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
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
            PRO
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
              <User size={18} />
            </Link>
            <button onClick={logout} className="p-2 rounded-full hover:bg-red-50 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-indigo-600 font-medium text-sm">Login</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 glass mt-2 p-4 rounded-b-2xl shadow-xl flex flex-col gap-2 md:hidden z-50 border-t border-slate-200 dark:border-slate-700"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl transition-all ${location.pathname === link.path
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="font-medium">{link.title}</span>
              </Link>
            ))}

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="flex gap-3">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User size={20} />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={20} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-2 text-indigo-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary py-2 px-5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;