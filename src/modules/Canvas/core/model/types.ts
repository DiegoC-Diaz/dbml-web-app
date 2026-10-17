/**
 * Modelo propio del editor DBML.
 *
 * Es deliberadamente independiente de `@dbml/core`: el resto de la app
 * (editor, canvas, colaboración) solo conoce estos tipos, así un cambio de
 * versión de la librería se absorbe en `parser/toModel.ts`.
 */

export interface DbmlField {
  name: string;
  type: string;
  pk: boolean;
  unique: boolean;
  notNull: boolean;
  increment: boolean;
  note?: string;
  default?: string;
}

export interface DbmlTable {
  /** Identificador estable: `name` en schema public, `schema.name` en otro caso. */
  id: string;
  name: string;
  schema: string;
  alias?: string;
  note?: string;
  fields: DbmlField[];
}

export type Cardinality = '1' | 'n';

export interface DbmlRefEndpoint {
  tableId: string;
  fieldNames: string[];
  cardinality: Cardinality;
}

export interface DbmlRef {
  id: string;
  name?: string;
  from: DbmlRefEndpoint;
  to: DbmlRefEndpoint;
}

export interface DbmlEnum {
  id: string;
  name: string;
  schema: string;
  values: string[];
}

export interface DbmlModel {
  tables: DbmlTable[];
  refs: DbmlRef[];
  enums: DbmlEnum[];
}

/** Coordenadas de cada tabla en el canvas, indexadas por `DbmlTable.id`. */
export interface Position {
  x: number;
  y: number;
}
export type Positions = Record<string, Position>;

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/** Línea y columna 1-based (igual que reporta @dbml/core). */
export interface Diagnostic {
  message: string;
  severity: DiagnosticSeverity;
  start: { line: number; column: number };
  end?: { line: number; column: number };
}
