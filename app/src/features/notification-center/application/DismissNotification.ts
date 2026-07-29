import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService } from "../services";

export interface DismissNotificationDeps {
  readonly service?: NotificationCenterService;
  readonly notificationId: string;
}

export async function dismissNotification(deps: DismissNotificationDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.dismissNotification(deps.notificationId);
  return mapNotificationCenterData(dto);
}
