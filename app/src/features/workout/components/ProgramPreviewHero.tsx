import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface ProgramPreviewHeroProps {
  title: string;
  goalLabel: string;
  durationLabel: string;
  splitTypeLabel: string;
  description: string | null;
  trainingDayCount: number;
  restDayCount: number;
}

export function ProgramPreviewHero({
  title,
  goalLabel,
  durationLabel,
  splitTypeLabel,
  description,
  trainingDayCount,
  restDayCount,
}: ProgramPreviewHeroProps) {
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
      missionLabel: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      programTitle: {
        ...typography.metric,
      },
      description: {
        ...typography.callout,
        color: colors.inkSecondary,
        marginTop: spacing.xs,
      },
      statGrid: {
        gap: spacing.md,
        marginTop: spacing.sm,
      },
      statRow: {
        flexDirection: "row",
        gap: spacing.md,
      },
      statChip: {
        flex: 1,
        minWidth: 0,
      },
    }),
  );

  const trainingLabel =
    trainingDayCount === 1 ? "1 training day" : `${trainingDayCount} training days`;
  const restLabel = restDayCount === 1 ? "1 rest day" : `${restDayCount} rest days`;

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.chipRow}>
            <Chip label={goalLabel} variant="accent" size="lg" icon="flag-outline" />
            <Chip label={durationLabel} variant="neutral" size="lg" icon="calendar-outline" />
            <Chip label={splitTypeLabel} variant="outline" size="lg" icon="git-branch-outline" />
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.missionLabel}>Your program</Text>
            <Text style={styles.programTitle} numberOfLines={3}>
              {title}
            </Text>
            {description ? (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            ) : null}
          </View>
        </HeroEntrance>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <FloatingStatChip
              label="Duration"
              value={durationLabel}
              icon="time-outline"
              tone="accent"
              style={styles.statChip}
              enterIndex={0}
            />
            <FloatingStatChip
              label="Goal"
              value={goalLabel}
              icon="trophy-outline"
              tone="warm"
              style={styles.statChip}
              enterIndex={1}
            />
          </View>
          <View style={styles.statRow}>
            <FloatingStatChip
              label="Training"
              value={trainingLabel}
              icon="barbell-outline"
              tone="neutral"
              style={styles.statChip}
              enterIndex={2}
            />
            <FloatingStatChip
              label="Recovery"
              value={restLabel}
              icon="moon-outline"
              tone="accent"
              style={styles.statChip}
              enterIndex={3}
            />
          </View>
        </View>
      </View>
    </HeroAmbientLayer>
  );
}
