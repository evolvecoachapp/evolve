import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatDashboardDate,
  formatDashboardGreeting,
  formatWorkoutsProgress,
} from "../utils/presentationFormatters";

interface DashboardHeroProps {
  firstName: string;
  recoveryScore: number;
  streakDays: number;
  workoutsCompleted: number;
  workoutsTarget: number;
}

export function DashboardHero({
  firstName,
  recoveryScore,
  streakDays,
  workoutsCompleted,
  workoutsTarget,
}: DashboardHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginBottom: spacing.sm,
      },
      headlineBlock: {
        gap: heroLayout.headlineGap,
        paddingHorizontal: spacing.xs,
        maxWidth: heroLayout.headlineMaxWidth.dashboard,
      },
      date: {
        ...typography.eyebrow,
        color: colors.inkMuted,
      },
      greeting: {
        ...typography.title2,
        color: colors.inkSecondary,
        fontWeight: "500",
        marginTop: spacing.sm,
      },
      name: {
        ...typography.hero,
        marginTop: spacing.xs,
      },
      subtitle: {
        ...typography.bodyRelaxed,
        color: colors.inkMuted,
        marginTop: spacing.sm,
      },
      chipField: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
        marginTop: heroLayout.chipRowMarginTop,
        paddingHorizontal: spacing.xs,
      },
      chipPrimary: {
        transform: [{ translateY: 0 }],
      },
      chipSecondary: {
        transform: [{ translateY: spacing.xs }],
      },
      chipTertiary: {
        transform: [{ translateY: -spacing.xs }],
      },
    }),
  );

  const greeting = formatDashboardGreeting();
  const dateLabel = formatDashboardDate();

  return (
    <HeroAmbientLayer style={styles.hero}>
      <HeroEntrance delay={0}>
        <View style={styles.headlineBlock}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.subtitle}>Your daily performance at a glance</Text>
        </View>
      </HeroEntrance>

      <View style={styles.chipField}>
        <FloatingStatChip
          label="Recovery"
          value={`${recoveryScore}%`}
          icon="heart-outline"
          tone="accent"
          style={styles.chipPrimary}
          enterIndex={0}
        />
        <FloatingStatChip
          label="Streak"
          value={`${streakDays} days`}
          icon="flame-outline"
          tone="warm"
          style={styles.chipSecondary}
          enterIndex={1}
        />
        <FloatingStatChip
          label="This week"
          value={formatWorkoutsProgress(workoutsCompleted, workoutsTarget)}
          icon="barbell-outline"
          tone="neutral"
          style={styles.chipTertiary}
          enterIndex={2}
        />
      </View>
    </HeroAmbientLayer>
  );
}
