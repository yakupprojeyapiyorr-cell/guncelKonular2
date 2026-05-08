import React, { useState } from 'react'
import LessonManager from '../components/admin/LessonManager'
import TopicManager from '../components/admin/TopicManager'
import SummaryManager from '../components/admin/SummaryManager'
import QuestionManager from '../components/admin/QuestionManager'
import GeneratedQuestionManager from '../components/admin/GeneratedQuestionManager'
import QuestionPoolDashboard from '../components/admin/QuestionPoolDashboard'
import ExamManager from '../components/admin/ExamManager'

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
          { id: 'pool-dashboard', label: 'Havuz Analizi', icon: '📊' },
          { id: 'questions', label: 'Sorular', icon: '📝' },
          { id: 'ai-questions', label: 'AI Soru Üretimi', icon: '✨' },
          { id: 'summaries', label: 'MEB Özetleri', icon: '📖' },
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
        {activeTab === 'pool-dashboard' && <QuestionPoolDashboard />}
        {activeTab === 'summaries' && <SummaryManager />}
        {activeTab === 'questions' && <QuestionManager />}
        {activeTab === 'ai-questions' && <GeneratedQuestionManager />}
        {activeTab === 'exams' && <ExamManager />}
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
