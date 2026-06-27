import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { 
  FilePlus, FileMinus, Zap, FileText, Lock, 
  Image as ImageIcon, Sparkles, ArrowRight, 
  CheckCircle2, Star, Shield, Clock, Video, Music, Layers, ScanText, Globe, Mic
} from 'lucide-react';

const SpotlightCard = ({ children, className = "", onClick }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-3xl overflow-hidden glass-card cursor-pointer border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300 group ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99,102,241,.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
        {children}
      </div>
    </motion.div>
  );
};

const ToolCard = ({ icon, title, description, link, mode, popular, className = "", isLarge = false, bgClass = "" }) => {
  const navigate = useNavigate();
  return (
    <SpotlightCard 
      onClick={() => navigate(link, { state: { mode } })}
      className={`${className} ${isLarge ? (bgClass || 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white border-transparent') : 'bg-white/40 dark:bg-slate-900/40 text-slate-800 dark:text-white'}`}
    >
      {/* Huge Watermark Icon for Large Cards */}
      {isLarge && (
        <div className="absolute -bottom-10 -right-10 text-white/10 dark:text-white/5 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
          {React.cloneElement(icon, { size: 240 })}
        </div>
      )}

      {popular && (
        <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-900 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/20 z-20">
          <Star size={10} fill="currentColor" /> Popular
        </div>
      )}
      
      <div className={`rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden ${isLarge ? 'w-24 h-24 bg-white/20 text-white backdrop-blur-md' : 'w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white group-hover:from-brand-500 group-hover:to-indigo-500'}`}>
        <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isLarge ? React.cloneElement(icon, { size: 48 }) : icon}
      </div>
      
      <div className="mt-auto relative z-10">
        <h3 className={`${isLarge ? 'text-3xl md:text-4xl' : 'text-xl'} font-black mb-3 transition-colors ${isLarge ? 'text-white' : 'group-hover:text-brand-600 dark:group-hover:text-brand-400'}`}>{title}</h3>
        <p className={`leading-relaxed ${isLarge ? 'text-lg text-white/90 max-w-sm' : 'text-sm text-slate-500 dark:text-slate-400'}`}>{description}</p>
      </div>
    </SpotlightCard>
  );
};

const ToolCategory = ({ title, children, subtitle }) => (
  <motion.div 
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      visible: { transition: { staggerChildren: 0.1 } }
    }}
    className="mb-32 relative"
  >
    <div className="flex flex-col items-center text-center mb-16 relative z-10">
      <div className="inline-flex items-center justify-center p-2 bg-brand-50 dark:bg-brand-900/30 rounded-2xl mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-brand-500 to-accent-500 rounded-full" />
      </div>
      <h2 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight mb-4">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">{subtitle}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px] relative z-10">
      {children}
    </div>
  </motion.div>
);

const FeatureBadge = ({ icon, text, delay, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, type: 'spring' }}
    className={`absolute hidden lg:flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-xl shadow-brand-500/5 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-200 z-20 ${className}`}
  >
    <div className="text-brand-500">{icon}</div>
    {text}
  </motion.div>
);

