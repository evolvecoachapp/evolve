import { StyleSheet, Text, type TextStyle } from "react-native";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatMessageTimestamp } from "../utils/presentationFormatters";

interface MessageTimestampProps {
  /** ISO-8601 timestamp or Date. */
  value: string | Date;
  tone?: "default" | "onInk";
  style?: TextStyle;
}

/** Formats a message timestamp for chat bubbles — presentation only. */
export function MessageTimestamp({
  value,
  tone = "default",
  style,
}: MessageTimestampProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      text: {
        ...typography.micro,
        color: tone === "onInk" ? colors.textOnInkMuted : colors.inkMuted,
      },
    }),
  );

  const date = typeof value === "string" ? new Date(value) : value;
  const label = Number.isNaN(date.getTime())
    ? ""
    : formatMessageTimestamp(date);

  if (!label) {
    return null;
  }

  return <Text style={[styles.text, style]}>{label}</Text>;
}
