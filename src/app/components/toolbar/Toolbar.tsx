import { useRef } from "react";
import type { SupportedLanguage } from "../../models/language.model";
import type { ThemeId } from "../../models/theme.model";
import { LanguageSelector } from "../language-selector/LanguageSelector";
import { ThemeSelector } from "../theme-selector/ThemeSelector";

interface ToolbarProps {
  language: SupportedLanguage;
  theme: ThemeId;
  filename: string;
  wordWrap: boolean;
  lineNumbers: boolean;
  onLanguageChange: (language: SupportedLanguage) => void;
  onThemeChange: (theme: ThemeId) => void;
  onFilenameChange: (name: string) => void;
  onUpload: (file: File) => void;
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  onReset: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onAutoDetect: () => void;
  onFoldAll: () => void;
  onUnfoldAll: () => void;
  onValidate: () => void;
  onToggleWordWrap: () => void;
  onToggleLineNumbers: () => void;
  onToggleFullscreen: () => void;
  diffMode?: boolean;
  onToggleDiff?: () => void;
  onCompareDiff?: () => void;
  onFormatDiffBoth?: () => void;
  onMinifyDiffBoth?: () => void;
  onSwapDiff?: () => void;
  onClearDiff?: () => void;
  onDownloadDiff?: () => void;
  onToggleInlineDiff?: () => void;
}

interface ToolbarIconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  className = "",
}: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      className={`toolbar-icon-button ${className}`.trim()}
      title={label}
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export function Toolbar(props: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <section className="toolbar tiny-toolbar" aria-label="Editor toolbar">
      <div className="toolbar-controls">
        <LanguageSelector
          value={props.language}
          onChange={props.onLanguageChange}
        />
        <ThemeSelector value={props.theme} onChange={props.onThemeChange} />
        <label className="field filename-field">
          <span>Filename</span>
          <input
            value={props.filename}
            onChange={(event) => props.onFilenameChange(event.target.value)}
            placeholder="viewer-output"
          />
        </label>
      </div>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".json,.xml,.html,.htm,.css,.js,.mjs,.cjs,.ts,.tsx,text/*,application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) props.onUpload(file);
          event.currentTarget.value = "";
        }}
      />
      <div className="toolbar-actions" role="group" aria-label="Editor actions">
        <ToolbarIconButton
          icon="📁"
          label="Upload file"
          onClick={() => inputRef.current?.click()}
        />
        <ToolbarIconButton
          icon="⬇"
          label="Download file"
          onClick={props.onDownload}
        />
        <ToolbarIconButton
          icon="⧉"
          label="Copy editor content"
          onClick={props.onCopy}
        />
        <ToolbarIconButton
          icon="✨"
          label="Beautify / format code"
          onClick={props.onFormat}
        />
        <ToolbarIconButton
          icon="▰"
          label="Minify code"
          onClick={props.onMinify}
        />
        <ToolbarIconButton
          icon="🧠"
          label="Auto-detect language from editor content"
          onClick={props.onAutoDetect}
        />
        <ToolbarIconButton
          icon="⊟"
          label="Fold all blocks"
          onClick={props.onFoldAll}
        />
        <ToolbarIconButton
          icon="⊞"
          label="Unfold all blocks"
          onClick={props.onUnfoldAll}
        />
        <ToolbarIconButton
          icon="✓"
          label="Validate current content"
          onClick={props.onValidate}
        />
        <ToolbarIconButton
          icon="↔"
          label={props.wordWrap ? "Disable word wrap" : "Enable word wrap"}
          onClick={props.onToggleWordWrap}
        />
        <ToolbarIconButton
          icon="#"
          label={props.lineNumbers ? "Hide line numbers" : "Show line numbers"}
          onClick={props.onToggleLineNumbers}
        />
        <ToolbarIconButton
          icon="⛶"
          label="Toggle fullscreen"
          onClick={props.onToggleFullscreen}
        />
        <ToolbarIconButton
          icon="⇆"
          label={props.diffMode ? "Close diff checker" : "Open diff checker"}
          onClick={props.onToggleDiff ?? (() => undefined)}
        />
        {props.diffMode && (
          <>
            <ToolbarIconButton
              icon="≠"
              label="Compare files"
              onClick={props.onCompareDiff ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="✨²"
              label="Format both diff editors"
              onClick={props.onFormatDiffBoth ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="▰²"
              label="Minify both diff editors"
              onClick={props.onMinifyDiffBoth ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="⇄"
              label="Swap diff editors"
              onClick={props.onSwapDiff ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="▤"
              label="Toggle inline diff result"
              onClick={props.onToggleInlineDiff ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="⬇≠"
              label="Download diff result"
              onClick={props.onDownloadDiff ?? (() => undefined)}
            />
            <ToolbarIconButton
              icon="✕≠"
              label="Clear diff editor"
              onClick={props.onClearDiff ?? (() => undefined)}
            />
          </>
        )}
        <ToolbarIconButton
          icon="🧹"
          label="Clear editor"
          onClick={props.onClear}
          className="danger"
        />
        <ToolbarIconButton
          icon="↺"
          label="Reset sample content"
          onClick={props.onReset}
        />
      </div>
    </section>
  );
}
