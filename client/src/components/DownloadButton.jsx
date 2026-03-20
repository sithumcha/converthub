import React, { useState } from 'react';
import { fileService } from '../services/api';
import { Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const DownloadButton = ({ conversionId, filename = 'download.pdf', className = '', children }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        console.log('========================================');
        console.log('🔍 DOWNLOAD BUTTON CLICKED');
        console.log('🔍 conversionId:', conversionId);

        // Check token
        const token = localStorage.getItem('token');
        console.log('🔍 Token from localStorage:', token ? '✅ EXISTS' : '❌ NOT FOUND');
        if (token) {
            console.log('🔍 Token preview:', token.substring(0, 40) + '...');
        }

        if (!conversionId) {
            console.error('❌ No conversionId provided!');
            toast.error('No file ID available');
            return;
        }

        if (!token) {
            console.error('❌ No token found! Please login again.');
            toast.error('No token found. Please login again.');
            window.location.href = '/login';
            return;
        }

        setLoading(true);
        try {
            console.log('🔍 Calling fileService.downloadFile...');
            const blob = await fileService.downloadFile(conversionId, filename);
            console.log('✅ Download successful, blob size:', blob.size, 'bytes');

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Download started!');
            console.log('✅ Download started successfully');
        } catch (error) {
            console.error('❌ Download error:', error);
            toast.error(error.message || 'Download failed');
        } finally {
            setLoading(false);
        }
        console.log('========================================');
    };

    return (
        <button
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