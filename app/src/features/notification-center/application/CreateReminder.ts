import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService, type ReminderDto } from "../services";

export interface CreateReminderDeps {
  readonly service?: NotificationCenterService;
  readonly reminder: ReminderDto;
}

export async function createNewReminder(deps: CreateReminderDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.createReminder(deps.reminder);
  return mapNotificationCenterData(dto);
}
