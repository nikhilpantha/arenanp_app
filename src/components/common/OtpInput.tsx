import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export interface OtpInputProps {
  value: string;
  onChangeText: (code: string) => void;
  length?: number;
  /** Fires once the user has entered every digit. */
  onComplete?: (code: string) => void;
  error?: boolean;
}

/**
 * Segmented OTP field backed by a single hidden TextInput, so paste and SMS
 * autofill (`oneTimeCode` / `sms-otp`) work out of the box. The visible boxes
 * are presentational and driven by `value`.
 */
export function OtpInput({
  value,
  onChangeText,
  length = 6,
  onComplete,
  error = false,
}: OtpInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length) {
      inputRef.current?.blur();
      onComplete?.(digits);
    }
  };

  const cells = Array.from({ length });
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable style={styles.wrap} onPress={() => inputRef.current?.focus()}>
      {cells.map((_, i) => {
        const char = value[i] ?? '';
        const isActive = focused && i === activeIndex && value.length < length;
        const borderColor = error ? theme.danger : isActive || char ? theme.primary : theme.border;
        return (
          <View key={i} style={[styles.cell, { backgroundColor: theme.card, borderColor }]}>
            <Typography variant="headline-md" color={theme.ink}>
              {char}
            </Typography>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 56,
    borderWidth: 1.5,
    borderRadius: Radius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});
