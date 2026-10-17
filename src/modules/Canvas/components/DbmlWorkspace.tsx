import { useRef, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { DbmlEditor } from '../editor/DbmlEditor';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import { useDbmlDocument } from '../hooks/useDbmlDocument';
import { SAMPLE_DBML } from '../utils/sample';

export function DbmlWorkspace() {
  const doc = useDbmlDocument(SAMPLE_DBML);
  const [editorPct, setEditorPct] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const resize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setEditorPct(Math.min(75, Math.max(20, pct)));
  };

  const errors = doc.diagnostics.filter((d) => d.severity === 'error').length;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <h1 className="text-sm font-semibold text-slate-900">DBML Editor</h1>
        {doc.ok ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CircleCheck className="h-4 w-4" />
            {doc.model?.tables.length ?? 0} tablas · {doc.model?.refs.length ?? 0} relaciones
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <CircleAlert className="h-4 w-4" />
            {errors} {errors === 1 ? 'error' : 'errores'}
          </span>
        )}
      </header>

      <div ref={containerRef} className="flex min-h-0 flex-1">
        <section style={{ width: `${editorPct}%` }} className="min-w-0">
          <DbmlEditor
            initialValue={SAMPLE_DBML}
            onChange={doc.setSource}
            diagnostics={doc.diagnostics}
          />
        </section>
        <div
          onPointerDown={startResize}
          onPointerMove={resize}
          className="w-1.5 shrink-0 cursor-col-resize bg-slate-200 transition hover:bg-indigo-400"
        />
        <section className="min-w-0 flex-1">
          <DiagramCanvas
            model={doc.model}
            positions={doc.positions}
            onMove={doc.movePositions}
          />
        </section>
      </div>
    </div>
  );
}
