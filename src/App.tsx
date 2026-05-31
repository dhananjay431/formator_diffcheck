import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { CodeEditor } from "./app/components/code-editor/CodeEditor";
import { ErrorPanel } from "./app/components/error-panel/ErrorPanel";
import { JsonFilter } from "./app/components/json-filter/JsonFilter";
import { StatusBar } from "./app/components/status-bar/StatusBar";
import { Toolbar } from "./app/components/toolbar/Toolbar";
import {
  defaultDiffState,
  type DiffState,
} from "./app/models/diff-state.model";
import type { EditorError, EditorState } from "./app/models/editor-state.model";
import type { SupportedLanguage } from "./app/models/language.model";
import { defaultSample } from "./app/models/language.model";
import { monacoThemeMap, type ThemeId } from "./app/models/theme.model";
import { copyToClipboard } from "./app/utils/clipboard.util";
import {
  detectLanguageFromContent,
  detectLanguageFromFileName,
} from "./app/utils/language-detect.util";
import { downloadText } from "./app/services/download.service";
import {
  createDiffDownloadText,
  prepareDiffContent,
} from "./app/services/diff.service";
import { formatCode } from "./app/services/formatter.service";
import { filterJson } from "./app/services/json-filter.service";
import { minifyCode } from "./app/services/minifier.service";
import {
  loadDiffState,
  loadState,
  saveDiffState,
  saveState,
} from "./app/services/storage.service";
import { validateCode } from "./app/services/validation.service";
import "./App.css";

const monacoLanguageMap: Record<SupportedLanguage, string> = {
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
};

const initialState: EditorState = {
  language: "json",
  theme: "dark-night",
  content: defaultSample.json,
  output: "",
  error: null,
  wordWrap: true,
  lineNumbers: true,
};

