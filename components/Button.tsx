import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...rest
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      case 'gradient':
        return styles.gradientButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      case 'gradient':
        return styles.gradientText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      case 'xlarge':
        return styles.xlargeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      case 'xlarge':
        return styles.xlargeText;
      default:
        return styles.mediumText;
    }
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.text} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              disabled && styles.disabledText,
              textStyle,
              leftIcon ? { marginLeft: 8 } : undefined,
              rightIcon ? { marginRight: 8 } : undefined,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
        ]}
        activeOpacity={0.8}
        {...rest}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientContainer, getSizeStyle()]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.m,
    ...theme.shadows.medium,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primaryButton: {
    backgroundColor: colors.primary,
    ...theme.shadows.colored,
  },
  primaryText: {
    color: colors.text,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  secondaryText: {
    color: colors.text,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  textButtonText: {
    color: colors.primary,
  },
  gradientButton: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.m,
    width: '100%',
  },
  gradientText: {
    color: colors.text,
    fontWeight: '700',
  },
  // Sizes
  smallButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.l,
    minHeight: 36,
  },
  smallText: {
    fontSize: theme.typography.fontSizes.s,
  },
  mediumButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 48,
  },
  mediumText: {
    fontSize: theme.typography.fontSizes.m,
  },
  largeButton: {
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xxl,
    minHeight: 56,
  },
  largeText: {
    fontSize: theme.typography.fontSizes.l,
  },
  xlargeButton: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxxl,
    minHeight: 64,
  },
  xlargeText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
  },
  // States
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default Button;