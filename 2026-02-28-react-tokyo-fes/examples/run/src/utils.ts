export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
} as const;

const SECTION_LINE = "=".repeat(56);

export function style(text: string, ...codes: string[]) {
  return `${codes.join("")}${text}${ANSI.reset}`;
}

export function logSection(step: string, title: string) {
  console.log(style(SECTION_LINE, ANSI.dim));
  console.log(style(`${step}: ${title}`, ANSI.bold, ANSI.cyan));
  console.log(style(SECTION_LINE, ANSI.dim));
}

export function logNote(note: string) {
  console.log(style(`Note: ${note}`, ANSI.yellow));
}

export async function stringToString(stream: ReadableStream<Uint8Array>) {
  let result = "";
  await stream.pipeThrough(new TextDecoderStream() as any).pipeTo(
    new WritableStream({
      write(chunk) {
        result += chunk;
      },
    }),
  );
  return result;
}

export function stringToStream(text: string) {
  return new Blob([text]).stream() as ReadableStream<Uint8Array>;
}
