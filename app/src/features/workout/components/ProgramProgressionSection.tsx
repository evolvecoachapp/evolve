import { StyleSheet, Text, View } from "react-native";
import type { WorkoutPreviewProgressionSummary } from "../../training/application";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface ProgramProgressionSectionProps {
  summaries: readonly WorkoutPreviewProgressionSummary[];
}

export function ProgramProgressionSection({ summaries }: ProgramProgressionSectionProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      section: {
        gap: spacing.md,
        paddingBottom: spacing.xl,
      },
      empty: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      card: {
        gap: spacing.md,
      },
      headerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        alignItems: "center",
      },
      modelTitle: {
        ...typography.title3,
        flex: 1,
        minWidth: 120,
      },
      summary: {
        ...typography.body,
        color: colors.inkSecondary,
        lineHeight: 22,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
    }),
  );

  return (
    <View style={styles.section}>
      <SectionTitle title="Progression" />

      {summaries.length === 0 ? (
        <Text style={styles.empty}>No progression schemes on this program.</Text>
      ) : (
        summaries.map((item) => (
          <AppCard key={item.id} variant="elevated" style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.modelTitle}>{item.modelLabel}</Text>
              {item.incrementLabel ? (
                <Chip label={item.incrementLabel} variant="accent" size="sm" icon="trending-up-outline" />
              ) : null}
            </View>

            <Text style={styles.summary}>{item.summary}</Text>

            <View style={styles.metaRow}>
              {item.cycleLengthWeeks !== null ? (
                <Chip
                  label={`${item.cycleLengthWeeks}-week cycle`}
                  variant="outline"
                  size="sm"
                  icon="repeat-outline"
                />
              ) : null}
              {item.deloadFrequencyWeeks !== null ? (
                <Chip
                  label={`Deload every ${item.deloadFrequencyWeeks} weeks`}
                  variant="warm"
                  size="sm"
                  icon="leaf-outline"
                />
              ) : null}
            </View>
          </AppCard>
        ))
      )}
    </View>
  );
}
