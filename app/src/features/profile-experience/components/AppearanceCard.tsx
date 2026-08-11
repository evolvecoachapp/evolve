import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AppearancePreferences } from "../models";

export interface AppearanceCardProps {
  readonly prefs: AppearancePreferences;
  readonly onPress?: () => void;
}

const THEME_ICON: Record<AppearancePreferences["theme"], keyof typeof Ionicons.glyphMap> = {
  light: "sunny-outline",
  dark: "moon-outline",
  system: "phone-portrait-outline",
};

const THEME_LABEL: Record<AppearancePreferences["theme"], string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function AppearanceCard({ prefs, onPress }: AppearanceCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { flexDirection: "row" as const, alignItems: "center" as const, gap: spacing.md },
    iconRing: {
      width: spacing.avatar.sm,
      height: spacing.avatar.sm,
      borderRadius: radius.full,
      backgroundColor: colors.pulseMuted,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    text: { flex: 1, gap: spacing.xs },
    title: { ...typography.title3 },
    value: { ...typography.callout, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating" onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconRing}>
          <Ionicons name={THEME_ICON[prefs.theme]} size={spacing.icon.sm} color={colors.pulse} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Appearance</Text>
          <Text style={styles.value}>{THEME_LABEL[prefs.theme]} theme</Text>
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={spacing.icon.md} color={colors.inkMuted} />
        ) : null}
      </View>
    </AppCard>
  );
}
