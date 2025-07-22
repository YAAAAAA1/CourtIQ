import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  StyleProp,
  View,
  ViewStyle as RNViewStyle,
  TextStyle as RNTextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const Button = ({
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
  children,
  ...rest
}: ButtonProps) => {
  const getButtonStyle = (): ViewStyle => {
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

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      case 'xlarge':
        return styles.xlargeButton;
      case 'medium':
      default:
        return styles.mediumButton;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : colors.primary} 
          />
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <Text
          style={[
            styles.text,
            getTextStyle(),
            textStyle,
            (disabled || loading) && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        {children}
      </View>
    );
  };

  const renderButton = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientContainer,
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabledButton,
          style,
        ]}
      >
        {renderButton()}
      </LinearGradient>
    );
  }

  return renderButton();
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.m,
  },
  gradientButton: {
    backgroundColor: 'transparent',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold as any,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold as any,
  },
  outlineText: {
    color: colors.primary,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold as any,
  },
  textButtonText: {
    color: colors.primary,
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.medium as any,
  },
  disabledText: {
    opacity: 0.6,
  },
  smallButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },
  mediumButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  largeButton: {
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.xl,
  },
  xlargeButton: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
    minHeight: 64,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    padding: theme.spacing.s,
  },
  iconLeft: {
    marginRight: theme.spacing.s,
  },
  iconRight: {
    marginLeft: theme.spacing.s,
  },
  gradientContainer: {
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  text: {
    textAlign: 'center',
  },
});

export default Button;