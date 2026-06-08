import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function AiStatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/stats/me');
      setStats(data);
    } catch (err) {
      console.log('Stats yuklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const handleFetchAi = async () => {
    setAiLoading(true);
    try {
      const totalFocusMinutes = Math.round((stats?.totalPomodoroHours || 0) * 60);
      const tasksCompleted = stats?.completedTasks ?? stats?.totalQuestions ?? 0;
      const tasksPending = stats?.pendingTasks ?? 0;

      const { data } = await apiClient.get(
        `/ai/suggestions?focusMinutes=${totalFocusMinutes}&completedTasks=${tasksCompleted}&pendingTasks=${tasksPending}`
      );
      setSuggestion(data.suggestion);
    } catch (error) {
      setSuggestion('Yapay Zeka asistanina su an ulasilamiyor. Lutfen daha sonra tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0f1a', '#111620']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </LinearGradient>
    );
  }

  // Dummy chart data for MVP
  const chartData = {
    labels: ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </Pressable>
        <Text style={styles.headerTitle}>AI Verimlilik Analizi</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>Google Gemini altyapisi ile size ozel odaklanma stratejileri</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: 'rgba(249, 115, 22, 0.2)' }]}>
            <Text style={styles.statLabel}>Toplam Odak</Text>
            <Text style={[styles.statValue, { color: '#fb923c' }]}>{stats?.totalPomodoroHours?.toFixed(1) || 0}s</Text>
          </View>
          <View style={[styles.statBox, { borderColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Text style={styles.statLabel}>Tamamlanan</Text>
            <Text style={[styles.statValue, { color: '#818cf8' }]}>{stats?.completedTasks ?? 0}</Text>
          </View>
          <View style={[styles.statBox, { borderColor: 'rgba(244, 63, 94, 0.2)' }]}>
            <Text style={styles.statLabel}>Bekleyen</Text>
            <Text style={[styles.statValue, { color: '#fb7185' }]}>{stats?.pendingTasks ?? 0}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Haftalik Odak Trendi</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#111620',
              backgroundGradientFrom: '#111620',
              backgroundGradientTo: '#111620',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#818cf8' }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        <View style={styles.aiContainer}>
          <LinearGradient colors={['rgba(26, 35, 126, 0.4)', 'rgba(17, 22, 32, 1)']} style={styles.aiInner}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIconBox}>
                <Text style={{ fontSize: 24 }}>✨</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.aiTitle}>FocusFlow AI Asistan</Text>
                <Text style={styles.aiSub}>Gercek zamanli verimlilik analizi</Text>
              </View>
            </View>

            <Pressable
              onPress={handleFetchAi}
              disabled={aiLoading}
              style={[styles.aiBtn, aiLoading && { opacity: 0.6 }]}
            >
              <Text style={styles.aiBtnText}>{aiLoading ? 'Analiz Ediliyor...' : 'Analizi Baslat'}</Text>
            </Pressable>

            <View style={styles.suggestionBox}>
              {aiLoading ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <ActivityIndicator size="small" color="#818cf8" />
                  <Text style={styles.loadingAiText}>Gemini AI modelinden tavsiyeler aliniyor...</Text>
                </View>
              ) : (
                <Text style={styles.suggestionText}>
                  {suggestion || 'Analizi baslatmak icin yukaridaki butona tiklayin.'}
                </Text>
              )}
            </View>
          </LinearGradient>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: { color: '#64748b', fontSize: 13, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(17, 22, 32, 0.6)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  aiContainer: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
  aiInner: { padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(99, 102, 241, 0.2)', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  aiSub: { color: '#818cf8', fontSize: 12 },
  aiBtn: { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  aiBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  suggestionBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, minHeight: 120, justifyContent: 'center' },
  loadingAiText: { color: '#818cf8', fontSize: 12, marginTop: 10 },
  suggestionText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
});
