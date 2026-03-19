import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { imageService, fileService } from '../services/api';
import { Image as ImageIcon, Send, Download, Loader2, CheckCircle2, AlertCircle, Trash2, Sliders, Maximize, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageTools = () => {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState(location.state?.mode || 'process'); // 'process' or 'remove-bg'
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  
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
            reject(new Error('Background removal failed'));
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
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 dark:text-white">Image Studio</h1>
        <p className="text-slate-500 dark:text-slate-400">Convert, Compress, and Resize your images with ease</p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => { setMode('process'); setStatus('idle'); setResult(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            mode === 'process' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <Sliders size={20} /> Basic Tools
        </button>
        <button
          onClick={() => { setMode('remove-bg'); setStatus('idle'); setResult(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            mode === 'remove-bg' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-900 dark:text-slate-300'
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
            className={`glass border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer h-64 flex flex-col justify-center gap-4 ${
              isDragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-2">
              <ImageIcon size={32} />
            </div>
            <div>
              <p className="text-lg font-bold dark:text-white">
                {file ? file.name : 'Drop image here'}
              </p>
              <p className="text-sm text-slate-500">JPG, PNG, WEBP, GIF, AVIF supported</p>
            </div>
          </div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-3xl p-8 space-y-6 bg-white/50 dark:bg-slate-900/50"
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
          {status === 'completed' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass rounded-[3rem] p-12 text-center bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/10 flex-1 flex flex-col items-center justify-center gap-8 border border-slate-100 dark:border-slate-800"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
                className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 size={48} />
              </motion.div>
              <div className="text-center">
                <h3 className="text-3xl font-black dark:text-white mb-2 tracking-tight">Success!</h3>
                <p className="text-slate-500 font-medium">{result.convertedFile.filename}</p>
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={fileService.download(result._id)}
                download
                className="btn-primary px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-indigo-500/30 text-lg font-black"
              >
                <Download size={22} /> Download Now
              </motion.a>
              <button
                onClick={() => { setFile(null); setStatus('idle'); setResult(null); }}
                className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-widest text-xs transition-colors"
              >
                Process another image
              </button>
            </motion.div>
          ) : (
            <div className="glass rounded-3xl p-10 flex-1 flex flex-col items-center justify-center text-center text-slate-400 bg-white/20 dark:bg-slate-900/20 border-2 border-dashed border-slate-300 dark:border-slate-800">
              <Sliders size={64} className="mb-6 opacity-20" />
              <p className="text-lg">Upload an image to see results and adjustment previews</p>
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
        </motion.div>
      </div>
    </div>
  );
};

export default ImageTools;
