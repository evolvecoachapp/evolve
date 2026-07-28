import { homeService, type HomeService } from "../services";
import type { QuickAction } from "../models/QuickAction";
import { mapQuickActions } from "../mappers";

export interface LoadQuickActionsOptions {
  readonly service?: HomeService;
}

/** Loads Home quick actions via Application → HomeService. */
export async function loadQuickActions({
  service = homeService,
}: LoadQuickActionsOptions = {}): Promise<readonly QuickAction[]> {
  const dto = await service.getDashboard();
  return mapQuickActions(dto);
}
