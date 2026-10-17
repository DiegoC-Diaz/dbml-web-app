import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import type { Diagnostic as CmDiagnostic } from '@codemirror/lint';
import type { Diagnostic } from '../core';

interface DbmlEditorProps {
  /** Solo se lee al montar; el editor es dueño del texto después. */
  initialValue: string;
  onChange: (value: string) => void;
  diagnostics: Diagnostic[];
}

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
});

function toCmDiagnostics(view: EditorView, list: Diagnostic[]): CmDiagnostic[] {
  const doc = view.state.doc;
  const offset = (p: { line: number; column: number }) => {
    const line = doc.line(Math.min(Math.max(p.line, 1), doc.lines));
    return Math.min(line.from + Math.max(p.column - 1, 0), line.to);
  };
  return list.map((d) => {
    const from = offset(d.start);
    let to = d.end ? offset(d.end) : from;
    if (to <= from) to = Math.min(from + 1, doc.length);
    return { from: Math.min(from, to), to, severity: d.severity, message: d.message };
  });
}

export function DbmlEditor({ initialValue, onChange, diagnostics }: DbmlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const view = new EditorView({
      parent: containerRef.current!,
      state: EditorState.create({
        doc: initialValue,
        extensions: [
          basicSetup,
          lintGutter(),
          theme,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // initialValue es intencionalmente solo de montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch(setDiagnostics(view.state, toCmDiagnostics(view, diagnostics)));
  }, [diagnostics]);

  return <div ref={containerRef} className="h-full overflow-hidden bg-white" />;
}
