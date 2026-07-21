import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import type { AIProvider } from "./AIProvider";
import {
  createStubProviderInfo,
  createStubResponse,
  type StubProviderConfig,
} from "./stubHelpers";

const CONFIG: StubProviderConfig = Object.freeze({
  type: "local",
  name: "Local Stub",
  model: Object.freeze({
    id: "local-stub-v1",
    name: "Local Stub v1",
    provider: "local",
  }),
  sampleContent:
    "[Local Stub] Deterministic assistant reply for offline testing.",
});

/** Offline local-LLM stand-in — deterministic, no networking. */
export class LocalProviderStub implements AIProvider {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    return createStubResponse(CONFIG, request);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  getProviderInfo(): AIProviderInfo {
    return createStubProviderInfo(CONFIG);
  }
}
