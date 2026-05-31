import type { EditorState } from "../models/editor-state.model";
import type { DiffState } from "../models/diff-state.model";

const STORAGE_KEY = "multi-language-code-viewer-state";
const DIFF_STORAGE_KEY = "multi-language-code-viewer-diff-state";

export function loadState(): Partial<EditorState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveState(state: EditorState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, error: null }),
    );
  } catch {
    // Storage can fail in private mode or quota-limited environments.
  }
}

export function loadDiffState(): Partial<DiffState> {
  try {
    const raw = localStorage.getItem(DIFF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDiffState(state: DiffState) {
  try {
    localStorage.setItem(DIFF_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}
