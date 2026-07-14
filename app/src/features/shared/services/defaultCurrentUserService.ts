import { createCurrentUserService } from "./currentUserServiceFactory";

/** Singleton used by the Profile UI — swap providers via EXPO_PUBLIC_USER_PROVIDER. */
export const currentUserService = createCurrentUserService();
