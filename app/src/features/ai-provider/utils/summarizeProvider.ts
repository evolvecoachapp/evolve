import type { AIProvider } from "../models/AIProvider";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIRequest } from "../models/AIRequest";
import { formatCountPhrase, formatProviderLabel } from "./formatting";
import { listEnabledCapabilities } from "./aggregateCapabilities";

export function summarizeProvider(provider: AIProvider): string {
  const enabled = listEnabledCapabilities(provider.capabilities);
  const label = formatProviderLabel(provider.id, provider.displayName);
  return `${label} (${provider.status}) with ${formatCountPhrase(enabled.length, "capability")}.`;
}

export function summarizeRequest(request: AIRequest): string {
  const provider = request.providerId ?? "unassigned";
  const model = request.model?.id ?? "default";
  return `AI request ${request.id} for prompt package ${request.promptPackageId} via ${provider}/${model}.`;
}

export function summarizeProviderResult(result: AIProviderResult): string {
  const providerPart = result.provider
    ? formatProviderLabel(result.provider.id, result.provider.displayName)
    : "unresolved";
  const issueCount = result.validationIssues.length;
  return `Prepared ${result.request.id} → ${providerPart} with ${formatCountPhrase(issueCount, "validation issue")}.`;
}
