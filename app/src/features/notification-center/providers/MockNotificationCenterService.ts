import type {
  CoachNotificationDto,
  NotificationCenterDataDto,
  NotificationCenterService,
  NotificationItemDto,
  NotificationSettingsDto,
  NotificationStatisticsDto,
  ReminderDto,
} from "../services";

function buildDefaultData(): NotificationCenterDataDto {
  return {
    notifications: [
      {
        id: "notif-001",
        title: "Workout Reminder",
        message: "Your upper body session is scheduled for today at 7:00 AM.",
        category: "reminder",
        priority: "normal",
        state: "delivered",
        icon: "barbell-outline",
        createdAt: "2026-07-29T06:00:00Z",
        readAt: null,
        expiresAt: "2026-07-29T23:59:59Z",
        actions: [{ id: "act-start", label: "Start Workout", icon: "play-outline", destination: "/(app)/workout/start", category: "reminder" }],
        destination: "/(app)/workout/today",
      },
      {
        id: "notif-002",
        title: "Hydration Check",
        message: "You've logged 4 of 8 glasses today. Keep going!",
        category: "reminder",
        priority: "low",
        state: "delivered",
        icon: "water-outline",
        createdAt: "2026-07-29T12:00:00Z",
        readAt: null,
        expiresAt: "2026-07-29T23:59:59Z",
        actions: [],
        destination: null,
      },
      {
        id: "notif-003",
        title: "Coach Insight",
        message: "Your squat volume increased 12% this week. Consider a deload next week.",
        category: "coach",
        priority: "high",
        state: "pending",
        icon: "school-outline",
        createdAt: "2026-07-28T18:00:00Z",
        readAt: null,
        expiresAt: null,
        actions: [{ id: "act-view", label: "View Analysis", icon: "analytics-outline", destination: "/(app)/progress/weekly", category: "coach" }],
        destination: "/(app)/coach/insight/notif-003",
      },
      {
        id: "notif-004",
        title: "Weekly Progress",
        message: "You completed 4 of 5 planned sessions this week.",
        category: "progress",
        priority: "normal",
        state: "delivered",
        icon: "trending-up-outline",
        createdAt: "2026-07-27T09:00:00Z",
        readAt: "2026-07-27T10:15:00Z",
        expiresAt: null,
        actions: [],
        destination: "/(app)/progress/weekly",
      },
      {
        id: "notif-005",
        title: "Body Weight Reminder",
        message: "Time for your weekly weigh-in.",
        category: "reminder",
        priority: "normal",
        state: "scheduled",
        icon: "scale-outline",
        createdAt: "2026-07-29T07:00:00Z",
        readAt: null,
        expiresAt: "2026-07-30T07:00:00Z",
        actions: [{ id: "act-log", label: "Log Weight", icon: "create-outline", destination: "/(app)/progress/log-weight", category: "reminder" }],
        destination: "/(app)/progress/log-weight",
      },
    ],
    reminders: [
      {
        id: "rem-001",
        type: "workout",
        title: "Morning Workout",
        message: "Time to train!",
        schedule: { dayOfWeek: [1, 2, 3, 4, 5], timeOfDay: "07:00", deliveryPolicy: "daily", enabled: true },
        deliveryPolicy: "daily",
        enabled: true,
        createdAt: "2026-01-15T08:00:00Z",
        updatedAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "rem-002",
        type: "hydration",
        title: "Hydration Check",
        message: "Remember to drink water.",
        schedule: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], timeOfDay: "12:00", deliveryPolicy: "daily", enabled: true },
        deliveryPolicy: "daily",
        enabled: true,
        createdAt: "2026-01-15T08:00:00Z",
        updatedAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "rem-003",
        type: "body_weight",
        title: "Weekly Weigh-In",
        message: "Log your weight for progress tracking.",
        schedule: { dayOfWeek: [1], timeOfDay: "07:00", deliveryPolicy: "weekly", enabled: true },
        deliveryPolicy: "weekly",
        enabled: true,
        createdAt: "2026-02-01T08:00:00Z",
        updatedAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "rem-004",
        type: "sleep",
        title: "Bedtime Reminder",
        message: "Wind down for optimal recovery.",
        schedule: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6], timeOfDay: "22:00", deliveryPolicy: "daily", enabled: false },
        deliveryPolicy: "daily",
        enabled: false,
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-07-20T10:00:00Z",
      },
    ],
    coachNotifications: [
      {
        id: "coach-001",
        title: "Deload Recommendation",
        message: "Based on your training load trend, a deload week would optimize recovery and future gains.",
        category: "coach",
        priority: "high",
        state: "delivered",
        coachContext: "Training volume increased 15% over the last 3 weeks with elevated RPE scores.",
        actionDestination: "/(app)/coach/recommendation/coach-001",
        createdAt: "2026-07-28T18:00:00Z",
        readAt: null,
      },
      {
        id: "coach-002",
        title: "Nutrition Adjustment",
        message: "Consider increasing protein intake on training days to support recovery.",
        category: "coach",
        priority: "normal",
        state: "delivered",
        coachContext: "Current protein intake averaging 1.4g/kg; recommended 1.8g/kg for your training phase.",
        actionDestination: "/(app)/coach/recommendation/coach-002",
        createdAt: "2026-07-27T14:00:00Z",
        readAt: "2026-07-27T16:30:00Z",
      },
    ],
    settings: {
      workoutReminders: true,
      nutritionReminders: true,
      hydrationReminders: true,
      recoveryReminders: true,
      sleepReminders: false,
      coachMessages: true,
      progressUpdates: true,
      globalDeliveryPolicy: "immediate",
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    },
    statistics: {
      totalNotifications: 47,
      unreadCount: 3,
      dismissedCount: 12,
      activeReminders: 3,
      deliveredToday: 2,
      pendingCount: 1,
    },
  };
}

