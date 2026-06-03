import { useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing, TypographyStyles } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search…',
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: SearchBarProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const showClear = !!value && value.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: focused ? theme.primary : theme.border,
        },
        containerStyle,
      ]}>
      <Icon name="search" size={18} color={theme.inkMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inkMuted}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, TypographyStyles['body-md'], { color: theme.ink }]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {showClear && (
        <Pressable
          onPress={() => {
            onClear?.();
            onChangeText?.('');
          }}
          hitSlop={8}>
          <Icon name="x" size={18} color={theme.inkMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
