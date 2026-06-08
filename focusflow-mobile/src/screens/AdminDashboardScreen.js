import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function AdminDashboardScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalTasks: 0, totalPomodoroMinutes: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setError('');
    } catch (err) {
      console.log('Admin veri yukleme hatasi:', err);
      setError('Veriler yuklenemedi. Yetkiniz olmayabilir.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.role !== 'ADMIN') {
        navigation.navigate('Home');
        return;
      }
      fetchAdminData();
    }, [user])
  );

  const handleAction = async (userId, actionType) => {
    try {
      await apiClient.post(`/admin/users/${userId}/${actionType}`);
      fetchAdminData();
    } catch (err) {
      Alert.alert('Hata', 'Kullanici guncellenemedi.');
    }
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Paneli</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdminData(); }} tintColor="#818cf8" />}
        >
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statLabel}>Toplam Kullanici</Text>
              <Text style={[styles.statValue, { color: '#60a5fa' }]}>{stats.totalUsers}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardEmerald]}>
              <Text style={styles.statLabel}>Premium Kullanici</Text>
              <Text style={[styles.statValue, { color: '#34d399' }]}>{stats.premiumUsers}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statLabel}>Toplam Odak (dk)</Text>
              <Text style={[styles.statValue, { color: '#c084fc' }]}>{stats.totalPomodoroMinutes}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardAmber]}>
              <Text style={styles.statLabel}>Sistemdeki Gorevler</Text>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>{stats.totalTasks}</Text>
            </View>
          </View>

          <View style={styles.usersSection}>
            <Text style={styles.sectionTitle}>Kayitli Ogrenciler</Text>
            {users.length === 0 ? (
              <Text style={styles.emptyText}>Kullanici bulunamadi.</Text>
            ) : (
              users.map((u) => (
                <View key={u.id} style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name} {u.surname}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <View style={styles.roleRow}>
                      <Text style={styles.roleBadge}>{u.role}</Text>
                      {u.subscriptionType === 'PREMIUM' && <Text style={styles.premiumBadge}>💎 Premium</Text>}
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    {u.subscriptionType !== 'PREMIUM' ? (
                      <Pressable onPress={() => handleAction(u.id, 'premium')} style={[styles.actionBtn, styles.actionBtnPremium]}>
                        <Text style={styles.actionBtnTextPremium}>Premium Yap</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => handleAction(u.id, 'free')} style={[styles.actionBtn, styles.actionBtnFree]}>
                        <Text style={styles.actionBtnTextFree}>Free Yap</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  errorBox: { marginHorizontal: 20, padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  errorText: { color: '#fca5a5', fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(17, 22, 32, 0.6)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  statCardBlue: { borderColor: 'rgba(59, 130, 246, 0.2)' },
  statCardEmerald: { borderColor: 'rgba(16, 185, 129, 0.2)' },
  statCardPurple: { borderColor: 'rgba(168, 85, 247, 0.2)' },
  statCardAmber: { borderColor: 'rgba(245, 158, 11, 0.2)' },
  statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '900' },
  usersSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  emptyText: { color: '#64748b', fontSize: 13 },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  userInfo: { flex: 1, marginRight: 10 },
  userName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  userEmail: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  roleBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  premiumBadge: { color: '#34d399', fontSize: 10, fontWeight: '700' },
  userActions: { justifyContent: 'center' },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnPremium: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  actionBtnTextPremium: { color: '#34d399', fontSize: 11, fontWeight: '700' },
  actionBtnFree: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  actionBtnTextFree: { color: '#f87171', fontSize: 11, fontWeight: '700' },
});
