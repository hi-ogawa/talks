import {
  createClientTemporaryReferenceSet,
  createFromReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { inspect } from "node:util";
import { ANSI, logNote, stringToStream, stringToString, style } from "./utils";

const SECTION_LINE = "=".repeat(56);

function logStep(step: string, title: string) {
  console.log(style(SECTION_LINE, ANSI.dim));
  console.log(style(`${step}: ${title}`, ANSI.bold, ANSI.cyan));
  console.log(style(SECTION_LINE, ANSI.dim));
}

function logLhs(name: string, value: unknown) {
  console.log(style(`${name} =`, ANSI.bold));
  const text = typeof value === "string" ? value : inspect(value, { depth: null, colors: true });
  console.log(
    text
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
  );
}

async function __cache_wrapper__(originalFn: (...args: any[]) => React.ReactNode) {
  const cache = new Map<string, string>();

  return async (...args: any[]) => {
    logStep("Step 1/5", "Encode Args as Cache Key (encodeReply)");
    logLhs("args", args);
    console.log();
    const clientTempRefs = createClientTemporaryReferenceSet();
    const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });
    if (typeof encodedArgs !== "string") {
      throw new Error("Expected encodedArgs to be a string in this simplified demo.");
    }
    logLhs("encodedArgs", encodedArgs);
    logLhs("clientTempRefs", clientTempRefs);
    console.log();

    if (!cache.has(encodedArgs)) {
      console.log(style("cache = miss", ANSI.bold, ANSI.green));
      console.log();

      logStep("Step 2/5", "Decode Arguments (decodeReply)");
      const serverTempRefs = createTemporaryReferenceSet();
      const decodedArgs = await decodeReply(encodedArgs, { temporaryReferences: serverTempRefs });
      logLhs("decodedArgs", decodedArgs);
      logLhs("serverTempRefs", serverTempRefs);
      logNote("[Function (anonymous)] is a temporary reference proxy for encoded $T.");
      console.log();

      logStep("Step 3/5", "Execute Original Function");
      const result = originalFn(...(decodedArgs as any[]));
      logLhs("result", result);
      console.log();

      logStep("Step 4/5", "Serialize Result and Cache (renderToReadableStream)");
      const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
      const payload = await stringToString(stream);
      cache.set(encodedArgs, payload);
      logLhs("stream", payload.trim());
      logNote("static timestamp is baked into the cached RSC payload.");
      logNote("temporary reference proxy is encoded back to $T in the payload.");
      console.log();
    } else {
      console.log(style("cache = hit (skip Steps 2-4)", ANSI.bold, ANSI.magenta));
      console.log();
    }

    logStep("Step 5/5", "Deserialize Cached RSC Stream (createFromReadableStream)");
    const payload = cache.get(encodedArgs)!;
    const finalResult = await createFromReadableStream(stringToStream(payload), {
      temporaryReferences: clientTempRefs,
    });
    logLhs("finalResult", finalResult);
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
