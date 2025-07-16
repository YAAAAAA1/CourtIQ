import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { Home, Dumbbell, Calendar, Brain, BarChart2, Settings, Target } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Image } from 'expo-image';

export default function AppLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)');
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.secondaryDark,
          borderTopColor: colors.secondaryLight,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts-new"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="drills-library"
        options={{
          title: 'Drills',
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/calendar-custom.png')}
              style={{ width: size, height: size, tintColor: color }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar - accessible via profile picture
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="workout-execution"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="drill-practice"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="program-creator"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="program-schedule"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}