const Home = () => {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const [timeOfDay, setTimeOfDay] = useState('day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('day');
    else setTimeOfDay('night');
  }, []);

  return (
    <>
      <Helmet>
        <title>ConvertHub - All-in-one File Suite</title>
        <meta name="description" content="The ultimate platform for PDF, Image and Document conversions. Powerful, fast, and completely secure." />
      </Helmet>

      {/* Full-width Hero Breakout Section */}
      <div className="w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[100vh] flex flex-col items-center justify-center -mt-32 pt-32 pb-20 overflow-hidden shadow-2xl rounded-b-[3rem]">
        
        {/* Dynamic Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 z-0"
          style={{ backgroundImage: `url('/hero-${timeOfDay}.png')` }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-[2px] z-0" />
        
        {/* Hero Content */}
        <motion.div style={{ opacity }} className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 text-center flex flex-col justify-center items-center mt-12">
          
          <FeatureBadge icon={<Zap size={16} />} text="Lightning Fast" delay={0.2} className="top-10 left-10 lg:left-20 animate-bounce-slow" />
          <FeatureBadge icon={<Shield size={16} />} text="100% Secure" delay={0.4} className="bottom-20 right-10 lg:right-32 animate-bounce-slow-reverse" />
          <FeatureBadge icon={<Star size={16} />} text="Pro Quality" delay={0.6} className="top-32 right-10 lg:right-20 animate-bounce-slow" />

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center gap-2 bg-black/40 border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-black mb-10 shadow-lg backdrop-blur-md uppercase tracking-widest"
          >
            <Sparkles size={16} className="text-brand-400 animate-pulse" /> {timeOfDay.toUpperCase()} MODE ACTIVE
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 text-white tracking-tighter leading-[1] drop-shadow-2xl">
              {t('home.hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-400 animate-gradient-x">
                {t('home.hero_title_2')}
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-14 font-medium leading-relaxed drop-shadow-lg"
          >
            {t('home.hero_desc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group border border-white/10">
              Explore Tools <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => window.location.href = '/pricing'} className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-lg shadow-xl backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              View Pricing
            </button>
          </motion.div>

        </motion.div>
      </div>

      <div className="pb-24 pt-24 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto relative z-10">        
      <div className="grid md:grid-cols-3 gap-8 mb-40 relative z-10">
          {[
            { icon: <Zap size={32} />, title: t('home.fast'), desc: "Process files instantly with our optimized cloud infrastructure." },
            { icon: <Shield size={32} />, title: t('home.secure'), desc: "Your files are encrypted and automatically deleted after 2 hours." },
            { icon: <CheckCircle2 size={32} />, title: t('home.quality'), desc: "We use enterprise-grade algorithms to ensure zero quality loss." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-brand-600 group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tools Grid (True Bento Style) */}
        <ToolCategory title="PDF Suite" subtitle="Everything you need to manipulate, secure, and optimize your PDF documents effortlessly.">
          <ToolCard 
            icon={<FilePlus size={36} />}
            title="Merge PDF"
            description="Combine multiple PDF files into one single document in seconds with our visual editor."
            link="/pdf"
            mode="merge"
            popular={true}
            isLarge={true}
            className="lg:col-span-2 lg:row-span-2"
            bgClass="bg-gradient-to-br from-brand-500 to-indigo-600 text-white"
          />
          <ToolCard 
            icon={<FileMinus size={24} />}
            title="Split PDF"
            description="Extract individual pages."
            link="/pdf"
            mode="split"
          />
          <ToolCard 
            icon={<Lock size={24} />}
            title="Protect PDF"
            description="Encrypt with passwords."
            link="/pdf"
            mode="protect"
          />
          <ToolCard 
            icon={<Zap size={24} />}
            title="Compress PDF"
            description="Reduce file size easily."
            link="/pdf"
            mode="compress"
            popular={true}
          />
          <ToolCard 
            icon={<FileText size={24} />}
            title="PDF to Word"
            description="Convert PDF to DOCX."
            link="/pdf"
            mode="to-word"
          />
        </ToolCategory>

        <ToolCategory title="Image Studio" subtitle="Transform your images with AI-powered background removal, compression, and smart resizing.">
          <ToolCard 
            icon={<Sparkles size={36} />}
            title="AI BG Remover"
            description="Remove backgrounds automatically in one click using state-of-the-art AI technology."
            link="/images"
            mode="remove-bg"
            popular={true}
            isLarge={true}
            className="lg:col-span-2 lg:row-span-2"
            bgClass="bg-gradient-to-br from-rose-500 to-orange-500 text-white"
          />
          <ToolCard 
            icon={<ImageIcon size={24} />}
            title="Converter"
            description="JPG, PNG, WEBP, AVIF."
            link="/images"
            mode="process"
          />
          <ToolCard 
            icon={<Zap size={24} />}
            title="Compressor"
            description="Shrink up to 90%."
            link="/images"
            mode="process"
          />
          <ToolCard 
            icon={<Maximize size={24} />}
            title="Smart Resize"
            description="Custom dimensions."
            link="/images"
            mode="process"
          />
          <ToolCard 
            icon={<ImageIcon size={24} />}
            title="Bulk Edit"
            description="Process multiple images."
            link="/images"
            mode="process"
          />
        </ToolCategory>

        <ToolCategory title="Advanced AI & Media" subtitle="Next-generation tools designed to extract text, synthesize speech, and capture the web.">
          <ToolCard 
            icon={<Globe size={36} />}
            title="Web to PDF"
            description="Capture any full-length website as a high-quality PDF document or a full-page PNG image."
            link="/web-capture"
            mode="web-capture"
            popular={true}
            isLarge={true}
            className="lg:col-span-2 lg:row-span-2"
            bgClass="bg-gradient-to-br from-cyan-600 to-blue-600 text-white"
          />
          <ToolCard 
            icon={<Mic size={24} />}
            title="Text-to-Speech"
            description="Realistic AI voiceovers."
            link="/tts"
            mode="tts"
          />
          <ToolCard 
            icon={<ScanText size={24} />}
            title="AI OCR"
            description="Extract text from images."
            link="/ocr"
            mode="extract"
            popular={true}
          />
          <ToolCard 
            icon={<Video size={24} />}
            title="Video Compress"
            description="Optimize MP4 files."
            link="/media"
            mode="compress-video"
          />
          <ToolCard 
            icon={<Layers size={24} />}
            title="Batch Jobs"
            description="Zip outputs instantly."
            link="/batch"
            mode="image-compress"
          />
        </ToolCategory>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-32 p-12 lg:p-24 bg-gradient-to-br from-brand-600 via-indigo-600 to-accent-600 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl shadow-brand-500/30"
        >
          {/* Animated Background Rings for CTA */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/20 rounded-full"
            />
            <motion.div 
              animate={{ scale: [1.2, 1.8, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full"
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-md">Unlock the Full Potential</h2>
            <p className="text-brand-100/90 text-lg md:text-2xl mb-12 font-medium leading-relaxed">
              Get 100x higher file limits, batch processing for up to 50 files, and priority ultra-fast conversion speeds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="bg-white text-brand-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Go PRO Today <ArrowRight size={22} />
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all shadow-xl active:scale-95 flex items-center justify-center"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Helper for Missing Icon
const Maximize = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

export default Home;
