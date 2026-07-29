import { mapNotificationStatistics } from "../mappers";
import type { NotificationStatistics } from "../models";
import { notificationCenterService, type NotificationCenterService } from "../services";

export interface GetNotificationStatisticsDeps {
  readonly service?: NotificationCenterService;
}

export async function getNotificationStatistics(deps: GetNotificationStatisticsDeps = {}): Promise<NotificationStatistics> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.getStatistics();
  return mapNotificationStatistics(dto);
}
