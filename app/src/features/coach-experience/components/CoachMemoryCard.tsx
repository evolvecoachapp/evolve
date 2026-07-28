import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachMemorySummary } from "../models/CoachMemorySummary";

interface CoachMemoryCardProps {
  readonly memory: CoachMemorySummary;
}

/** Memory summary card — presentation only. */
export function CoachMemoryCard({ memory }: CoachMemoryCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      sectionTitle: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: spacing.sm,
      },
      body: {
        gap: spacing.sm,
      },
      headline: {
        ...typography.title3,
        color: colors.ink,
      },
      summary: {
        ...typography.bodyRelaxed,
        color: colors.inkSecondary,
      },
      focus: {
        ...typography.caption,
        color: colors.inkMuted,
      },
    }),
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Memory Summary</Text>
      <AppCard variant="glass">
        <View style={styles.body}>
          <Text style={styles.headline}>{memory.headline}</Text>
          <Text style={styles.summary}>{memory.summary}</Text>
          {memory.focusAreas.length > 0 ? (
            <Text style={styles.focus}>
              Focus: {memory.focusAreas.join(" · ")}
            </Text>
          ) : null}
        </View>
      </AppCard>
    </View>
  );
}
