import { View } from "react-native";
import { RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { floatingFooterMetrics, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import {
  CoachEmpty,
  CoachError,
  CoachHeader,
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
import type { CoachExperienceService } from "../services";

export interface CoachExperienceScreenProps {
  readonly service?: CoachExperienceService;
}

/**
 * Flagship Coach Experience screen — composition only.
 * No business logic; data via ViewModel → Application → ExperienceService.
 */
export function CoachExperienceScreen({
  service,
}: CoachExperienceScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const conversation = useCoachConversation({ service });
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
    if (!destination) {
      return;
    }
    router.push(destination as never);
  };

  const handleQuickAction = (action: CoachQuickAction) => {
    if (!action.enabled) {
      return;
    }
    void conversation.sendMessage(action.prompt);
  };

  const showContent =
    !conversation.loading.isLoading &&
    !conversation.error &&
    conversation.experience &&
    !conversation.isEmpty;

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

          {conversation.error && !conversation.loading.isLoading ? (
            <CoachError
              error={conversation.error}
              onRetry={() => void conversation.refresh()}
            />
          ) : null}

          {!conversation.loading.isLoading &&
          !conversation.error &&
          conversation.isEmpty ? (
            <CoachEmpty />
          ) : null}

          {showContent ? (
            <>
              <CoachHeader
                title={conversation.conversation?.title ?? "Coach"}
                onHistoryPress={() =>
                  navigatePlaceholder(
                    conversation.conversation?.historyDestination,
                  )
                }
                onSettingsPress={() =>
                  navigatePlaceholder(
                    conversation.conversation?.settingsDestination,
                  )
                }
              />

              <CoachStatus
                typing={conversation.typing}
                streamingPrepared={conversation.streamingPrepared}
              />

              {insights.dailyInsight ? (
                <InsightCard
                  title="Daily Insight"
                  insight={insights.dailyInsight}
                  onPress={() =>
                    navigatePlaceholder(insights.dailyInsight?.detailsDestination)
                  }
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
                  onPress={() =>
                    navigatePlaceholder(
                      insights.pinnedInsight?.detailsDestination,
                    )
                  }
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
                onRegenerate={(messageId) =>
                  void conversation.regenerateResponse(messageId)
                }
              />

              <ConversationInput
                onSend={(message) => void conversation.sendMessage(message)}
                disabled={conversation.loading.isSending}
              />
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
