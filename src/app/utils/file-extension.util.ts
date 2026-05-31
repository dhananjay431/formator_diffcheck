import type { SupportedLanguage } from "../models/language.model";

export const extensionByLanguage: Record<SupportedLanguage, string> = {
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  javascript: "js",
  typescript: "ts",
};

export function normalizeFilename(name: string, language: SupportedLanguage) {
  const base = name.trim().replace(/\.[^.]+$/, "") || "viewer-output";
  return `${base}.${extensionByLanguage[language]}`;
}
