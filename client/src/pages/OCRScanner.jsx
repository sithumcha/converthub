import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Upload, ScanText, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import axios from 'axios';

const OCRScanner = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const API_URL = (() => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
})();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setExtractedText('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/ai/ocr`, formData);
      setExtractedText(res.data.text);
      toast.success('Text extracted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to extract text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>AI Vision OCR - ConvertHub</title>
        <meta name="description" content="Extract text from images accurately using AI Vision OCR." />
      </Helmet>

      <div className="py-20 px-6 max-w-6xl mx-auto min-h-screen">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/30 rotate-3"
          >
            <ScanText size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gradient tracking-tight">AI Image to Text</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Extract text from any image instantly using advanced AI Vision. Supports handwriting, tables, and documents.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left Column: Image Upload & Preview */}
          <div className="glass-panel p-6 flex flex-col h-full min-h-0">
            <h3 className="font-bold flex items-center gap-2 dark:text-white mb-6">
              <Upload size={20} className="text-indigo-500" /> Upload Image
            </h3>

            {!file ? (
              <div 
                {...getRootProps()} 
                className={`flex-1 min-h-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  <ScanText size={32} />
                </div>
                <p className="text-xl font-bold dark:text-white mb-2">Drop image to extract text</p>
                <p className="text-sm text-slate-500">Supports JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); setExtractedText(''); }}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Choose Another
                  </button>
                  <button 
                    onClick={handleExtract}
                    disabled={loading}
                    className="flex-1 btn-primary py-3 px-4"
                  >
                    {loading ? (
                      <><Loader2 size={20} className="animate-spin" /> Extracting...</>
                    ) : (
                      <><ScanText size={20} /> Extract Text</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Text */}
          <div className="glass-panel flex flex-col h-full overflow-hidden min-h-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 dark:text-white">
                <ScanText size={20} className="text-purple-500" /> Extracted Text
              </h3>
              {extractedText && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors dark:text-white"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4">
                  <Loader2 size={40} className="animate-spin text-purple-500" />
                  <p>Analyzing image and extracting text with AI...</p>
                </div>
              ) : extractedText ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent p-0 m-0 border-none">
                    {extractedText}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 text-center">
                  <ScanText size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                  <p>Upload an image and click "Extract Text" to see the results here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OCRScanner;
