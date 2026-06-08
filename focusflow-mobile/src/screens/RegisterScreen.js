import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleRegister = async () => {
    if (!form.email.trim() || !form.password.trim() || !form.name.trim() || !form.surname.trim()) {
      Alert.alert('Hata', 'Lutfen tum alanlari doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', form);
      const { token } = response.data;
      if (token) {
        navigation.replace('EmailVerification', { email: form.email, token, userData: response.data });
      } else {
        Alert.alert('Hata', 'Kayit basarisiz. Token alinamadi.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Kayit basarisiz. Bilgilerinizi kontrol edin.';
      Alert.alert('Kayit Hatasi', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#1a1f2e']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
          </Pressable>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Hesap Olustur</Text>
            <Text style={styles.subtitle}>FocusFlow'a katil ve verimliligini artir.</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad"
                  placeholderTextColor="#475569"
                  value={form.name}
                  onChangeText={(val) => setForm({ ...form, name: val })}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Soyad"
                  placeholderTextColor="#475569"
                  value={form.surname}
                  onChangeText={(val) => setForm({ ...form, surname: val })}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="#475569"
                value={form.email}
                onChangeText={(val) => setForm({ ...form, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sifre"
                placeholderTextColor="#475569"
                value={form.password}
                onChangeText={(val) => setForm({ ...form, password: val })}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                styles.registerBtn,
                pressed && styles.registerBtnPressed,
                loading && styles.registerBtnDisabled,
              ]}
            >
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerBtnText}>Kayit Ol</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerSection: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#f1f5f9', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 6 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f1f5f9', fontSize: 15 },
  eyeBtn: { padding: 4 },
  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 6 },
  registerBtnPressed: { opacity: 0.85 },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnGradient: { paddingVertical: 15, alignItems: 'center', borderRadius: 14 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
