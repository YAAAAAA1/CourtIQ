import React, { useEffect, ReactNode } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

// Route parameter types can be added here when needed
// type RouteParams = {
//   onboarding: undefined;
//   '(tabs)': undefined;
//   '(auth)': undefined;
// };

// Type for route segments
// type RouteSegment = string | string[];

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Initial route configuration
export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Auth state change handler
function AuthWrapper({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Get the current route segment
    const currentSegment = Array.isArray(segments[0]) ? segments[0][0] : segments[0] || '';
    const inAuthGroup = currentSegment === '(auth)';
    const inOnboarding = currentSegment === 'onboarding';

    // If user is not signed in and not in the auth group
    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } 
    // If user is signed in
    else if (user) {
      // If user hasn't completed onboarding and not already in onboarding
      if (!user.hasCompletedOnboarding && !inOnboarding) {
        // Using type assertion to match the expected type
        router.replace('/onboarding' as any);
      } 
      // If user has completed onboarding and is in auth or onboarding
      else if (user.hasCompletedOnboarding && (inAuthGroup || inOnboarding)) {
        // Using type assertion to match the expected type
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, loading, segments, router]);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // If no user is found, don't render children (will be redirected by the effect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.otf') as unknown as string,
    'Inter-Medium': require('@/assets/fonts/Inter-Medium.otf') as unknown as string,
    'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.otf') as unknown as string,
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.otf') as unknown as string,
  });

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <AuthWrapper>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: "#000000",
                  },
                  headerTintColor: "#FFFFFF",
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="modal" 
                  options={{ 
                    presentation: 'modal',
                    headerShown: false 
                  }} 
                />
              </Stack>
            </AuthWrapper>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}