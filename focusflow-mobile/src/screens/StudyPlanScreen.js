import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';

export default function StudyPlanScreen() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlanContent, setNewPlanContent] = useState('');
  const [saving, setSaving] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  const fetchPlans = async () => {
    try {
      const { data } = await apiClient.get(`/plans?date=${todayDate}`);
      setPlans(data || []);
    } catch (err) {
      console.log('Planlar yuklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  const handleAddPlan = async () => {
    if (!newPlanContent.trim()) return;

    setSaving(true);
    try {
      const { data } = await apiClient.post('/plans', {
        content: newPlanContent,
        planDate: todayDate,
      });
      setPlans((prev) => [...prev, data]);
      setNewPlanContent('');
      setShowForm(false);
    } catch (err) {
      console.log('Plan eklenemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (plan) => {
    try {
      const { data } = await apiClient.put(`/plans/${plan.id}`, {
        ...plan,
        isCompleted: !plan.isCompleted,
      });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? data : p)));
    } catch (err) {
      console.log('Plan guncellenemedi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.log('Plan silinemedi');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0f1a', '#111620']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </LinearGradient>
    );
  }

  const completedCount = plans.filter((p) => p.isCompleted).length;

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Calisma Plani</Text>
            <Text style={styles.headerSub}>Gunluk planlarini kaydet, takip et.</Text>
          </View>
          <Pressable
            onPress={() => setShowForm(!showForm)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
            <Text style={styles.addBtnText}>{showForm ? 'Kapat' : 'Yeni Plan'}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Plan Icerigi</Text>
            <TextInput
              style={styles.input}
              placeholder="Orn: Matematik - turev tekrarini bitir..."
              placeholderTextColor="#64748b"
              value={newPlanContent}
              onChangeText={setNewPlanContent}
              multiline
            />
            <Pressable
              onPress={handleAddPlan}
              disabled={saving}
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Kaydet</Text>
              )}
            </Pressable>
          </View>
        )}

        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-clear-outline" size={48} color="#334155" />
              <Text style={styles.emptyText}>Bugun icin planin yok.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.planCard, item.isCompleted && styles.planCompleted]}>
              <Pressable onPress={() => handleToggle(item)} style={styles.planCardInner}>
                <View
                  style={[
                    styles.checkbox,
                    item.isCompleted && { backgroundColor: '#10b981', borderColor: '#10b981' },
                  ]}
                >
                  {item.isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[styles.planText, item.isCompleted && styles.planTextDone]}>
                  {item.content}
                </Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Sil</Text>
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            plans.length > 0 ? (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Plan Ozeti</Text>
                <View style={styles.summaryRow}>
                  <View style={[styles.summaryBox, styles.summaryBoxBlue]}>
                    <Text style={styles.summaryBoxTitle}>Toplam Plan</Text>
                    <Text style={[styles.summaryBoxValue, { color: '#60a5fa' }]}>{plans.length}</Text>
                  </View>
                  <View style={[styles.summaryBox, styles.summaryBoxEmerald]}>
                    <Text style={styles.summaryBoxTitle}>Tamamlanan</Text>
                    <Text style={[styles.summaryBoxValue, { color: '#34d399' }]}>{completedCount}</Text>
                  </View>
                  <View style={[styles.summaryBox, styles.summaryBoxAmber]}>
                    <Text style={styles.summaryBoxTitle}>Devam Eden</Text>
                    <Text style={[styles.summaryBoxValue, { color: '#fbbf24' }]}>{plans.length - completedCount}</Text>
                  </View>
                </View>
              </View>
            ) : null
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
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 },
  input: {
    backgroundColor: '#0a0f1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  planCardInner: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  planCompleted: { backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  planText: { color: '#e2e8f0', fontSize: 15, flex: 1, lineHeight: 22 },
  planTextDone: { color: '#64748b', textDecorationLine: 'line-through' },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  deleteBtnText: { color: '#fb7185', fontWeight: '700', fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#f1f5f9', fontSize: 16, fontWeight: '600', marginTop: 12 },
  summaryContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20,
  },
  summaryTitle: { fontSize: 20, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryBox: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1 },
  summaryBoxBlue: { backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' },
  summaryBoxEmerald: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
  summaryBoxAmber: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' },
  summaryBoxTitle: { color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  summaryBoxValue: { fontSize: 20, fontWeight: '800' },
});
