import { RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "../../../components/GradientBackground";
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

export function NutritionExperienceScreen({ service }: NutritionExperienceScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const dashboard = useNutritionDashboard({ service });
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
                  <HydrationCard hydration={hydration.hydration ?? dashboard.dashboard!.hydration} />
                </View>
              </View>
              <MacroRingCard macros={dashboard.dashboard!.macros} />
              <NutritionProgressCard mealSummary={dashboard.dashboard!.mealSummary} />
              <MealTimeline
                meals={meals.meals}
                onToggleMeal={(mealId) => void dashboard.toggleMealCompletion(mealId)}
              />
              <View style={{ gap: spacing.md }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                  Coach Suggestions
                </Text>
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
