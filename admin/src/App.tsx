import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminShell } from "./layout/AdminShell";
import { CoachPage } from "./pages/CoachPage";
import { ConversationDetailPage } from "./pages/ConversationDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExerciseDetailPage } from "./pages/ExerciseDetailPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { GoalDetailPage } from "./pages/GoalDetailPage";
import { GoalsPage } from "./pages/GoalsPage";
import { LoginPage } from "./pages/LoginPage";
import { MealDetailPage } from "./pages/MealDetailPage";
import { MealLogDetailPage } from "./pages/MealLogDetailPage";
import { NutritionPage } from "./pages/NutritionPage";
import { ProgramDetailPage } from "./pages/ProgramDetailPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressDetailPage } from "./pages/ProgressDetailPage";
import { ProgressPage } from "./pages/ProgressPage";
import { RecoveryDetailPage } from "./pages/RecoveryDetailPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { SystemPage } from "./pages/SystemPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { WorkoutDetailPage } from "./pages/WorkoutDetailPage";
import { WorkoutLogDetailPage } from "./pages/WorkoutLogDetailPage";
import { WorkoutLogsPage } from "./pages/WorkoutLogsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:exerciseId" element={<ExerciseDetailPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:programId" element={<ProgramDetailPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/:workoutId" element={<WorkoutDetailPage />} />
          <Route path="/workout-logs" element={<WorkoutLogsPage />} />
          <Route path="/workout-logs/:logId" element={<WorkoutLogDetailPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/nutrition/meals/:mealId" element={<MealDetailPage />} />
          <Route path="/nutrition/logs/:logId" element={<MealLogDetailPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/recovery/:checkInId" element={<RecoveryDetailPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:goalId" element={<GoalDetailPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/progress/:entryId" element={<ProgressDetailPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/coach/:conversationId" element={<ConversationDetailPage />} />
          <Route path="/system" element={<SystemPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
