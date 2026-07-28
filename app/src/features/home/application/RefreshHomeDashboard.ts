import {
  loadHomeDashboard,
  type LoadHomeDashboardOptions,
} from "./LoadHomeDashboard";
import type { HomeDashboard } from "../models/HomeDashboard";

export type RefreshHomeDashboardOptions = LoadHomeDashboardOptions;

/** Refreshes the Home dashboard through the same application path as load. */
export async function refreshHomeDashboard(
  options: RefreshHomeDashboardOptions,
): Promise<HomeDashboard> {
  return loadHomeDashboard(options);
}
