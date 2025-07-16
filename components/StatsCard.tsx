import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  gradientColors?: readonly [string, string, ...string[]];
  onPress?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit,
  icon,
  color = colors.primary,
  gradientColors,
  onPress,
  trend,
  trendValue,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  const cardContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <View style={[
            styles.trendBadge,
            trend === 'up' && styles.trendUp,
            trend === 'down' && styles.trendDown,
            trend === 'neutral' && styles.trendNeutral,
          ]}>
            <Text style={[
              styles.trendText,
              trend === 'up' && styles.trendTextUp,
              trend === 'down' && styles.trendTextDown,
              trend === 'neutral' && styles.trendTextNeutral,
            ]}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  if (gradientColors) {
    return (
      <CardComponent
        style={[styles.card, styles.gradientCard]}
        onPress={onPress}
        activeOpacity={onPress ? 0.9 : 1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {cardContent}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent
      style={[styles.card, { backgroundColor: color }]}
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
    minHeight: 120,
    flex: 1,
    marginHorizontal: 4,
    ...theme.shadows.medium,
  },
  gradientCard: {
    backgroundColor: 'transparent',
    ...theme.shadows.large,
  },
  gradientContainer: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
  },
  container: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  iconContainer: {
    marginRight: theme.spacing.s,
    opacity: 0.9,
  },
  title: {
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.semibold,
    color: colors.text,
    opacity: 0.9,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.black,
    color: colors.text,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.medium,
    color: colors.text,
    opacity: 0.8,
    marginLeft: theme.spacing.xs,
  },
  trendContainer: {
    alignSelf: 'flex-start',
  },
  trendBadge: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
  },
  trendUp: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  trendDown: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  trendNeutral: {
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
  },
  trendText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: 0.2,
  },
  trendTextUp: {
    color: colors.success,
  },
  trendTextDown: {
    color: colors.error,
  },
  trendTextNeutral: {
    color: colors.warning,
  },
});

export default StatsCard;