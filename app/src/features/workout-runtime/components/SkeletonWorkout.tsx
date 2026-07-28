import { View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SkeletonBlock } from "../../../components/Skeleton";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

/** Loading skeleton for workout runtime — presentation only. */
export function SkeletonWorkout() {
  const styles = useThemedStyles(() => ({
    stack: {
      gap: spacing.lg,
    },
    header: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: "row" as const,
      gap: spacing.sm,
    },
    body: {
      gap: spacing.md,
    },
  }));

  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <SkeletonBlock width="30%" height={12} />
        <SkeletonBlock width="70%" height={28} />
        <SkeletonBlock width="50%" height={14} />
      </View>
      <View style={styles.row}>
        <SkeletonBlock width={120} height={56} borderRadius={16} />
        <SkeletonBlock width={120} height={56} borderRadius={16} />
        <SkeletonBlock width={120} height={56} borderRadius={16} />
      </View>
      <AppCard variant="elevated">
        <View style={styles.body}>
          <SkeletonBlock width="60%" height={20} />
          <SkeletonBlock width="80%" height={14} />
          <SkeletonBlock width="100%" height={48} borderRadius={12} />
          <SkeletonBlock width="100%" height={48} borderRadius={12} />
        </View>
      </AppCard>
    </View>
  );
}
