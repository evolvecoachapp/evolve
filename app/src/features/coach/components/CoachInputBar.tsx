import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { FloatingFooterAnchor, FloatingSurface } from "../../../components/FloatingSurface";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface CoachInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  placeholder?: string;
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;
}

export function CoachInputBar({
  value,
  onChangeText,
  onSendPress,
  placeholder = "Message your Coach…",
  inputProps,
}: CoachInputBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius, shadows }) =>
    StyleSheet.create({
      surface: {
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
      },
      inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: coachLayout.inputBarGap,
      },
      fieldShell: {
        flex: 1,
        minHeight: coachLayout.inputMinHeight,
        borderRadius: coachLayout.inputFieldRadius,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + spacing.xs,
        justifyContent: "center",
        ...shadows.card,
      },
      input: {
        ...typography.body,
        color: colors.ink,
        maxHeight: spacing["3xl"] * 2,
        paddingVertical: spacing.xs,
      },
      sendButton: {
        width: coachLayout.sendButtonSize,
        height: coachLayout.sendButtonSize,
        borderRadius: radius.full,
        overflow: "hidden",
        ...shadows.elevated,
      },
      sendButtonDisabled: {
        opacity: spacing.interaction.sendDisabledOpacity,
      },
      sendGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );

  const canSend = value.trim().length > 0;

  return (
    <FloatingFooterAnchor>
      <FloatingSurface variant="footer" style={styles.surface}>
        <View style={styles.inputRow}>
          <View style={styles.fieldShell}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.inkMuted}
              style={styles.input}
              multiline
              maxLength={500}
              {...inputProps}
            />
          </View>

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={onSendPress}
            disabled={!canSend}
            variant="floating"
            haptic="light"
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          >
            <LinearGradient
              colors={canSend ? [colors.pulse, colors.ink] : [colors.overlayStrong, colors.overlayStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendGradient}
            >
              <Ionicons
                name="arrow-up"
                size={spacing.icon.lg}
                color={canSend ? colors.textOnInk : colors.inkMuted}
              />
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </FloatingSurface>
    </FloatingFooterAnchor>
  );
}