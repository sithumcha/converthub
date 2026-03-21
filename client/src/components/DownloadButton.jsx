import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const DownloadButton = ({ conversionId, filename = 'download.pdf', className = '', children }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        console.log('========================================');
        console.log('🔍 DOWNLOAD BUTTON CLICKED');
        console.log('🔍 conversionId:', conversionId);

        const token = localStorage.getItem('token');
        console.log('🔍 Token:', token ? '✅ YES' : '❌ NO');

        if (!token) {
            toast.error('Please login first');
            window.location.href = '/login';
            return;
        }

        if (!conversionId) {
            toast.error('No file ID');
            return;
        }

        setLoading(true);
        try {
            // ✅ Hardcoded backend URL
            const url = `https://converthub-api.onrender.com/api/files/download/${conversionId}`;
            console.log('🔍 URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📡 Status:', response.status);

            if (response.status === 401) {
                localStorage.removeItem('token');
                toast.error('Session expired. Login again.');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed: ${response.status}`);
            }

            const blob = await response.blob();
            console.log('📦 Blob size:', blob.size);

            const urlBlob = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlBlob);

            toast.success('Download started!');
            console.log('✅ Download completed');
        } catch (error) {
            console.error('❌ Error:', error);
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
            className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 ${className}`}
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {children || (loading ? 'Downloading...' : 'Download')}
        </button>
    );
};

export default DownloadButton;