export interface ExerciseMock {
  name: string;
  sets: number;
  reps: string;
}

export interface WorkoutMock {
  name: string;
  durationMinutes: number;
  muscleFocus: string;
  exercises: ExerciseMock[];
}

export const workoutMock: WorkoutMock = {
  name: "Upper Body Strength",
  durationMinutes: 45,
  muscleFocus: "Chest, Shoulders, Triceps",
  exercises: [
    { name: "Barbell Bench Press", sets: 4, reps: "8-10" },
    { name: "Overhead Press", sets: 3, reps: "8-10" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
    { name: "Lateral Raises", sets: 3, reps: "12-15" },
    { name: "Tricep Pushdowns", sets: 3, reps: "12-15" },
    { name: "Face Pulls", sets: 3, reps: "15-20" },
  ],
};
