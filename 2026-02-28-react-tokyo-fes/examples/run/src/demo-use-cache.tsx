import {
  createClientTemporaryReferenceSet,
  createFromReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  encodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";

export async function main() {
  // "use cache" component: static shell + dynamic children
  function CachedParent({ children }: { children: React.ReactNode }) {
    return (
      <>
        <span>static: {new Date().toISOString()}</span>
        {children}
      </>
    );
  }

  // Dynamic child component
  function DynamicChild() {
    return <span>dynamic: {new Date().toISOString()}</span>;
  }

  console.log("==== 1. Original args (i.e. CachedParent's props) ====");
  const args = [{ children: <DynamicChild /> }];
  console.dir({ args }, { depth: null });
  console.log();

  // Step 1: Encode args (i.e. CachedParent's props)
  const clientTempRefs = createClientTemporaryReferenceSet();
  const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });
  console.log("==== 2. encodeReply ====");
  console.log({ encodedArgs });
  // console.log({ clientTempRefs });
  // console.log("→ children becomes $T");
  console.log();

  // Step 2: Decode args (on cache miss, to execute fn)
  const serverTempRefs = createTemporaryReferenceSet();
  const decodedArgs: any[] = await decodeReply(encodedArgs, {
    temporaryReferences: serverTempRefs,
  });
  console.log("==== 3. decodeReply ====");
  console.dir({ decodedArgs }, { depth: null });
  console.log(
    "→ [Function (anonymous)] is a temporary reference proxy which corresponds to encoded $T marker",
  );
  console.log();

  // Step 3: Execute the original function (this is the "fn" in use-cache-runtime)
  const result = CachedParent(decodedArgs[0] as any);
  console.log("==== 4. execute CachedParent(decoded) ====");
  console.dir({ result }, { depth: null });
  console.log();

  // Step 4: Serialize result (for cache value)
  const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
  const [stream1, stream2] = stream.tee();
  const rscPayload = await stringToString(stream1);
  console.log("==== 5. renderToReadableStream (cache value) ====");
  console.log({ stream: rscPayload.trim() });
  console.log("→ CachedParent's Date.now() is executed and baked in the stream");
  console.log("→ temporary reference proxy '[Function (anonymous)]' is encoded back to $T");
  console.log();

  // Step 5: Revive from cache (on cache hit)
  const finalResult = await createFromReadableStream(stream2, {
    temporaryReferences: clientTempRefs,
  });
  console.log("==== 6. createFromReadableStream (revived) ====");
  console.dir({ finalResult }, { depth: null });
  console.log("→ $T inside stream is swapped back to <DynamicChild />");
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
