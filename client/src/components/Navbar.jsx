import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, FolderSync, Menu, X, Languages, ChevronDown, Image as ImageIcon, FileText, Video, Layers, ScanText, Sparkles, Globe, Mic, Settings } from 'lucide-react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  // Handle scroll effect
  useState(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('si') ? 'en' : 'si');
  };

  const toolLinks = [
    { title: t('nav.pdfToolkit') || 'PDF Tools', path: '/pdf', icon: <FileText size={16} /> },
    { title: t('nav.imageStudio') || 'Image Tools', path: '/images', icon: <ImageIcon size={16} /> },
    { title: t('nav.mediaConverter') || 'Media Converter', path: '/media', icon: <Video size={16} /> },
    { title: t('nav.batchProcessing') || 'Batch Processing', path: '/batch', icon: <Layers size={16} /> },
    { title: t('nav.ocrScanner') || 'AI OCR', path: '/ocr', icon: <ScanText size={16} /> },
    { title: t('nav.aiAssistant') || 'AI Assistant', path: '/ai-assistant', icon: <Sparkles size={16} /> },
    { title: t('nav.webCapture') || 'Web to PDF', path: '/web-capture', icon: <Globe size={16} /> },
    { title: t('nav.textToSpeech') || 'Text to Speech', path: '/tts', icon: <Mic size={16} /> },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`sticky top-4 z-50 mx-4 lg:mx-auto max-w-7xl px-4 sm:px-6 py-3 rounded-2xl flex justify-between items-center gap-4 md:gap-8 transition-all duration-500 border border-white/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-lg ${
        isScrolled ? 'shadow-brand-500/10 translate-y-1' : 'shadow-slate-200/50 dark:shadow-none'
      }`}
    >
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-500 p-2 rounded-xl text-white group-hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
          <FolderSync size={22} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-xl sm:text-2xl font-black text-gradient tracking-tight ml-1">
          ConvertHub
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-slate-600 dark:text-slate-300">
        
        {/* Tools Dropdown */}
        <div 
          className="relative group"
          onMouseEnter={() => setToolsOpen(true)}
          onMouseLeave={() => setToolsOpen(false)}
        >
          <button className="flex items-center gap-1 font-semibold text-sm hover:text-brand-600 transition-colors py-2">
            Tools <ChevronDown size={14} className={`transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full -left-24 w-[340px] pt-4"
              >
                <div className="glass-panel p-3 grid grid-cols-2 gap-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 pointer-events-none" />
                  {toolLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 group/link relative z-10"
                    >
                      <div className="text-slate-400 group-hover/link:text-brand-500 transition-colors">
                        {link.icon}
                      </div>
                      {link.title}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/pricing" className={`transition-all font-semibold text-sm relative group ${location.pathname === '/pricing' ? 'text-brand-600 dark:text-brand-400' : 'hover:text-brand-600'}`}>
          Pricing
        </Link>

        {user?.tier === 'pro' && (
          <span className="bg-gradient-to-r from-brand-500 to-accent-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-brand-500/20">
            PRO
          </span>
        )}

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 font-bold text-xs uppercase"
          title="Switch Language"
        >
          <Languages size={18} />
          {i18n.language.startsWith('si') ? 'EN' : 'සිං'}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-500 hover:text-brand-600 transition-all" title="Dashboard">
              <User size={20} />
            </Link>
            <Link to="/settings" className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-500 hover:text-brand-600 transition-all" title="Settings">
              <Settings size={20} />
            </Link>
            <button onClick={logout} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-brand-600 font-bold text-sm transition-colors">{t('nav.login')}</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5">{t('nav.signup')}</Link>
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 glass-panel mt-2 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 md:hidden z-50"
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              {toolLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border border-transparent transition-all ${location.pathname === link.path
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border-brand-100 dark:border-brand-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <div className="text-slate-400">{link.icon}</div>
                  <span className="font-semibold text-xs text-center">{link.title}</span>
                </Link>
              ))}
            </div>

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
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <User size={20} />
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <Settings size={20} />
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
    </motion.nav>
  );
};

export default Navbar;