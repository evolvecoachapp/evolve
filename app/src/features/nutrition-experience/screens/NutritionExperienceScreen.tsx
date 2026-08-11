import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { GradientBackground } from "../../../components/GradientBackground";
import { SectionTitle } from "../../../components/SectionTitle";
import { TabScreenContainer } from "../../../components/TabScreenContainer";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import {
  CaloriesCard,
  CoachSuggestionCard,
  HydrationCard,
  MacroRingCard,
  MealTimeline,
  NutritionDaySelector,
  NutritionEmpty,
  NutritionError,
  NutritionHeader,
  NutritionProgressCard,
  NutritionSkeleton,
  NutritionSummaryCard,
} from "../components";
import {
  useCoachSuggestions,
  useHydration,
  useMeals,
  useNutritionDashboard,
} from "../hooks";
import type { NutritionExperienceService } from "../services";

export interface NutritionExperienceScreenProps {
  readonly service?: NutritionExperienceService;
}

/**
 * Operational Nutrition Experience screen — composition only.
 * Production data flows from hydrated Unified Workspace via applyHydratedDashboard().
 * NutritionExperienceService is test/preview-only when injected via the service prop.
 */
export function NutritionExperienceScreen({ service }: NutritionExperienceScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const dashboard = useNutritionDashboard({ service, athleteId: user?.id });
  const meals = useMeals({ viewModel: dashboard.viewModel });
  const hydration = useHydration({ viewModel: dashboard.viewModel });
  const suggestions = useCoachSuggestions({ viewModel: dashboard.viewModel });

  const showContent =
    !dashboard.loading.isLoading &&
    !dashboard.error &&
    dashboard.dashboard &&
    !dashboard.isEmpty;

  return (
    <GradientBackground variant="canvas">
      <TabScreenContainer
        gradient={false}
        withHeader={false}
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.loading.isRefreshing}
            onRefresh={() => void dashboard.refresh()}
            tintColor={colors.pulse}
            colors={[colors.pulse]}
          />
        }
      >
        <View style={{ gap: spacing.lg }}>
          {dashboard.loading.isLoading && !dashboard.dashboard ? <NutritionSkeleton /> : null}
          {dashboard.error && !dashboard.loading.isLoading ? (
            <NutritionError error={dashboard.error} onRetry={() => void dashboard.refresh()} />
          ) : null}
          {!dashboard.loading.isLoading && !dashboard.error && dashboard.isEmpty ? <NutritionEmpty /> : null}
          {showContent ? (
            <>
              <NutritionHeader dashboard={dashboard.dashboard!} />
              <NutritionDaySelector
                value={dashboard.day}
                options={dashboard.availableDays}
                onChange={(day) => void dashboard.changeDay(day)}
              />
              <NutritionSummaryCard dashboard={dashboard.dashboard!} />
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <CaloriesCard macros={dashboard.dashboard!.macros} />
                </View>
                <View style={{ flex: 1 }}>
                  <HydrationCard
                    hydration={hydration.hydration ?? dashboard.dashboard!.hydration}
                    onLogHydration={(amountMl) => void dashboard.logHydration(amountMl)}
                  />
                </View>
              </View>
              <MacroRingCard macros={dashboard.dashboard!.macros} />
              <NutritionProgressCard mealSummary={dashboard.dashboard!.mealSummary} />
              <MealTimeline
                meals={meals.meals}
                onToggleMeal={(mealId) => void dashboard.toggleMealCompletion(mealId)}
              />
              <View style={{ gap: spacing.md }}>
                <SectionTitle title="Coach Suggestions" />
                {suggestions.suggestions.map((suggestion) => (
                  <CoachSuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </TabScreenContainer>
    </GradientBackground>
  );
}
