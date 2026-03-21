import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { pdfService, fileService } from '../services/api';
import DownloadButton from '../components/DownloadButton';
import { FilePlus, FileMinus, Send, Download, Loader2, CheckCircle2, AlertCircle, Trash2, LayoutGrid, List, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PDFToolkit = () => {
  const location = useLocation();
  const [mode, setMode] = useState(location.state?.mode || 'merge');
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
      setFiles([]);
      setResult(null);
      setStatus('idle');
      setPassword('');
    }
  }, [location.state]);

  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles) => {
    if (mode === 'merge') {
      setFiles(prev => [...prev, ...acceptedFiles]);
    } else {
      setFiles([acceptedFiles[0]]);
    }
    setStatus('idle');
    setResult(null);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: mode === 'merge'
  });

  const pollStatus = async (id) => {
    let attempts = 0;
    const maxAttempts = 30;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fileService.getStatus(id);
          const data = res.data.data;

          console.log('🔍 Poll status response:', { id, status: data.status, data });

          if (data.status === 'completed') {
            clearInterval(interval);
            resolve(data);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            reject(new Error('Conversion failed on server'));
          }

          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Conversion timed out. Check Dashboard for status.'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 1000);
    });
  };

  const handleAction = async () => {
    if (files.length === 0) {
      toast.error('Please select a file');
      return;
    }

    if (mode === 'protect' && !password) {
      toast.error('Please enter a password');
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError('');

    try {
      let res;
      if (mode === 'merge') {
        res = await pdfService.merge(files);
      } else if (mode === 'split') {
        res = await pdfService.split(files[0]);
      } else if (mode === 'compress') {
        res = await pdfService.compress(files[0]);
      } else if (mode === 'to-word') {
        res = await pdfService.toDocx(files[0]);
      } else if (mode === 'protect') {
        res = await pdfService.protect(files[0], password);
      }

      console.log('🔍 API Response:', res.data);

      const conversionId = res.data.conversionId;
      console.log('🔍 conversionId from response:', conversionId);

      if (!conversionId) {
        throw new Error("No conversion ID received from server. Response: " + JSON.stringify(res.data));
      }

      const finalResult = await pollStatus(conversionId);
      console.log('🔍 pollStatus finalResult:', finalResult);

      // ✅ Use REAL conversionId from server
      setResult({
        ...finalResult,
        conversionId: conversionId,  // Real ID, NOT hardcoded
        _id: finalResult._id || conversionId
      });

      setStatus('completed');
      toast.success('Processing completed!');
    } catch (err) {
      console.error('❌ Error in handleAction:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
      setStatus('error');
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 dark:text-white">PDF Toolkit</h1>
        <p className="text-slate-500 dark:text-slate-400">Professional tools for PDF manipulation</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {[
          { id: 'merge', label: 'Merge', icon: <FilePlus size={18} /> },
          { id: 'split', label: 'Split', icon: <FileMinus size={18} /> },
          { id: 'compress', label: 'Compress', icon: <LayoutGrid size={18} /> },
          { id: 'to-word', label: 'PDF to Word', icon: <List size={18} /> },
          { id: 'protect', label: 'Protect', icon: <Lock size={18} /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setFiles([]); setResult(null); setStatus('idle'); setPassword(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${mode === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50'
              }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {mode === 'protect' && files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-6 glass rounded-3xl border border-indigo-100 dark:border-indigo-900/20"
            >
              <label className="block text-sm font-bold mb-2 dark:text-slate-300 flex items-center gap-2">
                <Lock size={16} className="text-indigo-500" /> Set PDF Password
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            </motion.div>
          )}

          <div
            {...getRootProps()}
            className={`glass border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer h-full flex flex-col justify-center gap-4 ${isDragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400'
              }`}
          >
            <input {...getInputProps()} />
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-2">
              <FilePlus size={32} />
            </div>
            <div>
              <p className="text-lg font-bold dark:text-white">
                {mode === 'merge' ? 'Drop multiple PDFs here' : 'Drop your PDF here'}
              </p>
              <p className="text-sm text-slate-500">Only .pdf files are supported</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl p-8 flex flex-col h-full bg-white/50 dark:bg-slate-900/50"
        >
          <div className="flex-1 overflow-y-auto max-h-[300px] mb-6 space-y-3 pr-2">
            {files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <LayoutGrid size={48} className="mb-4 opacity-20" />
                <p>No files selected</p>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((f, i) => (
                  <motion.div
                    key={f.name + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                        <FilePlus size={16} />
                      </div>
                      <span className="text-sm font-medium dark:text-white truncate max-w-[200px]">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {files.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAction}
              disabled={loading || (mode === 'merge' && files.length < 2) || (mode === 'protect' && !password)}
              className="w-full btn-primary py-4 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  {mode === 'merge' ? 'Merge PDFs' :
                    mode === 'split' ? 'Split PDF' :
                      mode === 'compress' ? 'Compress PDF' :
                        mode === 'protect' ? 'Protect PDF' : 'Convert to Word'}
                  <Send size={18} />
                </>
              )}
            </motion.button>
          )}

          {status === 'completed' && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-6 p-8 bg-green-50 dark:bg-green-900/10 rounded-[2.5rem] border border-green-100 dark:border-green-900/20 text-center shadow-xl shadow-green-500/5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
                className="text-green-500 mb-4 flex justify-center"
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <CheckCircle2 size={48} />
                </div>
              </motion.div>
              <h3 className="text-2xl font-black text-green-900 dark:text-green-400 mb-2">Success!</h3>
              <p className="text-green-700 dark:text-green-500/80 mb-6 font-medium">Your request has been processed.</p>

              {mode !== 'split' ? (
                <DownloadButton
                  conversionId={result.conversionId}
                  filename={`${mode}_output.pdf`}
                  className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl text-lg font-black shadow-lg shadow-green-600/20 transition-all"
                />
              ) : (
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  <p className="text-sm dark:text-white font-bold opacity-70 uppercase tracking-widest pl-1">Generated Pages</p>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {(Array.isArray(result.convertedFile) ? result.convertedFile : [result.convertedFile]).map((f, i) => (
                      <motion.div
                        key={f.filename || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-green-100 dark:border-green-900/30 text-sm text-green-700 dark:text-green-400"
                      >
                        <span className="truncate flex-1">{f.filename}</span>
                        <DownloadButton
                          conversionId={result.conversionId}
                          filename={f.filename || `page_${i + 1}.pdf`}
                          className="px-3 py-1.5 text-sm bg-transparent text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <Download size={14} className="ml-1" />
                        </DownloadButton>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PDFToolkit;