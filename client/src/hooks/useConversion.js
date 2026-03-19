import { useState, useCallback, useEffect } from 'react';
import { fileService, ocrService, summarizeService } from '../services/api';

export const useConversion = () => {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [conversionId, setConversionId] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [jobType, setJobType] = useState(null);

  const startConversion = async (type, files, options = {}) => {
    try {
      console.log(`🚀 Starting ${type} conversion...`);
      setStatus('starting');
      setError(null);
      setJobType(type);
      
      let response;
      if (type === 'ocr') {
        response = await ocrService.extract(
          files[0], 
          options.language || options.lang || 'eng',
          options.engine || 'tesseract'
        );
      } else if (type === 'summarize') {
        response = await summarizeService.document(files[0], options);
      } else if (type === 'pdf-merge') {
        response = await fileService.merge(files);
      } else {
        // Fallback for generic conversion
        response = await fileService.convert(files[0], options.targetFormat);
      }
      
      if (response.data.conversionId) {
        setConversionId(response.data.conversionId);
        setStatus('processing');
        setProgress(10);
      }
      
      return response.data;
      
    } catch (err) {
      console.error(`${type} initiation error:`, err);
      setStatus('failed');
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchOCRResult = async (convId) => {
    try {
      console.log('📝 Fetching OCR result for:', convId);
      const response = await ocrService.getResult(convId);
      
      setResult({
        type: 'ocr',
        text: response.data.extractedText,
        confidence: response.data.confidence,
        language: response.data.language,
        engine: response.data.engine
      });
      
    } catch (err) {
      console.error('Error fetching OCR result:', err);
      setError('Failed to load OCR result');
    }
  };

  // Poll for job status
  useEffect(() => {
    if (!conversionId || status !== 'processing') return;
    
    let interval;
    const checkStatus = async () => {
      try {
        const response = await fileService.getStatus(conversionId);
        const data = response.data.data;
        
        // Extract type from response data
        const currentJobType = data.type || data.jobType || jobType;
        
        if (data.status === 'completed') {
          setProgress(100);
          
          if (currentJobType === 'ocr') {
            await fetchOCRResult(conversionId);
          } else if (currentJobType === 'summarize') {
            setResult({
              type: 'summarize',
              summaryText: data.summaryText
            });
          } else {
            setResult({
              type: currentJobType,
              url: data.convertedFile?.downloadUrl,
              filename: data.convertedFile?.filename
            });
          }
          
          setStatus('completed'); // Set final status after result is set
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setStatus('failed');
          setError(data.error?.message || 'Conversion failed');
          clearInterval(interval);
        } else {
          setProgress(data.progress || 10);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    };
    
    checkStatus();
    interval = setInterval(checkStatus, 2000);
    
    return () => clearInterval(interval);
  }, [conversionId, status, jobType]);

  const reset = () => {
    setJobId(null);
    setStatus('idle');
    setProgress(0);
    setConversionId(null);
    setError(null);
    setResult(null);
    setJobType(null);
  };

  return {
    status,
    progress,
    conversionId,
    error,
    result,
    startConversion,
    reset
  };
};

export default useConversion;
