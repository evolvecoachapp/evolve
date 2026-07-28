import { homeService, type HomeService } from "../services";
import type { HomeDashboard } from "../models/HomeDashboard";
import {
  mapHomeDashboard,
  type AthleteIdentityInput,
} from "../mappers";

export interface LoadHomeDashboardOptions {
  readonly service?: HomeService;
  readonly identity: AthleteIdentityInput;
}

/** Loads the Home dashboard via Application → HomeService (mock/backend/local). */
export async function loadHomeDashboard({
  service = homeService,
  identity,
}: LoadHomeDashboardOptions): Promise<HomeDashboard> {
  const dto = await service.getDashboard();
  return mapHomeDashboard({ dto, identity });
}
