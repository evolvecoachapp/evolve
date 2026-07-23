import type { IToolCallingProvider } from "./IToolCallingProvider";

/**
 * Function-calling provider extension (alias surface over tool calling).
 */
export interface IFunctionCallingProvider extends IToolCallingProvider {
  supportsFunctionCalling(): boolean;
}
