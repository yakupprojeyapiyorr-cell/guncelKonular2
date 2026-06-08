import React, { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import FileViewer from './FileViewer';

export default function TaskAttachmentsModal({ taskId, onClose }) {
    const [attachments, setAttachments] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchAttachments();
    }, [taskId]);

    const fetchAttachments = async () => {
        try {
            const { data } = await apiClient.get(`/tasks/${taskId}/attachments`);
            setAttachments(data);
        } catch (error) {
            console.error("Attachments fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            uploadFiles(files);
        }
    };

    const uploadFiles = async (files) => {
        setUploading(true);
        setError('');
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const { data } = await apiClient.post(`/tasks/${taskId}/attachments`, formData);
                setAttachments(prev => [...prev, data]);
            } catch (err) {
                console.error("Upload failed:", err);
                setError(err.response?.data || 'Dosya yuklenemedi. Lutfen tekrar deneyin.');
            }
        }
        setUploading(false);
    };

    const deleteAttachment = async (attId) => {
        try {
            await apiClient.delete(`/tasks/attachments/${attId}`);
            setAttachments(prev => prev.filter(a => a.id !== attId));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return '📎';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('video')) return '🎥';
        return '📎';
    };

    // Construct full URL for download since the backend returns a relative URI.
    // apiClient.defaults.baseURL usually contains the backend URL.
    const getDownloadUrl = (uri) => {
        const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8080';
        // Remove trailing slash from base if present
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // Remove /api from base if the URI already contains /api
        const cleanBase = base.endsWith('/api') && uri.startsWith('/api') ? base.slice(0, -4) : base;
        return `${cleanBase}${uri}`;
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-[#111620] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            📎 Görev Dosyaları
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        {/* Drag-Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`
                                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-6
                                ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 bg-white/5 hover:border-white/40'}
                            `}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <span className="text-3xl mb-2 block">📥</span>
                            <p className="text-indigo-400 font-semibold text-sm">
                                Dosyaları sürükle veya seçmek için tıkla
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                {uploading ? 'Yukleniyor...' : 'PDF, Word, Excel, Resim, Video (Max 50MB)'}
                            </p>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => uploadFiles(e.target.files)}
                                className="hidden"
                                id="file-upload"
                            />
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                                {error}
                            </div>
                        )}

                        {/* Attachments List */}
                        {loading ? (
                            <p className="text-center text-slate-400 text-sm">Yükleniyor...</p>
                        ) : attachments.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm">Henüz dosya eklenmemiş.</p>
                        ) : (
                            <div className="space-y-3">
                                {attachments.map((att) => (
                                    <div 
                                        key={att.id} 
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition group cursor-pointer"
                                        onClick={() => setSelectedFile(att)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            <span className="text-2xl shrink-0">{getFileIcon(att.fileType)}</span>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-white text-sm truncate" title={att.fileName}>
                                                    {att.fileName}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    {(att.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(att); }}
                                                className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition"
                                                title="Görüntüle"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                            <a
                                                href={getDownloadUrl(att.fileUrl)}
                                                download={att.fileName}
                                                className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition"
                                                title="İndir"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            </a>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteAttachment(att.id); }}
                                                className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition"
                                                title="Sil"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedFile && (
                <FileViewer 
                    file={selectedFile} 
                    onClose={() => setSelectedFile(null)} 
                />
            )}
        </>
    );
}
