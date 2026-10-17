import { useEffect, useMemo, useState } from 'react';
import {
  createDbmlSession,
  reconcilePositions,
  type DbmlModel,
  type Diagnostic,
  type ParseResult,
  type Positions,
} from '../core';

const DEBOUNCE_MS = 250;

/**
 * Une el core con la UI: el texto es la fuente de verdad, se parsea con
 * debounce y el modelo se mantiene en el último estado válido si hay errores.
 * Las posiciones del canvas viven aparte del texto.
 */
export function useDbmlDocument(initialSource: string) {
  const [session] = useState(createDbmlSession);
  const [source, setSource] = useState(initialSource);
  const [result, setResult] = useState<ParseResult>(() =>
    session.update(initialSource),
  );
  const [userPositions, setUserPositions] = useState<Positions>({});

  useEffect(() => {
    const id = setTimeout(() => setResult(session.update(source)), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [source, session]);

  useEffect(() => () => session.dispose(), [session]);

  const model: DbmlModel | null = result.model;
  const diagnostics: Diagnostic[] = result.diagnostics;

  const positions = useMemo(
    () => reconcilePositions(model?.tables ?? [], userPositions),
    [model, userPositions],
  );

  /** Guarda el layout completo para que las tablas nuevas no salten al mover otra. */
  const movePositions = (updates: Positions) =>
    setUserPositions({ ...positions, ...updates });

  return {
    source,
    setSource,
    model,
    diagnostics,
    ok: result.ok,
    positions,
    movePositions,
  };
}
