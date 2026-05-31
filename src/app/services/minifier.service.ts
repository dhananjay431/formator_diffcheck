import { minify } from "terser";
import type { SupportedLanguage } from "../models/language.model";

function minifyCss(content: string) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyHtml(content: string) {
  const blocks: string[] = [];
  const protectedContent = content.replace(
    /<(script|style)\b[\s\S]*?<\/\1>/gi,
    (match) => {
      blocks.push(match);
      return `___VIEWER_BLOCK_${blocks.length - 1}___`;
    },
  );
  const minified = protectedContent
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
  return minified.replace(
    /___VIEWER_BLOCK_(\d+)___/g,
    (_, index) => blocks[Number(index)],
  );
}

function minifyXml(content: string) {
  return content
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function minifyCode(content: string, language: SupportedLanguage) {
  if (language === "json") return JSON.stringify(JSON.parse(content));
  if (language === "css") return minifyCss(content);
  if (language === "html") return minifyHtml(content);
  if (language === "xml") return minifyXml(content);
  if (language === "javascript") {
    const result = await minify(content, {
      compress: true,
      mangle: true,
      format: { comments: false },
    });
    if (!result.code)
      throw new Error("Terser could not produce minified JavaScript.");
    return result.code;
  }
  if (language === "typescript") {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}()[\]=:;,<>+\-*/])\s*/g, "$1")
      .trim();
  }
  throw new Error("This language cannot be minified safely in this viewer.");
}
