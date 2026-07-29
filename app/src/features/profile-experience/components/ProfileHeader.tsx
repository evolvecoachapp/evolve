import { View } from "react-native";
import { HeroSection } from "../../../components/HeroSection";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteProfile } from "../models";

export interface ProfileHeaderProps {
  readonly profile: AthleteProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: "row" as const, gap: spacing.md },
  }));

  const primaryGoal = profile.goals.find((g) => g.isPrimary);

  return (
    <HeroSection
      overline="Digital Athlete Profile"
      title={profile.displayName}
      subtitle={profile.bio || "No bio yet."}
      variant="gradient"
    >
      <View style={styles.row}>
        <StatCard
          label="Goals"
          value={profile.goals.length}
          unit="active"
          progress={primaryGoal?.progress ?? 0}
          icon="flag-outline"
          embedded
        />
        <StatCard
          label="Account"
          value={profile.accountStatus}
          unit=""
          trend={`v${profile.appVersion}`}
          icon="shield-checkmark-outline"
          embedded
        />
      </View>
    </HeroSection>
  );
}
