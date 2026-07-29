import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService, type NotificationSettingsDto } from "../services";

export interface UpdateNotificationSettingsDeps {
  readonly service?: NotificationCenterService;
  readonly settings: NotificationSettingsDto;
}

export async function updateNotificationSettings(deps: UpdateNotificationSettingsDeps): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.updateSettings(deps.settings);
  return mapNotificationCenterData(dto);
}
