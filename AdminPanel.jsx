import React, { useState } from 'react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('questions')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Paneli</h1>
        <p className="text-gray-600">Sistem yönetimi ve içerik ekleme</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'questions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600'
          }`}
        >
          Sorular
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'exams'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600'
          }`}
        >
          Sınavlar
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600'
          }`}
        >
          Kullanıcılar
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'questions' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Soru Yönetimi</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold mb-4">
              + Yeni Soru Ekle
            </button>
            <p className="text-gray-500 text-center py-8">Soru listeleri burada görülecek</p>
          </div>
        )}
        {activeTab === 'exams' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Sınav Yönetimi</h2>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold mb-4">
              + Yeni Sınav Oluştur
            </button>
            <p className="text-gray-500 text-center py-8">Sınav listeleri burada görülecek</p>
          </div>
        )}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Kullanıcı Yönetimi</h2>
            <p className="text-gray-500 text-center py-8">Kullanıcı listeleri burada görülecek</p>
          </div>
        )}
      </div>
    </div>
  )
}
