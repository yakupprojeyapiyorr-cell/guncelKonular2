import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'
import StudyAiChat from './StudyAiChat'

export default function LessonDetails({ lesson, onBack }) {
  const [topics, setTopics] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [watchedVideos, setWatchedVideos] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [topicsRes, playlistsRes] = await Promise.all([
          apiClient.get(`/lessons/${lesson.id}/topics`),
          apiClient.get(`/lessons/${lesson.id}/playlists`),
        ])

        setTopics(topicsRes.data)
        setPlaylists(playlistsRes.data || [])

        if (playlistsRes.data) {
          const progressMap = {}
          for (const pl of playlistsRes.data) {
            const { data: watched } = await apiClient.get(`/video-progress/${pl.id}`)
            progressMap[pl.id] = watched
          }
          setWatchedVideos(progressMap)
        }
      } catch (error) {
        console.error('Detaylar yuklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [lesson.id])

  const toggleWatch = async (playlistId, videoId) => {
    const isWatched = watchedVideos[playlistId]?.includes(videoId)
    try {
      await apiClient.post('/video-progress', {
        playlistId,
        youtubeVideoId: videoId,
        isWatched: !isWatched,
      })

      setWatchedVideos((prev) => {
        const current = prev[playlistId] || []
        const next = isWatched ? current.filter((id) => id !== videoId) : [...current, videoId]
        return { ...prev, [playlistId]: next }
      })
    } catch {
      console.error('Ilerleme kaydedilemedi')
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yukleniyor...</div>

  return (
    <div className="space-y-10 animate-fadeUp">
      <button onClick={onBack} className="text-slate-500 hover:text-white font-bold flex items-center gap-2 group transition-colors">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Ders Listesine Don
      </button>

      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <span className="text-8xl">Ders</span>
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{lesson.name}</h1>
        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">{lesson.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">Konu</span>
              Mufredat Konulari
            </h2>
            <div className="space-y-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center group ${
                    selectedTopic?.id === topic.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20'
                      : 'bg-[#111620]/60 border-white/[0.05] text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="font-bold">{topic.name}</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedTopic?.id === topic.id ? 'text-white/60' : 'text-blue-500 group-hover:translate-x-1 transition-transform'}`}>
                    {selectedTopic?.id === topic.id ? 'Aktif' : 'Incele'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTopic && (
            <div className="animate-fadeUp">
              <StudyAiChat topicName={selectedTopic.name} />
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-lg">Video</span>
            Video Egitim Serileri
          </h2>
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="text-xl font-black text-white">{playlist.title}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {playlist.totalDurationMinutes || 0} Dakika
                    </span>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {playlist.videoCount || 0} Ders
                    </span>
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/playlist?list=${playlist.youtubePlaylistId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-black px-6 py-3 rounded-xl text-xs font-black hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  YouTube <span className="text-lg">↗</span>
                </a>
              </div>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => {
                  const mockId = `${playlist.youtubePlaylistId}_v${i}`
                  const watched = watchedVideos[playlist.id]?.includes(mockId)
                  return (
                    <div
                      key={mockId}
                      onClick={() => toggleWatch(playlist.id, mockId)}
                      className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all ${
                        watched ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${watched ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                          {i}
                        </div>
                        <span className={`font-bold ${watched ? 'text-emerald-400' : 'text-slate-300'}`}>Ders Videosu Bolum #{i}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${watched ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-2 border-white/[0.1] text-transparent'}`}>
                        ✓
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
