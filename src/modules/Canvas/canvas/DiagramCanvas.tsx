import { useMemo, useState } from 'react';
import {
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { DbmlModel, Positions } from '../core';
import { TableNode, type TableFlowNode } from './nodes/TableNode';

const nodeTypes: NodeTypes = { table: TableNode };

/**
 * Estado interno de React Flow por nodo. React Flow v12 necesita que las
 * dimensiones medidas (`measured`) regresen en los nodos controlados; sin
 * ellas el nodo nunca queda "inicializado" y no se puede arrastrar (error #015).
 */
type NodeUiState = Pick<TableFlowNode, 'measured' | 'selected' | 'dragging' | 'width' | 'height'>;

interface DiagramCanvasProps {
  model: DbmlModel | null;
  positions: Positions;
  onMove: (updates: Positions) => void;
}

export function DiagramCanvas({ model, positions, onMove }: DiagramCanvasProps) {
  const [ui, setUi] = useState<Record<string, NodeUiState>>({});

  // Modelo y posiciones vienen de fuera; el estado de UI de React Flow vive aquí.
  const nodes = useMemo<TableFlowNode[]>(
    () =>
      (model?.tables ?? []).map((table) => ({
        ...ui[table.id],
        id: table.id,
        type: 'table',
        position: positions[table.id] ?? { x: 0, y: 0 },
        data: { table },
      })),
    [model, positions, ui],
  );

  const edges = useMemo<Edge[]>(
    () =>
      (model?.refs ?? []).map((ref) => ({
        id: ref.id,
        source: ref.from.tableId,
        target: ref.to.tableId,
        sourceHandle: `${ref.from.fieldNames[0]}-s`,
        targetHandle: `${ref.to.fieldNames[0]}-t`,
        label: `${ref.from.cardinality}:${ref.to.cardinality}`,
        style: { stroke: '#6366f1' },
        labelStyle: { fontSize: 10 },
      })),
    [model],
  );

  const handleNodesChange: OnNodesChange<TableFlowNode> = (changes) => {
    const next = applyNodeChanges(changes, nodes);

    const nextUi: Record<string, NodeUiState> = {};
    for (const n of next) {
      nextUi[n.id] = {
        measured: n.measured,
        selected: n.selected,
        dragging: n.dragging,
        width: n.width,
        height: n.height,
      };
    }
    setUi(nextUi);

    const moved: Positions = {};
    for (const c of changes) {
      if (c.type === 'position' && c.position) moved[c.id] = c.position;
    }
    if (Object.keys(moved).length > 0) onMove(moved);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      nodesConnectable={false}
      fitView
      minZoom={0.2}
    >
      <Background gap={20} />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}
