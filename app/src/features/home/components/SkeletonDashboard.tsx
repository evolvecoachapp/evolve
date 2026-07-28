import { View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { SkeletonBlock } from "../../../components/Skeleton";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { DashboardSection } from "./DashboardSection";

/** Loading skeleton for the Home dashboard — presentation only. */
export function SkeletonDashboard() {
  const styles = useThemedStyles(() => ({
    header: {
      gap: spacing.md,
      marginBottom: spacing.lg,
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
    chips: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    cardBody: {
      gap: spacing.md,
    },
    row: {
      flexDirection: "row" as const,
      gap: spacing.md,
    },
  }));

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <SkeletonBlock width={spacing.avatar.lg} height={spacing.avatar.lg} borderRadius={999} />
          <View style={styles.headerText}>
            <SkeletonBlock width="40%" height={12} />
            <SkeletonBlock width="70%" height={22} />
            <SkeletonBlock width="55%" height={14} />
          </View>
        </View>
        <View style={styles.chips}>
          <SkeletonBlock width={96} height={36} borderRadius={18} />
          <SkeletonBlock width={96} height={36} borderRadius={18} />
          <SkeletonBlock width={96} height={36} borderRadius={18} />
        </View>
      </View>

      <DashboardSection title="Today's Workout">
        <AppCard variant="elevated">
          <View style={styles.cardBody}>
            <SkeletonBlock width="60%" height={18} />
            <SkeletonBlock width="80%" height={14} />
            <SkeletonBlock width="30%" height={24} borderRadius={12} />
          </View>
        </AppCard>
      </DashboardSection>

      <DashboardSection title="Nutrition">
        <AppCard variant="elevated">
          <View style={styles.row}>
            <SkeletonBlock width="48%" height={88} borderRadius={16} />
            <SkeletonBlock width="48%" height={88} borderRadius={16} />
          </View>
        </AppCard>
      </DashboardSection>

      <DashboardSection title="Recovery">
        <AppCard variant="elevated">
          <View style={styles.cardBody}>
            <SkeletonBlock width="35%" height={36} />
            <SkeletonBlock width="90%" height={14} />
          </View>
        </AppCard>
      </DashboardSection>
    </View>
  );
}
