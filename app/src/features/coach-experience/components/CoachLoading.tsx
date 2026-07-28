import { View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SkeletonBlock } from "../../../components/Skeleton";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

/** Loading skeleton for Coach experience — presentation only. */
export function CoachLoading() {
  const styles = useThemedStyles(() => ({
    stack: {
      gap: spacing.lg,
    },
    headerRow: {
      flexDirection: "row" as const,
      gap: spacing.md,
      alignItems: "center" as const,
    },
    headerText: {
      flex: 1,
      gap: spacing.sm,
    },
    cardBody: {
      gap: spacing.md,
    },
    chips: {
      flexDirection: "row" as const,
      gap: spacing.sm,
    },
  }));

  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <SkeletonBlock
          width={spacing.avatar.lg}
          height={spacing.avatar.lg}
          borderRadius={999}
        />
        <View style={styles.headerText}>
          <SkeletonBlock width="40%" height={12} />
          <SkeletonBlock width="70%" height={22} />
        </View>
      </View>

      <AppCard variant="elevated">
        <View style={styles.cardBody}>
          <SkeletonBlock width="55%" height={16} />
          <SkeletonBlock width="90%" height={14} />
          <SkeletonBlock width="75%" height={14} />
        </View>
      </AppCard>

      <View style={styles.chips}>
        <SkeletonBlock width={140} height={52} borderRadius={16} />
        <SkeletonBlock width={140} height={52} borderRadius={16} />
      </View>

      <AppCard variant="glass">
        <View style={styles.cardBody}>
          <SkeletonBlock width="45%" height={16} />
          <SkeletonBlock width="100%" height={48} />
        </View>
      </AppCard>
    </View>
  );
}
