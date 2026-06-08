import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist is asynchronous in React Native due to AsyncStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    // If it's already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => unsub && unsub();
  }, []);

  if (!isHydrated) return null;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}
