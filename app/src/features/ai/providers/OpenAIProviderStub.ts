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
  type: "openai",
  name: "OpenAI Stub",
  model: Object.freeze({
    id: "gpt-stub-4o",
    name: "GPT Stub 4o",
    provider: "openai",
  }),
  sampleContent:
    "[OpenAI Stub] Deterministic assistant reply for offline testing.",
});

/** Offline OpenAI stand-in — deterministic, no networking. */
export class OpenAIProviderStub implements AIProvider {
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
