export type SupportedLanguage =
  | "json"
  | "xml"
  | "html"
  | "css"
  | "javascript"
  | "typescript";

export const supportedLanguages: Array<{
  label: string;
  value: SupportedLanguage;
  extension: string;
}> = [
  { label: "JSON", value: "json", extension: ".json" },
  { label: "XML", value: "xml", extension: ".xml" },
  { label: "HTML", value: "html", extension: ".html" },
  { label: "CSS", value: "css", extension: ".css" },
  { label: "JavaScript", value: "javascript", extension: ".js" },
  { label: "TypeScript", value: "typescript", extension: ".ts" },
];

export const defaultSample: Record<SupportedLanguage, string> = {
  json: JSON.stringify(
    {
      users: [
        { name: "Ada Lovelace", age: 28 },
        { name: "Grace Hopper", age: 36 },
      ],
      products: [{ name: "Laptop", price: 899 }],
    },
    null,
    2,
  ),
  xml: '<catalog>\n  <book id="bk101">\n    <author>Ada Lovelace</author>\n  </book>\n</catalog>',
  html: "<!doctype html>\n<html>\n  <body>\n    <h1>Hello Viewer</h1>\n  </body>\n</html>",
  css: "body {\n  margin: 0;\n  color: #e5e7eb;\n  background: #111827;\n}",
  javascript:
    'function greet(name) {\n  console.log(`Hello, ${name}!`)\n}\ngreet("developer")',
  typescript:
    'type User = { name: string; age: number }\nconst user: User = { name: "Ada", age: 28 }\nconsole.log(user)',
};
