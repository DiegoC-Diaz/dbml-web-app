import { Parser } from '@dbml/core';
import type { CompilerDiagnostic } from '@dbml/core';
import type { Diagnostic, DbmlModel } from '../model/types.ts';
import { toModel } from './toModel.ts';

const ENTRY = '/main.dbml';

export interface ParseResult {
  /** `true` si el último source compiló sin errores. */
  ok: boolean;
  /**
   * Último modelo válido (null si nunca compiló). Si `ok` es false, es el modelo
   * previo: el canvas no se rompe mientras el usuario escribe.
   */
  model: DbmlModel | null;
  diagnostics: Diagnostic[];
}

function toDiagnostic(d: CompilerDiagnostic): Diagnostic {
  return {
    message: d.message,
    severity: d.type ?? 'error',
    start: { line: d.location.start.line, column: d.location.start.column },
    end: d.location.end
      ? { line: d.location.end.line, column: d.location.end.column }
      : undefined,
  };
}

function extractDiagnostics(err: unknown): Diagnostic[] {
  const diags = (err as { diags?: CompilerDiagnostic[] } | null)?.diags;
  if (Array.isArray(diags) && diags.length > 0) {
    return diags.map(toDiagnostic);
  }
  const message = err instanceof Error ? err.message : String(err);
  return [{ message, severity: 'error', start: { line: 1, column: 1 } }];
}

/**
 * Sesión de parseo con estado. Usa la API stateful de @dbml/core
 * (`setDbmlSource` + `parseDbmlProject`), que cachea y actualiza de forma
 * incremental: pensada para llamarse en cada cambio del editor.
 */
export function createDbmlSession() {
  const parser = new Parser();
  let lastValid: DbmlModel | null = null;

  return {
    update(source: string): ParseResult {
      parser.setDbmlSource(ENTRY, source);
      try {
        lastValid = toModel(parser.parseDbmlProject(ENTRY));
        return { ok: true, model: lastValid, diagnostics: [] };
      } catch (err) {
        return { ok: false, model: lastValid, diagnostics: extractDiagnostics(err) };
      }
    },
    dispose() {
      parser.clearDbmlSource();
      lastValid = null;
    },
  };
}

export type DbmlSession = ReturnType<typeof createDbmlSession>;
