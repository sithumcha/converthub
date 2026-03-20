import React, { useState } from 'react';
import { fileService } from '../services/api';
import { Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const DownloadButton = ({ conversionId, filename = 'download.pdf', className = '', children }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!conversionId) {
            toast.error('No file ID available');
            return;
        }

        setLoading(true);
        try {
            const blob = await fileService.downloadFile(conversionId, filename);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error(error.message || 'Download failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all ${className}`}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                <Download size={18} />
            )}
            {children || (loading ? 'Downloading...' : 'Download')}
        </button>
    );
};

export default DownloadButton;