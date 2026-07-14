import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../components/GradientBackground";
import { coachHeroMock } from "../data/mocks/coach";
import {
  CoachAssistantMessage,
  CoachHero,
  CoachInputBar,
  CoachTypingIndicator,
  CoachUserMessage,
} from "../features/coach/components";
import { useCoachChat } from "../features/coach/hooks";
import { coachLayout, floatingFooterMetrics, spacing } from "../theme/theme";
import { useTabSceneBottomReserve } from "../theme/useTabLayout";
import { useThemedStyles } from "../theme/useThemedStyles";

/** Matches CoachInputBar local sizing — not a spacing token change. */
const COMPOSER_INPUT_FALLBACK = spacing["2xl"] + spacing.sm;
const COMPOSER_HEIGHT_FALLBACK =
  COMPOSER_INPUT_FALLBACK + spacing.md * 2 + spacing.xs * 2;

export function CoachScreen() {
  const insets = useSafeAreaInsets();
  const tabBarReserve = useTabSceneBottomReserve();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardLift, setKeyboardLift] = useState(0);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_HEIGHT_FALLBACK);

  const { messages, message, setMessage, sendMessage, isTyping, canSend } = useCoachChat();

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
    scrollToLatest(false);
  }, [scrollToLatest]);

  useLayoutEffect(() => {
    if (keyboardLift > 0) {
      scrollToLatest(false);
    }
  }, [keyboardLift, scrollToLatest]);

  useEffect(() => {
    scrollToLatest(true);
  }, [messages.length, isTyping, scrollToLatest]);

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
        gap: coachLayout.messageSectionGap,
      },
    }),
  );

  const handleSendPress = () => {
    void sendMessage().then(() => {
      scrollToLatest(true);
    });
    scrollToLatest(true);
  };

  const handleContentSizeChange = () => {
    scrollToLatest(false);
  };

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
        >
          <CoachHero
            aiStatus={coachHeroMock.aiStatus}
            recoveryScore={coachHeroMock.recoveryScore}
            readinessDetail={coachHeroMock.readinessDetail}
            trainingRecommendation={coachHeroMock.trainingRecommendation}
            trainingDetail={coachHeroMock.trainingDetail}
          />

          <View style={styles.conversation}>
            {messages.map((msg) =>
              msg.role === "coach" ? (
                <CoachAssistantMessage
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ) : (
                <CoachUserMessage
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ),
            )}
            {isTyping ? <CoachTypingIndicator /> : null}
          </View>
        </ScrollView>

        <CoachInputBar
          value={message}
          onChangeText={setMessage}
          onSendPress={handleSendPress}
          canSend={canSend}
          placeholder="Message your Coach…"
          onKeyboardHeightChange={setKeyboardLift}
          onComposerLayout={setComposerHeight}
        />
      </View>
    </GradientBackground>
  );
}
