import prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import htmlPlugin from "prettier/plugins/html";
import postcssPlugin from "prettier/plugins/postcss";
import typescriptPlugin from "prettier/plugins/typescript";
import xmlPlugin from "@prettier/plugin-xml";
import type { SupportedLanguage } from "../models/language.model";

const parserByLanguage: Partial<Record<SupportedLanguage, string>> = {
  json: "json",
  html: "html",
  xml: "xml",
  css: "css",
  javascript: "babel",
  typescript: "typescript",
};

export async function formatCode(content: string, language: SupportedLanguage) {
  if (language === "json") return JSON.stringify(JSON.parse(content), null, 2);
  const parser = parserByLanguage[language];
  if (!parser) throw new Error(`${language} formatting is not supported yet.`);
  const source =
    language === "xml" ? content.replace(/>\s*</g, ">\n<") : content;
  return prettier.format(source, {
    parser,
    plugins: [
      babelPlugin,
      estreePlugin,
      htmlPlugin,
      postcssPlugin,
      typescriptPlugin,
      xmlPlugin,
    ],
    tabWidth: 2,
    printWidth: 100,
    xmlWhitespaceSensitivity: "ignore",
  });
}
