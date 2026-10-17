import type { Database, Endpoint, Field } from '@dbml/core';
import { DEFAULT_SCHEMA, makeId } from '../model/ids.ts';
import type {
  Cardinality,
  DbmlField,
  DbmlModel,
  DbmlRef,
  DbmlRefEndpoint,
} from '../model/types.ts';

function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  const t = type as { type_name?: string } | null | undefined;
  return t?.type_name ?? 'unknown';
}

function defaultValue(dbdefault: unknown): string | undefined {
  if (dbdefault === null || dbdefault === undefined) return undefined;
  const d = dbdefault as { value?: unknown };
  return d.value === undefined ? String(dbdefault) : String(d.value);
}

function toField(f: Field): DbmlField {
  return {
    name: f.name,
    type: typeName(f.type),
    pk: !!f.pk,
    unique: !!f.unique,
    notNull: !!f.not_null,
    increment: !!f.increment,
    note: f.note || undefined,
    default: defaultValue(f.dbdefault),
  };
}

function toEndpoint(e: Endpoint): DbmlRefEndpoint {
  const cardinality: Cardinality = String(e.relation) === '1' ? '1' : 'n';
  return {
    tableId: makeId(e.schemaName, e.tableName),
    fieldNames: [...e.fieldNames],
    cardinality,
  };
}

/** Convierte el `Database` de @dbml/core al modelo propio. */
export function toModel(db: Database): DbmlModel {
  const model: DbmlModel = { tables: [], refs: [], enums: [] };

  for (const schema of db.schemas) {
    for (const t of schema.tables) {
      model.tables.push({
        id: makeId(schema.name, t.name),
        name: t.name,
        schema: schema.name ?? DEFAULT_SCHEMA,
        alias: t.alias || undefined,
        note: t.note || undefined,
        fields: t.fields.map(toField),
      });
    }

    for (const e of schema.enums) {
      model.enums.push({
        id: makeId(schema.name, e.name),
        name: e.name,
        schema: schema.name ?? DEFAULT_SCHEMA,
        values: e.values.map((v) => v.name),
      });
    }

    for (const r of schema.refs) {
      // Los refs de dos extremos son lo único que el canvas sabe dibujar.
      if (r.endpoints.length !== 2) continue;
      const ref: DbmlRef = {
        id: '',
        name: r.name || undefined,
        from: toEndpoint(r.endpoints[0]),
        to: toEndpoint(r.endpoints[1]),
      };
      ref.id = `${ref.from.tableId}.${ref.from.fieldNames.join('+')}->${ref.to.tableId}.${ref.to.fieldNames.join('+')}`;
      model.refs.push(ref);
    }
  }

  return model;
}
