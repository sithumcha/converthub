import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail, Layers } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 dark:bg-black dark:text-slate-400 border-t border-slate-800 dark:border-slate-800/50 mt-auto overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-brand-500 text-white p-2 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-brand-500/30">
                <Layers size={24} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">ConvertHub</span>
            </Link>
            <p className="text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
              The ultimate all-in-one suite for file conversions, PDF manipulation, AI background removal, and smart document tools.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-800/50 dark:bg-slate-900 rounded-full hover:bg-brand-500 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800/50 dark:bg-slate-900 rounded-full hover:bg-brand-500 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-800/50 dark:bg-slate-900 rounded-full hover:bg-brand-500 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Tools Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Powerful Tools</h4>
            <ul className="space-y-4">
              <li><Link to="/pdf" state={{ mode: 'merge' }} className="hover:text-brand-400 transition-colors">Merge PDF</Link></li>
              <li><Link to="/images" state={{ mode: 'remove-bg' }} className="hover:text-brand-400 transition-colors">AI Background Remover</Link></li>
              <li><Link to="/web-capture" className="hover:text-brand-400 transition-colors">Website to PDF</Link></li>
              <li><Link to="/tts" className="hover:text-brand-400 transition-colors">AI Text to Speech</Link></li>
              <li><Link to="/batch" className="hover:text-brand-400 transition-colors">Batch Process Files</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/pricing" className="hover:text-brand-400 transition-colors">Pricing & Pro</Link></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Blog & Updates</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal & Contact</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Refund Policy</a></li>
              <li className="pt-2">
                <a href="mailto:hello@converthub.com" className="flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors">
                  <Mail size={16} /> hello@converthub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} ConvertHub Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>for seamless workflows</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
