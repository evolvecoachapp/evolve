import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachPreferences } from "../models";

export interface CoachPreferencesCardProps {
  readonly prefs: CoachPreferences;
}

export function CoachPreferencesCard({ prefs }: CoachPreferencesCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.lg },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Coach Preferences</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Style</Text>
            <Text style={styles.value}>{prefs.coachingStyle}</Text>
          </View>
          <View>
            <Text style={styles.label}>Motivation</Text>
            <Text style={styles.value}>{prefs.motivationLevel}</Text>
          </View>
          <View>
            <Text style={styles.label}>Feedback</Text>
            <Text style={styles.value}>{prefs.feedbackFrequency}</Text>
          </View>
          <View>
            <Text style={styles.label}>Depth</Text>
            <Text style={styles.value}>{prefs.explanationDepth}</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
