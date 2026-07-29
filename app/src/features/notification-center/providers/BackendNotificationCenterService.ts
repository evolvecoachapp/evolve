import type { NotificationCenterService } from "../services/NotificationCenterService";
import { NotificationCenterError } from "../services/NotificationCenterService";

export const backendNotificationCenterService: NotificationCenterService = {
  providerId: "backend",
  async getNotifications() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async dismissNotification() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async markNotificationRead() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async createReminder() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async updateReminder() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async deleteReminder() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async updateSettings() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
  async getStatistics() {
    throw new NotificationCenterError("Backend notification center provider is not configured.", "backend");
  },
};
