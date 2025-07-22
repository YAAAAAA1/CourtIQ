import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingViewProps,
  ScrollViewProps,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { StatusBarStyle } from 'expo-status-bar';

type SignInError = {
  message: string;
  code?: string;
};

const SignInScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignIn = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        // Handle specific error cases
        switch (signInError.code) {
          case 'auth/user-not-found':
            setError('No account found with this email');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed attempts. Please try again later.');
            break;
          default:
            setError(signInError.message || 'Failed to sign in');
        }
      } else {
        // Navigate to app on successful sign in
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const keyboardBehavior: KeyboardAvoidingViewProps['behavior'] = Platform.OS === 'ios' ? 'padding' : undefined;
  const statusBarStyle: StatusBarStyle = 'light';

  // Define navigation functions with proper types
  const navigateToSignUp = () => {
    router.replace('/(auth)/signup');
  };

  const navigateToForgotPassword = () => {
    // For now, navigate to signup as we don't have a forgot password screen
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar style={statusBarStyle} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.text || '#FFFFFF'} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={<Mail size={20} color={colors.textSecondary || '#A1A1A6'} />}
              editable={!loading}
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus password input on next
                passwordInputRef.current?.focus();
              }}
            />

            <Input
              ref={passwordInputRef}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              leftIcon={<Lock size={20} color={colors.textSecondary || '#A1A1A6'} />}
              editable={!loading}
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={navigateToForgotPassword}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleSignIn}
              disabled={loading}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
              style={styles.signInButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={navigateToSignUp}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard || '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text || '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary || '#A1A1A6',
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -12,
    marginBottom: 24,
    padding: 8,
    marginRight: -8,
  },
  forgotPasswordText: {
    color: colors.primary || '#FF6B35',
    fontSize: 12,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: colors.textSecondary || '#A1A1A6',
    fontSize: 14,
  },
  signUpText: {
    color: colors.primary || '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: `${colors.error || '#FF453A'}20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.error || '#FF453A',
  },
  errorText: {
    color: colors.error || '#FF453A',
    fontSize: 12,
    lineHeight: 20,
  },
});