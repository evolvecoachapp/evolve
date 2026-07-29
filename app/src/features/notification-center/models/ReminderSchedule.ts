import type { DeliveryPolicy } from "./DeliveryPolicy";

export interface ReminderSchedule {
  readonly dayOfWeek: readonly number[];
  readonly timeOfDay: string;
  readonly deliveryPolicy: DeliveryPolicy;
  readonly enabled: boolean;
}

export function createReminderSchedule(input: ReminderSchedule): ReminderSchedule {
  return Object.freeze({
    ...input,
    dayOfWeek: Object.freeze([...input.dayOfWeek]),
  });
}
