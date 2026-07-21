import { StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { AppCard } from "../../../components/AppCard";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MessageRole } from "../../conversation/models/MessageRole";
import type { MessageStatus } from "../../conversation/models/MessageStatus";
import { CoachAvatar } from "./CoachAvatar";
import { MessageTimestamp } from "./MessageTimestamp";

export interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  status: MessageStatus;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** True while this assistant bubble is receiving stream deltas. */
  isStreaming?: boolean;
  onRetry?: () => void;
}

/** Chat message bubble for user / assistant turns — presentation only. */
export function MessageBubble({
  role,
  content,
  status,
  createdAt,
  isStreaming = false,
  onRetry,
}: MessageBubbleProps) {
  const styles = useThemedStyles(({ colors, typography, shadows }) =>
    StyleSheet.create({
      assistantRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        maxWidth: coachLayout.messageMaxWidth,
        alignSelf: "flex-start",
      },
      avatarColumn: {
        paddingBottom: spacing.xs,
      },
      messageColumn: {
        flex: 1,
        minWidth: 0,
      },
      assistantCard: {
        marginBottom: 0,
        borderBottomLeftRadius: coachLayout.bubbleTailRadius,
        borderTopLeftRadius: coachLayout.assistantBubbleRadius,
        borderTopRightRadius: coachLayout.assistantBubbleRadius,
        borderBottomRightRadius: coachLayout.assistantBubbleRadius,
      },
      pendingCard: {
        opacity: 0.72,
      },
      assistantContent: {
        ...typography.bodyRelaxed,
        color: colors.ink,
      },
      assistantMeta: {
        marginTop: spacing.sm,
        gap: spacing.sm,
      },
      userRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignSelf: "flex-end",
      },
      userBubble: {
        maxWidth: coachLayout.messageMaxWidth,
        backgroundColor: colors.ink,
        borderRadius: coachLayout.userBubbleRadius,
        borderBottomRightRadius: coachLayout.bubbleTailRadius,
        paddingHorizontal: coachLayout.bubblePadding,
        paddingVertical: coachLayout.bubblePadding,
        gap: spacing.sm,
        opacity: status === "pending" ? 0.72 : 1,
        ...shadows.elevated,
      },
      userBubbleFailed: {
        borderWidth: 1,
        borderColor: colors.warm,
      },
      userContent: {
        ...typography.bodyMedium,
        color: colors.textOnInk,
        lineHeight: typography.bodyRelaxed.lineHeight,
      },
      failedLabel: {
        ...typography.micro,
        color: colors.warm,
      },
      retryButton: {
        alignSelf: "flex-start",
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: spacing.sm,
        backgroundColor: colors.overlayStrong,
      },
      retryLabel: {
        ...typography.caption,
        color: colors.pulse,
      },
      systemRow: {
        alignSelf: "center",
        maxWidth: coachLayout.messageMaxWidth,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      },
      systemText: {
        ...typography.caption,
        color: colors.inkMuted,
        textAlign: "center",
      },
    }),
  );

  if (role === "system") {
    return (
      <View style={styles.systemRow} accessibilityRole="text">
        <Text style={styles.systemText}>{content}</Text>
      </View>
    );
  }

  if (role === "user") {
    return (
      <View style={styles.userRow} accessibilityRole="text">
        <View
          style={[
            styles.userBubble,
            status === "failed" ? styles.userBubbleFailed : null,
          ]}
        >
          <Text style={styles.userContent}>{content}</Text>
          <MessageTimestamp value={createdAt} tone="onInk" />
          {status === "failed" ? (
            <View>
              <Text style={styles.failedLabel}>Couldn’t send</Text>
              {onRetry ? (
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry message"
                  onPress={onRetry}
                  haptic="light"
                  style={styles.retryButton}
                >
                  <Text style={styles.retryLabel}>Retry</Text>
                </AnimatedPressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.assistantRow}
      accessibilityRole="text"
      accessibilityLabel={isStreaming ? "Coach is responding" : undefined}
    >
      <View style={styles.avatarColumn}>
        <CoachAvatar size="sm" />
      </View>
      <View style={styles.messageColumn}>
        <AppCard
          variant="glass"
          glow
          padding="compact"
          style={[
            styles.assistantCard,
            status === "pending" || isStreaming ? styles.pendingCard : null,
          ]}
        >
          {content.length > 0 ? (
            <Text style={styles.assistantContent}>{content}</Text>
          ) : null}
          <View style={styles.assistantMeta}>
            {!isStreaming ? <MessageTimestamp value={createdAt} /> : null}
            {status === "failed" ? (
              <View>
                <Text style={styles.failedLabel}>Response failed</Text>
                {onRetry ? (
                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry message"
                    onPress={onRetry}
                    haptic="light"
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryLabel}>Retry</Text>
                  </AnimatedPressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </AppCard>
      </View>
    </View>
  );
}
