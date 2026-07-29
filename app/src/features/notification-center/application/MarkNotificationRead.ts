import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService } from "../services";

export interface MarkNotificationReadDeps {
  readonly service?: NotificationCenterService;
  readonly notificationId: string;
}

export async function markNotificationRead(deps: MarkNotificationReadDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.markNotificationRead(deps.notificationId);
  return mapNotificationCenterData(dto);
}
