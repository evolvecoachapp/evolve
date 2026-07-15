import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface RestUpNextCardProps {
  exerciseName: string;
  setLabel: string;
  muscleGroupLabel?: string;
}

/** Highlights the next set waiting after rest ends. */
export function RestUpNextCard({ exerciseName, setLabel, muscleGroupLabel }: RestUpNextCardProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        width: "100%",
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceElevated,
      },
      eyebrow: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      },
      title: {
        ...typography.title3,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        alignItems: "center",
      },
      setPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
      },
      setPillText: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
      },
    }),
  );

  return (
    <AppCard variant="elevated" style={styles.card}>
      <Text style={styles.eyebrow}>Up next</Text>
      <Text style={styles.title}>{exerciseName}</Text>
      <View style={styles.metaRow}>
        {muscleGroupLabel ? <Chip label={muscleGroupLabel} /> : null}
        <View style={styles.setPill}>
          <Text style={styles.setPillText}>{setLabel}</Text>
        </View>
      </View>
    </AppCard>
  );
}
