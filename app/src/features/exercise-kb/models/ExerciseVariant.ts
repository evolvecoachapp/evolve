/**
 * Named variant of a parent exercise (e.g. paused, tempo).
 * References are by id only — no workout coupling.
 */
export interface ExerciseVariant {
  readonly id: string;
  readonly name: string;
  /** Optional domain note code (not prose coaching). */
  readonly noteCode: string | null;
}
