import React, { useState, forwardRef } from 'react';
import { 
  StyleSheet, 
  TextInput as RNTextInput, 
  View, 
  Text, 
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputFocusEventData,
  NativeSyntheticEvent,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import colors from '@/constants/colors';
import theme from '@/constants/theme';

export type InputVariant = 'default' | 'filled' | 'outlined';

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  variant?: InputVariant;
}

const Input = forwardRef<RNTextInput, InputProps>(({
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
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getInputContainerStyle = () => {
    const baseStyle: ViewStyle[] = [styles.inputContainer];
    
    switch (variant) {
      case 'filled':
        baseStyle.push(styles.filledInput);
        break;
      case 'outlined':
        baseStyle.push(styles.outlinedInput);
        break;
      default:
        baseStyle.push(styles.defaultInput);
    }

    if (isFocused) {
      baseStyle.push(styles.focused);
    }

    if (error) {
      baseStyle.push(styles.error);
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <RNTextInput
          ref={ref}
          style={StyleSheet.flatten([
            styles.input,
            inputStyle,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : undefined,
          ])}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.gray?.[500] || '#A1A1A6'}
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.gray?.[500] || '#A1A1A6'} />
            ) : (
              <Eye size={20} color={colors.gray?.[500] || '#A1A1A6'} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        ) : null}
      </View>
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    fontSize: theme.typography?.fontSizes?.m || 14,
    color: colors.text || '#FFFFFF',
    marginBottom: theme.spacing?.xs || 4,
    fontWeight: theme.typography?.fontWeights?.medium as any || '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: theme.borderRadius?.m || 8,
    backgroundColor: colors.backgroundCard || '#1C1C1E',
    borderWidth: 1,
    borderColor: colors.gray?.[700] || '#3A3A3C',
  },
  defaultInput: {
    backgroundColor: colors.backgroundCard || '#1C1C1E',
  },
  filledInput: {
    backgroundColor: colors.gray?.[900] || '#2C2C2E',
    borderColor: 'transparent',
  },
  outlinedInput: {
    backgroundColor: 'transparent',
    borderColor: colors.gray?.[600] || '#48484A',
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing?.m || 12,
    paddingHorizontal: theme.spacing?.l || 16,
    color: colors.text || '#FFFFFF',
    fontSize: theme.typography?.fontSizes?.m || 14,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing?.s || 8,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing?.s || 8,
  },
  iconContainer: {
    padding: theme.spacing?.m || 12,
  },
  focused: {
    borderColor: colors.primary || '#FF6B35',
  },
  error: {
    borderColor: colors.error || '#FF453A',
  },
  errorText: {
    marginTop: theme.spacing?.xs || 4,
    color: colors.error || '#FF453A',
    fontSize: theme.typography?.fontSizes?.s || 12,
  },
});

export default Input;