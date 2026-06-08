import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import TaskAttachmentsModal from './TaskAttachmentsModal'

export default function TaskManagerWidget() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [newPriority, setNewPriority] = useState('MEDIUM')
  const [newDifficulty, setNewDifficulty] = useState('MEDIUM')
  const [newRecurrence, setNewRecurrence] = useState('NONE')
  const [newCategory, setNewCategory] = useState('OTHER')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [selectedTaskForAttachments, setSelectedTaskForAttachments] = useState(null)

  // Alt gorev ekleme state'leri
  const [subTaskParentId, setSubTaskParentId] = useState(null)
  const [subTaskTitle, setSubTaskTitle] = useState('')

  const isPremium = user?.subscriptionType === 'PREMIUM'

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data } = await apiClient.get('/tasks')
      setTasks(data)
      setError(null)
    } catch (err) {
      console.error('Görevler yüklenemedi:', err)
      setError('Görevler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const payload = {
        title: newTaskTitle,
        description: '',
        folderName: isPremium && newFolderName.trim() ? newFolderName.trim() : 'Genel',
        priority: newPriority,
        difficulty: newDifficulty,
        recurrence: newRecurrence,
        category: newCategory,
      }
      
      const { data } = await apiClient.post('/tasks', payload)
      setTasks([data, ...tasks])
      setNewTaskTitle('')
      if(isPremium) setNewFolderName('')
      setNewPriority('MEDIUM')
      setNewDifficulty('MEDIUM')
      setNewRecurrence('NONE')
      setNewCategory('OTHER')
      setError(null)
    } catch (err) {
      handleApiError(err)
    }
  }

  const handleAddSubTask = async (e, parentId) => {
    e.preventDefault()
    if (!subTaskTitle.trim() || !isPremium) return

    try {
      const parentTask = tasks.find(t => t.id === parentId)
      const payload = {
        title: subTaskTitle,
        description: '',
        folderName: parentTask?.folderName || 'Genel',
        parentTaskId: parentId
      }
      
      const { data } = await apiClient.post('/tasks', payload)
      setTasks([...tasks, data])
      setSubTaskTitle('')
      setSubTaskParentId(null)
      setError(null)
    } catch (err) {
      handleApiError(err)
    }
  }

  const handleApiError = (err) => {
    setError(
      <span>
        Görev eklerken hata oluştu. Abonelik limitine ulaştınız.{' '}
        <a href="/pricing" className="underline font-bold text-rose-200">Premium'a Geçin.</a>
      </span>
    )
  }

  const toggleTask = async (id) => {
    try {
      await apiClient.patch(`/tasks/${id}/toggle`)
      await fetchTasks()
      // Görev durumu değiştiğinde Dashboard istatistiklerini güncelle
      window.dispatchEvent(new Event('stats-updated'))
    } catch (err) {
      console.error('Görev güncellenemedi:', err)
    }
  }

  const deleteTask = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`)
      // Delete task and its subtasks from state
      setTasks(tasks.filter(t => t.id !== id && t.parentTaskId !== id))
    } catch (err) {
      console.error('Görev silinemedi:', err)
    }
  }

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }))
  }

  // Gruplama ve Hiyerarsi Kurma
  const rootTasks = tasks.filter(t => !t.parentTaskId)
  const groupedTasks = rootTasks.reduce((acc, task) => {
    const folder = task.folderName || 'Genel'
    if (!acc[folder]) acc[folder] = []
    acc[folder].push(task)
    return acc
  }, {})

  if (loading) return <div className="text-white">Yükleniyor...</div>

  return (
    <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[500px]">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🎯 Görevlerim</h2>
      
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleAddTask} className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Yeni bir görev ekle..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            Ekle
          </button>
        </div>
        {isPremium ? (
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="📁 Proje / Klasör Adı (Opsiyonel)"
            className="bg-white/5 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-100 placeholder:text-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        ) : (
           <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
             <span className="text-amber-500">🔒</span> Klasör ve Alt Görev özellikleri için <a href="/pricing" className="text-blue-400 hover:underline">Premium'a geçin</a>.
           </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="CRITICAL" className="bg-[#111620]">🔴 Kritik</option>
            <option value="HIGH" className="bg-[#111620]">🟡 Yüksek</option>
            <option value="MEDIUM" className="bg-[#111620]">🟢 Orta</option>
            <option value="LOW" className="bg-[#111620]">⚪ Düşük</option>
          </select>
          <select
            value={newDifficulty}
            onChange={(e) => setNewDifficulty(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="EASY" className="bg-[#111620]">⭐ Kolay</option>
            <option value="MEDIUM" className="bg-[#111620]">⭐⭐ Orta</option>
            <option value="HARD" className="bg-[#111620]">⭐⭐⭐ Zor</option>
          </select>
          {isPremium && (
            <select
              value={newRecurrence}
              onChange={(e) => setNewRecurrence(e.target.value)}
              className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 col-span-2"
            >
              <option value="NONE" className="bg-[#111620]">Sadece Bir Kez</option>
              <option value="DAILY" className="bg-[#111620]">🔁 Her Gün Tekrarla</option>
              <option value="WEEKLY" className="bg-[#111620]">🔁 Her Hafta Tekrarla</option>
              <option value="MONTHLY" className="bg-[#111620]">🔁 Her Ay Tekrarla</option>
            </select>
          )}
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-2"
          >
            <option value="SOFTWARE" className="bg-[#111620]">💻 Yazılım</option>
            <option value="EDUCATION" className="bg-[#111620]">📚 Eğitim/Okul</option>
            <option value="READING" className="bg-[#111620]">📖 Kitap/Okuma</option>
            <option value="SPORT" className="bg-[#111620]">🏃‍♂️ Spor</option>
            <option value="OTHER" className="bg-[#111620]">📌 Diğer</option>
          </select>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {Object.keys(groupedTasks).length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Henüz bir görev eklenmedi.</p>
        ) : (
          Object.entries(groupedTasks).map(([folder, folderTasks]) => {
            const isExpanded = expandedFolders[folder] !== false
            return (
              <div key={folder} className="space-y-2">
                <div 
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-slate-500 text-xs transition-transform group-hover:text-white">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">{folder}</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                {isExpanded && (
                  <div className="space-y-2 pl-2">
                    {folderTasks.map(task => {
                      const subTasks = tasks.filter(t => t.parentTaskId === task.id)
                      return (
                        <div key={task.id} className="flex flex-col gap-1">
                          {/* ANA GOREV */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition">
                            <div className="flex items-center gap-3 flex-1">
                              <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-lg border-2 flex shrink-0 items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-white/40'}`}
                              >
                                {task.completed && <span className="text-white text-xs">✓</span>}
                              </button>
                              <span className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {task.recurrence && task.recurrence !== 'NONE' && <span className="text-indigo-400 mr-1" title="Tekrarlayan Görev">🔁</span>}
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <CategoryBadge category={task.category} />
                                <PriorityBadge priority={task.priority} />
                                <DifficultyBadge difficulty={task.difficulty} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {isPremium && (
                                <button
                                  onClick={() => setSubTaskParentId(subTaskParentId === task.id ? null : task.id)}
                                  className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-emerald-300 p-2 transition flex items-center justify-center bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"
                                  title="Alt Görev Ekle"
                                >
                                  +
                                </button>
                              )}
                              {!task.completed && (
                                <button
                                  onClick={() => navigate('/pomodoro', { state: { taskId: task.id } })}
                                  className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 p-2 transition flex items-center justify-center bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20"
                                  title="Bu görev için odaklan"
                                >
                                  ▶
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedTaskForAttachments(task.id)}
                                className="text-sky-400 hover:text-sky-300 p-2 transition flex items-center justify-center bg-sky-500/10 rounded-lg hover:bg-sky-500/20"
                                title="Dosya Ekleri"
                              >
                                📎
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-rose-400 hover:text-rose-300 p-2 transition rounded-lg hover:bg-rose-500/10"
                                title="Görevi Sil"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* ALT GOREV EKLEME FORMU */}
                          {subTaskParentId === task.id && isPremium && (
                            <form onSubmit={(e) => handleAddSubTask(e, task.id)} className="pl-10 flex gap-2 mt-1">
                              <input
                                autoFocus
                                type="text"
                                value={subTaskTitle}
                                onChange={(e) => setSubTaskTitle(e.target.value)}
                                placeholder="Alt görev adı..."
                                className="flex-1 bg-[#111620] border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-500"
                              />
                              <button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition">Kaydet</button>
                            </form>
                          )}

                          {/* ALT GOREVLER LISTESI */}
                          {subTasks.length > 0 && (
                            <div className="pl-8 space-y-1 mt-1">
                              {subTasks.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition">
                                  <div className="flex items-center gap-2 flex-1">
                                    <button 
                                      onClick={() => toggleTask(sub.id)}
                                      className={`w-4 h-4 rounded border flex shrink-0 items-center justify-center transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-white/40'}`}
                                    >
                                      {sub.completed && <span className="text-white text-[10px]">✓</span>}
                                    </button>
                                    <span className={`text-xs font-medium ${sub.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!sub.completed && (
                                      <button
                                        onClick={() => navigate('/pomodoro', { state: { taskId: sub.id } })}
                                        className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 p-1 transition flex items-center justify-center rounded hover:bg-indigo-500/20"
                                        title="Bu alt görev için odaklan"
                                      >
                                        ▶
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setSelectedTaskForAttachments(sub.id)}
                                      className="text-sky-400 hover:text-sky-300 p-1 transition flex items-center justify-center rounded hover:bg-sky-500/20"
                                      title="Dosya Ekleri"
                                    >
                                      📎
                                    </button>
                                    <button
                                      onClick={() => deleteTask(sub.id)}
                                      className="text-rose-400 hover:text-rose-300 p-1 transition rounded hover:bg-rose-500/10"
                                      title="Sil"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {selectedTaskForAttachments && (
        <TaskAttachmentsModal 
          taskId={selectedTaskForAttachments} 
          onClose={() => setSelectedTaskForAttachments(null)} 
        />
      )}
    </div>
  )
}

function PriorityBadge({ priority }) {
  const styles = {
    CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/10',
    HIGH: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    MEDIUM: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    LOW: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
  }
  const labels = { CRITICAL: 'Kritik', HIGH: 'Yüksek', MEDIUM: 'Orta', LOW: 'Düşük' }
  const p = priority || 'MEDIUM'
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles[p]}`}>
      {labels[p]}
    </span>
  )
}

function DifficultyBadge({ difficulty }) {
  const stars = { EASY: '⭐', MEDIUM: '⭐⭐', HARD: '⭐⭐⭐' }
  return <span className="text-[10px] text-yellow-500">{stars[difficulty || 'MEDIUM']}</span>
}

function CategoryBadge({ category }) {
  const styles = {
    SOFTWARE: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    EDUCATION: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    READING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    SPORT: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    OTHER: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }
  const labels = {
    SOFTWARE: 'Yazılım',
    EDUCATION: 'Okul',
    READING: 'Okuma',
    SPORT: 'Spor',
    OTHER: 'Diğer',
  }
  const c = category || 'OTHER'
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles[c]}`}>
      {labels[c]}
    </span>
  )
}
