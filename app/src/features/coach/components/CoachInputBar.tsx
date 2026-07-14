import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextInputProps,
} from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { FloatingFooterAnchor, FloatingSurface } from "../../../components/FloatingSurface";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

/** ~17% shorter composer — local to this bar; coachLayout tokens unchanged. */
const COMPOSER_INPUT_MIN_HEIGHT = spacing["2xl"] + spacing.sm;
const COMPOSER_ACTION_SIZE = spacing["2xl"] + spacing.sm;

interface CoachInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  placeholder?: string;
  canSend?: boolean;
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;
  onKeyboardHeightChange?: (height: number) => void;
  onComposerLayout?: (height: number) => void;
}

export function CoachInputBar({
  value,
  onChangeText,
  onSendPress,
  placeholder = "Message your Coach…",
  canSend: canSendOverride,
  inputProps,
  onKeyboardHeightChange,
  onComposerLayout,
}: CoachInputBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius, shadows }) =>
    StyleSheet.create({
      surface: {
        paddingTop: spacing.xs + spacing.xs,
        paddingBottom: spacing.xs + spacing.xs,
      },
      inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: coachLayout.inputBarGap,
      },
      fieldShell: {
        flex: 1,
        minHeight: COMPOSER_INPUT_MIN_HEIGHT,
        borderRadius: coachLayout.inputFieldRadius,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        justifyContent: "center",
        ...shadows.card,
      },
      input: {
        ...typography.body,
        color: colors.ink,
        maxHeight: spacing["3xl"] * 2,
        paddingVertical: spacing.xs,
        ...Platform.select({
          android: { textAlignVertical: "center" as const },
          default: {},
        }),
      },
      dismissButton: {
        width: COMPOSER_ACTION_SIZE,
        height: COMPOSER_ACTION_SIZE,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.overlayStrong,
      },
      sendButton: {
        width: COMPOSER_ACTION_SIZE,
        height: COMPOSER_ACTION_SIZE,
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

  const canSend = canSendOverride ?? value.trim().length > 0;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const handleKeyboardHeightChange = useCallback(
    (lift: number) => {
      setIsKeyboardVisible(lift > 0);
      onKeyboardHeightChange?.(lift);
    },
    [onKeyboardHeightChange],
  );

  const handleComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onComposerLayout?.(event.nativeEvent.layout.height);
    },
    [onComposerLayout],
  );

  return (
    <FloatingFooterAnchor keyboardAware onKeyboardHeightChange={handleKeyboardHeightChange}>
      <View onLayout={handleComposerLayout}>
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

            {isKeyboardVisible ? (
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel="Hide keyboard"
                onPress={Keyboard.dismiss}
                variant="floating"
                haptic="light"
                style={styles.dismissButton}
              >
                <Ionicons
                  name="chevron-down"
                  size={spacing.icon.md}
                  color={colors.inkMuted}
                />
              </AnimatedPressable>
            ) : null}

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
      </View>
    </FloatingFooterAnchor>
  );
}
