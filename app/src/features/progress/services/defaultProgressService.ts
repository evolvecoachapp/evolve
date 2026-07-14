import { createProgressService } from "./progressServiceFactory";

/** Singleton used by the Progress UI — swap providers via EXPO_PUBLIC_PROGRESS_PROVIDER. */
export const progressService = createProgressService();
