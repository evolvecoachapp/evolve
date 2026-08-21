import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { getActivityLevelLabel } from "../../athlete-setup/activityLevelOptions";
import { getSetupGoalLabel } from "../../athlete-setup/setupGoalOptions";
import { formatBirthDateDisplay, getGenderLabel } from "../../profile/utils";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteProfile } from "../models";

export interface AthleteCardProps {
  readonly profile: AthleteProfile;
}

function Metric({
  label,
  value,
  styles,
}: {
  label: string;
  value: string | null | undefined;
  styles: { label: object; value: object; metric: object };
}) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function AthleteCard({ profile }: AthleteCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.lg },
    metric: { minWidth: 88, gap: 2 },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
    email: { ...typography.callout, color: colors.inkMuted },
  }));

  const nameParts = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const height =
    profile.heightCm != null ? `${profile.heightCm} cm` : null;
  const weight =
    profile.weightKg != null ? `${profile.weightKg} kg` : null;
  const target =
    profile.targetWeightKg != null ? `${profile.targetWeightKg} kg` : null;
  const age = profile.age != null ? String(profile.age) : null;
  const birth = profile.birthDate ? formatBirthDateDisplay(profile.birthDate) : null;

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Athlete Information</Text>
        {nameParts ? <Text style={styles.value}>{nameParts}</Text> : null}
        {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        <View style={styles.row}>
          <Metric label="Age" value={age} styles={styles} />
          <Metric label="Born" value={birth && birth !== "—" ? birth : null} styles={styles} />
          <Metric label="Sex" value={profile.gender ? getGenderLabel(profile.gender) : null} styles={styles} />
        </View>
        <View style={styles.row}>
          <Metric label="Height" value={height} styles={styles} />
          <Metric label="Weight" value={weight} styles={styles} />
          <Metric label="Target" value={target} styles={styles} />
        </View>
        <View style={styles.row}>
          <Metric
            label="Primary goal"
            value={profile.primaryGoal ? getSetupGoalLabel(profile.primaryGoal) : null}
            styles={styles}
          />
          <Metric
            label="Activity"
            value={profile.activityLevel ? getActivityLevelLabel(profile.activityLevel) : null}
            styles={styles}
          />
        </View>
        <View>
          <Text style={styles.label}>Member since</Text>
          <Text style={styles.value}>{profile.joinDate}</Text>
        </View>
      </View>
    </AppCard>
  );
}
