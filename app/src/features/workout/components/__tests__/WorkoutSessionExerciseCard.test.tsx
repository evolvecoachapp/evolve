import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import type { WorkoutExercise } from "../../models/WorkoutExercise";
import { WorkoutSessionExerciseCard } from "../WorkoutSessionExerciseCard";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderCard() {
  const exercise: WorkoutExercise = {
    id: "session-exercise-1",
    order: 1,
    notes: null,
    warmupSets: [],
    workingSets: [
      {
        id: "set-1",
        targetWeight: 100,
        targetReps: 5,
        completed: false,
        setNumber: 1,
        completedReps: null,
        completedWeight: null,
        rpe: null,
        restSeconds: null,
      },
    ],
    exercise: {
      id: "ex-low-bar-squat",
      name: "Low Bar Squat",
      muscleGroup: "quads",
      equipment: "barbell",
      instructions: "Stand tall and descend under control.",
      videoUrl: null,
      imageUrl: null,
    },
  };

  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <WorkoutSessionExerciseCard
          exercise={exercise}
          exerciseNumber={1}
          exerciseTotal={3}
          setNumber={1}
          setTotal={1}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutSessionExerciseCard", () => {
  it("renders premium coaching sections from exercise metadata", () => {
    const { getByText } = renderCard();

    expect(getByText("Coach tip")).toBeTruthy();
    expect(getByText("Execution steps")).toBeTruthy();
    expect(getByText("Breathing")).toBeTruthy();
    expect(getByText("Safety notes")).toBeTruthy();
    expect(getByText("Common mistakes")).toBeTruthy();
    expect(getByText("Recommended rest")).toBeTruthy();
  });
});
