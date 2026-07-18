/**
 * Produces a nominally-typed ("branded") variant of a base type so that
 * structurally identical identifiers (e.g. two different `string` ids)
 * cannot be assigned to one another by mistake.
 */
export type Brand<Base, Tag extends string> = Base & { readonly __brand: Tag };
