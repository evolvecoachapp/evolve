import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../components/GradientBackground";
import {
  ChatInput,
  ConversationHeader,
  EmptyConversation,
  ErrorConversation,
  LoadingConversation,
  MessageBubble,
  ScrollToBottomButton,
  TypingIndicator,
} from "../features/coach/components";
import { createCoachConversationRuntime } from "../features/coach/services/createCoachConversationRuntime";
import { toFriendlyConversationError } from "../features/coach/utils/toFriendlyConversationError";
import { useCoachConversation } from "../features/conversation/hooks/useCoachConversation";
import { useCoachPrompt } from "../features/prompt-builder/hooks/useCoachPrompt";
import { coachLayout, floatingFooterMetrics, spacing } from "../theme/theme";
import { useTabSceneBottomReserve } from "../theme/useTabLayout";
import { useThemedStyles } from "../theme/useThemedStyles";

/** Matches ChatInput local sizing — not a spacing token change. */
const COMPOSER_INPUT_FALLBACK = spacing["2xl"] + spacing.sm;
const COMPOSER_HEIGHT_FALLBACK =
  COMPOSER_INPUT_FALLBACK + spacing.md * 2 + spacing.xs * 2;

const COACH_NAME = "EVOLVE Coach";
const NEAR_BOTTOM_THRESHOLD = 80;

export function CoachScreen() {
  const insets = useSafeAreaInsets();
  const tabBarReserve = useTabSceneBottomReserve();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardLift, setKeyboardLift] = useState(0);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_HEIGHT_FALLBACK);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [online, setOnline] = useState(true);

  const runtime = useMemo(() => createCoachConversationRuntime(), []);
  const {
    promptContext,
    loading: promptLoading,
    error: promptError,
  } = useCoachPrompt();

  const {
    conversation,
    messages,
    loading,
    isStreaming,
    currentStream,
    error,
    startConversation,
    sendMessage,
    retryMessage,
  } = useCoachConversation({
    service: runtime.service,
    coachingSession: runtime.coachingSession,
    promptContext,
  });

  const footerReserve = floatingFooterMetrics.scrollReserve(composerHeight);
  const scrollBottomPadding =
    keyboardLift > 0
      ? keyboardLift + composerHeight + spacing.md
      : tabBarReserve + footerReserve;

  const scrollToLatest = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void runtime.healthCheck().then((healthy) => {
      if (!cancelled) {
        setOnline(healthy);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [runtime]);

  useEffect(() => {
    if (!conversation && !loading && !promptLoading && !promptError && !error) {
      void startConversation();
    }
  }, [
    conversation,
    error,
    loading,
    promptError,
    promptLoading,
    startConversation,
  ]);

  const streamingContent = currentStream?.content ?? "";

  useEffect(() => {
    scrollToLatest(true);
  }, [messages.length, loading, isStreaming, streamingContent, scrollToLatest]);

  useEffect(() => {
    if (keyboardLift > 0) {
      scrollToLatest(false);
    }
  }, [keyboardLift, scrollToLatest]);

  const styles = useThemedStyles(() =>
    StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: "transparent",
      },
      scroll: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: spacing.screenPadding,
        gap: spacing.section,
        overflow: "hidden",
      },
      conversation: {
        gap: coachLayout.messageGap,
        position: "relative",
      },
    }),
  );

  const handleContentSizeChange = () => {
    if (!showScrollToBottom) {
      scrollToLatest(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setShowScrollToBottom(distanceFromBottom > NEAR_BOTTOM_THRESHOLD);
  };

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content);
      scrollToLatest(true);
    },
    [scrollToLatest, sendMessage],
  );

  const handleExamplePress = useCallback(
    (example: string) => {
      void handleSend(example);
    },
    [handleSend],
  );

  const handleRetryConversation = useCallback(() => {
    void startConversation();
  }, [startConversation]);

  const visibleMessages = messages.filter((message) => message.role !== "system");
  const conversationTitle =
    conversation?.metadata.title ?? "New conversation";
  const showInitialLoading =
    (promptLoading || (loading && !conversation)) && !error && !promptError;
  const showError = Boolean(error || promptError) && visibleMessages.length === 0;
  const friendlyError = toFriendlyConversationError(error ?? promptError);
  const streamingMessageId = currentStream?.messageId ?? null;
  const streamingBubbleVisible =
    isStreaming &&
    Boolean(
      visibleMessages.find(
        (message) =>
          message.id === streamingMessageId && message.content.length > 0,
      ),
    );
  const showTyping =
    (isStreaming || loading) &&
    visibleMessages.length > 0 &&
    !streamingBubbleVisible;
  const showEmpty =
    !showInitialLoading &&
    !showError &&
    visibleMessages.length === 0 &&
    Boolean(conversation);

  return (
    <GradientBackground variant="canvas">
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: scrollBottomPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={handleContentSizeChange}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <ConversationHeader
            coachName={COACH_NAME}
            providerName={runtime.providerInfo.name}
            model={runtime.providerInfo.model.name}
            online={online}
            conversationTitle={conversationTitle}
          />

          <View style={styles.conversation}>
            {showInitialLoading ? <LoadingConversation /> : null}

            {showError ? (
              <ErrorConversation
                message={friendlyError}
                onRetry={handleRetryConversation}
              />
            ) : null}

            {showEmpty ? (
              <EmptyConversation onExamplePress={handleExamplePress} />
            ) : null}

            {visibleMessages.map((message) => {
              const messageStreaming =
                isStreaming && message.id === streamingMessageId;
              if (
                messageStreaming &&
                message.role === "assistant" &&
                message.content.length === 0
              ) {
                return null;
              }

              return (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  status={message.status}
                  createdAt={message.createdAt}
                  isStreaming={messageStreaming}
                  onRetry={
                    message.status === "failed"
                      ? () => {
                          void retryMessage(message.id);
                        }
                      : undefined
                  }
                />
              );
            })}

            {showTyping ? <TypingIndicator streaming={isStreaming} /> : null}

            {error && visibleMessages.length > 0 ? (
              <ErrorConversation
                message={friendlyError}
                onRetry={() => {
                  const failed = [...visibleMessages]
                    .reverse()
                    .find((message) => message.status === "failed");
                  if (failed) {
                    void retryMessage(failed.id);
                  } else {
                    void startConversation();
                  }
                }}
              />
            ) : null}
          </View>
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: scrollBottomPadding,
          }}
        >
          <ScrollToBottomButton
            visible={showScrollToBottom}
            onPress={() => scrollToLatest(true)}
          />
        </View>

        <ChatInput
          onSend={handleSend}
          disabled={
            !conversation || !promptContext || showInitialLoading || isStreaming
          }
          loading={loading || isStreaming}
          onKeyboardHeightChange={setKeyboardLift}
          onComposerLayout={setComposerHeight}
        />
      </View>
    </GradientBackground>
  );
}
