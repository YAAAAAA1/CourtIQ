import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Svg from 'react-native-svg';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color = colors.primary,
  backgroundColor = colors.gray[800],
  children,
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg.Svg width={size} height={size} style={styles.svg}>
        <Svg.Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Svg.Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg.Svg>
      <View style={styles.content}>
        {children || (showPercentage && (
          <Text style={styles.percentage}>
            {Math.round(progress * 100)}%
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: colors.text,
  },
});

export default CircularProgress;