import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MeasurementUnits } from "../models";

export interface MeasurementUnitsCardProps {
  readonly units: MeasurementUnits;
}

export function MeasurementUnitsCard({ units }: MeasurementUnitsCardProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    body: { gap: spacing.sm },
    title: { ...typography.title3 },
    row: { flexDirection: "row" as const, gap: spacing.lg },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.body },
  }));

  return (
    <AppCard variant="floating">
      <View style={styles.body}>
        <Text style={styles.title}>Measurement Units</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{units.weight}</Text>
          </View>
          <View>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>{units.distance}</Text>
          </View>
          <View>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{units.height}</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
