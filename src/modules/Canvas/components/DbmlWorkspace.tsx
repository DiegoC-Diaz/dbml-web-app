import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  CircleAlert,
  CircleCheck,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { DbmlEditor } from '../editor/DbmlEditor';
import { DiagramCanvas } from '../canvas/DiagramCanvas';
import { useDbmlDocument } from '../hooks/useDbmlDocument';
import { SAMPLE_DBML } from '../utils/sample';
import { useProjectById } from '../../Project/hook';

interface DbmlWorkspaceContentProps {
  initialDbml: string;
  title: string;
}

function DbmlWorkspaceContent({ initialDbml, title }: DbmlWorkspaceContentProps) {
  const navigate = useNavigate();
  const doc = useDbmlDocument(initialDbml);
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            title="Volver a proyectos"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Proyectos</span>
          </button>
          <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
        </div>
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
            initialValue={initialDbml}
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

export function DbmlWorkspace() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjectById(id, { enabled: Boolean(id) });

  if (id) {
    if (isLoading) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Cargando documento DBML del proyecto…
          </p>
        </div>
      );
    }

    if (isError || !project) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <CircleAlert className="h-10 w-10 text-red-500" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            No se pudo cargar el proyecto
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            {error || 'El proyecto solicitado no existe o no tienes acceso.'}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver al inicio</span>
            </button>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      );
    }

    // Load only the fetched DBML document (`project.currentDbml`), ignoring layoutMetadata
    return (
      <DbmlWorkspaceContent
        key={project.id}
        initialDbml={project.currentDbml}
        title={project.title}
      />
    );
  }

  return <DbmlWorkspaceContent key="sample" initialDbml={SAMPLE_DBML} title="DBML Editor" />;
}
