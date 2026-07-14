import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface AvatarProps {
  initials: string;
  size?: number;
}

/**
 * Premium avatar with gradient ring — profile and identity surfaces.
 */
export function Avatar({ initials, size = 88 }: AvatarProps) {
  const { colors, shadows } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    wrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    ring: {
      alignItems: "center",
      justifyContent: "center",
      padding: 3,
    },
    inner: {
      backgroundColor: colors.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      ...typography.title1,
      color: colors.canvas,
      fontWeight: "700",
    },
  }));

  const innerSize = size - 6;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, shadows.elevated]}>
      <LinearGradient
        colors={[colors.pulse, colors.ink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
