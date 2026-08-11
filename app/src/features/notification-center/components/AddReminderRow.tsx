import { Text, View } from "react-native";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { REMINDER_PRESETS } from "../models";
import type { ReminderType } from "../models";

export interface AddReminderRowProps {
  readonly existingTypes: ReadonlySet<ReminderType>;
  readonly onAdd: (presetType: ReminderType) => void;
  readonly disabled?: boolean;
}

/**
 * Quick-add affordance for creating a reminder — offers presets for
 * reminder types the athlete hasn't already configured. Keeps reminder
 * creation reachable without a full custom-schedule editor.
 */
export function AddReminderRow({ existingTypes, onAdd, disabled = false }: AddReminderRowProps) {
  const available = REMINDER_PRESETS.filter((preset) => !existingTypes.has(preset.type));

  const styles = useThemedStyles(({ colors, typography }) => ({
    label: { ...typography.caption, color: colors.inkMuted },
    row: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.sm },
  }));

  if (available.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.label}>Add a reminder</Text>
      <View style={styles.row}>
        {available.map((preset) => (
          <Chip
            key={preset.type}
            label={`+ ${preset.label}`}
            accessibilityLabel={`Add ${preset.label} reminder`}
            variant="outline"
            size="sm"
            disabled={disabled}
            onPress={() => onAdd(preset.type)}
          />
        ))}
      </View>
    </View>
  );
}
