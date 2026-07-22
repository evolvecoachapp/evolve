/**
 * Immutable capability flags for a provider contract.
 *
 * Flags describe what a future provider may support — no networking here.
 */
export interface AIProviderCapabilities {
  readonly chat: boolean;
  readonly streaming: boolean;
  readonly tools: boolean;
  readonly vision: boolean;
  readonly audio: boolean;
  readonly embeddings: boolean;
  readonly models: boolean;
  readonly health: boolean;
}

export type AIProviderCapabilityKey = keyof AIProviderCapabilities;

export const ALL_CAPABILITY_KEYS: readonly AIProviderCapabilityKey[] =
  Object.freeze([
    "chat",
    "streaming",
    "tools",
    "vision",
    "audio",
    "embeddings",
    "models",
    "health",
  ]);

export const EMPTY_CAPABILITIES: AIProviderCapabilities = Object.freeze({
  chat: false,
  streaming: false,
  tools: false,
  vision: false,
  audio: false,
  embeddings: false,
  models: false,
  health: false,
});
