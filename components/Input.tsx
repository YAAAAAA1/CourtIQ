import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  Text, 
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  secureTextEntry?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  secureTextEntry,
  variant = 'default',
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filledInputContainer;
      case 'outlined':
        return styles.outlinedInputContainer;
      default:
        return styles.defaultInputContainer;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        getInputContainerStyle(),
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : undefined,
            inputStyle,
          ]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? 
              <EyeOff size={20} color={colors.textSecondary} /> : 
              <Eye size={20} color={colors.textSecondary} />
            }
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSizes.m,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.s,
    color: colors.text,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
    minHeight: 52,
  },
  defaultInputContainer: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  filledInputContainer: {
    backgroundColor: colors.gray[900],
    borderWidth: 0,
  },
  outlinedInputContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.gray[700],
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    fontSize: theme.typography.fontSizes.m,
    color: colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.s,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.s,
  },
  leftIconContainer: {
    paddingLeft: theme.spacing.m,
  },
  rightIconContainer: {
    paddingRight: theme.spacing.m,
  },
  inputFocused: {
    borderColor: colors.primary,
    ...theme.shadows.colored,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: theme.typography.fontSizes.s,
    fontWeight: theme.typography.fontWeights.medium,
    marginTop: theme.spacing.xs,
    letterSpacing: 0.2,
  },
});

export default Input;