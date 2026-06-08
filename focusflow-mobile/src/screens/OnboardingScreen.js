import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'FocusFlow\'a Hosgeldin',
    text: 'Pomodoro teknigi ile verimliligini zirveye tasi ve zamani en iyi sekilde yonet.',
    icon: 'rocket-outline',
    color: '#818cf8',
  },
  {
    key: '2',
    title: 'Gorevleri Planla',
    text: 'Kendine hedefler koy, projeleri kategorize et ve adim adim basariya ulas.',
    icon: 'calendar-outline',
    color: '#34d399',
  },
  {
    key: '3',
    title: 'Yapay Zeka Destegi',
    text: 'Gemini AI ile verimlilik aliskanliklarini analiz et, kisisel tavsiyeler al.',
    icon: 'sparkles-outline',
    color: '#f472b6',
  }
];

export default function OnboardingScreen({ route }) {
  const { token, userData } = route.params || {};
  const setUser = useAuthStore((state) => state.setUser);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish onboarding and log in
      if (token && userData) {
        setUser(userData, token);
      }
    }
  };

  const slide = SLIDES[currentIndex];

  return (
    <LinearGradient colors={['#0a0f1a', '#111620', '#0a0f1a']} style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { borderColor: slide.color + '40', backgroundColor: slide.color + '15' }]}>
          <Ionicons name={slide.icon} size={64} color={slide.color} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.text}>{slide.text}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.8 }]}
        >
          <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.nextBtnGradient}>
            <Text style={styles.nextBtnText}>{currentIndex === SLIDES.length - 1 ? 'Basla' : 'Devam Et'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 30, paddingBottom: 50 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 24, backgroundColor: '#818cf8' },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
