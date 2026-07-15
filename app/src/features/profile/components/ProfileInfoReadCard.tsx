import { StyleSheet, Text, View } from "react-native";
import type { UserProfile } from "../../shared/models";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  formatBirthDateDisplay,
  formatProfileValue,
  getGenderLabel,
  getGoalLabel,
} from "../utils";

interface ProfileInfoReadCardProps {
  profile: UserProfile | null;
}

interface InfoRowProps {
  label: string;
  value: string;
  showDivider?: boolean;
}

function InfoRow({ label, value, showDivider = true }: InfoRowProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.md,
        gap: spacing.md,
      },
      label: {
        ...typography.callout,
        color: colors.inkMuted,
        flex: 1,
      },
      value: {
        ...typography.bodyMedium,
        textAlign: "right",
        flex: 1,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
      },
    }),
  );

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

export function ProfileInfoReadCard({ profile }: ProfileInfoReadCardProps) {
  const rows: { label: string; value: string }[] = [
    { label: "First name", value: formatProfileValue(profile?.firstName) },
    { label: "Last name", value: formatProfileValue(profile?.lastName) },
    { label: "Date of birth", value: formatBirthDateDisplay(profile?.birthDate) },
    { label: "Gender", value: getGenderLabel(profile?.gender) },
    {
      label: "Height",
      value:
        profile?.heightCm != null ? `${profile.heightCm} cm` : formatProfileValue(null),
    },
    {
      label: "Weight",
      value:
        profile?.currentWeightKg != null
          ? `${profile.currentWeightKg} kg`
          : formatProfileValue(null),
    },
    { label: "Primary goal", value: getGoalLabel(profile?.goal) },
  ];

  return (
    <View>
      {rows.map((row, index) => (
        <InfoRow
          key={row.label}
          label={row.label}
          value={row.value}
          showDivider={index < rows.length - 1}
        />
      ))}
    </View>
  );
}
