import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FilePlus, FileMinus, Zap, FileText, Lock, 
  Image as ImageIcon, Sparkles, ArrowRight, 
  CheckCircle2, Star, Shield, Clock 
} from 'lucide-react';

const ToolCard = ({ icon, title, description, link, mode, popular }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(link, { state: { mode } })}
      className="relative group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 cursor-pointer transition-all duration-300 shadow-sm hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      {popular && (
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 z-10"
        >
          <Star size={10} fill="currentColor" /> Popular
        </motion.div>
      )}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

const ToolCategory = ({ title, children }) => (
  <motion.div 
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
    className="mb-20"
  >
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{title}</h2>
      <div className="h-[2px] flex-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  </motion.div>
);

const Home = () => {
  return (
    <div className="pb-24 pt-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm"
        >
          <Sparkles size={16} /> All-in-one File Suite
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-black mb-8 dark:text-white tracking-tighter leading-[0.9]"
        >
          Everything for your <br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Files & Images.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed"
        >
          The ultimate platform for PDF, Image and Document conversions. 
          Powerful, fast, and completely secure.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Shield size={16} className="text-green-500" /> Secure Processing
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Clock size={16} className="text-indigo-500" /> Fast Execution
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <CheckCircle2 size={16} className="text-blue-500" /> High Quality
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <ToolCategory title="PDF Tools">
        <ToolCard 
          icon={<FilePlus size={32} />}
          title="Merge PDF"
          description="Combine multiple PDF files into one single document in seconds."
          link="/pdf"
          mode="merge"
          popular={true}
        />
        <ToolCard 
          icon={<FileMinus size={32} />}
          title="Split PDF"
          description="Extract individual pages or separate a PDF into several files."
          link="/pdf"
          mode="split"
        />
        <ToolCard 
          icon={<Zap size={32} />}
          title="Compress PDF"
          description="Reduce the file size while optimizing for maximum PDF quality."
          link="/pdf"
          mode="compress"
          popular={true}
        />
        <ToolCard 
          icon={<FileText size={32} />}
          title="PDF to Word"
          description="Convert your PDF document into an editable DOCX file effortlessly."
          link="/pdf"
          mode="to-word"
        />
        <ToolCard 
          icon={<Lock size={32} />}
          title="Protect PDF"
          description="Encrypt your sensitive PDFs with professional-grade password protection."
          link="/pdf"
          mode="protect"
        />
      </ToolCategory>

      <ToolCategory title="Image Tools">
        <ToolCard 
          icon={<ImageIcon size={32} />}
          title="Image Converter"
          description="Convert between JPG, PNG, WEBP, and AVIF with custom quality."
          link="/images"
          mode="process"
          popular={true}
        />
        <ToolCard 
          icon={<Zap size={32} />}
          title="Image Compressor"
          description="Shrink image file size by up to 90% without losing visual quality."
          link="/images"
          mode="process"
        />
        <ToolCard 
          icon={<Maximize size={32} />}
          title="Resize Image"
          description="Define custom dimensions for your images with advanced fit options."
          link="/images"
          mode="process"
        />
        <ToolCard 
          icon={<Sparkles size={32} />}
          title="AI BG Remover"
          description="Remove backgrounds automatically in one click using advanced AI."
          link="/images"
          mode="remove-bg"
          popular={true}
        />
      </ToolCategory>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 p-12 bg-indigo-600 rounded-[3.5rem] text-center text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <h2 className="text-4xl font-black mb-6 relative z-10">Ready to go PRO?</h2>
        <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
          Get 100x higher limits, batch processing, and priority conversion speeds. 
          Unlock the full power of ConvertHub today.
        </p>
        <button 
          onClick={() => window.location.href = '/pricing'}
          className="bg-white text-indigo-600 px-10 py-5 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all shadow-2xl active:scale-95 flex items-center gap-2 mx-auto relative z-10"
        >
          Check Pricing <ArrowRight size={22} />
        </button>
      </motion.div>
    </div>
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

