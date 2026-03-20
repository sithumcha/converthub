import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const DownloadButton = ({ conversionId, filename = 'download.pdf', className = '', children }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        
        console.log('🔍 DownloadButton clicked');
        console.log('🔍 conversionId:', conversionId);

        const token = localStorage.getItem('token');
        console.log('🔍 Token exists:', token ? 'YES' : 'NO');

        if (!token) {
            toast.error('Please login first');
            window.location.href = '/login';
            return;
        }

        if (!conversionId) {
            toast.error('No file ID available');
            return;
        }

        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const url = `${API_BASE}/api/files/download/${conversionId}`;
            console.log('🔍 Download URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            console.log('📡 Response status:', response.status);

            if (response.status === 401) {
                console.error('❌ 401 Unauthorized');
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Download failed: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            console.log('📦 Blob size:', blob.size, 'bytes');
            console.log('📦 Blob type:', blob.type);

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);

            toast.success('Download started!');
            console.log('✅ Download completed');
        } catch (error) {
            console.error('❌ Download error:', error);
            toast.error(error.message || 'Download failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all ${className}`}
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {children || (loading ? 'Downloading...' : 'Download')}
        </button>
    );
};

export default DownloadButton;