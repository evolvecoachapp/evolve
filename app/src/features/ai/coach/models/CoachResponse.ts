import { Decision } from "../../decision/models/Decision";
import { CoachMemory } from "./CoachMemory";

export interface CoachResponse {
  message: string;

  decision: Decision;

  suggestions: string[];

  memory: CoachMemory;
}
