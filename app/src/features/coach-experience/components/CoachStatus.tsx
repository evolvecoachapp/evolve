import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachTypingState } from "../models/CoachTypingState";

interface CoachStatusProps {
  readonly typing: CoachTypingState;
  readonly streamingPrepared?: boolean;
}

/** Coach status line — presentation only; streaming prepared. */
export function CoachStatus({
  typing,
  streamingPrepared = false,
}: CoachStatusProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        marginBottom: spacing.sm,
      },
      label: {
        ...typography.caption,
        color: colors.inkMuted,
      },
    }),
  );

  let label = "Ready";
  if (typing.isStreaming) {
    label = "Streaming response…";
  } else if (typing.isTyping || (streamingPrepared && typing.visible)) {
    label = "Coach is typing…";
  }

  return (
    <View style={styles.row} accessibilityRole="text">
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
