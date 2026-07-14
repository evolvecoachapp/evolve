import { StyleSheet, Text, View } from "react-native";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface CoachUserMessageProps {
  content: string;
  timestamp: string;
}

export function CoachUserMessage({ content, timestamp }: CoachUserMessageProps) {
  const styles = useThemedStyles(({ colors, typography, shadows }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignSelf: "flex-end",
      },
      bubble: {
        maxWidth: coachLayout.messageMaxWidth,
        backgroundColor: colors.ink,
        borderRadius: coachLayout.userBubbleRadius,
        borderBottomRightRadius: coachLayout.bubbleTailRadius,
        paddingHorizontal: coachLayout.bubblePadding,
        paddingVertical: coachLayout.bubblePadding,
        gap: spacing.sm,
        ...shadows.elevated,
      },
      content: {
        ...typography.bodyMedium,
        color: colors.textOnInk,
        lineHeight: typography.bodyRelaxed.lineHeight,
      },
      timestamp: {
        ...typography.micro,
        color: colors.textOnInkMuted,
        alignSelf: "flex-end",
      },
    }),
  );

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.content}>{content}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
}
