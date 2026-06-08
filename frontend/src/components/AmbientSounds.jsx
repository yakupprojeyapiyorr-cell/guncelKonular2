import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const AMBIENT_TRACKS = [
  {
    id: 'rain',
    label: 'Yağmur Sesi',
    icon: '🌧️',
    url: '/audio/rain.mp3', // Backend hosted veya CDN URL
  },
  {
    id: 'library',
    label: 'Kütüphane Ortamı',
    icon: '📚',
    url: '/audio/library.mp3', // Backend hosted veya CDN URL
  },
  {
    id: 'forest',
    label: 'Orman Sesleri',
    icon: '🌲',
    url: '/audio/forest.mp3', // Backend hosted veya CDN URL
  },
]

export default function AmbientSounds({ isPremium, isRunning }) {
  const audioRef = useRef(null)
  const [activeTrack, setActiveTrack] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(AMBIENT_TRACKS[0].id)
  const [volume, setVolume] = useState(0.4)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const toggleAudio = () => {
    if (!isPremium) return

    if (activeTrack) {
      audioRef.current?.pause()
      setActiveTrack(null)
      return
    }

    const track = AMBIENT_TRACKS.find((t) => t.id === selectedTrack)
    if (track && audioRef.current) {
      audioRef.current.src = track.url
      audioRef.current.loop = true
      audioRef.current.volume = volume
      audioRef.current.play().catch(() => {})
      setActiveTrack(track.id)
    }
  }

  if (!isPremium) {
    return (
      <div className="bg-[#111620]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          🎧 Derin Odak Sesleri
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Lofi, yağmur ve kafe ortamı sesleri Premium üyeler için aktif.
        </p>
        <Link
          to="/pricing"
          className="inline-block text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
        >
          Premium&apos;a Geç →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
      <audio ref={audioRef} />
      <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        🎧 Derin Odak Sesleri
      </h2>
      <p className="text-slate-500 text-xs mb-4">
        {isRunning ? 'Oturum devam ederken arka plan sesi' : 'Oturumu başlatınca ses otomatik açılabilir'}
      </p>

      <div className="mb-4">
        <label className="text-xs text-slate-500 block mb-2">Ses Seç</label>
        <select
          value={selectedTrack}
          onChange={(e) => {
            setSelectedTrack(e.target.value)
            if (activeTrack) {
              audioRef.current?.pause()
              setActiveTrack(null)
            }
          }}
          disabled={!isPremium}
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {AMBIENT_TRACKS.map((track) => (
            <option key={track.id} value={track.id}>
              {track.icon} {track.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <button
          type="button"
          onClick={toggleAudio}
          className={`p-4 rounded-xl border text-center transition font-bold ${
            activeTrack
              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {activeTrack ? '⏸️ Durdur' : '▶️ Ses Aç'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 shrink-0">Ses</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
      </div>
    </div>
  )
}
