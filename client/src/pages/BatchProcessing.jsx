import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { batchService, fileService } from '../services/api';
import DownloadButton from '../components/DownloadButton';
import { CopyPlus, Send, Loader2, CheckCircle2, AlertCircle, Trash2, LayoutGrid, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const BatchProcessing = () => {
  const [action, setAction] = useState('image-compress');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('batch-progress', (data) => {
        setProgress(data.percent);
        if (data.completed) {
          fetchResult(data.conversionId);
        }
      });
    }
  }, [socket]);

  const fetchResult = async (id) => {
    try {
      const res = await fileService.getStatus(id);
      const data = res.data.data;
      if (data.status === 'completed') {
        setResult({
          ...data,
          conversionId: id
        });
        setStatus('completed');
        toast.success('Batch processing completed!');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length + files.length > 20) {
      toast.error('Maximum 20 files allowed per batch');
      return;
    }
    setFiles(prev => [...prev, ...acceptedFiles]);
    setStatus('idle');
    setResult(null);
    setError('');
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAction = async () => {
    if (files.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError('');
    setProgress(0);

    try {
      const socketId = socket ? socket.id : null;
      await batchService.process(files, action, socketId);
      // Processing continues via socket events
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
      setStatus('error');
      toast.error(err.message || 'Operation failed');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Batch Processing - ConvertHub</title>
        <meta name="description" content="Process multiple files at once. Compress, convert, or edit images in bulk." />
      </Helmet>
      <div className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">Batch Processing</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Process up to 20 files simultaneously and download as a ZIP</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'image-compress', label: 'Compress Images', icon: <FileImage size={18} /> },
            { id: 'image-to-webp', label: 'Convert to WEBP', icon: <CopyPlus size={18} /> },
            { id: 'remove-bg', label: 'Remove Background', icon: <LayoutGrid size={18} /> },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setAction(m.id); setStatus('idle'); setResult(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${action === m.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 -translate-y-1' : 'glass hover:-translate-y-1 hover:shadow-md'
                }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div
              {...getRootProps()}
              className={`glass-panel border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer h-full min-h-[400px] flex flex-col justify-center gap-4 ${isDragActive ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-orange-400 hover:shadow-lg'
                }`}
            >
              <input {...getInputProps()} />
              <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-orange-600 mb-2">
                <CopyPlus size={32} />
              </div>
              <div>
                <p className="text-lg font-bold dark:text-white">Drop multiple images here</p>
                <p className="text-sm text-slate-500">Max 20 files. Supports JPG, PNG, WEBP</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold dark:text-white">Selected Files ({files.length}/20)</h3>
              {files.length > 0 && (
                <button onClick={() => setFiles([])} className="text-sm text-red-500 hover:underline">Clear All</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 max-h-[250px] custom-scrollbar">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                  <LayoutGrid size={48} className="mb-4 opacity-20" />
                  <p>No files selected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {files.map((f, i) => (
                      <motion.div
                        key={f.name + i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                      >
                        <span className="text-sm font-medium dark:text-white truncate max-w-[220px]">{f.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <motion.div className="space-y-4">
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    <>Process {files.length} {files.length === 1 ? 'File' : 'Files'} <Send size={18} /></>
                  )}
                </button>

                {loading && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden relative">
                    <div
                      className="bg-orange-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                      {progress}%
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {status === 'completed' && result && (
              <motion.div className="mt-6 p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20 text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-2">Success!</h3>
                <p className="text-sm text-green-700 dark:text-green-500/80 mb-4">All {files.length} files processed.</p>
                <DownloadButton
                  conversionId={result.conversionId}
                  filename={result.convertedFile?.filename || 'batch_output.zip'}
                  className="w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all"
                >
                  <Download size={18} /> Download ZIP
                </DownloadButton>
              </motion.div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BatchProcessing;
