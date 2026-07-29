import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { BodyComposition, BodyMeasurement, BodyWeightHistory } from "../models";

export interface BodyMeasurementsCardProps {
  readonly measurements: readonly BodyMeasurement[];
  readonly composition?: BodyComposition | null;
  readonly bodyWeight?: BodyWeightHistory | null;
}

export function BodyMeasurementsCard({
  measurements,
  composition,
  bodyWeight,
}: BodyMeasurementsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.xs },
    title: { ...typography.callout },
    row: { ...typography.body, color: colors.inkMuted },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Body Measurements</Text>
        {bodyWeight?.currentKg != null ? (
          <Text style={styles.row}>Weight: {bodyWeight.currentKg} kg</Text>
        ) : null}
        {composition?.bodyFatPercent != null ? (
          <Text style={styles.row}>Body fat: {composition.bodyFatPercent}%</Text>
        ) : null}
        {measurements.map((m) => (
          <Text key={m.id} style={styles.row}>
            {m.site}: {m.valueCm} cm
          </Text>
        ))}
      </View>
    </AppCard>
  );
}
