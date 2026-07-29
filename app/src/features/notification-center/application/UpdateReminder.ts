import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService, type ReminderDto } from "../services";

export interface UpdateReminderDeps {
  readonly service?: NotificationCenterService;
  readonly reminder: ReminderDto;
}

export async function updateReminder(deps: UpdateReminderDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.updateReminder(deps.reminder);
  return mapNotificationCenterData(dto);
}