function App() {
  const persisted = useMemo(() => loadState(), []);
  const persistedDiff = useMemo(() => loadDiffState(), []);
  const [state, setState] = useState<EditorState>({
    ...initialState,
    ...persisted,
  });
  const [diffState, setDiffState] = useState<DiffState>({
    ...defaultDiffState,
    ...persistedDiff,
  });
  const [diffMode, setDiffMode] = useState(false);
  const [diffCompared, setDiffCompared] = useState({
    left: "",
    right: "",
  });
  const [filename, setFilename] = useState("viewer-output");
  const [jsonPath, setJsonPath] = useState("users[*].name");
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [toast, setToast] = useState("Ready");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const scrollSyncFlag = useRef<"left" | "right" | null>(null);

  const setError = (error: EditorError | null) =>
    setState((current) => ({ ...current, error }));
  const setContent = (content: string) =>
    setState((current) => ({ ...current, content }));
  const setOutput = (output: string) =>
    setState((current) => ({ ...current, output }));

  const updateContentWithAutoDetect = (content: string) => {
    const detectedLanguage = detectLanguageFromContent(content);
    setState((current) => ({
      ...current,
      content,
      language: detectedLanguage ?? current.language,
      output:
        detectedLanguage && detectedLanguage !== current.language
          ? ""
          : current.output,
      error:
        detectedLanguage && detectedLanguage !== current.language
          ? null
          : current.error,
    }));
    if (detectedLanguage && detectedLanguage !== state.language) {
      setResultCount(null);
      setToast(`Auto-detected ${detectedLanguage}`);
    }
  };

  const updateDiffRightWithAutoDetect = (content: string) => {
    const detectedLanguage = detectLanguageFromContent(content);
    setDiffState((current) => ({
      ...current,
      rightContent: content,
      ...(detectedLanguage && detectedLanguage !== current.rightLanguage
        ? { rightLanguage: detectedLanguage }
        : {}),
    }));
    if (detectedLanguage && detectedLanguage !== diffState.rightLanguage) {
      setToast(`Right editor auto-detected ${detectedLanguage}`);
    }
  };

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveDiffState(diffState);
  }, [diffState]);

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  const handleRightEditorMount: OnMount = (editorInstance) => {
    rightEditorRef.current = editorInstance;
  };

  useEffect(() => {
    const left = editorRef.current;
    const right = rightEditorRef.current;
    if (!left || !right || !diffMode) return;

    const leftDisposable = left.onDidScrollChange((e) => {
      if (scrollSyncFlag.current === "right") return;
      scrollSyncFlag.current = "left";
      right.setScrollTop(e.scrollTop);
      right.setScrollLeft(e.scrollLeft);
      scrollSyncFlag.current = null;
    });

    const rightDisposable = right.onDidScrollChange((e) => {
      if (scrollSyncFlag.current === "left") return;
      scrollSyncFlag.current = "right";
      left.setScrollTop(e.scrollTop);
      left.setScrollLeft(e.scrollLeft);
      scrollSyncFlag.current = null;
    });

    return () => {
      leftDisposable.dispose();
      rightDisposable.dispose();
    };
  }, [diffMode, diffState.rightContent]);

  const runValidation = useCallback(() => {
    const error = validateCode(state.content, state.language);
    setError(error);
    setToast(error ? "Validation failed" : "Validation passed");
  }, [state.content, state.language]);

  const handleLanguageChange = (language: SupportedLanguage) => {
    setState((current) => ({ ...current, language, error: null, output: "" }));
    setResultCount(null);
  };

  const handleAutoDetectLanguage = () => {
    const language = detectLanguageFromContent(state.content);
    if (!language) {
      setError({
        title: "Language detection failed",
        message:
          "Could not confidently detect the current content. Please choose a language manually or upload a file with an extension.",
      });
      setToast("Language detection failed");
      return;
    }
    setState((current) => ({ ...current, language, error: null, output: "" }));
    setResultCount(null);
    setToast(`Detected ${language}`);
  };

  const handleThemeChange = (theme: ThemeId) => {
    setState((current) => ({ ...current, theme }));
  };

  const handleFormat = useCallback(async () => {
    try {
      const formatted = await formatCode(state.content, state.language);
      setContent(formatted);
      setError(null);
      setToast("Code formatted");
    } catch (error) {
      setError({
        title: "Format error",
        message:
          error instanceof Error ? error.message : "Unable to format content.",
      });
    }
  }, [state.content, state.language]);

  const handleMinify = useCallback(async () => {
    try {
      const minified = await minifyCode(state.content, state.language);
      setContent(minified);
      setError(null);
      setToast("Code minified");
    } catch (error) {
      setError({
        title: "Minify error",
        message:
          error instanceof Error ? error.message : "Unable to minify content.",
      });
    }
  }, [state.content, state.language]);

  const patchDiff = (changes: Partial<DiffState>) =>
    setDiffState((current) => ({ ...current, ...changes }));

  const handleCompareDiff = async () => {
    try {
      const result = await prepareDiffContent({
        ...diffState,
        leftContent: state.content,
      });
      setDiffCompared(result);
      setError(null);
      setToast("Diff result updated");
    } catch (error) {
      setError({
        title: "Diff compare error",
        message:
          error instanceof Error ? error.message : "Unable to compare editors.",
      });
    }
  };

  const handleFormatDiffBoth = async () => {
    try {
      const [leftContent, rightContent] = await Promise.all([
        formatCode(state.content, state.language),
        formatCode(diffState.rightContent, diffState.rightLanguage),
      ]);
      setContent(leftContent);
      patchDiff({ rightContent });
      setToast("Formatted both diff editors");
    } catch (error) {
      setError({
        title: "Diff format error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to format both editors.",
      });
    }
  };

  const handleMinifyDiffBoth = async () => {
    try {
      const [leftContent, rightContent] = await Promise.all([
        minifyCode(state.content, state.language),
        minifyCode(diffState.rightContent, diffState.rightLanguage),
      ]);
      setContent(leftContent);
      patchDiff({ rightContent });
      setToast("Minified both diff editors");
    } catch (error) {
      setError({
        title: "Diff minify error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to minify both editors.",
      });
    }
  };

  const handleSwapDiff = () => {
    const leftContent = state.content;
    const leftLanguage = state.language;
    setState((current) => ({
      ...current,
      content: diffState.rightContent,
      language: diffState.rightLanguage,
      output: "",
      error: null,
    }));
    patchDiff({ rightContent: leftContent, rightLanguage: leftLanguage });
    setToast("Swapped diff editors");
  };

  const handleClearDiff = () => {
    patchDiff({ rightContent: "" });
    setDiffCompared({ left: "", right: "" });
    setToast("Cleared right diff editor");
  };

  const handleDownloadDiff = () => {
    downloadText(
      createDiffDownloadText(
        diffCompared.left || state.content,
        diffCompared.right || diffState.rightContent,
      ),
      "javascript",
      "diff-result",
    );
  };

  const handleFilter = () => {
    try {
      const { output, count } = filterJson(state.content, jsonPath);
      setOutput(output);
      setResultCount(count);
      setError(null);
      setToast(`JSON filter returned ${count} result${count === 1 ? "" : "s"}`);
    } catch (error) {
      setError({
        title: "JSON filter error",
        message:
          error instanceof Error ? error.message : "Unable to filter JSON.",
      });
    }
  };

  const handleClearFilter = () => {
    setOutput("");
    setResultCount(null);
    setToast("Filter cleared");
  };

  const handleCopy = async (text = state.content) => {
    await copyToClipboard(text);
    setToast("Copied to clipboard");
  };

  const handleDownload = useCallback(
    (text = state.output || state.content) => {
      downloadText(text, state.language, filename);
      setToast("Download started");
    },
    [filename, state.content, state.language, state.output],
  );

  const handleUpload = async (file: File) => {
    const text = await file.text();
    const language =
      detectLanguageFromFileName(file.name) ??
      detectLanguageFromContent(text) ??
      state.language;
    setFilename(file.name.replace(/\.[^.]+$/, "") || "viewer-output");
    setState((current) => ({
      ...current,
      content: text,
      language,
      output: "",
      error: null,
    }));
    setResultCount(null);
    setToast(`Loaded ${file.name}`);
  };

  const handleFoldAll = () =>
    editorRef.current?.trigger("toolbar", "editor.foldAll", {});
  const handleUnfoldAll = () =>
    editorRef.current?.trigger("toolbar", "editor.unfoldAll", {});
  const handleClear = () => {
    setContent("");
    setOutput("");
    setResultCount(null);
    setError(null);
  };
  const handleReset = () => {
    setState((current) => ({
      ...current,
      content: defaultSample[current.language],
      output: "",
      error: null,
    }));
    setResultCount(null);
  };

  const toggleFullscreen = () => setIsFullscreen((value) => !value);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (event.ctrlKey && key === "s") {
        event.preventDefault();
        handleDownload();
      }
      if (event.ctrlKey && event.shiftKey && key === "f") {
        event.preventDefault();
        void handleFormat();
      }
      if (event.ctrlKey && key === "m") {
        event.preventDefault();
        void handleMinify();
      }
      if (event.ctrlKey && event.shiftKey && key === "l") {
        event.preventDefault();
        setState((current) => ({
          ...current,
          lineNumbers: !current.lineNumbers,
        }));
      }
      if (event.ctrlKey && event.shiftKey && key === "w") {
        event.preventDefault();
        setState((current) => ({ ...current, wordWrap: !current.wordWrap }));
      }
      if (event.ctrlKey && key === "d") {
        event.preventDefault();
        document
          .getElementById("diff-checker")
          ?.scrollIntoView({ behavior: "smooth" });
      }
      if (event.ctrlKey && key === "k") {
        event.preventDefault();
        handleClear();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleDownload, handleFormat, handleMinify]);

  const monacoTheme = monacoThemeMap[state.theme as ThemeId] ?? "vs-dark";

  return (
    <main className={`app-shell ${isFullscreen ? "fullscreen" : ""}`}>
      <Toolbar
        language={state.language}
        theme={state.theme as ThemeId}
        filename={filename}
        wordWrap={state.wordWrap}
        lineNumbers={state.lineNumbers}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        onFilenameChange={setFilename}
        onUpload={handleUpload}
        onDownload={() => handleDownload()}
        onCopy={() => void handleCopy()}
        onClear={handleClear}
        onReset={handleReset}
        onFormat={() => void handleFormat()}
        onMinify={() => void handleMinify()}
        onAutoDetect={handleAutoDetectLanguage}
        onFoldAll={handleFoldAll}
        onUnfoldAll={handleUnfoldAll}
        onValidate={runValidation}
        onToggleWordWrap={() =>
          setState((current) => ({ ...current, wordWrap: !current.wordWrap }))
        }
        onToggleLineNumbers={() =>
          setState((current) => ({
            ...current,
            lineNumbers: !current.lineNumbers,
          }))
        }
        onToggleFullscreen={toggleFullscreen}
        diffMode={diffMode}
        onToggleDiff={() => setDiffMode((value) => !value)}
        onCompareDiff={() => void handleCompareDiff()}
        onFormatDiffBoth={() => void handleFormatDiffBoth()}
        onMinifyDiffBoth={() => void handleMinifyDiffBoth()}
        onSwapDiff={handleSwapDiff}
        onClearDiff={handleClearDiff}
        onDownloadDiff={handleDownloadDiff}
        onToggleInlineDiff={() =>
          patchDiff({
            mode: diffState.mode === "inline" ? "side-by-side" : "inline",
          })
        }
      />

      <JsonFilter
        disabled={state.language !== "json"}
        value={jsonPath}
        output={state.output}
        resultCount={resultCount}
        onChange={setJsonPath}
        onFilter={handleFilter}
        onClear={handleClearFilter}
        onCopy={() => void handleCopy(state.output)}
        onDownload={() => handleDownload(state.output)}
        onReplace={() => state.output && setContent(state.output)}
      />

      <section className={`workspace-grid ${diffMode ? "diff-workspace" : ""}`}>
        <div className="editor-pair">
          <CodeEditor
            language={state.language}
            theme={monacoTheme}
            value={state.content}
            wordWrap={state.wordWrap}
            lineNumbers={state.lineNumbers}
            onChange={(value) => updateContentWithAutoDetect(value ?? "")}
            onMount={handleEditorMount}
            height={diffMode ? "52vh" : "68vh"}
          />
          {diffMode && (
            <CodeEditor
              language={diffState.rightLanguage}
              theme={monacoTheme}
              value={diffState.rightContent}
              wordWrap={state.wordWrap}
              lineNumbers={state.lineNumbers}
              onChange={(value) => updateDiffRightWithAutoDetect(value ?? "")}
              onMount={handleRightEditorMount}
              className="editor-card"
              height="52vh"
            />
          )}
        </div>
        <aside className={`side-panel ${diffMode ? "compact-side-panel" : ""}`}>
          <ErrorPanel error={state.error} />
          <div className="output-card">
            <div className="panel-heading">
              <h2>Output</h2>
              <button
                disabled={!state.output}
                onClick={() => void handleCopy(state.output)}
              >
                Copy output
              </button>
            </div>
            {state.output ? (
              <CodeEditor
                language={state.language}
                theme={monacoTheme}
                value={state.output}
                wordWrap={state.wordWrap}
                lineNumbers={state.lineNumbers}
                onChange={() => {}}
                onMount={() => {}}
                className="output-editor"
                height={diffMode ? "34vh" : "58vh"}
                readOnly
              />
            ) : (
              <pre className="output-placeholder">
                Filtered JSON or action results will appear here.
              </pre>
            )}
          </div>
        </aside>
      </section>

      {diffMode && (
        <section className="compact-diff-result" id="diff-checker">
          <div className="panel-heading">
            <h2>Diff Result</h2>
            <span>
              {diffState.mode === "inline" ? "Inline" : "Side-by-side"}
            </span>
          </div>
          <DiffEditor
            height="38vh"
            language={
              state.language === diffState.rightLanguage
                ? monacoLanguageMap[state.language]
                : "plaintext"
            }
            theme={monacoTheme}
            original={diffCompared.left || state.content}
            modified={diffCompared.right || diffState.rightContent}
            options={{
              automaticLayout: true,
              renderSideBySide: diffState.mode === "side-by-side",
              minimap: { enabled: false },
              readOnly: false,
              originalEditable: true,
            }}
          />
        </section>
      )}

      <StatusBar
        content={state.content}
        language={state.language}
        theme={state.theme}
        toast={toast}
      />
    </main>
  );
}

export default App;
