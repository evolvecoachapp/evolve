import { useLocalSearchParams } from "expo-router";
import { WorkoutSummaryScreen } from "../../../src/screens/WorkoutSummaryScreen";
import { parseWorkoutSummaryParams } from "../../../src/features/workout/utils/summaryRouteParams";

export default function WorkoutSummaryRoute() {
  const params = useLocalSearchParams();
  const summary = parseWorkoutSummaryParams(params);

  return <WorkoutSummaryScreen summary={summary} />;
}
