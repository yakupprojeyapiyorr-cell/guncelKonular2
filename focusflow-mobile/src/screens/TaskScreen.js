import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

const PRIORITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#22c55e',
};

const PRIORITY_LABELS = {
  CRITICAL: 'Kritik',
  HIGH: 'Yuksek',
  MEDIUM: 'Orta',
  LOW: 'Dusuk',
};

const CATEGORY_ICONS = {
  SOFTWARE: 'code-slash',
  EDUCATION: 'school-outline',
  READING: 'book-outline',
  SPORT: 'fitness-outline',
  OTHER: 'apps-outline',
};

const CATEGORY_LABELS = {
  SOFTWARE: 'Yazilim',
  EDUCATION: 'Egitim',
  READING: 'Okuma',
  SPORT: 'Spor',
  OTHER: 'Diger',
};

const DIFFICULTY_STARS = {
  EASY: '⭐',
  MEDIUM: '⭐⭐',
  HARD: '⭐⭐⭐',
};

export default function TaskScreen() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDifficulty, setNewDifficulty] = useState('MEDIUM');
  const [newCategory, setNewCategory] = useState('OTHER');
  const [newFolderName, setNewFolderName] = useState('Genel');
  const [newRecurrence, setNewRecurrence] = useState('NONE');

  const fetchTasks = async () => {
    try {
      const { data } = await apiClient.get('/tasks');
      setTasks(data || []);
    } catch (err) {
      console.log('Gorevler yuklenemedi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleToggle = async (taskId) => {
    try {
      const { data } = await apiClient.patch(`/tasks/${taskId}/toggle`);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: data.completed } : t))
      );
    } catch (err) {
      Alert.alert('Hata', 'Gorev durumu guncellenemedi.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id && t.parentTaskId !== id));
    } catch (err) {
      Alert.alert('Hata', 'Gorev silinemedi.');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: newTaskTitle,
        description: '',
        folderName: newFolderName,
        priority: newPriority,
        difficulty: newDifficulty,
        recurrence: newRecurrence,
        category: newCategory,
      };
      const { data } = await apiClient.post('/tasks', payload);
      setTasks((prev) => [data, ...prev]);
      setNewTaskTitle('');
      setShowForm(false);
      setNewPriority('MEDIUM');
      setNewDifficulty('MEDIUM');
      setNewCategory('OTHER');
      setNewFolderName('Genel');
      setNewRecurrence('NONE');
    } catch (err) {
      Alert.alert('Hata', 'Gorev eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  const renderTask = ({ item }) => {
    const priorityColor = PRIORITY_COLORS[item.priority] || '#64748b';
    const categoryIcon = CATEGORY_ICONS[item.category] || 'apps-outline';

    return (
      <View style={[styles.taskCard, item.completed && styles.taskCompleted]}>
        <Pressable onPress={() => handleToggle(item.id)} style={styles.taskLeft}>
          <View
            style={[
              styles.checkbox,
              item.completed && { backgroundColor: '#22c55e', borderColor: '#22c55e' },
            ]}
          >
            {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.taskInfo}>
            <Text
              style={[styles.taskTitle, item.completed && styles.taskTitleDone]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { borderColor: priorityColor + '40', backgroundColor: priorityColor + '15' }]}>
                <Text style={[styles.badgeText, { color: priorityColor }]}>{PRIORITY_LABELS[item.priority] || 'Orta'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeTextStar}>{DIFFICULTY_STARS[item.difficulty] || '⭐⭐'}</Text>
              </View>
              <View style={[styles.badge, { borderColor: '#6366f140', backgroundColor: '#6366f115' }]}>
                <Text style={[styles.badgeText, { color: '#818cf8' }]}>{CATEGORY_LABELS[item.category] || 'Diger'}</Text>
              </View>
            </View>
          </View>
        </Pressable>
        <View style={styles.taskRight}>
          <Ionicons name={categoryIcon} size={20} color="#64748b" />
          <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#0a0f1a', '#111620']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎯 Gorevlerim</Text>
          <Pressable
            onPress={() => setShowForm(!showForm)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
            <Text style={styles.addBtnText}>{showForm ? 'Kapat' : 'Yeni Gorev'}</Text>
          </Pressable>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' },
              ]}
            />
          </View>
          <View style={styles.statsTextRow}>
            <Text style={styles.statsText}>
              {tasks.length > 0
                ? `%${Math.round((completedCount / tasks.length) * 100)} tamamlandi`
                : 'Henuz gorev yok'}
            </Text>
            <Text style={styles.statsText}>
              {completedCount}/{tasks.length}
            </Text>
          </View>
        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Yeni bir gorev ekle..."
              placeholderTextColor="#64748b"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Klasor adi (Orn: Genel)"
              placeholderTextColor="#64748b"
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            
            <View style={styles.formOptionsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setNewPriority(p)}
                    style={[styles.optionChip, newPriority === p && { backgroundColor: PRIORITY_COLORS[p], borderColor: PRIORITY_COLORS[p] }]}
                  >
                    <Text style={[styles.optionText, newPriority === p && { color: '#fff' }]}>{PRIORITY_LABELS[p]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formOptionsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setNewDifficulty(d)}
                    style={[styles.optionChip, newDifficulty === d && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, newDifficulty === d && styles.optionTextActive]}>{DIFFICULTY_STARS[d]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formOptionsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {Object.keys(CATEGORY_LABELS).map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setNewCategory(c)}
                    style={[styles.optionChip, newCategory === c && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, newCategory === c && styles.optionTextActive]}>{CATEGORY_LABELS[c]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formOptionsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {[
                  { val: 'NONE', label: 'Tek Seferlik' },
                  { val: 'DAILY', label: 'Gunluk' },
                  { val: 'WEEKLY', label: 'Haftalik' },
                  { val: 'MONTHLY', label: 'Aylik' }
                ].map((r) => (
                  <Pressable
                    key={r.val}
                    onPress={() => setNewRecurrence(r.val)}
                    style={[styles.optionChip, newRecurrence === r.val && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, newRecurrence === r.val && styles.optionTextActive]}>{r.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Pressable
              onPress={handleAddTask}
              disabled={saving}
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Gorevi Ekle</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Task List */}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTasks();
              }}
              tintColor="#818cf8"
              colors={['#818cf8']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="clipboard-outline" size={48} color="#334155" />
              <Text style={styles.emptyText}>Henuz gorev eklenmemis.</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#f1f5f9' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statsBar: { paddingHorizontal: 20, marginBottom: 16 },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  statsTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsText: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  formOptionsRow: {
    marginBottom: 10,
  },
  optionsScroll: {
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  taskCompleted: { opacity: 0.55 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#334155',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#64748b' },
  badgeContainer: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontWeight: '700' },
  badgeTextStar: { fontSize: 8 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 12 },
  deleteBtn: {
    padding: 4,
  },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#475569', fontSize: 14, marginTop: 12 },
});
