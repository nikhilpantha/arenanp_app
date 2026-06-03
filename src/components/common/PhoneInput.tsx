import { useState } from 'react';
import { type StyleProp, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { Radius, Shadow, Spacing, TypographyStyles } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

const COUNTRY_CODE = '+977';
const LOCAL_LENGTH = 10;

export interface PhoneInputProps {
  /** Local digits only (max 10), e.g. "9801234567". */
  value: string;
  onChangeText: (digits: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Builds an E.164 number from local Nepali digits, e.g. "9801234567" → "+9779801234567". */
export function toE164(localDigits: string): string {
  return `${COUNTRY_CODE}${localDigits}`;
}

export function PhoneInput({
  value,
  onChangeText,
  onBlur,
  label,
  error,
  containerStyle,
}: PhoneInputProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const [focused, setFocused] = useState(false);

  // Pill input: matches Input — white, fully rounded, soft shadow, no border at rest.
  const fieldStyle = error
    ? { backgroundColor: `${theme.danger}0F`, borderColor: theme.danger }
    : focused
      ? { backgroundColor: theme.card, borderColor: accent }
      : { backgroundColor: theme.card, borderColor: 'transparent' };
  // Code chip contrasts against the white field.
  const chipBg = theme.cardMuted;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
      )}
      <View style={[styles.field, fieldStyle, focused ? Shadow.md : Shadow.sm]}>
        <View style={[styles.codeChip, { backgroundColor: chipBg }]}>
          <Typography variant="label-lg" color={theme.ink}>
            {COUNTRY_CODE}
          </Typography>
        </View>
        <TextInput
          // Drop the token lineHeight: it shifts TextInput text down once typing starts.
          style={[styles.input, TypographyStyles['body-md'], { color: theme.ink, lineHeight: undefined }]}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, LOCAL_LENGTH))}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          placeholder="98XXXXXXXX"
          placeholderTextColor={theme.inkMuted}
          maxLength={LOCAL_LENGTH}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
        />
      </View>
      {error && (
        <View style={styles.messageRow}>
          <Icon name="xCircle" size={13} color={theme.danger} />
          <Typography variant="label-sm" color={theme.danger} style={styles.message}>
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.lg,
    gap: Spacing.sm,
  },
  codeChip: {
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  message: {
    textTransform: 'none',
    letterSpacing: 0.1,
  },
});
