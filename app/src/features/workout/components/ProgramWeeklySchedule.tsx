import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WorkoutPreviewDay } from "../../training/application";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { SectionTitle } from "../../../components/SectionTitle";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { formatPreviewFocus } from "../utils/previewPresentationFormatters";

interface ProgramWeeklyScheduleProps {
  scheduleName: string;
  days: readonly WorkoutPreviewDay[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
}

export function ProgramWeeklySchedule({
  scheduleName,
  days,
  selectedDayId,
  onSelectDay,
}: ProgramWeeklyScheduleProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      section: {
        gap: spacing.sm,
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkMuted,
        marginTop: -spacing.sm,
        marginBottom: spacing.sm,
      },
      list: {
        gap: spacing.xs,
        padding: spacing.sm,
      },
      dayRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
      },
      dayRowSelected: {
        backgroundColor: colors.pulseMuted,
      },
      dayRowRest: {
        opacity: 0.9,
      },
      dayIndex: {
        ...typography.orderBadge,
        color: colors.inkMuted,
        minWidth: spacing.xl,
        textAlign: "center",
      },
      dayIndexSelected: {
        color: colors.pulse,
      },
      dayContent: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
      },
      dayName: {
        ...typography.bodyMedium,
      },
      dayNameSelected: {
        ...typography.title3,
      },
      dayMeta: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      chipWrap: {
        flexShrink: 0,
      },
    }),
  );

  return (
    <View style={styles.section}>
      <SectionTitle title="Weekly schedule" />
      <Text style={styles.subtitle}>{scheduleName}</Text>

      <AppCard variant="floating" padding="none">
        <View style={styles.list}>
          {days.map((day) => {
            const selected = day.id === selectedDayId;
            const focus = day.isRestDay
              ? "Recovery"
              : formatPreviewFocus(day.primaryFocus);
            const exerciseLabel = day.isRestDay
              ? "Rest day"
              : day.exercises.length === 1
                ? "1 exercise"
                : `${day.exercises.length} exercises`;

            return (
              <Pressable
                key={day.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelectDay(day.id)}
                style={[
                  styles.dayRow,
                  selected && styles.dayRowSelected,
                  day.isRestDay && styles.dayRowRest,
                ]}
              >
                <Text style={[styles.dayIndex, selected && styles.dayIndexSelected]}>
                  {day.dayIndex + 1}
                </Text>
                <View style={styles.dayContent}>
                  <Text
                    style={[styles.dayName, selected && styles.dayNameSelected]}
                    numberOfLines={1}
                  >
                    {day.name}
                  </Text>
                  <Text style={styles.dayMeta} numberOfLines={1}>
                    {focus} · {exerciseLabel}
                  </Text>
                </View>
                <View style={styles.chipWrap}>
                  <Chip
                    label={day.isRestDay ? "Rest" : "Train"}
                    variant={day.isRestDay ? "warm" : selected ? "accent" : "neutral"}
                    size="sm"
                    icon={day.isRestDay ? "moon-outline" : "fitness-outline"}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </AppCard>
    </View>
  );
}
