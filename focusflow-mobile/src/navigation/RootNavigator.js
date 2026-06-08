import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TaskScreen from '../screens/TaskScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import StudyPlanScreen from '../screens/StudyPlanScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AiStatsScreen from '../screens/AiStatsScreen';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111620',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Tasks') iconName = 'checkmark-circle-outline';
          else if (route.name === 'Pomodoro') iconName = 'timer-outline';
          else if (route.name === 'Plan') iconName = 'calendar-outline';
          else if (route.name === 'Chat') iconName = 'chatbubble-ellipses-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="Tasks" component={TaskScreen} options={{ tabBarLabel: 'Gorevler' }} />
      <Tab.Screen name="Pomodoro" component={PomodoroScreen} options={{ tabBarLabel: 'Odak' }} />
      <Tab.Screen name="Plan" component={StudyPlanScreen} options={{ tabBarLabel: 'Plan' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Koc' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  // AsyncStorage'dan veri yüklenene kadar loading göster
  // Bu sayede login flash sorunu ortadan kalkar
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AiStats" component={AiStatsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
