import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export default function FileViewer({ file, onClose }) {
    const { token } = useAuthStore()
    const [scale, setScale] = useState(1);

    const fileType = useMemo(() => {
        if (!file?.fileType) return 'unknown';
        const type = file.fileType.toLowerCase();
        if (type.includes('pdf')) return 'pdf';
        if (type.includes('image')) return 'image';
        if (type.includes('video')) return 'video';
        if (type.includes('text') || type.includes('plain')) return 'text';
        if (type.includes('word') || type.includes('document')) return 'document';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'spreadsheet';
        return 'unknown';
    }, [file?.fileType]);

    const getDownloadUrl = (uri) => {
        if (!uri) return '';
        const baseUrl = import.meta.env.VITE_API_URL || 'https://focusflow-api-tzbl.onrender.com'; // backend URL
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanBase = base.endsWith('/api') && uri.startsWith('/api') ? base.slice(0, -4) : base;
        return `${cleanBase}${uri}`;
    };

    const handleDownload = async (downloadUrl, fileName) => {
        try {
            const response = await fetch(downloadUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                throw new Error(`İndirme başarısız: ${response.status}`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Dosya indir hatası:', error);
            alert('Dosya indirme hatası: ' + error.message);
        }
    };

    const handleOpenPdf = async (downloadUrl) => {
        try {
            const response = await fetch(downloadUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                throw new Error(`PDF açma başarısız: ${response.status}`);
            }
            const blob = await response.blob();
            // Create a blob URL with type application/pdf
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('PDF açma hatası:', error);
            alert('PDF açma hatası: ' + error.message);
        }
    };

    const handleZoom = (direction) => {
        setScale(prev => {
            const newScale = direction === 'in' ? prev + 0.2 : prev - 0.2;
            return Math.max(0.5, Math.min(3, newScale));
        });
    };

    const renderPreview = () => {
        const url = getDownloadUrl(file.fileUrl);

        switch (fileType) {
            case 'image':
                return (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => handleZoom('out')}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition"
                            >
                                🔍−
                            </button>
                            <span className="px-3 py-1 bg-slate-700 text-white rounded text-sm">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={() => handleZoom('in')}
                                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition"
                            >
                                🔍+
                            </button>
                            <button
                                onClick={() => handleDownload(url, file.fileName)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition"
                            >
                                📥 İndir
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[calc(100%-60px)] w-full flex items-center justify-center">
                            <img
                                src={url}
                                alt={file.fileName}
                                style={{ transform: `scale(${scale})` }}
                                className="max-w-full transition-transform"
                                onError={(e) => {
                                    console.error('Resim yükleme hatası:', e);
                                    e.target.src = '';
                                }}
                            />
                        </div>
                    </div>
                );

            case 'video':
                return (
                    <div className="flex flex-col gap-4 h-full">
                        <video
                            src={url}
                            controls
                            className="w-full h-full bg-black rounded-lg"
                        />
                        <button
                            onClick={() => handleDownload(url, file.fileName)}
                            className="self-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                        >
                            📥 İndir
                        </button>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-slate-300 text-center max-w-xs">
                            PDF dosyası görüntüleyicisi yükleniyor...
                        </p>
                        <button
                            onClick={() => handleOpenPdf(url)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
                        >
                            📖 PDF'yi Aç (Yeni Sekmede)
                        </button>
                        <button
                            onClick={() => handleDownload(url, file.fileName)}
                            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition"
                        >
                            📥 İndir
                        </button>
                    </div>
                );

            case 'document':
            case 'spreadsheet':
                return (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="text-6xl mb-4">
                            {fileType === 'document' ? '📝' : '📊'}
                        </div>
                        <p className="text-slate-300 text-center max-w-xs">
                            {fileType === 'document' ? 'Word belgesi' : 'Excel dosyası'} - Tarayıcı ön izlemesi desteklenmiyor
                        </p>
                        <button
                            onClick={() => handleDownload(url, file.fileName)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
                        >
                            📥 İndir
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        <div className="text-6xl mb-4">📎</div>
                        <p className="text-slate-300 text-center max-w-xs">
                            Bu dosya türü ön izleme desteklemiyor
                        </p>
                        <button
                            onClick={() => handleDownload(url, file.fileName)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
                        >
                            📥 İndir
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111620] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-3xl shrink-0">
                            {fileType === 'image' ? '🖼️' : fileType === 'video' ? '🎥' : fileType === 'pdf' ? '📄' : '📎'}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">
                                {file?.fileName || 'Dosya'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {file?.fileSizeBytes ? `${(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                        title="Kapat"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
}
