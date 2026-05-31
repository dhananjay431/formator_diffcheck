import type { DiffState } from "../models/diff-state.model";
import { formatCode } from "./formatter.service";
import { minifyCode } from "./minifier.service";

export function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function normalizeText(content: string, state: DiffState) {
  let result = content;
  if (state.ignoreCase) result = result.toLowerCase();
  if (state.ignoreEmptyLines)
    result = result.replace(/^\s*$(?:\r\n?|\n)/gm, "");
  if (state.ignoreWhitespace)
    result = result
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, " "))
      .join("\n");
  return result;
}

export async function prepareDiffContent(state: DiffState) {
  let left = state.leftContent;
  let right = state.rightContent;

  if (
    state.sortJsonKeys &&
    state.leftLanguage === "json" &&
    state.rightLanguage === "json"
  ) {
    left = JSON.stringify(sortJsonKeys(JSON.parse(left)), null, 2);
    right = JSON.stringify(sortJsonKeys(JSON.parse(right)), null, 2);
  }

  if (state.formatBeforeCompare) {
    left = await formatCode(left, state.leftLanguage);
    right = await formatCode(right, state.rightLanguage);
  }

  return {
    left: normalizeText(left, state),
    right: normalizeText(right, state),
  };
}

export async function minifyDiffSide(
  content: string,
  language: DiffState["leftLanguage"],
) {
  return minifyCode(content, language);
}

export function createDiffDownloadText(left: string, right: string) {
  return `--- Original ---\n${left}\n\n--- Modified ---\n${right}\n`;
}
