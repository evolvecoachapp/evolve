import { View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { HeroSection } from "../../../components/HeroSection";
import { SkeletonBlock } from "../../../components/Skeleton";
import { spacing } from "../../../theme/theme";

export function ProgressSkeleton() {
  return (
    <View style={{ gap: spacing.lg }}>
      <HeroSection overline="Athlete Analytics" title="Loading analytics" subtitle="Preparing your performance dashboard.">
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <SkeletonBlock width="48%" height={96} borderRadius={20} />
          <SkeletonBlock width="48%" height={96} borderRadius={20} />
        </View>
      </HeroSection>
      <AppCard variant="elevated"><SkeletonBlock width="60%" height={22} /><SkeletonBlock width="100%" height={140} borderRadius={16} /></AppCard>
      <AppCard variant="elevated"><SkeletonBlock width="45%" height={22} /><SkeletonBlock width="100%" height={140} borderRadius={16} /></AppCard>
      <AppCard variant="elevated"><SkeletonBlock width="55%" height={22} /><SkeletonBlock width="100%" height={140} borderRadius={16} /></AppCard>
    </View>
  );
}
