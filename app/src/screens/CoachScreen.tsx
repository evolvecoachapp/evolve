import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../components/GradientBackground";
import { coachHeroMock, coachMock } from "../data/mocks/coach";
import {
  CoachAssistantMessage,
  CoachHero,
  CoachInputBar,
  CoachUserMessage,
} from "../features/coach/components";
import { coachLayout, floatingFooterMetrics, spacing } from "../theme/theme";
import { useTabSceneBottomReserve } from "../theme/useTabLayout";
import { useThemedStyles } from "../theme/useThemedStyles";

export function CoachScreen() {
  const insets = useSafeAreaInsets();
  const tabBarReserve = useTabSceneBottomReserve();
  const [message, setMessage] = useState("");
  const footerReserve = floatingFooterMetrics.scrollReserve(
    floatingFooterMetrics.coachInputContentHeight,
  );

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

  return (
    <GradientBackground variant="canvas">
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + spacing.lg : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: tabBarReserve + footerReserve,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CoachHero
            aiStatus={coachHeroMock.aiStatus}
            recoveryScore={coachHeroMock.recoveryScore}
            readinessDetail={coachHeroMock.readinessDetail}
            trainingRecommendation={coachHeroMock.trainingRecommendation}
            trainingDetail={coachHeroMock.trainingDetail}
          />

          <View style={styles.conversation}>
            {coachMock.map((msg) =>
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
          </View>
        </ScrollView>

        <CoachInputBar
          value={message}
          onChangeText={setMessage}
          onSendPress={() => setMessage("")}
          placeholder="Message your Coach…"
        />
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
