const ANSI_CODES: Record<string, [open: string, close: string]> = {
  bold: ["\x1b[1m", "\x1b[22m"],
  dim: ["\x1b[2m", "\x1b[22m"],
  cyan: ["\x1b[36m", "\x1b[39m"],
  green: ["\x1b[32m", "\x1b[39m"],
  magenta: ["\x1b[35m", "\x1b[39m"],
  yellow: ["\x1b[33m", "\x1b[39m"],
};

export function styleText(format: string | string[], text: string) {
  const formats = Array.isArray(format) ? format : [format];
  let result = text;
  for (const item of formats) {
    const codes = ANSI_CODES[item];
    if (!codes) continue;
    result = `${codes[0]}${result}${codes[1]}`;
  }
  return result;
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
