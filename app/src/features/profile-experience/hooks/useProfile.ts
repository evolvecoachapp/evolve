import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { UserPublic } from "../../../types/api";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { mergeUserPublicIntoProfile } from "../mappers/mergeUserPublicIntoProfile";
import type { ProfileExperienceService } from "../services";
import { readHydratedProfile } from "../services/readHydratedProfile";
import { ProfileExperienceViewModel } from "../viewmodels";

export interface UseProfileOptions {
  readonly service?: ProfileExperienceService;
  readonly viewModel?: ProfileExperienceViewModel;
  readonly athleteId?: string;
  readonly backendUser?: UserPublic | null;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to ProfileExperienceViewModel — no business logic in the hook.
 * Production path applies hydrated Athlete Identity via applyHydratedProfile().
 * ProfileExperienceService is test/preview-only when injected explicitly.
 */
export function useProfile({
  service,
  viewModel: injected,
  athleteId,
  backendUser = null,
  autoLoad = true,
}: UseProfileOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";
  const backendUserKey = backendUser?.updated_at ?? backendUser?.id ?? "";
  const backendUserRef = useRef(backendUser);
  backendUserRef.current = backendUser;

  const viewModel = useMemo(
    () => injected ?? new ProfileExperienceViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadProfile();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    const profile = readHydratedProfile(athleteId);
    if (profile) {
      viewModel.applyHydratedProfile(
        mergeUserPublicIntoProfile(profile, backendUserRef.current),
      );
      return;
    }

    viewModel.applyIdentityFailure("Athlete identity unavailable.");
  }, [autoLoad, injected, viewModel, isRuntimePath, athleteKey, athleteId, runtimeStatus, backendUserKey]);

  const refresh = useCallback(async () => {
    if (service) {
      await viewModel.refresh();
      return;
    }

    if (!athleteId) {
      viewModel.applyIdentityFailure("Athlete identity unavailable.");
      return;
    }

    const hydrated = readHydratedProfile(athleteId);
    if (!hydrated) {
      viewModel.applyIdentityFailure("Athlete identity unavailable.");
      return;
    }

    viewModel.refreshFromHydratedProfile(
      mergeUserPublicIntoProfile(hydrated, backendUserRef.current),
    );
  }, [viewModel, service, athleteId, backendUserKey]);

  return {
    profile: viewModel.profile,
    loading: viewModel.loading,
    saving: viewModel.saving,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh,
    loadProfile: useCallback(() => viewModel.loadProfile(), [viewModel]),
    updateUnits: useCallback((u: Parameters<ProfileExperienceViewModel["updateUnits"]>[0]) => viewModel.updateUnits(u), [viewModel]),
    updateTheme: useCallback((p: Parameters<ProfileExperienceViewModel["updateTheme"]>[0]) => viewModel.updateTheme(p), [viewModel]),
    updateNotifications: useCallback((p: Parameters<ProfileExperienceViewModel["updateNotifications"]>[0]) => viewModel.updateNotifications(p), [viewModel]),
    updateTrainingPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateTrainingPreferences"]>[0]) => viewModel.updateTrainingPreferences(p), [viewModel]),
    updateNutritionPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateNutritionPreferences"]>[0]) => viewModel.updateNutritionPreferences(p), [viewModel]),
    updateGoals: useCallback((g: Parameters<ProfileExperienceViewModel["updateGoals"]>[0]) => viewModel.updateGoals(g), [viewModel]),
    updateCoachPreferences: useCallback((p: Parameters<ProfileExperienceViewModel["updateCoachPreferences"]>[0]) => viewModel.updateCoachPreferences(p), [viewModel]),
    updateAthleteInfo: useCallback((i: Parameters<ProfileExperienceViewModel["updateAthleteInfo"]>[0]) => viewModel.updateAthleteInfo(i), [viewModel]),
    viewModel,
  };
}
