import { Modal, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { AppCard } from "../../../components/AppCard";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface FinishWorkoutDialogProps {
  readonly visible: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly title?: string;
}

/** Finish workout confirmation — presentation only. */
export function FinishWorkoutDialog({
  visible,
  onConfirm,
  onCancel,
  title = "Finish workout?",
}: FinishWorkoutDialogProps) {
  const styles = useThemedStyles(({ colors, typography }) => ({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlayStrong,
      justifyContent: "center" as const,
      padding: spacing.screenPadding,
    },
    body: {
      gap: spacing.lg,
    },
    title: {
      ...typography.title3,
      color: colors.ink,
    },
    message: {
      ...typography.callout,
      color: colors.inkMuted,
    },
    actions: {
      gap: spacing.sm,
    },
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <AppCard variant="floating">
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>
              This will end the current session. You can review history and
              statistics afterward.
            </Text>
            <View style={styles.actions}>
              <AppButton
                label="Finish workout"
                onPress={onConfirm}
                size="lg"
                interaction="floating"
              />
              <AppButton
                label="Keep training"
                onPress={onCancel}
                variant="secondary"
                size="md"
              />
            </View>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}
