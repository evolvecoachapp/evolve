import { getRuntimeSessionStateHolder } from "../RuntimeSessionStateHolder";
import type { RuntimeSessionStatus } from "../RuntimeSessionStatus";

/**
 * Current runtime session lifecycle status.
 */
export function getRuntimeSessionStatus(): RuntimeSessionStatus {
  return getRuntimeSessionStateHolder().status;
}
