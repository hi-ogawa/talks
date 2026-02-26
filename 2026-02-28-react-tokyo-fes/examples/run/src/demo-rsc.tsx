import { createFromReadableStream, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";

const SECTION_LINE = "=".repeat(56);

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
} as const;

function style(text: string, ...codes: string[]) {
  return `${codes.join("")}${text}${ANSI.reset}`;
}

function logSection(step: string, title: string, purpose: string) {
  console.log(style(SECTION_LINE, ANSI.dim));
  console.log(style(`${step}: ${title}`, ANSI.bold, ANSI.cyan));
  console.log(style(`Purpose: ${purpose}`, ANSI.dim));
  console.log(style(SECTION_LINE, ANSI.dim));
}

export async function main() {
  async function ServerComponent() {
    return (
      <div>
        <span>{Math.random()}</span>
      </div>
    );
  }

  const rootNode = <ServerComponent />;
  logSection("Step 1/3", "Server Component Node", "React element on server environment");
  console.dir(rootNode);
  console.log();

  const rscStream = renderToReadableStream(rootNode);
  const [rscStream1, rscStream2] = rscStream.tee();
  logSection("Step 2/3", "RSC Stream Payload", "renderToReadableStream output");
  console.log(await stringToString(rscStream1));
  console.log();

  const rootNodeClient = await createFromReadableStream(rscStream2);
  logSection("Step 3/3", "Client React Node", "createFromReadableStream output");
  console.dir(rootNodeClient, { depth: null });
}

async function stringToString(stream: ReadableStream<Uint8Array>) {
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
