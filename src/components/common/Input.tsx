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

import { Radius, Shadow, Spacing, TypographyStyles } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  onFocus,
  onBlur,
  editable = true,
  secureTextEntry,
  multiline,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const [focused, setFocused] = useState(false);
  // Password fields render a built-in show/hide toggle; revealed flips obscuring off.
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);
  // Multiline renders as a text area: a tall rounded rectangle with top-aligned text.
  const isMultiline = Boolean(multiline);

  // Pill input: white, fully rounded, soft shadow, no visible border at rest;
  // role-accent ring + lift on focus; danger tint on error.
  const iconColor = error ? theme.danger : focused ? accent : theme.inkMuted;
  const fieldStyle = error
    ? { backgroundColor: `${theme.danger}0F`, borderColor: theme.danger }
    : focused
      ? { backgroundColor: theme.card, borderColor: accent }
      : { backgroundColor: theme.card, borderColor: 'transparent' };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
      )}
      <View
        style={[
          styles.field,
          isMultiline && styles.fieldMultiline,
          fieldStyle,
          focused ? Shadow.md : Shadow.sm,
        ]}>
        {leftIcon && (
          <Icon name={leftIcon} size={20} color={iconColor} style={isMultiline ? styles.iconTop : undefined} />
        )}
        <TextInput
          // Drop the token lineHeight: a lineHeight on TextInput shifts the text down
          // once typing starts (placeholder vs value align differently).
          style={[
            styles.input,
            isMultiline && styles.inputMultiline,
            TypographyStyles['body-md'],
            { color: theme.ink, lineHeight: undefined },
          ]}
          placeholderTextColor={theme.inkMuted}
          editable={editable}
          multiline={multiline}
          secureTextEntry={isPassword ? !revealed : secureTextEntry}
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
        {isPassword ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}>
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={20} color={iconColor} />
          </Pressable>
        ) : rightIcon ? (
          <Icon name={rightIcon} size={20} color={iconColor} onPress={onRightIconPress} />
        ) : null}
      </View>
      {error ? (
        <View style={styles.messageRow}>
          <Icon name="xCircle" size={13} color={theme.danger} />
          <Typography variant="label-sm" color={theme.danger} style={styles.message}>
            {error}
          </Typography>
        </View>
      ) : hint ? (
        <Typography variant="label-sm" color={theme.inkMuted} style={styles.message}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
  },
  // Text-area mode: taller, top-aligned, gently rounded (not a pill).
  fieldMultiline: {
    alignItems: 'flex-start',
    minHeight: 120,
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    // Keep text vertically centered and stable across placeholder ↔ value (Android).
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputMultiline: {
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  iconTop: {
    marginTop: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // label-sm is uppercased by default; messages read better in normal case.
  message: {
    textTransform: 'none',
    letterSpacing: 0.1,
  },
});
