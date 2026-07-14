import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "../../../components/ProgressBar";
import type { ColorPalette } from "../../../theme/colorTokens";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatCompletionPercent, formatMacroGrams } from "../utils";

type MacroKind = "calories" | "protein" | "carbs" | "fat";

interface NutritionMacroCardProps {
  kind: MacroKind;
  label: string;
  current: number;
  target: number;
  progress: number;
}

const MACRO_ICONS: Record<MacroKind, keyof typeof Ionicons.glyphMap> = {
  calories: "flame-outline",
  protein: "nutrition-outline",
  carbs: "leaf-outline",
  fat: "water-outline",
};

function getMacroTones(colors: ColorPalette) {
  return {
    calories: {
      iconBg: colors.pulseMuted,
      iconColor: colors.pulse,
      borderColor: colors.borderPulse,
    },
    protein: {
      iconBg: colors.pulseMuted,
      iconColor: colors.pulse,
      borderColor: colors.border,
    },
    carbs: {
      iconBg: colors.warmMuted,
      iconColor: colors.warm,
      borderColor: colors.borderWarm,
    },
    fat: {
      iconBg: colors.overlayStrong,
      iconColor: colors.inkSecondary,
      borderColor: colors.border,
    },
  } satisfies Record<
    MacroKind,
    { iconBg: string; iconColor: string; borderColor: string }
  >;
}

export function NutritionMacroCard({
  kind,
  label,
  current,
  target,
  progress,
}: NutritionMacroCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius, shadows }) =>
    StyleSheet.create({
      card: {
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.surfaceElevated,
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.elevated,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
      },
      iconRing: {
        width: spacing.avatar.md,
        height: spacing.avatar.md,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
      },
      label: {
        ...typography.caption,
        color: colors.inkMuted,
        flex: 1,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      completion: {
        ...typography.micro,
        color: colors.pulse,
      },
      valueRow: {
        flexDirection: "row",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: spacing.xs,
      },
      value: {
        ...typography.metric,
      },
      target: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      progress: {
        marginTop: spacing.xs,
      },
    }),
  );

  const tone = getMacroTones(colors)[kind];
  const icon = MACRO_ICONS[kind];
  const isCalories = kind === "calories";

  const valueLabel = isCalories
    ? current.toLocaleString("en-US")
    : formatMacroGrams(current);
  const targetLabel = isCalories
    ? `/ ${target.toLocaleString("en-US")}`
    : `/ ${formatMacroGrams(target)}`;
  const unitLabel = isCalories ? "kcal" : "";

  return (
    <View style={[styles.card, { borderColor: tone.borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconRing, { backgroundColor: tone.iconBg }]}>
          <Ionicons name={icon} size={spacing.icon.md} color={tone.iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.completion}>{formatCompletionPercent(progress)}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{valueLabel}</Text>
        <Text style={styles.target}>
          {targetLabel}
          {unitLabel ? ` ${unitLabel}` : ""}
        </Text>
      </View>

      <ProgressBar progress={progress} height={5} style={styles.progress} />
    </View>
  );
}
