import type { OpenAIChoice } from "../models/OpenAIChoice";
import type { OpenAIClientOptions } from "../models/OpenAIClientOptions";
import type { OpenAIError } from "../models/OpenAIError";
import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIMessage } from "../models/OpenAIMessage";
import type { OpenAIModelConfiguration } from "../models/OpenAIModelConfiguration";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import type { OpenAIUsage } from "../models/OpenAIUsage";
import { freezeResponse } from "../../ai-provider/utils/freezeObjects";

export function freezeMessage(message: OpenAIMessage): OpenAIMessage {
  return Object.freeze({ ...message });
}

export function freezeUsage(usage: OpenAIUsage): OpenAIUsage {
  return Object.freeze({ ...usage });
}

export function freezeChoice(choice: OpenAIChoice): OpenAIChoice {
  return Object.freeze({
    ...choice,
    message: freezeMessage(choice.message),
  });
}

export function freezeRequest(request: OpenAIRequest): OpenAIRequest {
  return Object.freeze({
    ...request,
    messages: Object.freeze(request.messages.map(freezeMessage)),
    stop: request.stop ? Object.freeze([...request.stop]) : null,
    stream: false as const,
  });
}

export function freezeResponseOpenAI(response: OpenAIResponse): OpenAIResponse {
  return Object.freeze({
    ...response,
    choices: Object.freeze(response.choices.map(freezeChoice)),
    usage: freezeUsage(response.usage),
  });
}

export function freezeError(error: OpenAIError): OpenAIError {
  return Object.freeze({
    ...error,
    details: Object.freeze({ ...error.details }),
  });
}

export function freezeModelConfiguration(
  model: OpenAIModelConfiguration,
): OpenAIModelConfiguration {
  return Object.freeze({ ...model });
}

export function freezeClientOptions(
  options: OpenAIClientOptions,
): OpenAIClientOptions {
  return Object.freeze({ ...options });
}

export function freezeProviderConfiguration(
  configuration: OpenAIProviderConfiguration,
): OpenAIProviderConfiguration {
  return Object.freeze({
    ...configuration,
    models: Object.freeze(configuration.models.map(freezeModelConfiguration)),
    client: freezeClientOptions(configuration.client),
  });
}

export function freezeExecutionResult(
  result: OpenAIExecutionResult,
): OpenAIExecutionResult {
  return Object.freeze({
    ...result,
    openAIRequest: freezeRequest(result.openAIRequest),
    openAIResponse: freezeResponseOpenAI(result.openAIResponse),
    response: freezeResponse(result.response),
  });
}
