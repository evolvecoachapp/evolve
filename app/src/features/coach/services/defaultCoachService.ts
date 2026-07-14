import { createCoachService } from "./coachServiceFactory";

/** Singleton used by the Coach UI — swap providers via EXPO_PUBLIC_COACH_PROVIDER. */
export const coachService = createCoachService();
