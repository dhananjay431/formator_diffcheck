import type { SupportedLanguage } from "../models/language.model";

const extensionMap: Record<string, SupportedLanguage> = {
  json: "json",
  xml: "xml",
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
};

export function detectLanguageFromFileName(
  fileName: string,
): SupportedLanguage | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? (extensionMap[extension] ?? null) : null;
}

export function detectLanguageFromContent(
  content: string,
): SupportedLanguage | null {
  const trimmed = content.trim();
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    // Continue with heuristic detection.
  }
  if (/^<\?xml|<([\w:-]+)(\s|>|\/)/i.test(trimmed)) {
    return /<!doctype html|<html|<body|<script|<style/i.test(trimmed)
      ? "html"
      : "xml";
  }
  if (
    /(^|\n)\s*(@media|@keyframes|[.#]?[\w-][\w\s.#:[\]="'>+~,*-]*\s*\{)|\b(color|margin|padding|display|position|background|font-size)\s*:/.test(
      trimmed,
    )
  )
    return "css";
  if (/\b(interface|type|enum|implements|namespace)\b/.test(trimmed))
    return "typescript";
  if (
    /\b(function|const|let|var|class|import|export|async|await|console\.log)\b/.test(
      trimmed,
    )
  )
    return "javascript";
  return null;
}
