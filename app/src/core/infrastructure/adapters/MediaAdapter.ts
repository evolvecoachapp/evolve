import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for media handling.
 * No implementation in this sprint.
 */
export interface MediaAdapter {
  readonly adapterId: "media";
  store(
    mediaId: string,
    payload: string,
  ): Promise<AdapterResult<string>> | AdapterResult<string>;
  retrieve(
    mediaId: string,
  ): Promise<AdapterResult<string | null>> | AdapterResult<string | null>;
  remove(mediaId: string): Promise<AdapterResult<void>> | AdapterResult<void>;
}
