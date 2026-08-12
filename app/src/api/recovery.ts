import type {
  ReadinessReadDto,
  RecoveryCheckInCreateRequest,
  RecoveryCheckInPageDto,
  RecoveryCheckInReadDto,
  RecoveryCheckInUpdateRequest,
} from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the Recovery domain: `/api/v1/recovery`.
 *
 * Mirrors `src/api/nutrition.ts` — plain request-wrapping functions, no state.
 * Consumed exclusively by
 * `features/recovery-experience/providers/BackendRecoveryExperienceService.ts`.
 *
 * Only the endpoints the Recovery Experience backend provider actually uses
 * are wrapped here (list/create/update check-ins + daily readiness).
 */

/** `GET /api/v1/recovery/check-ins` — paginated check-ins, optionally by date. */
export async function listRecoveryCheckIns(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<RecoveryCheckInPageDto> {
  const query = new URLSearchParams();
  if (params?.date_from) {
    query.set("date_from", params.date_from);
  }
  if (params?.date_to) {
    query.set("date_to", params.date_to);
  }
  if (params?.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params?.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<RecoveryCheckInPageDto>(`/api/v1/recovery/check-ins${suffix}`);
}

/** `POST /api/v1/recovery/check-ins` — create a daily check-in. */
export async function createRecoveryCheckIn(
  data: RecoveryCheckInCreateRequest,
): Promise<RecoveryCheckInReadDto> {
  return request<RecoveryCheckInReadDto>("/api/v1/recovery/check-ins", {
    method: "POST",
    body: data,
  });
}

/** `PATCH /api/v1/recovery/check-ins/{id}` — partial update of a check-in. */
export async function updateRecoveryCheckIn(
  checkInId: string,
  data: RecoveryCheckInUpdateRequest,
): Promise<RecoveryCheckInReadDto> {
  return request<RecoveryCheckInReadDto>(
    `/api/v1/recovery/check-ins/${encodeURIComponent(checkInId)}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}

/** `GET /api/v1/recovery/readiness` — computed daily readiness for a date. */
export async function getDailyReadiness(params?: {
  for_date?: string;
}): Promise<ReadinessReadDto> {
  const query = new URLSearchParams();
  if (params?.for_date) {
    query.set("for_date", params.for_date);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<ReadinessReadDto>(`/api/v1/recovery/readiness${suffix}`);
}
