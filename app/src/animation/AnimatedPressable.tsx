import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { triggerHaptic, type HapticFeedback } from "../haptics/triggerHaptic";
import { spacing } from "../theme/theme";
import { usePressScale } from "./usePressScale";

type AnimatedPressableVariant = "default" | "card" | "floating";

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: AnimatedPressableVariant;
  haptic?: HapticFeedback;
}

const PRESSED_SCALE: Record<AnimatedPressableVariant, number> = {
  default: spacing.interaction.pressedScale,
  card: spacing.interaction.pressedScaleCard,
  floating: spacing.interaction.pressedScaleSubtle,
};

/**
 * Pressable with spring release and optional haptic feedback.
 */
export function AnimatedPressable({
  children,
  style,
  pressedStyle,
  disabled = false,
  variant = "default",
  haptic,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const { animatedStyle, pressIn, pressOut } = usePressScale({
    pressedScale: PRESSED_SCALE[variant],
    disabled,
    variant: variant === "floating" ? "floating" : "default",
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={(event) => {
        if (haptic && !disabled) {
          triggerHaptic(haptic);
        }
        onPress?.(event);
      }}
      onPressIn={(event) => {
        pressIn();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressOut();
        onPressOut?.(event);
      }}
      {...rest}
    >
      {({ pressed }) => (
        <Animated.View style={[style, animatedStyle, pressed && pressedStyle]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}
