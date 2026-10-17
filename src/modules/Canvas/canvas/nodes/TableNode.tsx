import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { KeyRound } from 'lucide-react';
import type { DbmlTable } from '../../core';

export type TableFlowNode = Node<{ table: DbmlTable }, 'table'>;

export function TableNode({ data }: NodeProps<TableFlowNode>) {
  const { table } = data;
  return (
    <div className="w-60 overflow-hidden rounded-lg border border-slate-300 bg-white text-xs shadow-sm">
      <div className="bg-indigo-600 px-3 py-2 font-semibold text-white">
        {table.schema !== 'public' && (
          <span className="mr-1 opacity-70">{table.schema}.</span>
        )}
        {table.name}
      </div>
      <ul>
        {table.fields.map((f) => (
          <li
            key={f.name}
            className="relative flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-1.5"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${f.name}-t`}
              className="!h-1.5 !w-1.5 !bg-slate-400"
            />
            <span className="flex items-center gap-1 font-medium text-slate-800">
              {f.pk && <KeyRound className="h-3 w-3 text-amber-500" />}
              {f.name}
            </span>
            <span className="text-slate-400">{f.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`${f.name}-s`}
              className="!h-1.5 !w-1.5 !bg-slate-400"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
