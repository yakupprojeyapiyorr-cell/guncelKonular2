import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'

export default function ExamPage() {
  const [exams, setExams] = useState([])
  const [leaderboard, setLeaderboard] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data } = await apiClient.get('/exams')
      setExams(data)
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async (examId) => {
    try {
      const { data } = await apiClient.get(`/exams/${examId}/leaderboard`)
      setLeaderboard(data.content)
      setSelectedExam(exams.find(e => e.id === examId))
    } catch (error) {
      console.error('Liderlik tablosu yüklenirken hata:', error)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yükleniyor...</div>

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Deneme Sınavları</h1>
        <p className="text-slate-400 font-medium">Sınavlara gir ve sıralamanı gör</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exams List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📝</span> Aktif Sınavlar
          </h2>
          <div className="space-y-3">
            {exams.map(exam => (
              <div 
                key={exam.id}
                onClick={() => fetchLeaderboard(exam.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedExam?.id === exam.id ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#111620]/60 border-white/[0.05] hover:border-blue-500/30'}`}
              >
                <h3 className="font-bold text-white mb-1">{exam.title}</h3>
                <div className="flex justify-between text-xs font-medium">
                  <span className={selectedExam?.id === exam.id ? 'text-blue-100' : 'text-slate-400'}>⏱️ {exam.durationMinutes} dk</span>
                  <span className={selectedExam?.id === exam.id ? 'text-blue-100' : 'text-slate-400'}>📊 {exam.questionCount} Soru</span>
                </div>
                <button className={`w-full mt-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedExam?.id === exam.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                  Sınava Başla
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏆</span> {selectedExam ? `${selectedExam.title} Sıralaması` : 'Liderlik Tablosu'}
          </h2>
          
          {leaderboard ? (
            <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Sıra</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Öğrenci</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Net</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Süre</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {leaderboard.map((res, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-slate-300/20 text-slate-300' : idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'text-slate-500'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{res.userName}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-400">{res.netScore}</td>
                      <td className="px-6 py-4 text-center text-slate-400">{res.timeTakenMinutes} dk</td>
                      <td className="px-6 py-4 text-right font-black text-blue-400">{res.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#111620]/40 border border-white/[0.05] border-dashed rounded-2xl py-20 text-center">
              <p className="text-slate-500 font-medium">Sıralamayı görmek için soldan bir sınav seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
