import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, MessageSquare, Send, Loader2, Bot, User, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AIAssistant = () => {
  const [file, setFile] = useState(null);
  const [serverFilePath, setServerFilePath] = useState(null);
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSummary('');
      setMessages([]);
      setServerFilePath(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleSummarize = async () => {
    if (!file) return;
    setSummarizing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/ai/summarize`, formData);
      setSummary(res.data.summary);
      setServerFilePath(res.data.filePath);
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !serverFilePath) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, {
        filePath: serverFilePath,
        question: userMessage
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (error) {
      toast.error('Failed to get answer');
      setMessages(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error while trying to answer that.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Assistant - ConvertHub</title>
        <meta name="description" content="Chat with your PDFs and get instant summaries using AI." />
      </Helmet>
      
      <div className="py-20 px-6 max-w-5xl mx-auto min-h-screen">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-accent-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-500/30 rotate-3"
          >
            <Bot size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">AI Document Assistant</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Summarize and chat with your PDF documents instantly.</p>
        </div>

        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            {...getRootProps()}
            className={`glass-panel border-2 border-dashed p-16 text-center transition-all duration-300 cursor-pointer ${isDragActive ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:shadow-xl'}`}
          >
            <input {...getInputProps()} />
            <Upload size={48} className="mx-auto text-indigo-500 mb-4 opacity-50" />
            <p className="text-xl font-bold dark:text-white mb-2">Drop your PDF here</p>
            <p className="text-sm text-slate-500">Only .pdf files are supported</p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Side: File Info & Summary */}
            <div className="flex flex-col gap-6 h-full min-h-0">
              <div className="glass-panel p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <span className="font-medium dark:text-white truncate" title={file.name}>{file.name}</span>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="glass-panel p-6 flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    <FileText size={20} className="text-indigo-500" /> Document Summary
                  </h3>
                  {!summary && (
                    <button 
                      onClick={handleSummarize}
                      disabled={summarizing}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                      {summarizing ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                      Generate Summary
                    </button>
                  )}
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {summarizing ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p>Reading document and generating summary...</p>
                    </div>
                  ) : summary ? (
                    <div className="whitespace-pre-wrap">{summary}</div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 opacity-50 italic text-center">
                      Click the button above to generate a summary of your document.<br/>This is required before you can chat with the document.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Chat Interface */}
            <div className="glass-panel flex flex-col h-full overflow-hidden min-h-0">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <h3 className="font-bold flex items-center gap-2 dark:text-white">
                  <MessageSquare size={18} className="text-indigo-500" /> Chat with PDF
                </h3>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <MessageSquare size={48} className="mb-4 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">Ask any question about the uploaded document.<br/>(Requires generating summary first)</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.role === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {msg.role === 'user' ? <User size={16} /> : msg.role === 'error' ? <AlertCircle size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                            : msg.role === 'error'
                              ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 dark:text-slate-200 rounded-tl-sm'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Bot size={16} className="text-slate-500" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-indigo-500" />
                          <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={serverFilePath ? "Ask a question..." : "Generate summary first..."}
                    disabled={!serverFilePath || loading || summarizing}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white disabled:opacity-50 text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || !serverFilePath || loading}
                    className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIAssistant;
