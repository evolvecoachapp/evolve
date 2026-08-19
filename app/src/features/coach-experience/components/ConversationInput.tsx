import { ChatInput } from "../../coach/components/ChatInput";

interface ConversationInputProps {
  readonly onSend: (message: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly onKeyboardHeightChange?: (height: number) => void;
  readonly onComposerLayout?: (height: number) => void;
}

/**
 * Conversation composer — presentation only.
 * Reuses the keyboard-aware ChatInput floating footer so the bar sits above
 * the software keyboard and tab bar without a second keyboard listener.
 */
export function ConversationInput({
  onSend,
  disabled = false,
  placeholder = "Ask your coach…",
  onKeyboardHeightChange,
  onComposerLayout,
}: ConversationInputProps) {
  return (
    <ChatInput
      onSend={onSend}
      disabled={disabled}
      loading={disabled}
      placeholder={placeholder}
      onKeyboardHeightChange={onKeyboardHeightChange}
      onComposerLayout={onComposerLayout}
      inputProps={{
        accessibilityLabel: "Coach message input",
      }}
    />
  );
}
