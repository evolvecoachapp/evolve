import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { WorkoutSessionSet } from "../../training/application";
import type { SetExecutionState } from "../types/sessionExecutionState";
import { formatSessionSetLine } from "../utils/sessionPresentationFormatters";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface SessionSetRowProps {
  set: WorkoutSessionSet;
  execution: SetExecutionState;
  /** True when this is the focused pending set in the local set flow. */
  isActive?: boolean;
  onComplete: () => void;
  onUncomplete: () => void;
  onSkip: () => void;
  onUnskip: () => void;
  onRepsChange: (reps: number | null) => void;
  onLoadChange: (load: number | null) => void;
  /** Fired when this row becomes active so the screen can scroll it into view. */
  onActiveLayout?: (windowY: number) => void;
}

function formatOptionalNumber(value: number | null): string {
  return value === null ? "" : String(value);
}

function parseRepsInput(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseLoadInput(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "" || trimmed === ".") {
    return null;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Interactive set row for local session execution.
 * Completes / skips / edits live in UI state only.
 */
export function SessionSetRow({
  set,
  execution,
  isActive = false,
  onComplete,
  onUncomplete,
  onSkip,
  onUnskip,
  onRepsChange,
  onLoadChange,
  onActiveLayout,
}: SessionSetRowProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      container: {
        gap: spacing.sm,
        paddingLeft: spacing["3xl"] + spacing.md,
        paddingVertical: spacing.sm,
        paddingRight: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: "transparent",
      },
      containerActive: {
        borderColor: colors.borderPulse,
        backgroundColor: colors.pulseMuted,
      },
      prescription: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      prescriptionCompleted: {
        color: colors.inkSecondary,
      },
      prescriptionSkipped: {
        color: colors.inkMuted,
        textDecorationLine: "line-through",
      },
      note: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontStyle: "italic",
      },
      activeLabel: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: "transparent",
      },
      actionPrimary: {
        borderColor: colors.borderPulse,
        backgroundColor: colors.pulseMuted,
      },
      actionWarm: {
        borderColor: colors.borderWarm,
        backgroundColor: colors.warmMuted,
      },
      actionPressed: {
        opacity: spacing.interaction.chipPressedOpacity,
      },
      actionLabel: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      actionLabelPrimary: {
        color: colors.pulse,
      },
      actionLabelWarm: {
        color: colors.warm,
      },
      statusLabel: {
        ...typography.caption,
        fontWeight: "600",
        color: colors.pulse,
      },
      statusSkipped: {
        color: colors.warm,
      },
      fields: {
        flexDirection: "row",
        gap: spacing.md,
      },
      field: {
        flex: 1,
        gap: spacing.xs,
      },
      fieldLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
      },
      input: {
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceElevated,
        color: colors.ink,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 40,
      },
      inputDisabled: {
        opacity: 0.55,
      },
    }),
  );

  const [repsDraft, setRepsDraft] = useState(formatOptionalNumber(execution.completedReps));
  const [loadDraft, setLoadDraft] = useState(formatOptionalNumber(execution.completedLoad));
  const containerRef = useRef<View>(null);

  useEffect(() => {
    setRepsDraft(formatOptionalNumber(execution.completedReps));
  }, [execution.completedReps]);

  useEffect(() => {
    setLoadDraft(formatOptionalNumber(execution.completedLoad));
  }, [execution.completedLoad]);

  useEffect(() => {
    if (!isActive || !onActiveLayout) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      containerRef.current?.measureInWindow((_x, y) => {
        onActiveLayout(y);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isActive, onActiveLayout, execution.status]);

  const isCompleted = execution.status === "completed";
  const isSkipped = execution.status === "skipped";
  const fieldsEnabled = isCompleted;

  const prescriptionStyle = [
    styles.prescription,
    isCompleted ? styles.prescriptionCompleted : null,
    isSkipped ? styles.prescriptionSkipped : null,
  ];

  return (
    <View
      ref={containerRef}
      style={[styles.container, isActive ? styles.containerActive : null]}
      accessibilityState={{ selected: isActive }}
    >
      {isActive ? <Text style={styles.activeLabel}>Active set</Text> : null}
      <Text style={prescriptionStyle}>{formatSessionSetLine(set)}</Text>
      {set.prescriptionNotes ? <Text style={styles.note}>{set.prescriptionNotes}</Text> : null}

      {isCompleted ? <Text style={styles.statusLabel}>Completed</Text> : null}
      {isSkipped ? <Text style={[styles.statusLabel, styles.statusSkipped]}>Skipped</Text> : null}

      {isCompleted ? (
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Reps</Text>
            <TextInput
              style={[styles.input, !fieldsEnabled ? styles.inputDisabled : null]}
              value={repsDraft}
              onChangeText={(text) => {
                setRepsDraft(text);
                onRepsChange(parseRepsInput(text));
              }}
              keyboardType="number-pad"
              editable={fieldsEnabled}
              placeholder={String(set.targetReps.min)}
              accessibilityLabel={`Completed reps for set ${set.order + 1}`}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Load (kg)</Text>
            <TextInput
              style={[styles.input, !fieldsEnabled ? styles.inputDisabled : null]}
              value={loadDraft}
              onChangeText={(text) => {
                setLoadDraft(text);
                onLoadChange(parseLoadInput(text));
              }}
              keyboardType="decimal-pad"
              editable={fieldsEnabled}
              placeholder="0"
              accessibilityLabel={`Completed load for set ${set.order + 1}`}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {execution.status === "pending" ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Complete set ${set.order + 1}`}
              onPress={onComplete}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionPrimary,
                pressed ? styles.actionPressed : null,
              ]}
            >
              <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Complete</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Skip set ${set.order + 1}`}
              onPress={onSkip}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionWarm,
                pressed ? styles.actionPressed : null,
              ]}
            >
              <Text style={[styles.actionLabel, styles.actionLabelWarm]}>Skip</Text>
            </Pressable>
          </>
        ) : null}

        {isCompleted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Unmark set ${set.order + 1}`}
            onPress={onUncomplete}
            style={({ pressed }) => [
              styles.actionButton,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.actionLabel}>Undo complete</Text>
          </Pressable>
        ) : null}

        {isSkipped ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Restore set ${set.order + 1}`}
            onPress={onUnskip}
            style={({ pressed }) => [
              styles.actionButton,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Text style={styles.actionLabel}>Restore set</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
