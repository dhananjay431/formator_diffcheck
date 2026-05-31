import type { EditorError } from "../models/editor-state.model";
import type { SupportedLanguage } from "../models/language.model";

function jsonError(message: string): EditorError {
  const match = message.match(/position (\d+)/i);
  return {
    title: "Invalid JSON",
    message,
    column: match ? Number(match[1]) : undefined,
  };
}

export function validateCode(
  content: string,
  language: SupportedLanguage,
): EditorError | null {
  if (!content.trim())
    return {
      title: "Empty input",
      message: "Paste or upload content before validating.",
    };
  if (language === "json") {
    try {
      JSON.parse(content);
      return null;
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Invalid JSON.",
      );
    }
  }
  if (language === "xml") {
    const doc = new DOMParser().parseFromString(content, "application/xml");
    const parserError = doc.querySelector("parsererror");
    return parserError
      ? {
          title: "Invalid XML",
          message: parserError.textContent || "XML parser error.",
        }
      : null;
  }
  if (language === "html") {
    new DOMParser().parseFromString(content, "text/html");
    return null;
  }
  return null;
}
