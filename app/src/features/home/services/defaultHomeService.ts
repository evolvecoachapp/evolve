import { createHomeService } from "./homeServiceFactory";

/** Singleton used by the Home UI — swap providers via EXPO_PUBLIC_HOME_PROVIDER. */
export const homeService = createHomeService();
