import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// File Services
export const fileService = {
  convert: (file, targetFormat) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    return api.post('/files/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getHistory: () => api.get('/files/history'),
  getStatus: (id) => api.get(`/files/status/${id}`),
  download: (id) => `${API_URL}/files/download/${id}`,
  batchDownload: (conversionIds) => api.post('/files/batch-download', { conversionIds }),

  // ✅ Fixed downloadFile function with credentials: 'include'
  downloadFile: async (conversionId, filename = 'download.pdf') => {
    console.log('🔍 Download requested for:', conversionId);

    const token = localStorage.getItem('token');
    console.log('🔍 Token exists:', !!token);

    if (!token) {
      console.error('❌ No token found');
      throw new Error('No token found. Please login again.');
    }

    const API_URL = import.meta.env.VITE_API_URL;
    const url = `${API_URL}/files/download/${conversionId}`;
    console.log('🔍 Download URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'  // ✅ Important: Send cookies with request
      });

      console.log('🔍 Response status:', response.status);

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalid');
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('✅ Download successful, blob size:', blob.size);
      return blob;

    } catch (error) {
      console.error('❌ Download error:', error);
      throw error;
    }
  }
};

export const pdfService = {
  merge: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  split: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/split', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  compress: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  toDocx: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/to-docx', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  protect: (file, password) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return api.post('/pdf/protect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const imageService = {
  process: (file, options) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.targetFormat) formData.append('targetFormat', options.targetFormat);
    if (options.quality) formData.append('quality', options.quality);
    if (options.width) formData.append('width', options.width);
    if (options.height) formData.append('height', options.height);

    return api.post('/images/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  removeBg: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/images/remove-bg', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const ocrService = {
  extract: (file, lang, engine = 'tesseract') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);
    formData.append('engine', engine);
    return api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getResult: (id) => api.get(`/ocr/result/${id}`),
  export: (text, format) => api.post('/ocr/export', { text, format })
};

export const paymentService = {
  createCheckoutSession: () => api.post('/payments/create-checkout-session')
};

export default api;