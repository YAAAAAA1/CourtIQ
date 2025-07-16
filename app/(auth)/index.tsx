import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(app)');
    }
  }, [user, loading]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" />
      
      {/* Hero Background */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=2090&auto=format&fit=crop' }}
          style={styles.backgroundImage}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.8)'] as const}
          style={styles.overlay}
        />
        
        {/* Logo and Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🏀</Text>
            <Text style={styles.logoText}>HoopMaster AI</Text>
          </View>
          <Text style={styles.tagline}>Your Ultimate Basketball Training Partner</Text>
          <Text style={styles.subtitle}>Train smarter, play better, dominate the court</Text>
        </View>
      </View>

      {/* Content Section */}
      <LinearGradient
        colors={[colors.background, colors.backgroundLight] as const}
        style={styles.contentContainer}
      >
        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="🎯" 
            title="Personalized Training" 
            description="AI-powered workouts tailored to your skill level and goals" 
          />
          <FeatureItem 
            icon="📊" 
            title="Smart Analytics" 
            description="Track your progress with detailed performance insights" 
          />
          <FeatureItem 
            icon="🥗" 
            title="Nutrition Tracking" 
            description="Fuel your body for peak performance on and off the court" 
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            variant="gradient"
            size="large"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.primaryButton}
            fullWidth
          />
          <Button
            title="Sign In"
            variant="outline"
            size="large"
            onPress={() => router.push('/(auth)/signin')}
            style={styles.secondaryButton}
            fullWidth
          />
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustContainer}>
          <Text style={styles.trustText}>Join thousands of players improving their game</Text>
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>⭐ 4.9</Text>
            </View>
            <View style={styles.trustBadge}>
              <Text style={styles.trustBadgeText}>🏆 #1 Basketball App</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: height * 0.55,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  brandingContainer: {
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.s,
  },
  logoText: {
    fontSize: theme.typography.fontSizes.hero,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: theme.typography.fontSizes.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeights.medium,
  },
  contentContainer: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xxxl : theme.spacing.xl,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    backgroundColor: colors.backgroundCard,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    ...theme.shadows.small,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSizes.l,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.medium,
  },
  buttonContainer: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.m,
  },
  primaryButton: {
    ...theme.shadows.glow,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trustContainer: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    fontWeight: theme.typography.fontWeights.medium,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  trustBadge: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  trustBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});