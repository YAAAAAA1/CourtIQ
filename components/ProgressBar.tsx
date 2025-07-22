import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import colors from '@/constants/colors.js';
import theme from '@/constants/theme.js';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  showPercentage?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = colors.gray[700],
  progressColor = colors.primary,
  style,
  showPercentage = false,
  label,
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {showPercentage && <Text style={styles.percentage}>{percentage}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  progressContainer: {
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.borderRadius.xs,
  },
  percentage: {
    fontSize: theme.typography.fontSizes.s,
    color: colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default ProgressBar;