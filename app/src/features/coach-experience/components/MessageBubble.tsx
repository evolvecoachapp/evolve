import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  CoachMessageRoles,
  type CoachMessage,
} from "../models/CoachMessage";
import { CoachAvatar } from "./CoachAvatar";

interface MessageBubbleProps {
  readonly message: CoachMessage;
  readonly onRegenerate?: (messageId: string) => void;
  readonly index?: number;
}

/** Message bubble — presentation only; prepared for markdown + citations. */
export function MessageBubble({
  message,
  onRegenerate,
  index = 0,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.role === CoachMessageRoles.USER;
  const isCoach = message.role === CoachMessageRoles.COACH;

  const styles = useThemedStyles(({ typography }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        maxWidth: coachLayout.messageMaxWidth,
        alignSelf: isUser ? "flex-end" : "flex-start",
      },
      avatarColumn: {
        paddingBottom: spacing.xs,
      },
      messageColumn: {
        flexShrink: 1,
        minWidth: 0,
        gap: spacing.xs,
      },
      card: {
        marginBottom: 0,
        ...(isUser
          ? {
              borderBottomRightRadius: coachLayout.bubbleTailRadius,
              borderTopLeftRadius: coachLayout.userBubbleRadius,
              borderTopRightRadius: coachLayout.userBubbleRadius,
              borderBottomLeftRadius: coachLayout.userBubbleRadius,
              backgroundColor: colors.pulseMuted,
            }
          : {
              borderBottomLeftRadius: coachLayout.bubbleTailRadius,
              borderTopLeftRadius: coachLayout.assistantBubbleRadius,
              borderTopRightRadius: coachLayout.assistantBubbleRadius,
              borderBottomRightRadius: coachLayout.assistantBubbleRadius,
            }),
      },
      content: {
        ...typography.bodyRelaxed,
        color: colors.ink,
      },
      citations: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      regenerate: {
        alignSelf: "flex-start",
        minHeight: spacing["2xl"],
        justifyContent: "center",
        paddingHorizontal: spacing.xs,
      },
      regenerateLabel: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "600",
      },
    }),
  );

  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40).springify()}>
      <View style={styles.row}>
        {isCoach ? (
          <View style={styles.avatarColumn}>
            <CoachAvatar size="sm" />
          </View>
        ) : null}
        <View style={styles.messageColumn}>
          <AppCard
            variant={isUser ? "elevated" : "glass"}
            glow={!isUser}
            padding="compact"
            style={styles.card}
          >
            <Text style={styles.content}>{message.content}</Text>
            {message.citations.length > 0 ? (
              <Text style={styles.citations}>
                Sources: {message.citations.join(", ")}
              </Text>
            ) : null}
          </AppCard>
          {isCoach && onRegenerate ? (
            <Pressable
              onPress={() => onRegenerate(message.id)}
              style={styles.regenerate}
              accessibilityRole="button"
              accessibilityLabel="Regenerate response"
            >
              <Text style={styles.regenerateLabel}>Regenerate</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
