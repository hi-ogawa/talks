import {
  createClientTemporaryReferenceSet,
  createFromReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";

const SECTION_LINE = "=".repeat(56);

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
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

function logNote(note: string) {
  console.log(style(`Note: ${note}`, ANSI.yellow));
}

function stringToStream(text: string) {
  return new Blob([text]).stream() as ReadableStream<Uint8Array>;
}

async function __cache_wrapper__(originalFn: (...args: any[]) => React.ReactNode) {
  const cache = new Map<string, string>();

  return async (...args: any[]) => {
    logSection("Step 1/5", "Encode Args as Cache Key", "encodeReply(args)");
    const clientTempRefs = createClientTemporaryReferenceSet();
    const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });
    if (typeof encodedArgs !== "string") {
      throw new Error("Expected encodedArgs to be a string in this simplified demo.");
    }
    console.log(encodedArgs);
    console.log();

    if (!cache.has(encodedArgs)) {
      console.log(style("Cache: miss", ANSI.bold, ANSI.green));
      console.log();

      logSection("Step 2/5", "Decode Arguments", "decodeReply(encodedArgs)");
      const serverTempRefs = createTemporaryReferenceSet();
      const decodedArgs = await decodeReply(encodedArgs, { temporaryReferences: serverTempRefs });
      console.dir(decodedArgs, { depth: null });
      logNote("[Function (anonymous)] is a temporary reference proxy for encoded $T.");
      console.log();

      logSection("Step 3/5", "Execute Original Function", "originalFn(...decodedArgs)");
      const result = originalFn(...(decodedArgs as any[]));
      console.dir(result, { depth: null });
      console.log();

      logSection("Step 4/5", "Serialize Result and Cache", "renderToReadableStream(result)");
      const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
      const payload = await stringToString(stream);
      cache.set(encodedArgs, payload);
      console.log(payload.trim());
      logNote("static timestamp is baked into the cached RSC payload.");
      logNote("temporary reference proxy is encoded back to $T in the payload.");
      console.log();
    } else {
      console.log(style("Cache: hit (skip Steps 2-4)", ANSI.bold, ANSI.magenta));
      console.log();
    }

    logSection("Step 5/5", "Deserialize Cached RSC Stream", "createFromReadableStream(stream)");
    const payload = cache.get(encodedArgs)!;
    const finalResult = await createFromReadableStream(stringToStream(payload), {
      temporaryReferences: clientTempRefs,
    });
    console.dir(finalResult, { depth: null });
    logNote("$T in payload is restored to the latest <DynamicChild /> reference.");
    console.log();

    return finalResult;
  };
}

export async function main() {
  function CachedParent({ children }: { children: React.ReactNode }) {
    return (
      <>
        <span>static: {new Date().toISOString()}</span>
        {children}
      </>
    );
  }

  function DynamicChild() {
    return <span>dynamic: {new Date().toISOString()}</span>;
  }

  const CachedParent_wrapped = await __cache_wrapper__(CachedParent);

  console.log(style("Run #1", ANSI.bold));
  await CachedParent_wrapped({ children: <DynamicChild /> });

  console.log(style("Run #2 (same args shape)", ANSI.bold));
  await CachedParent_wrapped({ children: <DynamicChild /> });
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
