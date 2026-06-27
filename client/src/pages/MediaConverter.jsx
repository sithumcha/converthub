import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { mediaService, fileService } from '../services/api';
import DownloadButton from '../components/DownloadButton';
import { Music, Video, Send, Loader2, CheckCircle2, AlertCircle, Trash2, LayoutGrid, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

const SERVER_URL = API_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');

const MediaConverter = () => {
  const [mode, setMode] = useState('extract-audio');
  const [file, setFile] = useState(null);
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
      socket.on('conversion-progress', (data) => {
        setProgress(data.percent);
      });
    }
  }, [socket]);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setStatus('idle');
    setResult(null);
    setError('');
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mkv', '.avi', '.mov'] },
    maxFiles: 1
  });

  const pollStatus = async (id) => {
    let attempts = 0;
    const maxAttempts = 300; // Longer polling for video

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
      }, 2000); // Check every 2 seconds
    });
  };

  const handleAction = async () => {
    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError('');
    setProgress(0);

    try {
      let res;
      const socketId = socket ? socket.id : null;

      if (mode === 'extract-audio') {
        res = await mediaService.extractAudio(file, socketId);
      } else if (mode === 'compress-video') {
        res = await mediaService.compressVideo(file, socketId);
      }

      const conversionId = res.data.conversionId;

      if (!conversionId) {
        throw new Error("No conversion ID received from server.");
      }

      const finalResult = await pollStatus(conversionId);

      setResult({
        ...finalResult,
        conversionId: conversionId
      });

      setStatus('completed');
      toast.success('Processing completed!');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
      setStatus('error');
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Media Studio - ConvertHub</title>
        <meta name="description" content="Convert videos to audio or compress video size efficiently." />
      </Helmet>
      <div className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/30 rotate-3"
          >
            <Video size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">Media Studio</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Extract high-quality audio from videos or compress video files instantly.</p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          {[
            { id: 'extract-audio', label: 'Video to Audio (MP3)', icon: <Music size={18} /> },
            { id: 'compress-video', label: 'Compress Video', icon: <Video size={18} /> },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setFile(null); setResult(null); setStatus('idle'); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${mode === m.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 -translate-y-1' : 'glass hover:-translate-y-1 hover:shadow-md'
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
              className={`glass-panel border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer h-[400px] flex flex-col justify-center gap-4 ${isDragActive ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:shadow-lg'
                }`}
            >
              <input {...getInputProps()} />
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-2">
                <Video size={32} />
              </div>
              <div>
                <p className="text-lg font-bold dark:text-white">Drop your video here</p>
                <p className="text-sm text-slate-500">Supports MP4, MKV, AVI, MOV</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 flex flex-col h-full min-h-[400px]">
            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              {!file ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <LayoutGrid size={48} className="mb-4 opacity-20" />
                  <p>No video selected</p>
                </div>
              ) : (
                <motion.div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                      <Video size={16} />
                    </div>
                    <span className="text-sm font-medium dark:text-white truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              )}
            </div>

            {file && (
              <motion.div className="space-y-4">
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl py-4 flex justify-center items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    <>{mode === 'extract-audio' ? 'Extract Audio' : 'Compress Video'} <Send size={18} /></>
                  )}
                </button>

                {loading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mb-2">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden relative shadow-inner">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.5 }}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white/20"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {status === 'completed' && result && (
              <motion.div className="mt-6 p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20 text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-4">Success!</h3>
                <DownloadButton
                  conversionId={result.conversionId}
                  filename={result.convertedFile?.filename || 'output'}
                  className="w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all"
                />
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

export default MediaConverter;
