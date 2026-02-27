export function styleText(_format: string | string[], text: string) {
  return text;
}

export function inspect(value: unknown, _options?: unknown) {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "function") {
        return `[Function ${val.name || "anonymous"}]`;
      }
      if (typeof val === "symbol") {
        return String(val);
      }
      if (typeof val === "bigint") {
        return `${val.toString()}n`;
      }
      return val;
    },
    2,
  );
}
