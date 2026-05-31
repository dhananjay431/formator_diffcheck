import type { SupportedLanguage } from "./language.model";

export interface EditorError {
  title: string;
  message: string;
  line?: number;
  column?: number;
}

export interface EditorState {
  language: SupportedLanguage;
  theme: string;
  content: string;
  output?: string;
  error?: EditorError | null;
  wordWrap: boolean;
  lineNumbers: boolean;
}
