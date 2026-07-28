import { homeService, type HomeService } from "../services";
import type { AthleteSnapshotCard } from "../models/AthleteSnapshotCard";
import {
  mapAthleteSnapshot,
  type AthleteIdentityInput,
} from "../mappers";

export interface LoadAthleteSnapshotOptions {
  readonly service?: HomeService;
  readonly identity: AthleteIdentityInput;
}

/** Loads the athlete snapshot card via Application → HomeService. */
export async function loadAthleteSnapshot({
  service = homeService,
  identity,
}: LoadAthleteSnapshotOptions): Promise<AthleteSnapshotCard> {
  const dto = await service.getDashboard();
  return mapAthleteSnapshot(dto, identity);
}
