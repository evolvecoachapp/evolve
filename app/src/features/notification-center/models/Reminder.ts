import type { DeliveryPolicy } from "./DeliveryPolicy";
import type { ReminderSchedule } from "./ReminderSchedule";
import type { ReminderType } from "./ReminderType";

export interface Reminder {
  readonly id: string;
  readonly type: ReminderType;
  readonly title: string;
  readonly message: string;
  readonly schedule: ReminderSchedule;
  readonly deliveryPolicy: DeliveryPolicy;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createReminder(input: Reminder): Reminder {
  return Object.freeze({ ...input, schedule: Object.freeze({ ...input.schedule, dayOfWeek: Object.freeze([...input.schedule.dayOfWeek]) }) });
}
