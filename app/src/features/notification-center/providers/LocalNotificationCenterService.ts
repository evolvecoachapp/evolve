import type { NotificationCenterService } from "../services/NotificationCenterService";
import { NotificationCenterError } from "../services/NotificationCenterService";

export const localNotificationCenterService: NotificationCenterService = {
  providerId: "local",
  async getNotifications() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async dismissNotification() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async markNotificationRead() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async createReminder() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async updateReminder() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async deleteReminder() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async updateSettings() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
  async getStatistics() {
    throw new NotificationCenterError("Local notification center provider is not configured.", "local");
  },
};
