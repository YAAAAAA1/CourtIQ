import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import useAuth from '../../src/hooks/useAuth';
import { router } from 'expo-router';
import { Home, Dumbbell, Calendar, Brain, BarChart2, Settings, Target } from 'lucide-react-native';
import colors from '../../constants/colors';
import { Image } from 'expo-image';

type IconProps = {
  size: number;
  color: string;
  style?: any;
};

export default function AppLayout() {
  // @ts-ignore - The hook is being used correctly, but TypeScript is having trouble with the types
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)');
    }
  }, [user, loading, router]);

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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Dumbbell width={size} height={size} color={color} />
          ),
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Target width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <BarChart2 width={size} height={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Brain width={size} height={size} color={color} />
          ),
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