import { useEffect, useMemo, useRef, useState } from "react";
import { DiffEditor, Editor } from "@monaco-editor/react";
import type { DiffState } from "../../models/diff-state.model";
import { defaultDiffState } from "../../models/diff-state.model";
import type { SupportedLanguage } from "../../models/language.model";
import { supportedLanguages } from "../../models/language.model";
import type { EditorError } from "../../models/editor-state.model";
import { downloadText } from "../../services/download.service";
import { formatCode } from "../../services/formatter.service";
import { loadDiffState, saveDiffState } from "../../services/storage.service";
import {
  createDiffDownloadText,
  minifyDiffSide,
  prepareDiffContent,
} from "../../services/diff.service";
import {
  detectLanguageFromContent,
  detectLanguageFromFileName,
} from "../../utils/language-detect.util";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const monacoLanguage: Record<SupportedLanguage, string> = {
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
};

interface DiffCheckerProps {
  theme: string;
  onError: (error: EditorError | null) => void;
  onToast: (message: string) => void;
}

interface IconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      className="toolbar-icon-button"
      title={label}
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export function DiffChecker({ theme, onError, onToast }: DiffCheckerProps) {
  const persisted = useMemo(() => loadDiffState(), []);
  const [state, setState] = useState<DiffState>({
    ...defaultDiffState,
    ...persisted,
  });
  const [compared, setCompared] = useState({
    left: state.leftContent,
    right: state.rightContent,
  });
  const leftInputRef = useRef<HTMLInputElement | null>(null);
  const rightInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => saveDiffState(state), [state]);

  const patch = (changes: Partial<DiffState>) =>
    setState((current) => ({ ...current, ...changes }));

  const loadFile = async (side: "left" | "right", file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      onError({
        title: "File too large",
        message: "Maximum upload size is 5 MB.",
      });
      return;
    }
    const text = await file.text();
    const language =
      detectLanguageFromFileName(file.name) ??
      detectLanguageFromContent(text) ??
      "json";
    patch(
      side === "left"
        ? { leftContent: text, leftLanguage: language }
        : { rightContent: text, rightLanguage: language },
    );
    onToast(`Loaded ${file.name}`);
  };

  const formatSide = async (side: "left" | "right") => {
    try {
      const content = side === "left" ? state.leftContent : state.rightContent;
      const language =
        side === "left" ? state.leftLanguage : state.rightLanguage;
      const formatted = await formatCode(content, language);
      patch(
        side === "left"
          ? { leftContent: formatted }
          : { rightContent: formatted },
      );
      onError(null);
      onToast(`Formatted ${side}`);
    } catch (error) {
      onError({
        title: "Diff format error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to format diff side.",
      });
    }
  };

  const minifySide = async (side: "left" | "right") => {
    try {
      const content = side === "left" ? state.leftContent : state.rightContent;
      const language =
        side === "left" ? state.leftLanguage : state.rightLanguage;
      const minified = await minifyDiffSide(content, language);
      patch(
        side === "left"
          ? { leftContent: minified }
          : { rightContent: minified },
      );
      onError(null);
      onToast(`Minified ${side}`);
    } catch (error) {
      onError({
        title: "Diff minify error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to minify diff side.",
      });
    }
  };

  const compare = async () => {
    try {
      const result = await prepareDiffContent(state);
      setCompared(result);
      onError(null);
      onToast("Diff updated");
    } catch (error) {
      onError({
        title: "Diff compare error",
        message:
          error instanceof Error ? error.message : "Unable to compare files.",
      });
    }
  };

  return (
    <section className="diff-section" id="diff-checker">
      <div className="diff-header">
        <div>
          <p className="eyebrow">Two-file comparison</p>
          <h2>Diff Checker</h2>
        </div>
        <div className="toolbar-actions diff-actions">
          <IconButton
            icon="≠"
            label="Compare files"
            onClick={() => void compare()}
          />
          <IconButton
            icon="✨"
            label="Format both files"
            onClick={() =>
              void Promise.all([formatSide("left"), formatSide("right")])
            }
          />
          <IconButton
            icon="▰"
            label="Minify both files"
            onClick={() =>
              void Promise.all([minifySide("left"), minifySide("right")])
            }
          />
          <IconButton
            icon="⇄"
            label="Swap left and right"
            onClick={() =>
              patch({
                leftContent: state.rightContent,
                rightContent: state.leftContent,
                leftLanguage: state.rightLanguage,
                rightLanguage: state.leftLanguage,
              })
            }
          />
          <IconButton
            icon="🧹"
            label="Clear both files"
            onClick={() => patch({ leftContent: "", rightContent: "" })}
          />
          <IconButton
            icon="⬇"
            label="Download diff source"
            onClick={() =>
              downloadText(
                createDiffDownloadText(compared.left, compared.right),
                "javascript",
                "diff-result",
              )
            }
          />
        </div>
      </div>

      <div className="diff-options">
        <label>
          <input
            type="checkbox"
            checked={state.mode === "inline"}
            onChange={(e) =>
              patch({ mode: e.target.checked ? "inline" : "side-by-side" })
            }
          />{" "}
          Inline diff
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.ignoreWhitespace}
            onChange={(e) => patch({ ignoreWhitespace: e.target.checked })}
          />{" "}
          Ignore whitespace
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.ignoreCase}
            onChange={(e) => patch({ ignoreCase: e.target.checked })}
          />{" "}
          Ignore case
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.ignoreEmptyLines}
            onChange={(e) => patch({ ignoreEmptyLines: e.target.checked })}
          />{" "}
          Ignore empty lines
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.formatBeforeCompare}
            onChange={(e) => patch({ formatBeforeCompare: e.target.checked })}
          />{" "}
          Format before compare
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.sortJsonKeys}
            onChange={(e) => patch({ sortJsonKeys: e.target.checked })}
          />{" "}
          Sort JSON keys
        </label>
      </div>

      <div className="diff-input-grid">
        {(["left", "right"] as const).map((side) => {
          const isLeft = side === "left";
          const language = isLeft ? state.leftLanguage : state.rightLanguage;
          const content = isLeft ? state.leftContent : state.rightContent;
          const inputRef = isLeft ? leftInputRef : rightInputRef;
          return (
            <div className="diff-pane" key={side}>
              <div className="diff-pane-toolbar">
                <strong>
                  {isLeft ? "Original / Left" : "Modified / Right"}
                </strong>
                <select
                  value={language}
                  onChange={(e) =>
                    patch(
                      isLeft
                        ? { leftLanguage: e.target.value as SupportedLanguage }
                        : {
                            rightLanguage: e.target.value as SupportedLanguage,
                          },
                    )
                  }
                >
                  {supportedLanguages.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  ref={inputRef}
                  hidden
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void loadFile(side, file);
                    e.currentTarget.value = "";
                  }}
                />
                <IconButton
                  icon="📁"
                  label={`Upload ${side} file`}
                  onClick={() => inputRef.current?.click()}
                />
                <IconButton
                  icon="✨"
                  label={`Format ${side}`}
                  onClick={() => void formatSide(side)}
                />
                <IconButton
                  icon="▰"
                  label={`Minify ${side}`}
                  onClick={() => void minifySide(side)}
                />
                <IconButton
                  icon="✕"
                  label={`Clear ${side}`}
                  onClick={() =>
                    patch(isLeft ? { leftContent: "" } : { rightContent: "" })
                  }
                />
              </div>
              <Editor
                height="260px"
                language={monacoLanguage[language]}
                theme={theme}
                value={content}
                onChange={(value) =>
                  patch(
                    isLeft
                      ? { leftContent: value ?? "" }
                      : { rightContent: value ?? "" },
                  )
                }
                options={{
                  automaticLayout: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  folding: true,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="diff-viewer-card">
        <DiffEditor
          height="420px"
          language={
            state.leftLanguage === state.rightLanguage
              ? monacoLanguage[state.leftLanguage]
              : "plaintext"
          }
          theme={theme}
          original={compared.left}
          modified={compared.right}
          options={{
            automaticLayout: true,
            renderSideBySide: state.mode === "side-by-side",
            readOnly: false,
            originalEditable: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </section>
  );
}
