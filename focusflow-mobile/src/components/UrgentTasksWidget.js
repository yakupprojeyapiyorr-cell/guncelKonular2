import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';

const PRIORITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#64748b',
};

const PRIORITY_LABELS = {
  CRITICAL: 'Kritik',
  HIGH: 'Yuksek',
  MEDIUM: 'Orta',
  LOW: 'Dusuk',
};

const DIFFICULTY_STARS = {
  EASY: '⭐',
  MEDIUM: '⭐⭐',
  HARD: '⭐⭐⭐',
};

function urgencyScore(task) {
  const p = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[task.priority || 'MEDIUM'];
  const d = { HARD: 0, MEDIUM: 1, EASY: 2 }[task.difficulty || 'MEDIUM'];
  return p * 10 + d;
}

export default function UrgentTasksWidget() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await apiClient.get('/tasks');
        const urgent = data
          .filter((t) => !t.completed && !t.parentTaskId)
          .filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH')
          .sort((a, b) => urgencyScore(a) - urgencyScore(b))
          .slice(0, 5);
        setTasks(urgent);
      } catch (err) {
        console.log('Acil gorevler yuklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#818cf8" />
        <Text style={styles.loadingText}>Yukleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔴 En Acil Gorevler</Text>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>Kritik veya yuksek oncelikli bekleyen gorev yok.</Text>
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { borderColor: PRIORITY_COLORS[task.priority] + '40', backgroundColor: PRIORITY_COLORS[task.priority] + '15' }]}>
                    <Text style={[styles.badgeText, { color: PRIORITY_COLORS[task.priority] }]}>
                      {PRIORITY_LABELS[task.priority] || 'Orta'}
                    </Text>
                  </View>
                  <Text style={styles.stars}>{DIFFICULTY_STARS[task.difficulty || 'MEDIUM']}</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.7 }]}
                onPress={() => navigation.navigate('Pomodoro', { taskId: task.id })}
              >
                <Ionicons name="play" size={16} color="#818cf8" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    backgroundColor: 'rgba(17, 22, 32, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  loadingText: { color: '#64748b', fontSize: 13 },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#f87171' },
  emptyText: { color: '#64748b', fontSize: 13 },
  list: { gap: 8 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  taskInfo: { flex: 1, marginRight: 10 },
  taskTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  stars: { fontSize: 10 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
