/**
 * Known specialist roles eligible for collaboration (orchestration labels only).
 */
export const CollaborationRoles = {
  COACH: "coach",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
} as const;

export type CollaborationRole =
  (typeof CollaborationRoles)[keyof typeof CollaborationRoles];

export const ALL_COLLABORATION_ROLES: readonly CollaborationRole[] =
  Object.freeze(Object.values(CollaborationRoles));

export const SPECIALIST_COLLABORATION_ROLES: readonly CollaborationRole[] =
  Object.freeze([
    CollaborationRoles.WORKOUT,
    CollaborationRoles.NUTRITION,
    CollaborationRoles.RECOVERY,
  ]);
