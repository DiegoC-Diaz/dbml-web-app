import type { DbmlTable, Positions } from '../model/types.ts';

const COLS = 4;
const CELL_W = 320;
const CELL_H = 360;

/**
 * Reconcilia posiciones con las tablas actuales:
 * - conserva las posiciones de tablas que siguen existiendo,
 * - descarta las de tablas eliminadas,
 * - coloca las tablas nuevas en la primera celda libre de una cuadrícula.
 *
 * Es pura: devuelve un objeto nuevo y no muta `positions`.
 */
export function reconcilePositions(
  tables: DbmlTable[],
  positions: Positions,
): Positions {
  const next: Positions = {};
  const missing: DbmlTable[] = [];

  for (const t of tables) {
    if (positions[t.id]) next[t.id] = positions[t.id];
    else missing.push(t);
  }
  if (missing.length === 0) return next;

  const taken = new Set(
    Object.values(next).map(
      (p) => `${Math.round(p.x / CELL_W)}:${Math.round(p.y / CELL_H)}`,
    ),
  );

  let i = 0;
  for (const t of missing) {
    let col: number;
    let row: number;
    do {
      col = i % COLS;
      row = Math.floor(i / COLS);
      i++;
    } while (taken.has(`${col}:${row}`));
    taken.add(`${col}:${row}`);
    next[t.id] = { x: col * CELL_W, y: row * CELL_H };
  }
  return next;
}
