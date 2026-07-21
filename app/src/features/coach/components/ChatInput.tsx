import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextInputProps,
} from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import {
  FloatingFooterAnchor,
  FloatingSurface,
} from "../../../components/FloatingSurface";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

/** Soft character limit — counter appears near the ceiling. */
export const CHAT_INPUT_SOFT_LIMIT = 500;
const COUNTER_VISIBILITY_THRESHOLD = Math.floor(CHAT_INPUT_SOFT_LIMIT * 0.8);

const COMPOSER_INPUT_MIN_HEIGHT = spacing["2xl"] + spacing.sm;
const COMPOSER_ACTION_SIZE = spacing["2xl"] + spacing.sm;

export interface ChatInputProps {
  onSend: (content: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  softLimit?: number;
  inputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "placeholder" | "editable"
  >;
  onKeyboardHeightChange?: (height: number) => void;
  onComposerLayout?: (height: number) => void;
}

/**
 * Sticky multiline coach composer.
 * Clears after send. Presentation only — no AI logic.
 */
export function ChatInput({
  onSend,
  placeholder = "Message your Coach…",
  disabled = false,
  loading = false,
  softLimit = CHAT_INPUT_SOFT_LIMIT,
  inputProps,
  onKeyboardHeightChange,
  onComposerLayout,
}: ChatInputProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
      counter: {
        ...typography.micro,
        color: colors.inkMuted,
        alignSelf: "flex-end",
        marginTop: spacing.xs,
      },
      counterWarn: {
        color: colors.warm,
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

  const trimmed = value.trim();
  const canSend = !disabled && !loading && trimmed.length > 0;
  const showCounter = value.length >= COUNTER_VISIBILITY_THRESHOLD;
  const nearLimit = value.length >= softLimit;

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

  const handleSend = useCallback(() => {
    if (!canSend) {
      return;
    }
    const content = trimmed;
    setValue("");
    void onSend(content);
  }, [canSend, onSend, trimmed]);

  return (
    <FloatingFooterAnchor
      keyboardAware
      onKeyboardHeightChange={handleKeyboardHeightChange}
    >
      <View onLayout={handleComposerLayout}>
        <FloatingSurface variant="footer" style={styles.surface}>
          <View style={styles.inputRow}>
            <View style={styles.fieldShell}>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                placeholderTextColor={colors.inkMuted}
                style={styles.input}
                multiline
                maxLength={softLimit}
                editable={!disabled && !loading}
                accessibilityLabel="Message input"
                {...inputProps}
              />
              {showCounter ? (
                <Text
                  style={[styles.counter, nearLimit ? styles.counterWarn : null]}
                >
                  {value.length}/{softLimit}
                </Text>
              ) : null}
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
              onPress={handleSend}
              disabled={!canSend}
              variant="floating"
              haptic="light"
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            >
              <LinearGradient
                colors={
                  canSend
                    ? [colors.pulse, colors.ink]
                    : [colors.overlayStrong, colors.overlayStrong]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.textOnInk}
                  />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={spacing.icon.lg}
                    color={canSend ? colors.textOnInk : colors.inkMuted}
                  />
                )}
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </FloatingSurface>
      </View>
    </FloatingFooterAnchor>
  );
}
