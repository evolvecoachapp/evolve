import { View } from "react-native";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { isReachableRoute } from "../../../navigation/isReachableRoute";
import { useTheme } from "../../../theme/ThemeContext";
import { floatingFooterMetrics, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  CoachEmpty,
  CoachError,
  CoachHeader,
  CoachInlineError,
  CoachLoading,
  CoachMemoryCard,
  CoachStatus,
  ConversationInput,
  ConversationList,
  InsightCard,
  QuickActionsRow,
  RecommendationCard,
} from "../components";
import {
  useCoachConversation,
  useCoachInsights,
  useCoachQuickActions,
  useCoachRecommendations,
  usePullToRefresh,
} from "../hooks";
import type { CoachQuickAction } from "../models/CoachQuickAction";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface CoachExperienceScreenProps {
  readonly service?: CoachExperienceService;
}

/**
 * Flagship Coach Experience screen — composition only.
 * Production injects the backend Coach Experience service (POST /api/v1/coach/messages).
 * Tests may inject mock/local services via the service prop.
 */
export function CoachExperienceScreen({
  service = coachExperienceService,
}: CoachExperienceScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();

  const conversation = useCoachConversation({ service, athleteId: user?.id });
  const allowRegenerate = service.providerId !== "backend";
  const insights = useCoachInsights({ viewModel: conversation.viewModel });
  const recommendations = useCoachRecommendations({
    viewModel: conversation.viewModel,
  });
  const quickActions = useCoachQuickActions({
    viewModel: conversation.viewModel,
  });

  const pull = usePullToRefresh({
    onRefresh: conversation.refresh,
    refreshing: conversation.loading.isRefreshing,
  });

  const styles = useThemedStyles(() => ({
    stack: {
      gap: spacing.lg,
      paddingBottom: floatingFooterMetrics.scrollReserve(
        floatingFooterMetrics.coachInputContentHeight + spacing["3xl"],
      ),
    },
  }));

  const navigatePlaceholder = (destination: string | null | undefined) => {
    if (!destination || !isReachableRoute(destination)) {
      return;
    }
    router.push(destination as never);
  };

  const reachableHandler = (destination: string | null | undefined) =>
    isReachableRoute(destination) ? () => navigatePlaceholder(destination) : undefined;

  const handleQuickAction = (action: CoachQuickAction) => {
    if (!action.enabled) {
      return;
    }
    void conversation.sendMessage(action.prompt);
  };

  // A load/refresh failure with no prior experience is a full-page error —
  // there is nothing else to show. A send/regenerate failure that occurs
  // once a conversation already exists must not hide that conversation;
  // it renders as an inline banner instead (see CoachInlineError below).
  const showFullPageError =
    !conversation.loading.isLoading &&
    !!conversation.error &&
    !conversation.experience;

  const showContent =
    !conversation.loading.isLoading &&
    !showFullPageError &&
    conversation.experience &&
    !conversation.isEmpty;

  // Fresh users have an empty experience and still need the composer to start
  // the first message. Keep CoachEmpty, but never hide ConversationInput
  // behind `isEmpty`.
  const showComposer =
    !conversation.loading.isLoading && !showFullPageError;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
        }}
        refreshControl={
          <RefreshControl
            refreshing={pull.refreshing}
            onRefresh={pull.onRefresh}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        <View style={styles.stack}>
          {conversation.loading.isLoading && !conversation.experience ? (
            <CoachLoading />
          ) : null}

          {showFullPageError ? (
            <CoachError
              error={conversation.error!}
              onRetry={() => void conversation.refresh()}
            />
          ) : null}

          {!conversation.loading.isLoading &&
          !showFullPageError &&
          !conversation.error &&
          conversation.isEmpty ? (
            <CoachEmpty />
          ) : null}

          {showContent ? (
            <>
              <CoachHeader
                title={conversation.conversation?.title ?? "Coach"}
                onHistoryPress={reachableHandler(
                  conversation.conversation?.historyDestination,
                )}
                onSettingsPress={reachableHandler(
                  conversation.conversation?.settingsDestination,
                )}
              />

              <CoachStatus
                typing={conversation.typing}
                streamingPrepared={conversation.streamingPrepared}
              />

              {insights.dailyInsight ? (
                <InsightCard
                  title="Daily Insight"
                  insight={insights.dailyInsight}
                  onPress={reachableHandler(
                    insights.dailyInsight.detailsDestination,
                  )}
                  onPin={() =>
                    void insights.pinInsight(insights.dailyInsight!.id)
                  }
                  onDismiss={() =>
                    void insights.dismissInsight(insights.dailyInsight!.id)
                  }
                />
              ) : null}

              {insights.pinnedInsight ? (
                <InsightCard
                  title="Pinned Insight"
                  insight={insights.pinnedInsight}
                  onPress={reachableHandler(
                    insights.pinnedInsight.detailsDestination,
                  )}
                  onDismiss={() =>
                    void insights.dismissInsight(insights.pinnedInsight!.id)
                  }
                />
              ) : null}

              {recommendations.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onPress={() =>
                    navigatePlaceholder(recommendation.destination)
                  }
                />
              ))}

              {conversation.memorySummary ? (
                <CoachMemoryCard memory={conversation.memorySummary} />
              ) : null}

              <QuickActionsRow
                actions={quickActions.quickActions}
                onActionPress={handleQuickAction}
              />

              <ConversationList
                messages={conversation.messages}
                typing={conversation.typing}
                onRegenerate={
                  allowRegenerate
                    ? (messageId) =>
                        void conversation.regenerateResponse(messageId)
                    : undefined
                }
              />

              {conversation.error ? (
                <CoachInlineError
                  error={conversation.error}
                  onRetry={() => void conversation.refresh()}
                />
              ) : null}
            </>
          ) : null}

          {showComposer ? (
            <ConversationInput
              onSend={(message) => void conversation.sendMessage(message)}
              disabled={conversation.loading.isSending}
            />
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
