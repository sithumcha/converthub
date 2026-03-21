import { useState, useEffect } from 'react';
import { fileService } from '../services/api';
import DownloadButton from '../components/DownloadButton';
import { Download, Clock, CheckCircle, XCircle, Trash2, Archive, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fileService.getHistory();
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDownload = async () => {
    if (selected.length === 0) return;
    try {
      const res = await fileService.batchDownload(selected);
      window.location.href = `${SERVER_URL}${res.data.data.zipUrl}`;
    } catch (err) {
      alert('Failed to create batch download');
    }
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold dark:text-white mb-2">Conversion History</h1>
          <p className="text-slate-500 dark:text-slate-400">View and managed your processed files</p>
        </motion.div>

        <AnimatePresence>
          {selected.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBatchDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Archive size={20} />
              Download Batch ({selected.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="flex justify-center p-20 dark:text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-20 text-center border border-slate-200 dark:border-slate-800"
        >
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-semibold dark:text-white mb-2">No conversions yet</h3>
          <p className="text-slate-500">Your history will appear here once you convert files.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-300">
                <AnimatePresence>
                  {history.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(item._id)}
                          onChange={() => handleSelect(item._id)}
                          disabled={item.status !== 'completed'}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium max-w-xs truncate">
                        {item.originalFiles?.[0]?.filename || 'File'}
                      </td>
                      <td className="px-6 py-4">
                        {item.type === 'summarize' ? (
                          <span className="uppercase px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-bold">AI SUMMARY</span>
                        ) : item.type === 'ocr' ? (
                          <span className="uppercase px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 font-bold">OCR EXTRACT</span>
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{item.originalFormat || 'FILE'}</span>
                            <ArrowRight size={14} className="text-slate-400" />
                            <span className="uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-bold">{item.targetFormat || 'FILE'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'completed' ? (
                          <span className="flex items-center gap-1.5 text-green-500 font-medium text-sm">
                            <CheckCircle size={16} /> Completed
                          </span>
                        ) : item.status === 'failed' ? (
                          <span className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
                            <XCircle size={16} /> Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500 font-medium text-sm animate-pulse">
                            <Clock size={16} /> Processing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === 'completed' && !['summarize', 'ocr'].includes(item.type) && (
                          <DownloadButton
                            conversionId={item._id}
                            filename={item.convertedFile?.filename || 'download.pdf'}
                            className="p-2 inline-block text-indigo-500 hover:text-indigo-600 transition-colors"
                            title="Download"
                          />
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;