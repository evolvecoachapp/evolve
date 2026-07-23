import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { CoachFormatting } from "../models/CoachFormatting";
import type { CoachOutputFormat } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponsePackage } from "../models/CoachResponsePackage";
import type { CoachSummary } from "../models/CoachSummary";
import type { CoachValidationIssue } from "../models/CoachValidationIssue";
import {
  createResponseFormatterService,
  type ResponseFormatterService,
} from "../services/ResponseFormatterService";

function resolveService(
  service?: ResponseFormatterService,
): ResponseFormatterService {
  return service ?? createResponseFormatterService();
}

/**
 * Public API — transform AIResponse into a full CoachResponsePackage.
 *
 * Does not expose parsers / extractors / formatters internals.
 */
export function formatResponse(options: {
  readonly response: AIResponse;
  readonly formatting?: Partial<CoachFormatting> | null;
  readonly outputFormat?: CoachOutputFormat | null;
  readonly createdAt?: string;
  readonly responseId?: string;
  readonly service?: ResponseFormatterService;
}): CoachResponsePackage {
  const { service, ...rest } = options;
  return resolveService(service).formatResponse(rest);
}

/**
 * Public API — build an immutable CoachResponse from AIResponse.
 */
export function buildCoachResponse(options: {
  readonly response: AIResponse;
  readonly formatting?: Partial<CoachFormatting> | null;
  readonly createdAt?: string;
  readonly responseId?: string;
  readonly service?: ResponseFormatterService;
}): CoachResponse {
  const { service, response, ...rest } = options;
  return resolveService(service).buildCoachResponse(response, rest);
}

/**
 * Public API — summarize a CoachResponse.
 */
export function summarizeResponse(options: {
  readonly response: CoachResponse;
  readonly service?: ResponseFormatterService;
}): CoachSummary {
  return resolveService(options.service).summarizeResponse(options.response);
}

/**
 * Public API — validate a CoachResponse.
 */
export function validateResponse(options: {
  readonly response: CoachResponse;
  readonly service?: ResponseFormatterService;
}): readonly CoachValidationIssue[] {
  return resolveService(options.service).validateResponse(options.response);
}
