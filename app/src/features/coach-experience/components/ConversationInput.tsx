import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface ConversationInputProps {
  readonly onSend: (message: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}

/** Conversation composer — presentation only. */
export function ConversationInput({
  onSend,
  disabled = false,
  placeholder = "Ask your coach…",
}: ConversationInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState("");

  const styles = useThemedStyles(({ typography, radius }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        marginTop: spacing.lg,
      },
      input: {
        flex: 1,
        minHeight: spacing["3xl"] + spacing.sm,
        maxHeight: 120,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        ...typography.body,
        color: colors.ink,
      },
      send: {
        width: spacing["3xl"] + spacing.sm,
        height: spacing["3xl"] + spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.pulse,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      },
    }),
  );

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        editable={!disabled}
        multiline
        accessibilityLabel="Coach message input"
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled || value.trim().length === 0}
        style={styles.send}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        hitSlop={4}
      >
        <Ionicons name="arrow-up" size={spacing.icon.md} color={colors.textOnInk} />
      </Pressable>
    </View>
  );
}
