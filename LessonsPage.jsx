import React from 'react'

export default function LessonsPage() {
  const lessons = [
    { id: 1, name: 'Matematik', color: 'blue' },
    { id: 2, name: 'Türkçe', color: 'green' },
    { id: 3, name: 'İngilizce', color: 'purple' },
    { id: 4, name: 'Fen Bilgisi', color: 'red' },
    { id: 5, name: 'Sosyal Bilgiler', color: 'yellow' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dersler</h1>
        <p className="text-gray-600">Çalışmak istediğiniz dersi seçin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`bg-${lesson.color}-50 border-2 border-${lesson.color}-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition transform hover:scale-105`}
          >
            <h3 className={`text-xl font-bold text-${lesson.color}-900 mb-2`}>{lesson.name}</h3>
            <p className={`text-${lesson.color}-700 text-sm mb-4`}>
              Konu başlıklarını görmek için tıklayınız
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">0/0 konular tamamlandı</span>
              <span className="text-2xl">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
