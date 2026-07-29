import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService } from "../services";

export interface DeleteReminderDeps {
  readonly service?: NotificationCenterService;
  readonly reminderId: string;
}

export async function deleteReminder(deps: DeleteReminderDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.deleteReminder(deps.reminderId);
  return mapNotificationCenterData(dto);
}
