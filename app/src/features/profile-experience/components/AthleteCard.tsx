import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { AthleteProfile } from "../models";

export interface AthleteCardProps {
  readonly profile: AthleteProfile;
}

export function AthleteCard({ profile }: AthleteCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, gap: spacing.lg },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
    email: { ...typography.callout, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Athlete Information</Text>
        {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        <View style={styles.row}>
          {profile.age ? (
            <View>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{profile.age}</Text>
            </View>
          ) : null}
          {profile.heightCm ? (
            <View>
              <Text style={styles.label}>Height</Text>
              <Text style={styles.value}>{profile.heightCm} cm</Text>
            </View>
          ) : null}
          {profile.weightKg ? (
            <View>
              <Text style={styles.label}>Weight</Text>
              <Text style={styles.value}>{profile.weightKg} kg</Text>
            </View>
          ) : null}
        </View>
        <View>
          <Text style={styles.label}>Member since</Text>
          <Text style={styles.value}>{profile.joinDate}</Text>
        </View>
      </View>
    </AppCard>
  );
}
