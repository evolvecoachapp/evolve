import { getRuntimeWriteThroughStateHolder } from "../RuntimeWriteThroughStateHolder";
import type { RuntimeWriteThroughStatus } from "../RuntimeWriteThroughStatus";

/**
 * Current runtime write-through lifecycle status.
 */
export function getWriteThroughStatus(): RuntimeWriteThroughStatus {
  return getRuntimeWriteThroughStateHolder().status;
}
