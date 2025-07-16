import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  gradientColors?: readonly [string, string, ...string[]];
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  style,
  titleStyle,
  onPress,
  rightComponent,
  variant = 'default',
  gradientColors,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  const getCardStyle = () => {
    switch (variant) {
      case 'gradient':
        return styles.gradientCard;
      case 'glass':
        return styles.glassCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  const cardContent = (
    <>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {rightComponent}
        </View>
      )}
      {children}
    </>
  );

  if (variant === 'gradient' && gradientColors) {
    return (
      <CardComponent
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.9 : 1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientContainer]}
        >
          {cardContent}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent
      style={[styles.card, getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {cardContent}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.l,
    marginVertical: theme.spacing.s,
    overflow: 'hidden',
  },
  defaultCard: {
    backgroundColor: colors.backgroundCard,
    padding: theme.spacing.l,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  gradientCard: {
    padding: 0,
    ...theme.shadows.large,
  },
  glassCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    padding: theme.spacing.l,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  elevatedCard: {
    backgroundColor: colors.backgroundCard,
    padding: theme.spacing.l,
    ...theme.shadows.large,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  gradientContainer: {
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
    letterSpacing: 0.5,
  },
});

export default Card;