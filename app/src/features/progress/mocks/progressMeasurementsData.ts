import type { BodyMeasurement } from "../models/BodyMeasurement";

export const mockMeasurementsData: BodyMeasurement[] = [
  { id: "measure-1", type: "chest", valueCm: 102, date: "2026-06-10" },
  { id: "measure-2", type: "waist", valueCm: 84, date: "2026-06-10" },
  { id: "measure-3", type: "hips", valueCm: 98, date: "2026-06-10" },
  { id: "measure-4", type: "chest", valueCm: 103, date: "2026-07-14" },
  { id: "measure-5", type: "waist", valueCm: 82.5, date: "2026-07-14" },
  { id: "measure-6", type: "hips", valueCm: 97.5, date: "2026-07-14" },
];
