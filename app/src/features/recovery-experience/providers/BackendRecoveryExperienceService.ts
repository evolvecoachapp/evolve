import {
  createRecoveryCheckIn,
  getDailyReadiness,
  listRecoveryCheckIns,
  updateRecoveryCheckIn,
} from "../../../api/recovery";
import { ApiError } from "../../../api/client";
import type { ReadinessReadDto, RecoveryCheckInReadDto } from "../../../types/api";
import {
  mapBackendRecoveryToExperienceDto,
  mapSleepHoursToLikertQuality,
  NEUTRAL_LIKERT,
} from "../mappers/mapBackendRecoveryToExperienceDto";
import type { RecoveryDay } from "../models";
import type { RecoveryDashboardDto, RecoveryExperienceService } from "../services";
import { RecoveryExperienceError } from "../services";

/**
 * Backend provider — talks to the already-implemented Recovery FastAPI
 * surface (`/api/v1/recovery`) via the shared authenticated API client.
 *
 * Supported:
 * - Dashboard / day read via `GET /check-ins` + `GET /readiness`
 * - Day navigation (same reads scoped to `day.isoDate`)
 * - Sleep logging via create/update check-in (`POST`/`PATCH /check-ins`)
 * - Recovery assessment via `GET /readiness` (server-side Recovery Engine)
 *
 * Explicitly unsupported (no matching writable API):
 * - Manual readiness score updates (`updateReadiness`) — readiness is computed
 *   by the Recovery Engine from check-ins + training load, not client-set
 *
 * Check-in get-by-id / delete / historical paging beyond day navigation are
 * not part of `RecoveryExperienceService` and are not wrapped here.
 */

function toRecoveryExperienceError(error: unknown, fallback: string): RecoveryExperienceError {
  if (error instanceof RecoveryExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new RecoveryExperienceError(error.message, "backend");
  }
  return new RecoveryExperienceError(
    error instanceof Error ? error.message : fallback,
    "backend",
  );
}

function unsupportedCapability(name: string): RecoveryExperienceError {
  return new RecoveryExperienceError(
    `${name} is not supported by the backend recovery API yet — see /api/v1/recovery.`,
    "backend",
  );
}

async function findCheckInForDay(isoDate: string): Promise<RecoveryCheckInReadDto | null> {
  const page = await listRecoveryCheckIns({
    date_from: isoDate,
    date_to: isoDate,
    limit: 1,
    offset: 0,
  });
  return page.items[0] ?? null;
}

async function fetchReadinessForDay(isoDate: string): Promise<ReadinessReadDto | null> {
  try {
    return await getDailyReadiness({ for_date: isoDate });
  } catch (error) {
    // No check-in for the date → engine cannot score; treat as empty readiness.
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchDayDashboard(day: RecoveryDay): Promise<RecoveryDashboardDto> {
  const isoDate = day.isoDate;
  const [checkIn, readiness] = await Promise.all([
    findCheckInForDay(isoDate),
    fetchReadinessForDay(isoDate),
  ]);
  return mapBackendRecoveryToExperienceDto({ day, checkIn, readiness });
}

export const backendRecoveryExperienceService: RecoveryExperienceService = {
  providerId: "backend",

  async getDashboard(day) {
    try {
      return await fetchDayDashboard(day);
    } catch (error) {
      throw toRecoveryExperienceError(error, "Failed to load recovery dashboard.");
    }
  },

  async logSleep(day, hours) {
    if (!(hours > 0)) {
      throw new RecoveryExperienceError(
        "Sleep hours must be greater than zero.",
        "backend",
      );
    }

    try {
      const existing = await findCheckInForDay(day.isoDate);
      const sleepQuality = mapSleepHoursToLikertQuality(hours);

      if (existing) {
        await updateRecoveryCheckIn(existing.id, {
          sleep_hours: hours,
          sleep_quality: sleepQuality,
        });
      } else {
        // Check-in create requires soreness/fatigue (1–5). The Experience
        // sleep action only supplies hours — use the Likert midpoint for the
        // required non-sleep fields rather than inventing a separate API.
        await createRecoveryCheckIn({
          checkin_date: day.isoDate,
          sleep_hours: hours,
          sleep_quality: sleepQuality,
          soreness: NEUTRAL_LIKERT,
          fatigue: NEUTRAL_LIKERT,
        });
      }

      return await fetchDayDashboard(day);
    } catch (error) {
      throw toRecoveryExperienceError(error, "Failed to log sleep.");
    }
  },

  async updateReadiness() {
    throw unsupportedCapability("Manual readiness score updates");
  },

  async assessRecovery(day) {
    try {
      // Forces the server-side Recovery Engine path; 404 means no check-in yet.
      await getDailyReadiness({ for_date: day.isoDate });
      return await fetchDayDashboard(day);
    } catch (error) {
      throw toRecoveryExperienceError(error, "Failed to assess recovery.");
    }
  },
};