let currentData: NotificationCenterDataDto = buildDefaultData();

function computeStatistics(data: NotificationCenterDataDto): NotificationStatisticsDto {
  return {
    totalNotifications: data.notifications.length,
    unreadCount: data.notifications.filter((n) => !n.readAt && n.state !== "dismissed" && n.state !== "cancelled").length,
    dismissedCount: data.notifications.filter((n) => n.state === "dismissed").length,
    activeReminders: data.reminders.filter((r) => r.enabled).length,
    deliveredToday: data.notifications.filter((n) => n.state === "delivered").length,
    pendingCount: data.notifications.filter((n) => n.state === "pending" || n.state === "scheduled").length,
  };
}

export const mockNotificationCenterService: NotificationCenterService = {
  providerId: "mock",

  async getNotifications() {
    return currentData;
  },

  async dismissNotification(notificationId: string) {
    currentData = {
      ...currentData,
      notifications: currentData.notifications.map((n) =>
        n.id === notificationId ? { ...n, state: "dismissed" as const } : n,
      ),
    };
    currentData = { ...currentData, statistics: computeStatistics(currentData) };
    return currentData;
  },

  async markNotificationRead(notificationId: string) {
    currentData = {
      ...currentData,
      notifications: currentData.notifications.map((n) =>
        n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    };
    currentData = { ...currentData, statistics: computeStatistics(currentData) };
    return currentData;
  },

  async createReminder(reminder: ReminderDto) {
    currentData = {
      ...currentData,
      reminders: [...currentData.reminders, reminder],
    };
    currentData = { ...currentData, statistics: computeStatistics(currentData) };
    return currentData;
  },

  async updateReminder(reminder: ReminderDto) {
    currentData = {
      ...currentData,
      reminders: currentData.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
    };
    currentData = { ...currentData, statistics: computeStatistics(currentData) };
    return currentData;
  },

  async deleteReminder(reminderId: string) {
    currentData = {
      ...currentData,
      reminders: currentData.reminders.filter((r) => r.id !== reminderId),
    };
    currentData = { ...currentData, statistics: computeStatistics(currentData) };
    return currentData;
  },

  async updateSettings(settings: NotificationSettingsDto) {
    currentData = { ...currentData, settings };
    return currentData;
  },

  async getStatistics() {
    return computeStatistics(currentData);
  },
};

export const emptyMockNotificationCenterService: NotificationCenterService = {
  ...mockNotificationCenterService,
  async getNotifications() {
    return {
      notifications: [],
      reminders: [],
      coachNotifications: [],
      settings: buildDefaultData().settings,
      statistics: {
        totalNotifications: 0,
        unreadCount: 0,
        dismissedCount: 0,
        activeReminders: 0,
        deliveredToday: 0,
        pendingCount: 0,
      },
    };
  },
};
