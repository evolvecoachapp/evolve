import { ReminderTypes, type ReminderType } from "./ReminderType";
import { createReminder, type Reminder } from "./Reminder";

interface ReminderPresetDefinition {
  readonly type: ReminderType;
  readonly label: string;
  readonly title: string;
  readonly message: string;
  readonly dayOfWeek: readonly number[];
  readonly timeOfDay: string;
  readonly deliveryPolicy: Reminder["deliveryPolicy"];
}

/**
 * Quick-add presets for reminder creation — sensible defaults for the
 * reminder types the domain already understands. The athlete can pause
 * or remove any created reminder afterward via the existing controls.
 */
export const REMINDER_PRESETS: readonly ReminderPresetDefinition[] = Object.freeze([
  {
    type: ReminderTypes.WORKOUT,
    label: "Workout",
    title: "Workout Reminder",
    message: "Time to train — check today's session.",
    dayOfWeek: Object.freeze([1, 2, 3, 4, 5]),
    timeOfDay: "07:00",
    deliveryPolicy: "daily",
  },
  {
    type: ReminderTypes.HYDRATION,
    label: "Hydration",
    title: "Hydration Check",
    message: "Remember to log your water intake.",
    dayOfWeek: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
    timeOfDay: "12:00",
    deliveryPolicy: "daily",
  },
  {
    type: ReminderTypes.SLEEP,
    label: "Sleep",
    title: "Bedtime Reminder",
    message: "Wind down for optimal recovery.",
    dayOfWeek: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
    timeOfDay: "22:00",
    deliveryPolicy: "daily",
  },
  {
    type: ReminderTypes.NUTRITION,
    label: "Nutrition",
    title: "Nutrition Reminder",
    message: "Log today's meals to stay on track.",
    dayOfWeek: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
    timeOfDay: "18:00",
    deliveryPolicy: "daily",
  },
  {
    type: ReminderTypes.RECOVERY,
    label: "Recovery",
    title: "Recovery Check-In",
    message: "Log readiness and recovery signals for today.",
    dayOfWeek: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
    timeOfDay: "08:00",
    deliveryPolicy: "daily",
  },
]);

function generateReminderId(): string {
  return `reminder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildPresetReminder(type: ReminderType, at: string): Reminder {
  const preset = REMINDER_PRESETS.find((candidate) => candidate.type === type);
  if (!preset) {
    throw new Error(`No reminder preset for type "${type}".`);
  }

  return createReminder({
    id: generateReminderId(),
    type: preset.type,
    title: preset.title,
    message: preset.message,
    schedule: {
      dayOfWeek: preset.dayOfWeek,
      timeOfDay: preset.timeOfDay,
      deliveryPolicy: preset.deliveryPolicy,
      enabled: true,
    },
    deliveryPolicy: preset.deliveryPolicy,
    enabled: true,
    createdAt: at,
    updatedAt: at,
  });
}
