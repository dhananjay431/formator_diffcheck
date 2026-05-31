import type { SupportedLanguage } from "../../models/language.model";

interface StatusBarProps {
  content: string;
  language: SupportedLanguage;
  theme: string;
  toast: string;
}

export function StatusBar({ content, language, theme, toast }: StatusBarProps) {
  const lines = content ? content.split(/\r\n|\r|\n/).length : 0;
  return (
    <footer className="status-bar">
      <span>{toast}</span>
      <span>Language: {language}</span>
      <span>Theme: {theme}</span>
      <span>{lines} lines</span>
      <span>{content.length} chars</span>
      <span className="shortcut-hint">
        Ctrl+S download · Ctrl+Shift+F format · Ctrl+M minify
      </span>
    </footer>
  );
}
