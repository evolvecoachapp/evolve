import type { IAIProvider } from "./IAIProvider";

/**
 * Vision-capable provider extension (contract only).
 */
export interface IVisionProvider extends IAIProvider {
  supportsVision(): boolean;
}
