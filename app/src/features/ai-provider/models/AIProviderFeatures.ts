/**
 * Immutable high-level feature flags derived from capabilities.
 */
export interface AIProviderFeatures {
  readonly supportsChat: boolean;
  readonly supportsStreaming: boolean;
  readonly supportsTools: boolean;
  readonly supportsVision: boolean;
  readonly supportsAudio: boolean;
  readonly supportsEmbeddings: boolean;
  readonly supportsReasoning: boolean;
  readonly supportsFunctionCalling: boolean;
}
