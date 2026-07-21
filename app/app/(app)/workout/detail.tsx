import { useLocalSearchParams } from "expo-router";
import { WorkoutDetailScreen } from "../../../src/screens/WorkoutDetailScreen";

export default function WorkoutDetailRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  return <WorkoutDetailScreen sessionId={sessionId} />;
}
