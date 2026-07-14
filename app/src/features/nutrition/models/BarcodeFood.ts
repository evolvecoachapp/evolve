import type { Food } from "./Food";

/** A food item resolved from a barcode scan. */
export interface BarcodeFood extends Food {
  barcode: string;
}
