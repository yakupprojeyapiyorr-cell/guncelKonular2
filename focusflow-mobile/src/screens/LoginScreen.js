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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lutfen e-posta ve sifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data;
      if (data.token) {
        // emailVerified kontrolü - webden kayıt olunmuş kullanıcılar için
        if (data.emailVerified === false) {
          navigation.navigate('EmailVerification', {
            email: email.trim().toLowerCase(),
            token: data.token,
            userData: data,
          });
          return;
        }
        setUser(data, data.token);
      } else {
        Alert.alert('Hata', 'Giris basarisiz. Token alinamadi.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Giris basarisiz. Bilgilerinizi kontrol edin.';
      Alert.alert('Giris Hatasi', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#1a1f2e']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo / Baslik */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="timer-outline" size={48} color="#818cf8" />
          </View>
          <Text style={styles.appName}>FocusFlow</Text>
          <Text style={styles.subtitle}>Odaklan. Basla. Basarilara Ulas.</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Sifre"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
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
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && styles.loginBtnPressed,
              loading && styles.loginBtnDisabled,
            ]}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Giris Yap</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>Hesabin yok mu? <Text style={styles.registerTextBold}>Kayit Ol</Text></Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
  },
  loginBtnPressed: {
    opacity: 0.85,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 14,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#818cf8',
    fontWeight: 'bold',
  },
});
