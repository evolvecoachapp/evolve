import { StyleSheet, View } from "react-native";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { CoachMessage } from "../models/CoachMessage";
import type { CoachTypingState } from "../models/CoachTypingState";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ConversationListProps {
  readonly messages: readonly CoachMessage[];
  readonly typing?: CoachTypingState;
  readonly onRegenerate?: (messageId: string) => void;
}

/** Conversation message list — presentation only. */
export function ConversationList({
  messages,
  typing,
  onRegenerate,
}: ConversationListProps) {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      list: {
        gap: spacing.md,
      },
    }),
  );

  return (
    <View style={styles.list}>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          index={index}
          onRegenerate={onRegenerate}
        />
      ))}
      {typing?.visible ? (
        <TypingIndicator streaming={typing.isStreaming} />
      ) : null}
    </View>
  );
}
