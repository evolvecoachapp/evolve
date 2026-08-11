import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { TrainingPreferences } from "../models";

export interface TrainingPreferencesCardProps {
  readonly prefs: TrainingPreferences;
}

export function TrainingPreferencesCard({ prefs }: TrainingPreferencesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, gap: spacing.lg },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
    tags: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.xs },
    tag: { ...typography.caption, color: colors.pulse },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Training Preferences</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>{prefs.level}</Text>
          </View>
          <View>
            <Text style={styles.label}>Sessions/week</Text>
            <Text style={styles.value}>{prefs.sessionsPerWeek > 0 ? prefs.sessionsPerWeek : "—"}</Text>
          </View>
          <View>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{prefs.preferredDuration > 0 ? `${prefs.preferredDuration} min` : "—"}</Text>
          </View>
        </View>
        {prefs.preferredTime ? (
          <View>
            <Text style={styles.label}>Preferred time</Text>
            <Text style={styles.value}>{prefs.preferredTime}</Text>
          </View>
        ) : null}
        {prefs.focusAreas.length > 0 ? (
          <View>
            <Text style={styles.label}>Focus areas</Text>
            <View style={styles.tags}>
              {prefs.focusAreas.map((area) => (
                <Text key={area} style={styles.tag}>{area}</Text>
              ))}
            </View>
          </View>
        ) : null}
        {prefs.equipmentAvailable.length > 0 ? (
          <View>
            <Text style={styles.label}>Equipment</Text>
            <View style={styles.tags}>
              {prefs.equipmentAvailable.map((eq) => (
                <Text key={eq} style={styles.tag}>{eq}</Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
