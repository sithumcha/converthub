import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Globe, Download, Loader2, Image as ImageIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import DownloadButton from '../components/DownloadButton';

const WebCapture = () => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('pdf'); // 'pdf' or 'image'
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

  const SERVER_URL = API_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');

  const handleCapture = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setStatus('processing');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/extra/web-capture`, 
        { url, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResult(res.data.data);
      setStatus('completed');
      toast.success('Website captured successfully!');
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error(error.response?.data?.message || 'Failed to capture website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Website to PDF/Image - ConvertHub</title>
        <meta name="description" content="Capture any website as a high-quality PDF or full-page Image screenshot." />
      </Helmet>
      
      <div className="py-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/30 rotate-3"
          >
            <Globe size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">Website to PDF</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Turn any webpage into a high-quality PDF document or a full-page screenshot instantly.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12"
        >
          {status === 'idle' || status === 'error' ? (
            <form onSubmit={handleCapture} className="space-y-8">
              <div>
                <label className="block text-sm font-bold mb-3 dark:text-slate-300">Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe size={20} className="text-slate-400" />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://wikipedia.org"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors text-lg dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 dark:text-slate-300">Output Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('pdf')}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      type === 'pdf'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <FileText size={32} />
                    <span className="font-bold">PDF Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('image')}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      type === 'image'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    <ImageIcon size={32} />
                    <span className="font-bold">Full Page Image</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !url}
                className="w-full btn-primary py-5 text-lg"
              >
                Capture Website
              </button>
            </form>
          ) : status === 'processing' ? (
             <div className="py-20 flex flex-col items-center justify-center text-center">
               <Loader2 className="animate-spin w-16 h-16 text-indigo-500 mb-6" />
               <h3 className="text-2xl font-bold mb-2 dark:text-white">Capturing Website...</h3>
               <p className="text-slate-500">Our bots are taking a snapshot. This usually takes about 10-15 seconds.</p>
             </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black mb-2 dark:text-white">Capture Successful!</h3>
              <p className="text-slate-500 mb-8">{result?.filename}</p>

              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={() => { setStatus('idle'); setUrl(''); }}
                  className="flex-1 py-4 px-6 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Capture Another
                </button>
                {/* Custom download button logic since it's not a Conversion model */}
                <a 
                  href={`${SERVER_URL}/converted/${result?.filename}`}
                  download={result?.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 btn-primary py-4"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default WebCapture;
