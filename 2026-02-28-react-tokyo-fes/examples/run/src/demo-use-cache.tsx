import {
  createClientTemporaryReferenceSet,
  createFromReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { ANSI, logNote, logSection, stringToStream, stringToString, style } from "./utils";

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
