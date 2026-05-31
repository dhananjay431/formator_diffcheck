import type { SupportedLanguage } from "./language.model";

export type DiffMode = "side-by-side" | "inline";

export interface DiffState {
  leftContent: string;
  rightContent: string;
  leftLanguage: SupportedLanguage;
  rightLanguage: SupportedLanguage;
  mode: DiffMode;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  ignoreEmptyLines: boolean;
  formatBeforeCompare: boolean;
  sortJsonKeys: boolean;
}

export const defaultDiffState: DiffState = {
  leftContent: "",
  rightContent: "",
  leftLanguage: "json",
  rightLanguage: "json",
  mode: "side-by-side",
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreEmptyLines: false,
  formatBeforeCompare: false,
  sortJsonKeys: false,
};
