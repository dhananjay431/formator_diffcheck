import type { EditorError } from "../../models/editor-state.model";

interface ErrorPanelProps {
  error?: EditorError | null;
}

export function ErrorPanel({ error }: ErrorPanelProps) {
  return (
    <div className={`error-card ${error ? "has-error" : "is-ok"}`}>
      <div className="panel-heading">
        <h2>{error ? error.title : "Status"}</h2>
        <span>{error ? "Needs attention" : "No errors"}</span>
      </div>
      {error ? (
        <div>
          <p>{error.message}</p>
          {(error.line || error.column) && (
            <small>
              Line {error.line ?? "?"}, Column {error.column ?? "?"}
            </small>
          )}
        </div>
      ) : (
        <p>
          Validation, formatting, minification, and JSON filter errors will
          appear here.
        </p>
      )}
    </div>
  );
}
