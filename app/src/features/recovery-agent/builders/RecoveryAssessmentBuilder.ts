import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import { RecoveryPlanBuilder } from "./RecoveryPlanBuilder";

export class RecoveryAssessmentBuilder {
  constructor(private readonly planBuilder = new RecoveryPlanBuilder()) {}

  build(input: {
    readonly context: RecoveryContext;
    readonly reasoning?: readonly RecoveryReasoning[];
    readonly clock?: () => string;
  }): RecoveryAssessment {
    return this.planBuilder.buildProposal(input).assessment;
  }
}
