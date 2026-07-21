import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { StatCard } from "../../../components/StatCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface AnalyticsKpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

/** Reusable KPI tile for analytics dashboards. */
export function AnalyticsKpiCard({
  label,
  value,
  unit,
  icon,
  style,
}: AnalyticsKpiCardProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      cell: {
        width: spacing.gridHalfWidth,
        flexGrow: 1,
        minWidth: 0,
      },
    }),
  );

  return (
    <View style={[styles.cell, style]} testID="analytics-kpi-card">
      <StatCard label={label} value={value} unit={unit} icon={icon} />
    </View>
  );
}
