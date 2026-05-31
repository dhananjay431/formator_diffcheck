export type ThemeId =
  | "dark-night"
  | "light"
  | "dracula"
  | "monokai"
  | "github-dark"
  | "github-light"
  | "solarized-dark"
  | "solarized-light";

export const themes: Array<{ label: string; value: ThemeId }> = [
  { label: "Dark / Night", value: "dark-night" },
  { label: "Light", value: "light" },
  { label: "Dracula", value: "dracula" },
  { label: "Monokai", value: "monokai" },
  { label: "GitHub Dark", value: "github-dark" },
  { label: "GitHub Light", value: "github-light" },
  { label: "Solarized Dark", value: "solarized-dark" },
  { label: "Solarized Light", value: "solarized-light" },
];

export const monacoThemeMap: Record<ThemeId, string> = {
  "dark-night": "vs-dark",
  light: "light-viewer",
  dracula: "dracula-viewer",
  monokai: "monokai-viewer",
  "github-dark": "github-dark-viewer",
  "github-light": "github-light-viewer",
  "solarized-dark": "solarized-dark-viewer",
  "solarized-light": "solarized-light-viewer",
};
