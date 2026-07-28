/**
 * Canonical log levels.
 * Representation only — no sink routing.
 */
export const LOG_LEVELS = [
  "Trace",
  "Debug",
  "Information",
  "Warning",
  "Error",
  "Fatal",
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export function isLogLevel(value: string): value is LogLevel {
  return (LOG_LEVELS as readonly string[]).includes(value);
}

export const LOG_LEVEL_RANK: Readonly<Record<LogLevel, number>> = Object.freeze(
  {
    Trace: 0,
    Debug: 1,
    Information: 2,
    Warning: 3,
    Error: 4,
    Fatal: 5,
  },
);
