import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';

export default function EmailVerificationScreen({ route, navigation }) {
  const { email, token, userData } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Lutfen 6 haneli kodu eksiksiz girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/verify-email', { email, code: fullCode });
      // Go to onboarding after success
      navigation.replace('Onboarding', { token, userData });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Dogrulama basarisiz.';
      setError(typeof msg === 'string' ? msg : 'Hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-open-outline" size={40} color="#818cf8" />
          </View>
          <Text style={styles.title}>E-postani Dogrula</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>{email || 'E-posta'}</Text> adresine gonderdigimiz 6 haneli kodu gir.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              keyboardType="number-pad"
              maxLength={6}
              value={digit}
              onChangeText={(val) => handleChange(index, val)}
              onKeyPress={(e) => handleKeyDown(index, e)}
            />
          ))}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed, loading && { opacity: 0.7 }]}
        >
          <LinearGradient colors={['#6366f1', '#4f46e5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Dogrula</Text>}
          </LinearGradient>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: 20 },
  errorText: { color: '#fca5a5', fontSize: 13, textAlign: 'center' },
  codeContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 40 },
  codeInput: { width: 45, height: 55, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  codeInputFilled: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: '#818cf8' },
  submitBtn: { borderRadius: 14, overflow: 'hidden' },
  submitBtnPressed: { opacity: 0.8 },
  submitBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
