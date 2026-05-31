import { JSONPath } from "jsonpath-plus";

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed)
    throw new Error("Enter a JSONPath expression, for example users[*].name.");
  return trimmed.startsWith("$") ? trimmed : `$.${trimmed}`;
}

function matchesSearch(value: unknown, query: string): boolean {
  const needle = query.toLowerCase();
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, child]) =>
        key.toLowerCase().includes(needle) || matchesSearch(child, query),
    );
  }
  return String(value).toLowerCase().includes(needle);
}

function textSearch(json: unknown, query: string): unknown[] {
  if (Array.isArray(json))
    return json.filter((item) => matchesSearch(item, query));
  if (json && typeof json === "object") {
    return Object.entries(json as Record<string, unknown>)
      .filter(
        ([key, value]) =>
          key.toLowerCase().includes(query.toLowerCase()) ||
          matchesSearch(value, query),
      )
      .map(([key, value]) => ({ [key]: value }));
  }
  return matchesSearch(json, query) ? [json] : [];
}

export function filterJson(content: string, path: string) {
  let json: string | number | boolean | object | unknown[] | null;
  try {
    json = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : "Unable to parse JSON."}`,
    );
  }
  if (!path.trim().startsWith("$") && !/[.[\]?*]/.test(path.trim())) {
    const result = textSearch(json, path.trim());
    return {
      output: JSON.stringify(result.length === 1 ? result[0] : result, null, 2),
      count: result.length,
    };
  }
  try {
    const result = JSONPath({
      path: normalizePath(path),
      json,
      wrap: true,
    }) as unknown as unknown[];
    const outputValue = result.length === 1 ? result[0] : result;
    return {
      output: JSON.stringify(outputValue, null, 2),
      count: result.length,
    };
  } catch (error) {
    throw new Error(
      `Invalid filter path: ${error instanceof Error ? error.message : "Unable to apply filter."}`,
    );
  }
}
