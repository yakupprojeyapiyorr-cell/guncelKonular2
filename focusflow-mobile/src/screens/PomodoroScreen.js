import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = {
  SOFTWARE: '💻 Yazılım',
  EDUCATION: '📚 Eğitim',
  READING: '📖 Okuma',
  SPORT: '🏃 Spor',
  OTHER: '📌 Diğer',
};

export default function PomodoroScreen() {
  const user = useAuthStore((state) => state.user);
  
  const [workMinutes, setWorkMinutes] = useState('25');
  const [breakMinutes, setBreakMinutes] = useState('5');
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('OTHER');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const timerRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const { data } = await apiClient.get('/tasks');
      setTasks((data || []).filter(t => !t.completed));
    } catch (err) {
      console.log('Görevler yüklenemedi:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            const completedMinutes = mode === 'work' ? parseInt(workMinutes) : parseInt(breakMinutes);
            handleEndSession(completedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, workMinutes, breakMinutes]);

  const handleStart = async () => {
    if (isRunning) return;
    
    if (mode === 'break') {
      setIsRunning(true);
      return;
    }

    setLoading(true);
    try {
      let query = '';
      if (selectedTaskId) {
        query = `?taskId=${selectedTaskId}`;
      } else if (selectedCategory) {
        query = `?category=${selectedCategory}`;
      }
      
      const response = await apiClient.post(`/pomodoro/sessions/start${query}`);
      if (response.data?.id) {
        setSessionId(response.data.id);
        setIsRunning(true);
      }
    } catch (err) {
      Alert.alert('Hata', 'Oturum baslatilamadi. Internete bagli oldugunuzdan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/pomodoro/stats/today');
      // If we had local state for stats we could set it here
      // setStats(response.data);
    } catch (err) {
      console.log('Pomodoro istatistikleri alinamadi', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleEndSession = async (completedMinutes) => {
    setIsRunning(false);
    if (!sessionId) {
      // Just finish the break or an untracked session
      const nextMode = mode === 'work' ? 'break' : 'work';
      setMode(nextMode);
      setTimeLeft(nextMode === 'work' ? parseInt(workMinutes) * 60 : parseInt(breakMinutes) * 60);
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post(`/pomodoro/sessions/${sessionId}/end?durationMinutes=${completedMinutes}`);
      Alert.alert('Tebrikler!', `${completedMinutes} dakikalik odaklanma oturumu basariyla kaydedildi.`);
      fetchStats();
    } catch (err) {
      Alert.alert('Hata', 'Oturum kaydedilemedi.');
    } finally {
      setLoading(false);
      setSessionId(null);
      const nextMode = mode === 'work' ? 'break' : 'work';
      setMode(nextMode);
      setTimeLeft(nextMode === 'work' ? parseInt(workMinutes) * 60 : parseInt(breakMinutes) * 60);
    }
  };

  const handleStop = () => {
    Alert.alert('Oturumu Bitir', 'Bu oturumu erken bitirmek istediginize emin misiniz? Sadece calistiginiz sure kaydedilecek.', [
      { text: 'Iptal', style: 'cancel' },
      { 
        text: 'Bitir', 
        style: 'destructive', 
        onPress: () => {
          const defaultTime = mode === 'work' ? parseInt(workMinutes) * 60 : parseInt(breakMinutes) * 60;
          const workedSeconds = defaultTime - timeLeft;
          const workedMinutes = Math.floor(workedSeconds / 60);
          if (workedMinutes > 0 && mode === 'work') {
            handleEndSession(workedMinutes);
          } else {
            setIsRunning(false);
            setSessionId(null);
            resetTimer();
          }
        } 
      },
    ]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const defaultTime = mode === 'work' ? parseInt(workMinutes) * 60 : parseInt(breakMinutes) * 60;
    setTimeLeft(defaultTime);
  };

  const handleSkipForward = () => {
    setTimeLeft((prev) => Math.max(0, prev - (5 * 60)));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#1a1f2e']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pomodoro Zamanlayici</Text>
          <Text style={styles.headerSubtitle}>Odaklan ve oturumlarini sisteme kaydet.</Text>
        </View>

        {/* Settings Panel */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Ayarlar</Text>
          
          <View style={styles.settingCol}>
            <Text style={styles.settingLabel}>Görev Seçimi (Opsiyonel)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              <Pressable
                onPress={() => setSelectedTaskId('')}
                style={[styles.chip, !selectedTaskId && styles.chipActive]}
              >
                <Text style={[styles.chipText, !selectedTaskId && styles.chipTextActive]}>Genel (Görev Yok)</Text>
              </Pressable>
              {tasks.map(t => (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedTaskId(t.id)}
                  style={[styles.chip, selectedTaskId === t.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedTaskId === t.id && styles.chipTextActive]}>{t.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {!selectedTaskId && (
            <View style={styles.settingCol}>
              <Text style={styles.settingLabel}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedCategory(key)}
                    style={[styles.chip, selectedCategory === key && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selectedCategory === key && styles.chipTextActive]}>{label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Calisma Suresi (Dk)</Text>
            <TextInput
              style={styles.settingInput}
              keyboardType="numeric"
              value={workMinutes}
              editable={!isRunning && user?.subscriptionType === 'PREMIUM'}
              onChangeText={(val) => {
                setWorkMinutes(val);
                if (!isRunning && mode === 'work') setTimeLeft((parseInt(val) || 0) * 60);
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Mola Suresi (Dk)</Text>
            <TextInput
              style={styles.settingInput}
              keyboardType="numeric"
              value={breakMinutes}
              editable={!isRunning && user?.subscriptionType === 'PREMIUM'}
              onChangeText={(val) => {
                setBreakMinutes(val);
                if (!isRunning && mode === 'break') setTimeLeft((parseInt(val) || 0) * 60);
              }}
            />
          </View>

          {user?.subscriptionType !== 'PREMIUM' && (
            <Text style={styles.premiumText}>Sureleri degistirmek icin Premium'a gecin.</Text>
          )}
        </View>

        <View style={styles.content}>
          {/* Circle Timer */}
          <View style={[styles.timerCircleOuter, mode === 'break' && { borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.05)' }]}>
            <View style={[styles.timerCircleInner, mode === 'break' && { borderColor: '#10b981', shadowColor: '#10b981' }]}>
              <Text style={[styles.timerText, mode === 'break' && { color: '#34d399' }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.timerLabel, mode === 'break' && { color: '#10b981' }]}>
                {isRunning ? (mode === 'work' ? 'Odaklan!' : 'Dinlen!') : 'Hazir'}
              </Text>
            </View>
          </View>

          {/* Mode Badge */}
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {mode === 'work' ? 'Calisma Oturumu' : 'Mola Oturumu'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {loading ? (
              <ActivityIndicator size="large" color="#6366f1" />
            ) : (
              <>
                {!isRunning ? (
                  <Pressable onPress={handleStart} style={[styles.btn, styles.startBtn]}>
                    <Ionicons name="play" size={28} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable onPress={handlePause} style={[styles.btn, styles.pauseBtn]}>
                    <Ionicons name="pause" size={28} color="#fff" />
                  </Pressable>
                )}
                
                <Pressable onPress={resetTimer} style={[styles.btn, styles.resetBtn]}>
                  <Ionicons name="refresh" size={24} color="#fff" />
                </Pressable>

                <Pressable onPress={handleStop} style={[styles.btn, styles.stopBtn, !sessionId && { opacity: 0.5 }]} disabled={!sessionId}>
                  <Ionicons name="square" size={24} color="#ef4444" />
                </Pressable>
              </>
            )}
          </View>
          
          <Pressable onPress={handleSkipForward} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>+5 Dk Ileri Sar (Test)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  scrollContent: { paddingBottom: 50 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  headerSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  settingsCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  settingsTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 },
  settingCol: { marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingLabel: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  chipScroll: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  settingInput: {
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumText: {
    fontSize: 12,
    color: '#818cf8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modeBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  modeBadgeText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerCircleOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99,102,241,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerCircleInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#0a0f1a',
    borderWidth: 8,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#f1f5f9',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#818cf8',
    fontWeight: '600',
    marginTop: -5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    height: 80,
    marginBottom: 20,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  startBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
  },
  pauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },
  resetBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(100,116,139,0.2)',
    borderWidth: 2,
    borderColor: '#64748b',
  },
  stopBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  skipBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderRadius: 20,
  },
  skipBtnText: {
    color: '#c084fc',
    fontWeight: '700',
  },
});
