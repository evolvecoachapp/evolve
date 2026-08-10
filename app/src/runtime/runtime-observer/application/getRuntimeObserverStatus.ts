import { getRuntimeObserverStateHolder } from "../RuntimeObserverStateHolder";
import type { RuntimeObserverStatus } from "../RuntimeObserverStatus";

/**
 * Current runtime observer lifecycle status.
 */
export function getRuntimeObserverStatus(): RuntimeObserverStatus {
  return getRuntimeObserverStateHolder().status;
}
