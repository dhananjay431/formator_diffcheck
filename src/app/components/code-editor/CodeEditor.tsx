import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { SupportedLanguage } from "../../models/language.model";

const languageMap: Record<SupportedLanguage, string> = {
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  javascript: "javascript",
  typescript: "typescript",
};

function defineTheme(
  monaco: Monaco,
  name: string,
  base: "vs" | "vs-dark",
  bg: string,
  fg: string,
  accent: string,
) {
  monaco.editor.defineTheme(name, {
    base,
    inherit: true,
    rules: [
      { token: "keyword", foreground: accent.replace("#", "") },
      { token: "string", foreground: base === "vs-dark" ? "a6e3a1" : "0a3069" },
      { token: "number", foreground: base === "vs-dark" ? "fab387" : "953800" },
      {
        token: "comment",
        foreground: base === "vs-dark" ? "6b7280" : "6e7781",
      },
    ],
    colors: {
      "editor.background": bg,
      "editor.foreground": fg,
      "editorLineNumber.foreground": base === "vs-dark" ? "64748b" : "8c959f",
      "editorCursor.foreground": accent,
      "editor.selectionBackground": `${accent}55`,
      "editorGutter.background": bg,
    },
  });
}

function registerThemes(monaco: Monaco) {
  defineTheme(
    monaco,
    "dracula-viewer",
    "vs-dark",
    "#282a36",
    "#f8f8f2",
    "#bd93f9",
  );
  defineTheme(
    monaco,
    "monokai-viewer",
    "vs-dark",
    "#272822",
    "#f8f8f2",
    "#f92672",
  );
  defineTheme(
    monaco,
    "github-dark-viewer",
    "vs-dark",
    "#0d1117",
    "#c9d1d9",
    "#58a6ff",
  );
  defineTheme(
    monaco,
    "github-light-viewer",
    "vs",
    "#ffffff",
    "#24292f",
    "#0969da",
  );
  defineTheme(
    monaco,
    "solarized-dark-viewer",
    "vs-dark",
    "#002b36",
    "#839496",
    "#b58900",
  );
  defineTheme(
    monaco,
    "solarized-light-viewer",
    "vs",
    "#fdf6e3",
    "#657b83",
    "#268bd2",
  );
  defineTheme(monaco, "light-viewer", "vs", "#ffffff", "#1f2937", "#2563eb");
}

interface CodeEditorProps {
  language: SupportedLanguage;
  theme: string;
  value: string;
  wordWrap: boolean;
  lineNumbers: boolean;
  onChange: OnChange;
  onMount: OnMount;
  className?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  language,
  theme,
  value,
  wordWrap,
  lineNumbers,
  onChange,
  onMount,
  className = "editor-card",
  height = "68vh",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <section className={className} aria-label="Code editor">
      <Editor
        height={height}
        language={languageMap[language]}
        theme={theme}
        value={value}
        beforeMount={registerThemes}
        onChange={onChange}
        onMount={onMount}
        options={{
          automaticLayout: true,
          folding: true,
          foldingHighlight: true,
          lineNumbers: lineNumbers ? "on" : "off",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          wordWrap: wordWrap ? "on" : "off",
          fontSize: 14,
          fontLigatures: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </section>
  );
}
