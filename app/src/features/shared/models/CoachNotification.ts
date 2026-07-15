export type NotificationType =
  | "workout_reminder"
  | "nutrition_reminder"
  | "recovery_alert"
  | "achievement"
  | "coach_message"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationStatus =
  | "pending"
  | "scheduled"
  | "active"
  | "expired"
  | "dismissed";

export type NotificationActionType = "open" | "dismiss" | "snooze" | "custom";

export interface NotificationAction {
  id: string;
  type: NotificationActionType;
  label: string;
  payload: Record<string, unknown>;
}

export interface CoachNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: string;
  expiresAt: string;
  read: boolean;
  actions: NotificationAction[];
  metadata: Record<string, unknown>;
}

const DEFAULT_NOTIFICATION_TYPE: NotificationType = "coach_message";
const DEFAULT_NOTIFICATION_PRIORITY: NotificationPriority = "medium";
const DEFAULT_NOTIFICATION_STATUS: NotificationStatus = "pending";
const DEFAULT_ACTION_TYPE: NotificationActionType = "open";
const DEFAULT_NOTIFICATION_TITLE = "New message from your coach";
const DEFAULT_NOTIFICATION_MESSAGE =
  "Your AI coach has a new recommendation to help you stay on track.";

const ID_PREFIX = {
  notification: "notification",
  action: "action",
} as const;

function generateId(prefix: keyof typeof ID_PREFIX): string {
  return `${ID_PREFIX[prefix]}_${Math.random().toString(36).slice(2, 10)}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function createNotificationAction(
  overrides: Partial<NotificationAction> = {}
): NotificationAction {
  return {
    id: overrides.id ?? generateId("action"),
    type: overrides.type ?? DEFAULT_ACTION_TYPE,
    label: overrides.label ?? "View",
    payload: overrides.payload ?? {},
  };
}

export function createCoachNotification(
  overrides: Partial<Omit<CoachNotification, "actions">> & {
    actions?: Array<NotificationAction | Partial<NotificationAction>>;
  } = {}
): CoachNotification {
  const createdAt = overrides.createdAt ?? new Date().toISOString();
  const expiresAt = overrides.expiresAt ?? addDays(new Date(createdAt), 7).toISOString();

  return {
    id: overrides.id ?? generateId("notification"),
    title: overrides.title ?? DEFAULT_NOTIFICATION_TITLE,
    message: overrides.message ?? DEFAULT_NOTIFICATION_MESSAGE,
    type: overrides.type ?? DEFAULT_NOTIFICATION_TYPE,
    priority: overrides.priority ?? DEFAULT_NOTIFICATION_PRIORITY,
    status: overrides.status ?? DEFAULT_NOTIFICATION_STATUS,
    createdAt,
    expiresAt,
    read: overrides.read ?? false,
    actions: (overrides.actions ?? []).map((action) => createNotificationAction(action)),
    metadata: overrides.metadata ?? {},
  };
}
