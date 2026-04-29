import React, { useState } from 'react'
import LessonManager from '../components/admin/LessonManager'
import TopicManager from '../components/admin/TopicManager'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('questions')

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Admin Paneli</h1>
        <p className="text-slate-400 font-medium">Sistem yönetimi ve içerik yapılandırma merkezi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#111620]/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.05] overflow-x-auto no-scrollbar">
        {[
          { id: 'lessons', label: 'Dersler', icon: '📚' },
          { id: 'topics', label: 'Konular', icon: '📎' },
          { id: 'questions', label: 'Sorular', icon: '📝' },
          { id: 'exams', label: 'Sınavlar', icon: '🏆' },
          { id: 'users', label: 'Kullanıcılar', icon: '👥' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-8 min-h-[500px]">
        {activeTab === 'lessons' && <LessonManager />}
        {activeTab === 'topics' && <TopicManager />}
        {activeTab === 'questions' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-white mb-3">Soru Yönetimi</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Soru bankasını yönetin, yeni sorular ekleyin veya mevcut soruları düzenleyin.</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              + Yeni Soru Ekle
            </button>
          </div>
        )}
        {activeTab === 'exams' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-3">Sınav Yönetimi</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Sınavlar oluşturun, süresini belirleyin ve öğrencilerin performansını takip edin.</p>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
              + Yeni Sınav Oluştur
            </button>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">👥</div>
            <h2 className="text-2xl font-bold text-white mb-3">Kullanıcı Yönetimi</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Sistemdeki kullanıcıları görüntüleyin ve rollerini yönetin.</p>
            <p className="text-blue-400 font-medium">Bu özellik çok yakında burada olacak.</p>
          </div>
        )}
      </div>
    </div>
  )
}
