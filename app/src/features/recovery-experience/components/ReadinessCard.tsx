import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ReadinessProgress } from "../models";

export interface ReadinessCardProps {
  readonly readiness: ReadinessProgress;
  readonly onUpdateReadiness?: (score: number) => void;
}

export function ReadinessCard({ readiness, onUpdateReadiness }: ReadinessCardProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
      },
      label: { ...typography.caption, color: colors.inkMuted },
      value: { ...typography.title3, color: colors.text },
      action: { ...typography.caption, color: colors.pulse, marginTop: spacing.sm },
    }),
  );

  return (
    <AppCard>
      <View style={styles.row}>
        <Text style={styles.label}>Readiness</Text>
        <Text style={styles.value}>
          {readiness.score > 0 ? `${readiness.score}% · ${readiness.label}` : "Not updated"}
        </Text>
      </View>
      {onUpdateReadiness ? (
        <Pressable onPress={() => onUpdateReadiness(78)}>
          <Text style={styles.action}>Update readiness to 78%</Text>
        </Pressable>
      ) : null}
    </AppCard>
  );
}
