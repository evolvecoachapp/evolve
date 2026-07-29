import { Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MacroProgress } from "../models";

export interface MacroRingCardProps {
  readonly macros: MacroProgress;
}

function MacroRow({
  label,
  value,
  target,
  progress,
}: {
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly progress: number;
}) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    row: { gap: spacing.xs },
    top: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    label: { ...typography.caption, color: colors.inkMuted },
    value: { ...typography.callout },
  }));
  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value} / {target}</Text>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
}

export function MacroRingCard({ macros }: MacroRingCardProps) {
  const styles = useThemedStyles(({ typography }) => ({
    body: { gap: spacing.md },
    title: { ...typography.title3 },
  }));

  return (
    <AppCard variant="elevated">
      <View style={styles.body}>
        <Text style={styles.title}>Macro Targets</Text>
        <MacroRow label="Protein" value={macros.protein.currentGrams} target={macros.protein.targetGrams} progress={macros.protein.completionPercent} />
        <MacroRow label="Carbohydrates" value={macros.carbohydrates.currentGrams} target={macros.carbohydrates.targetGrams} progress={macros.carbohydrates.completionPercent} />
        <MacroRow label="Fat" value={macros.fat.currentGrams} target={macros.fat.targetGrams} progress={macros.fat.completionPercent} />
      </View>
    </AppCard>
  );
}
