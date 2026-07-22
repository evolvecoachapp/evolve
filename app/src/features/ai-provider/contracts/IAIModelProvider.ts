import type { AIModelInfo } from "../models/AIModelInfo";
import type { IAIProvider } from "./IAIProvider";

/**
 * Model-catalog provider contract.
 *
 * Lists model descriptors only — no vendor API calls.
 */
export interface IAIModelProvider extends IAIProvider {
  listModels(): readonly AIModelInfo[];
  getModel(modelId: string): AIModelInfo | null;
}
