export const DEFAULT_SCHEMA = 'public';

/** Id estable de tabla (o enum) a partir de schema y nombre. */
export function makeId(schema: string | null | undefined, name: string): string {
  return !schema || schema === DEFAULT_SCHEMA ? name : `${schema}.${name}`;
}
