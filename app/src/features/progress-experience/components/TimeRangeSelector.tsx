import { ScrollView } from "react-native";
import { AppButton } from "../../../components/AppButton";
import type { TimeRange, TimeRangeOption } from "../models";
import { spacing } from "../../../theme/theme";

export interface TimeRangeSelectorProps {
  readonly value: TimeRange;
  readonly options: readonly TimeRangeOption[];
  readonly onChange: (timeRange: TimeRange) => void;
}

export function TimeRangeSelector({ value, options, onChange }: TimeRangeSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}>
      {options.map((option) => (
        <AppButton key={option.value} label={option.label} size="sm" variant={option.value === value ? "primary" : "secondary"} onPress={() => onChange(option.value)} />
      ))}
    </ScrollView>
  );
}
