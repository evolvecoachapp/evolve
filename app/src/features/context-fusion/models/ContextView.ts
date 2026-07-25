import type { ContextSection } from "./ContextSection";

/**
 * Named immutable projection over fused sections.
 */
export interface ContextView {
  readonly id: string;
  readonly name: string;
  readonly sectionIds: readonly string[];
  readonly sections: readonly ContextSection[];
  readonly notes: readonly string[];
}
