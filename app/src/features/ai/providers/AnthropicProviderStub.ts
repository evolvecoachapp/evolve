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
  type: "anthropic",
  name: "Anthropic Stub",
  model: Object.freeze({
    id: "claude-stub-sonnet",
    name: "Claude Stub Sonnet",
    provider: "anthropic",
  }),
  sampleContent:
    "[Anthropic Stub] Deterministic assistant reply for offline testing.",
});

/** Offline Anthropic stand-in — deterministic, no networking. */
export class AnthropicProviderStub implements AIProvider {
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
