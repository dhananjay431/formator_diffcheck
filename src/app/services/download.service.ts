import type { SupportedLanguage } from "../models/language.model";
import { normalizeFilename } from "../utils/file-extension.util";

export function downloadText(
  text: string,
  language: SupportedLanguage,
  filename: string,
) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = normalizeFilename(filename, language);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
