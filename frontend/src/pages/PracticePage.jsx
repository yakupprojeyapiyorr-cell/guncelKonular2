import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'
import StudyAiChat from '../components/StudyAiChat'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E']

/**
 * PracticePage - Konu bazlı soru çalışma modu
 * Deneme sınavından farklı olarak:
 *   - Zamanlı değil
 *   - Her sorudan sonra AI açıklama alınabilir
 *   - Yanda StudyAiChat paneli her zaman açık
 */
export default function PracticePage() {
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [loading, setLoading] = useState(false)
  const [aiKey, setAiKey] = useState(0) // AI panelini sıfırlamak için

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const { data: lessons } = await apiClient.get('/lessons')
      const allTopics = []
      for (const lesson of lessons) {
        const { data: topicsData } = await apiClient.get(`/lessons/${lesson.id}/topics`)
        topicsData.forEach(t => allTopics.push({ ...t, lessonName: lesson.name }))
      }
      setTopics(allTopics)
    } catch (err) {
      console.error('Konular yüklenemedi:', err)
    }
  }

  const startPractice = async (topic) => {
    setLoading(true)
    setSelectedTopic(topic)
    try {
      const { data } = await apiClient.get(`/admin/questions?topicId=${topic.id}&size=10`)
      setQuestions(data.content || [])
      setCurrentIndex(0)
      setSelectedOption(null)
      setAnswered(false)
      setScore({ correct: 0, wrong: 0 })
      setAiKey(prev => prev + 1)
    } catch (err) {
      console.error('Sorular yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (optIndex) => {
    if (answered) return
    setSelectedOption(optIndex)
    setAnswered(true)

    const q = questions[currentIndex]
    if (optIndex === q.correctOption) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }))
      // AI paneli otomatik açılacak — StudyAiChat bunu props ile alır
    }
    // AI key'i güncelle → panel yeni soruya adapte olsun
    setAiKey(prev => prev + 1)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
      setAnswered(false)
    }
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = answered && selectedOption === currentQuestion?.correctOption
  const isWrong = answered && selectedOption !== currentQuestion?.correctOption

  // ── Konu Seçim Ekranı ─────────────────────────────────────────────
  if (!selectedTopic) {
    return (
      <div className="space-y-8 animate-fadeUp">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">📚 Konu Çalışması</h1>
          <p className="text-slate-400">Çalışmak istediğin konuyu seç. AI öğretmen yanında hazır olacak.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => startPractice(topic)}
              disabled={loading}
              className="text-left p-6 bg-[#111620]/80 border border-white/[0.07] rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all group"
            >
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">{topic.lessonName}</p>
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-indigo-300 transition-colors">{topic.name}</h3>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">
                <span>Çalışmaya Başla</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Yükleme ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Sorular hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  // ── Tüm Sorular Bitti ─────────────────────────────────────────────
  if (currentIndex >= questions.length || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full animate-fadeUp">
        <div className="text-center space-y-6">
          <div className="text-8xl">🏆</div>
          <h2 className="text-3xl font-black text-white">Konu Tamamlandı!</h2>
          <div className="flex gap-6 justify-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl">
              <p className="text-emerald-400 text-3xl font-black">{score.correct}</p>
              <p className="text-slate-400 text-sm">Doğru</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 px-8 py-4 rounded-2xl">
              <p className="text-rose-400 text-3xl font-black">{score.wrong}</p>
              <p className="text-slate-400 text-sm">Yanlış</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTopic(null)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Başka Konu Seç
          </button>
        </div>
      </div>
    )
  }

  // ── Soru Çözüm Ekranı ─────────────────────────────────────────────
  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] animate-fadeUp">

      {/* Sol - Soru */}
      <div className="flex-1 flex flex-col space-y-6 overflow-y-auto no-scrollbar pr-2">
        {/* Üst Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTopic(null)}
            className="text-slate-500 hover:text-white font-bold flex items-center gap-2 transition-colors"
          >
            ← Konu Listesi
          </button>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold text-sm">✓ {score.correct}</span>
              <span className="text-rose-400 font-bold text-sm">✗ {score.wrong}</span>
            </div>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Konu Etiketi */}
        <div className="flex items-center gap-3">
          <span className="text-xs bg-indigo-600/20 border border-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {selectedTopic.name}
          </span>
          <span className="text-xs text-slate-500">{currentQuestion?.difficulty}</span>
        </div>

        {/* Soru Kartı */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          <p className="text-white text-lg font-medium leading-relaxed">
            {currentQuestion?.questionText || 'Soru metni yükleniyor...'}
          </p>
        </div>

        {/* Şıklar */}
        <div className="space-y-3">
          {currentQuestion?.options?.sort((a, b) => a.index - b.index).map((opt) => {
            const isSelected = selectedOption === opt.index
            const isCorrectOpt = opt.index === currentQuestion.correctOption
            let style = 'bg-[#111620]/60 border-white/[0.07] text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/5'

            if (answered) {
              if (isCorrectOpt) style = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              else if (isSelected) style = 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              else style = 'bg-white/[0.02] border-white/[0.04] text-slate-500'
            }

            return (
              <button
                key={opt.index}
                onClick={() => handleOptionSelect(opt.index)}
                disabled={answered}
                className={`w-full text-left px-6 py-4 rounded-2xl border transition-all flex items-center gap-4 ${style}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 border ${
                  answered && isCorrectOpt ? 'bg-emerald-500 border-emerald-400 text-white' :
                  answered && isSelected ? 'bg-rose-500 border-rose-400 text-white' :
                  'bg-white/5 border-white/10'
                }`}>
                  {OPTION_LABELS[opt.index]}
                </span>
                <span className="font-medium">{opt.text}</span>
              </button>
            )
          })}
        </div>

        {/* Cevap Sonrası Feedback + İleri Butonu */}
        {answered && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <p className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? '✅ Doğru! Harika iş çıkardın.' : '❌ Yanlış. AI öğretmen sana açıklıyor →'}
            </p>
            <button
              onClick={handleNext}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>

      {/* Sağ - AI Chat Paneli (Deneme sınavında olmaz, burada her zaman var) */}
      <StudyAiChat
        key={aiKey}
        questionId={answered ? currentQuestion?.id : null}
        selectedOption={isWrong ? selectedOption : null}
        topicName={selectedTopic?.name}
      />
    </div>
  )
}
