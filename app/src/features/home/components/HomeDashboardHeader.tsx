import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../../components/Avatar";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatWorkoutsProgress } from "../../dashboard/utils/presentationFormatters";
import type { AthleteSnapshotCard as AthleteSnapshotCardModel } from "../models/AthleteSnapshotCard";

interface HomeDashboardHeaderProps {
  readonly athlete: AthleteSnapshotCardModel;
}

/** Home greeting + avatar + snapshot chips — presentation only. */
export function HomeDashboardHeader({ athlete }: HomeDashboardHeaderProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginBottom: spacing.sm,
      },
      row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        paddingHorizontal: spacing.xs,
      },
      headlineBlock: {
        flex: 1,
        gap: heroLayout.headlineGap,
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

  return (
    <HeroAmbientLayer style={styles.hero}>
      <HeroEntrance delay={0}>
        <View style={styles.row}>
          <Avatar initials={athlete.initials} size={spacing.avatar.lg} />
          <View style={styles.headlineBlock}>
            <Text style={styles.date}>{athlete.dateLabel}</Text>
            <Text style={styles.greeting}>{athlete.greeting},</Text>
            <Text style={styles.name}>{athlete.displayName}</Text>
            <Text style={styles.subtitle}>{athlete.subtitle}</Text>
          </View>
        </View>
      </HeroEntrance>

      <View style={styles.chipField}>
        <FloatingStatChip
          label="Recovery"
          value={`${athlete.recoveryScore}%`}
          icon="heart-outline"
          tone="accent"
          style={styles.chipPrimary}
          enterIndex={0}
        />
        <FloatingStatChip
          label="Streak"
          value={`${athlete.streakDays} days`}
          icon="flame-outline"
          tone="warm"
          style={styles.chipSecondary}
          enterIndex={1}
        />
        <FloatingStatChip
          label="This week"
          value={formatWorkoutsProgress(
            athlete.workoutsCompleted,
            athlete.workoutsTarget,
          )}
          icon="barbell-outline"
          tone="neutral"
          style={styles.chipTertiary}
          enterIndex={2}
        />
      </View>
    </HeroAmbientLayer>
  );
}
