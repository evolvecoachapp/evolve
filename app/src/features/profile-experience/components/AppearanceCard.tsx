import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AppearancePreferences } from "../models";

export interface AppearanceCardProps {
  readonly prefs: AppearancePreferences;
}

export function AppearanceCard({ prefs }: AppearanceCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Appearance</Text>
        <View>
          <Text style={styles.label}>Theme</Text>
          <Text style={styles.value}>{prefs.theme}</Text>
        </View>
        {prefs.accentColor ? (
          <View>
            <Text style={styles.label}>Accent</Text>
            <Text style={styles.value}>{prefs.accentColor}</Text>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
