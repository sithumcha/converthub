import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mic, Play, Pause, Download, Loader2, Languages, Type, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResultUrl(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/extra/tts`, 
        { text, lang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const audioDataUri = `data:audio/mp3;base64,${res.data.data.base64}`;
      setResultUrl(audioDataUri);
      toast.success('Speech generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to generate speech');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Text-to-Speech - ConvertHub</title>
        <meta name="description" content="Convert your text into realistic AI voice audio in multiple languages." />
      </Helmet>
      
      <div className="py-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 rotate-3"
          >
            <Mic size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">AI Text-to-Speech</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Transform any text into natural-sounding audio in seconds.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 glass-panel p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2 dark:text-white">
                <Type size={18} className="text-indigo-500" /> Enter Text
              </label>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${text.length > 200 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {text.length} chars (Max 200 recommended for free tier)
              </span>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want to convert to speech..."
              className="w-full h-64 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors text-lg dark:text-white resize-none"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 flex flex-col h-full"
          >
            <div className="mb-8">
              <label className="block text-sm font-bold mb-3 dark:text-slate-300 flex items-center gap-2">
                <Languages size={18} className="text-indigo-500" /> Voice Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English (US)</option>
                <option value="en-gb">English (UK)</option>
                <option value="si">Sinhala (සිංහල)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="ko">Korean (한국어)</option>
              </select>
            </div>

            <div className="flex-1"></div>

            {!resultUrl ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : <><Mic size={20} /> Generate Audio</>}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400 mb-6">
                  <CheckCircle2 size={24} />
                  <span className="font-medium text-sm">Audio Ready!</span>
                </div>
                
                <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700">
                  <audio 
                    ref={audioRef} 
                    src={resultUrl} 
                    controls 
                    autoPlay
                    className="w-full" 
                  />
                </div>

                <a
                  href={resultUrl}
                  download={`tts_${Date.now()}.mp3`}
                  className="w-full btn-primary py-4 text-center block"
                >
                  Download MP3
                </a>

                <button
                  onClick={() => { setResultUrl(null); setIsPlaying(false); }}
                  className="w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-500 mt-2"
                >
                  Create New
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TextToSpeech;
