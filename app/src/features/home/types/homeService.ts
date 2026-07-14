import type { HomeDashboard } from "./homeDashboard";

export type HomeProviderId = "mock" | "backend" | "local";

/** Contract for Home dashboard backends — UI and hooks depend on this interface only. */
export interface HomeService {
  readonly providerId: HomeProviderId;

  getDashboard(): Promise<HomeDashboard>;
}

export class HomeServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: HomeProviderId,
  ) {
    super(message);
    this.name = "HomeServiceError";
  }
}
