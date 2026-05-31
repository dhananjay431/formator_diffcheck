interface JsonFilterProps {
  disabled: boolean;
  value: string;
  output?: string;
  resultCount: number | null;
  onChange: (value: string) => void;
  onFilter: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onReplace: () => void;
}

interface JsonFilterIconButtonProps {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

function JsonFilterIconButton({
  icon,
  label,
  disabled,
  onClick,
}: JsonFilterIconButtonProps) {
  return (
    <button
      type="button"
      className="json-filter-icon-button"
      title={label}
      aria-label={label}
      data-tooltip={label}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export function JsonFilter({
  disabled,
  value,
  output,
  resultCount,
  onChange,
  onFilter,
  onClear,
  onCopy,
  onDownload,
  onReplace,
}: JsonFilterProps) {
  return (
    <section
      className={`json-filter tiny-json-filter ${disabled ? "disabled" : ""}`}
      aria-label="JSON filter"
    >
      <label className="field filter-field">
        <span className="sr-only">JSON filter path</span>
        <input
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="users[*].name or products[?(@.price < 1000)]"
        />
      </label>
      <div
        className="json-filter-actions"
        role="group"
        aria-label="JSON filter actions"
      >
        <JsonFilterIconButton
          icon="🔎"
          label="Apply JSON filter"
          disabled={disabled}
          onClick={onFilter}
        />
        <JsonFilterIconButton
          icon="✕"
          label="Clear JSON filter output"
          disabled={disabled && !output}
          onClick={onClear}
        />
        <JsonFilterIconButton
          icon="⧉"
          label="Copy filtered result"
          disabled={!output}
          onClick={onCopy}
        />
        <JsonFilterIconButton
          icon="⬇"
          label="Download filtered result"
          disabled={!output}
          onClick={onDownload}
        />
        <JsonFilterIconButton
          icon="↩"
          label="Replace editor with filtered result"
          disabled={!output}
          onClick={onReplace}
        />
      </div>
      <span className="result-pill">
        {disabled
          ? "JSON only"
          : resultCount === null
            ? "No filter run"
            : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
      </span>
    </section>
  );
}
