import { useState } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export interface ExpandableTextProps {
  text: string;
  /** Lines shown while collapsed (default 4). */
  collapsedLines?: number;
}

/**
 * Body text that clamps to `collapsedLines` with a "Read more" / "Read less" toggle.
 * The toggle appears for longer text (a length heuristic, since clamped line counts are
 * unreliable across iOS/Android).
 */
export function ExpandableText({ text, collapsedLines = 4 }: ExpandableTextProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const canToggle = text.trim().length > 180;

  return (
    <>
      <Typography
        variant="body-md"
        color={theme.inkMuted}
        numberOfLines={expanded || !canToggle ? undefined : collapsedLines}>
        {text}
      </Typography>
      {canToggle ? (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8} accessibilityRole="button">
          <Typography variant="label-sm" color={theme.primary} style={{ textTransform: 'none' }}>
            {expanded ? 'Read less' : 'Read more'}
          </Typography>
        </Pressable>
      ) : null}
    </>
  );
}
