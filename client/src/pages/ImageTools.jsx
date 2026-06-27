import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { imageService, fileService } from '../services/api';
import DownloadButton from '../components/DownloadButton';
import { Image as ImageIcon, Send, Download, Loader2, CheckCircle2, AlertCircle, Trash2, Sliders, Maximize, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageTools = () => {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(location.state?.mode || 'process');
  const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
      setFile(null);
      setStatus('idle');
      setResult(null);
    }
  }, [location.state]);

  const [options, setOptions] = useState({
    targetFormat: '',
    quality: 80,
    width: '',
    height: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // Simulate progress
  useEffect(() => {
    let interval;
    if (status === 'processing') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Hold at 90% until backend says 100%
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 90);
        });
      }, 500);
    } else if (status === 'completed') {
      setProgress(100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setStatus('idle');
    setResult(null);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'] },
    multiple: false
  });

  const pollStatus = async (id) => {
    let attempts = 0;
    const maxAttempts = 30;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fileService.getStatus(id);
          const data = res.data.data;

          if (data.status === 'completed') {
            clearInterval(interval);
            resolve(data);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            reject(new Error('Processing failed'));
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Operation timed out'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 1000);
    });
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('processing');
    setError('');

    try {
      const res = mode === 'process'
        ? await imageService.process(file, options)
        : await imageService.removeBg(file);

      const conversionId = res.data.conversionId;
      const finalResult = await pollStatus(conversionId);

      setResult(finalResult);
      setStatus('completed');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Processing failed');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Image Tools - ConvertHub</title>
        <meta name="description" content="Professional tools for Image processing. Convert, compress, resize, and remove background from images." />
      </Helmet>
      <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">Image Studio</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Convert, Compress, and Resize your images with ease</p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => { setMode('process'); setStatus('idle'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${mode === 'process' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 -translate-y-1' : 'glass hover:-translate-y-1 hover:shadow-md'
              }`}
        >
          <Sliders size={20} /> Basic Tools
        </button>
        <button
          onClick={() => { setMode('remove-bg'); setStatus('idle'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${mode === 'remove-bg' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 -translate-y-1' : 'glass hover:-translate-y-1 hover:shadow-md'
              }`}
        >
          <Sparkles size={20} /> AI BG Remover
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
              isDragActive 
                ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]' 
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-brand-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDragActive ? 'opacity-100' : ''}`} />
            <input {...getInputProps()} />
            {file ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-white/5 flex items-center justify-center group">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold text-sm">Click or drop to replace</p>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-2">
                <ImageIcon size={32} />
              </div>
            )}
            <div>
              <p className="text-lg font-bold dark:text-white truncate px-4">
                {file ? file.name : 'Drop image here'}
              </p>
              <p className="text-sm text-slate-500 mt-1">JPG, PNG, WEBP, GIF, AVIF supported</p>
            </div>
          </div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-8 flex flex-col h-full"
              >
                {mode === 'process' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Target Format</label>
                        <select
                          value={options.targetFormat}
                          onChange={(e) => setOptions({ ...options, targetFormat: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Maintain Original</option>
                          <option value="jpg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WEBP</option>
                          <option value="avif">AVIF</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-slate-300">Quality ({options.quality}%)</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={options.quality}
                          onChange={(e) => setOptions({ ...options, quality: e.target.value })}
                          className="w-full h-10 accent-indigo-600 cursor-pointer mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-slate-300 flex items-center gap-2">
                          <Maximize size={16} /> Width (px)
                        </label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={options.width}
                          onChange={(e) => setOptions({ ...options, width: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 dark:text-slate-300 flex items-center gap-2">
                          <Maximize size={16} className="rotate-90" /> Height (px)
                        </label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={options.height}
                          onChange={(e) => setOptions({ ...options, height: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-center">
                    <Sparkles className="mx-auto mb-3 text-indigo-500" size={32} />
                    <p className="text-sm dark:text-slate-300">AI will automatically detect and remove the background from your image, returning a transparent PNG.</p>
                  </div>
                )}

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full btn-primary py-4 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {mode === 'process' ? 'Processing...' : 'Removing Background...'}
                    </>
                  ) : (
                    <>
                      {mode === 'process' ? 'Process Image' : 'Remove Background'}
                      <Send size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          {status === 'completed' && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass rounded-[3rem] p-12 text-center bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/10 flex-1 flex flex-col items-center justify-center gap-8 border border-slate-100 dark:border-slate-800"
            >
              <div className="text-center relative">
                {/* Result Preview */}
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                  <img 
                    src={`${API_URL}/files/download/${result._id}?token=${localStorage.getItem('token')}`} 
                    alt="Processed Preview" 
                    className="w-full h-full object-contain relative z-10" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center text-slate-400">
                    <ImageIcon size={48} className="opacity-20" />
                  </div>
                </div>

                <h3 className="text-3xl font-black dark:text-white mb-2 tracking-tight">Success!</h3>
                <p className="text-slate-500 font-medium truncate max-w-[250px] mx-auto" title={result.convertedFile?.filename || 'Image processed'}>
                  {result.convertedFile?.filename || 'Image processed'}
                </p>
              </div>

              {/* ✅ Use DownloadButton instead of direct link */}
              <DownloadButton
                conversionId={result._id}
                filename={result.convertedFile?.filename || 'image.png'}
                className="btn-primary px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-indigo-500/30 text-lg font-black"
              />

              <button
                onClick={() => { setFile(null); setStatus('idle'); setResult(null); }}
                className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-widest text-xs transition-colors"
              >
                Process another image
              </button>
            </motion.div>
          )}

          {status === 'processing' && (
            <div className="glass rounded-3xl p-10 flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-200 dark:text-slate-700 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-brand-500 progress-ring stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-brand-600 dark:text-brand-400">
                  {Math.round(progress)}%
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Processing Image...</h3>
              <p className="text-slate-500">Please wait while we apply the magic ✨</p>
            </div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {status === 'idle' && !result && (
            <div className="glass rounded-3xl p-10 flex-1 flex flex-col items-center justify-center text-center text-slate-400 bg-white/20 dark:bg-slate-900/20 border-2 border-dashed border-slate-300 dark:border-slate-800">
              <Sliders size={64} className="mb-6 opacity-20" />
              <p className="text-lg">Upload an image to see results and adjustment previews</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default ImageTools;
