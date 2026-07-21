import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../../../components/Chip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatCompletedAt } from "../utils/sessionSummaryFormatters";

interface WorkoutDetailHeroProps {
  title: string;
  programName: string | null;
  completedAt: string;
}

/** Hero header for a completed workout detail screen. */
export function WorkoutDetailHero({
  title,
  programName,
  completedAt,
}: WorkoutDetailHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
        gap: heroLayout.contentGap,
      },
      chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
      },
      headlineBlock: {
        gap: heroLayout.headlineGap,
        paddingTop: spacing.sm,
      },
      eyebrow: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.metric,
        color: colors.ink,
      },
      completedAt: {
        ...typography.callout,
        color: colors.inkSecondary,
        marginTop: spacing.xs,
      },
    }),
  );

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.chipRow}>
            <Chip
              label="Completed"
              variant="warm"
              size="sm"
              icon="checkmark-circle-outline"
            />
            {programName ? (
              <Chip
                label={programName}
                variant="outline"
                size="sm"
                icon="flag-outline"
              />
            ) : null}
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.eyebrow}>Workout detail</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.completedAt}>
              Finished {formatCompletedAt(completedAt)}
            </Text>
          </View>
        </HeroEntrance>
      </View>
    </HeroAmbientLayer>
  );
}
