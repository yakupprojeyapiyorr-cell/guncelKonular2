import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import UrgentTasksWidget from '../components/UrgentTasksWidget';
export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, goalsRes, boardRes] = await Promise.all([
        apiClient.get('/stats/me'),
        apiClient.get('/goals/active'),
        apiClient.get('/stats/leaderboard'),
      ]);
      setStats(statsRes.data || {});
      setGoals(goalsRes.data || []);
      setLeaderboard(boardRes.data?.leaderboard?.slice(0, 5) || []);
    } catch (err) {
      console.log('Dashboard verisi alinamadi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0f1a', '#111620']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </LinearGradient>
    );
  }

  const userName = user?.name?.split(' ')[0] || 'Kullanici';

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Merhaba, <Text style={{ color: '#3b82f6' }}>{userName}</Text>
          </Text>
          <Text style={styles.headerSub}>HEDEFLERINE ULASMA YOLCULUGUNDA BUGUN YENI BIR ZAFER KAZAN.</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="notifications-outline" size={24} color="#f1f5f9" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
        }
      >
        {/* Urgent Tasks */}
        <UrgentTasksWidget />

        {/* Completed Banner */}
        <View style={styles.completedBanner}>
          <LinearGradient
            colors={['#3b82f6', '#10b981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.completedBannerGradient}
          >
            <View style={styles.completedBannerInner}>
              <View>
                <Text style={styles.completedBannerLabel}>GOREVLER</Text>
                <Text style={styles.completedBannerValue}>{stats?.completedTasks || 0}</Text>
              </View>
              <Text style={styles.completedBannerStatus}>TAMAMLANDI</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Main Stats Widget */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxEmerald]}>
            <View style={[styles.statIconBox, styles.statIconBoxEmerald]}>
              <Text style={{ fontSize: 24 }}>✅</Text>
            </View>
            <Text style={styles.statLabel}>TAMAMLANAN GOREV</Text>
            <Text style={styles.statVal}>{stats?.completedTasks || 0}</Text>
          </View>
          
          <View style={[styles.statBox, styles.statBoxPurple]}>
            <View style={[styles.statIconBox, styles.statIconBoxPurple]}>
              <Text style={{ fontSize: 24 }}>⏱️</Text>
            </View>
            <Text style={styles.statLabel}>BUGUNKU CALISMA</Text>
            <Text style={styles.statVal}>
              {stats?.todayPomodoroMinutes ? (stats.todayPomodoroMinutes / 60).toFixed(1) : '0.0'}h
            </Text>
          </View>
        </View>

        {/* Goals Widget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktif Hedeflerim</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henuz aktif hedefin yok.</Text>
            </View>
          ) : (
            goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalType}>{goal.type}</Text>
                  <Text style={styles.goalProgress}>
                    {goal.currentValue} / {goal.targetValue}
                  </Text>
                </View>
                <Text style={styles.goalTargetType}>{goal.targetType === 'STUDY_MINUTES' ? 'Calisma Dakikasi' : 'Tamamlanan Gorev'}</Text>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, goal.progressPercentage || 0)}%` },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Leaderboard Widget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liderlik Tablosu (Top 5)</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>Veri yok.</Text>
            ) : (
              leaderboard.map((user, idx) => (
                <View key={user.userId} style={[styles.leaderRow, idx !== leaderboard.length - 1 && styles.borderBottom]}>
                  <View style={styles.leaderLeft}>
                    <Text style={[styles.rankText, idx < 3 && styles.topRank]}>#{user.rank}</Text>
                    <View style={styles.leaderAvatar}>
                      <Ionicons name="person" size={16} color="#818cf8" />
                    </View>
                    <Text style={styles.leaderName} numberOfLines={1}>{user.userName}</Text>
                  </View>
                  <Text style={styles.leaderScore}>{user.totalPomodoroMinutes} dk</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: 'bold', letterSpacing: 1 },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  completedBanner: {
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  completedBannerGradient: {
    padding: 2,
    borderRadius: 24,
  },
  completedBannerInner: {
    backgroundColor: '#0a0f18',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedBannerLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1 },
  completedBannerValue: { fontSize: 32, fontWeight: '900', color: '#fff' },
  completedBannerStatus: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(17, 22, 32, 0.6)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  statBoxEmerald: { borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statBoxPurple: { borderColor: 'rgba(168, 85, 247, 0.2)', backgroundColor: 'rgba(168, 85, 247, 0.1)' },
  statIconBox: {
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statIconBoxEmerald: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statIconBoxPurple: { backgroundColor: 'rgba(168, 85, 247, 0.1)' },
  statVal: { color: '#f1f5f9', fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  goalCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  goalType: { color: '#818cf8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  goalProgress: { color: '#f1f5f9', fontSize: 14, fontWeight: '800' },
  goalTargetType: { color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  progressBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 3 },
  emptyCard: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  emptyText: { color: '#475569', fontSize: 13 },
  leaderboardCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
  },
  leaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  leaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankText: { color: '#64748b', fontSize: 14, fontWeight: '700', width: 28 },
  topRank: { color: '#f59e0b' },
  leaderAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  leaderName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  leaderScore: { color: '#818cf8', fontSize: 14, fontWeight: '700' },
});
