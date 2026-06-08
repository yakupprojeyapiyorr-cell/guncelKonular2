import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

const BADGE_ICONS = {
  FIRST_TASK: 'ribbon-outline',
  TASK_MASTER: 'trophy-outline',
  STREAK_3: 'flame-outline',
  STREAK_7: 'flame',
  POMODORO_1: 'timer-outline',
  POMODORO_10: 'hourglass-outline',
  STUDY_1H: 'school-outline',
  STUDY_10H: 'library-outline',
};

export default function ProfileScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || user?.email?.split('@')[0] || '';

  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [badgeRes, statsRes, streakRes] = await Promise.all([
        apiClient.get('/gamification/badges/all'),
        apiClient.get('/stats/me'),
        apiClient.get('/gamification/streak'),
      ]);
      setBadges(badgeRes.data || []);
      setStats(statsRes.data || {});
      setStreak(streakRes.data || {});
    } catch (err) {
      console.log('Profil verisi alinamadi:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Cikis', 'Cikis yapmak istediginize emin misiniz?', [
      { text: 'Iptal', style: 'cancel' },
      { text: 'Cikis Yap', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0f1a', '#111620']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </LinearGradient>
    );
  }

  const unlockedCount = badges.filter((b) => b.isUnlocked || b.unlocked).length;

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color="#818cf8" />
          </View>
          <Text style={styles.nameText}>{userName || 'Kullanici'}</Text>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={18} color="#f59e0b" />
            <Text style={styles.streakText}>
              {streak?.currentStreak || 0} gun seri
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.completedTasks || 0}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.pendingTasks || 0}</Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(stats.totalPomodoroHours || 0)}s</Text>
              <Text style={styles.statLabel}>Calisma</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{streak?.longestStreak || 0}</Text>
              <Text style={styles.statLabel}>En Uzun Seri</Text>
            </View>
          </View>
        )}

        {/* Badges */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rozetler</Text>
          <View style={styles.badgeCountBox}>
            <Text style={styles.badgeCountText}>
              {unlockedCount}/{badges.length}
            </Text>
          </View>
        </View>

        <View style={styles.badgeGrid}>
          {badges.map((badge) => {
            const unlocked = badge.isUnlocked || badge.unlocked;
            const iconName = BADGE_ICONS[badge.code] || 'medal-outline';
            const progress = badge.progressPercentage || 0;

            return (
              <View key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
                <View
                  style={[
                    styles.badgeIconCircle,
                    unlocked
                      ? { backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366f1' }
                      : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: '#1e293b' },
                  ]}
                >
                  {unlocked ? (
                    <Ionicons name={iconName} size={24} color="#818cf8" />
                  ) : (
                    <Ionicons name="lock-closed" size={20} color="#334155" />
                  )}
                </View>
                <Text style={[styles.badgeName, !unlocked && { color: '#475569' }]} numberOfLines={1}>
                  {badge.name}
                </Text>
                {/* Progress Bar */}
                <View style={styles.badgeProgressBg}>
                  <View
                    style={[
                      styles.badgeProgressFill,
                      { width: `${Math.min(100, progress)}%` },
                      unlocked && { backgroundColor: '#22c55e' },
                    ]}
                  />
                </View>
                <Text style={styles.badgeProgressText}>
                  {badge.currentProgress || 0}/{badge.requiredProgress || 1}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Menus */}
        <View style={styles.menuContainer}>
          <Pressable onPress={() => navigation.navigate('AiStats')} style={styles.menuBtn}>
            <Ionicons name="sparkles" size={18} color="#818cf8" />
            <Text style={styles.menuText}>AI Verimlilik Analizi</Text>
            <Ionicons name="chevron-forward" size={18} color="#64748b" style={{marginLeft: 'auto'}} />
          </Pressable>
          {user?.role === 'ADMIN' && (
            <Pressable onPress={() => navigation.navigate('AdminDashboard')} style={[styles.menuBtn, {marginTop: 10}]}>
              <Ionicons name="shield-checkmark" size={18} color="#34d399" />
              <Text style={styles.menuText}>Admin Paneli</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" style={{marginLeft: 'auto'}} />
            </Pressable>
          )}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Cikis Yap</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(99,102,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nameText: { color: '#f1f5f9', fontSize: 22, fontWeight: '700' },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  streakText: { color: '#f59e0b', fontSize: 14, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700' },
  badgeCountBox: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  badgeCountText: { color: '#818cf8', fontSize: 12, fontWeight: '700' },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  badgeName: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  badgeProgressText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 14,
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  menuContainer: { marginBottom: 20 },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  menuText: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
});
