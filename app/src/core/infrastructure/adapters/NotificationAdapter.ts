import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for notification / push providers.
 * No implementation in this sprint.
 */
export interface NotificationAdapter {
  readonly adapterId: "notification";
  schedule(
    payload: Readonly<Record<string, string>>,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  cancel(
    notificationId: string,
  ): Promise<AdapterResult<void>> | AdapterResult<void>;
  getPermissionStatus(): Promise<AdapterResult<string>> | AdapterResult<string>;
}
